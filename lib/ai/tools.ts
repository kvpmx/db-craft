import { tool } from 'ai';
import { z } from 'zod';
import { buildSchemaSummary, createSchemaProposalFromLogical } from '@/lib/ai/schema-proposal';
import {
  CompactGeneratedTableSchema,
  FROM_SCRATCH_MIN_TABLES,
  isFullSchemaRequest,
  toLogicalSchemaFromCompact,
} from '@/lib/ai/generated-schema';

import type { DatabaseType } from '@/lib/constants/diagram';
import type { DiagramConfig } from '@/types/diagram';
import type { SchemaProposal } from '@/types/ai-chat';

export type AiToolsContext = {
  currentSchema: DiagramConfig;
  databaseType: DatabaseType | undefined;
  userRequest?: string;
};

const toToolResult = (proposal: SchemaProposal) => {
  return {
    ...proposal,
    tableNames: proposal.proposedSchema.tables.map((table) => table.name),
  };
};

export const createDiagramAiTools = ({ currentSchema, userRequest }: AiToolsContext) => {
  let latestProposal: SchemaProposal | null = null;

  return {
    getSchemaSummary: tool({
      description:
        'Get a compact summary of the current diagram schema. Use for answering questions without modifying the schema.',
      parameters: z.object({
        focus: z
          .enum(['tables', 'relations', 'all'])
          .optional()
          .describe('Which part of the schema to summarize'),
      }),
      execute: async ({ focus }) => {
        return buildSchemaSummary(currentSchema, focus ?? 'all');
      },
    }),
    proposeSchemaUpdate: tool({
      description:
        'Propose a complete schema for user review. Pass EVERY table and relation in this single call. For a new database include 8-12 tables, not a first step. The user must confirm before changes are applied.',
      parameters: z.object({
        mode: z
          .enum(['patch', 'replace'])
          .optional()
          .describe(
            'patch: modify the existing schema. replace: generate a new schema from scratch.'
          ),
        tables: z
          .array(CompactGeneratedTableSchema)
          .describe('All tables in the proposed schema. Never send only the first table.'),
        relations: z
          .array(z.string())
          .describe('Foreign keys as "source_table.source_field -> target_table.target_field".'),
      }),
      execute: async ({ mode, tables, relations }) => {
        const request = userRequest?.trim() || '';
        const fromScratch = !currentSchema.tables?.length;
        const wantsFullSchema = fromScratch || isFullSchemaRequest(request);

        if (wantsFullSchema && tables.length < FROM_SCRATCH_MIN_TABLES) {
          return {
            error: `Incomplete schema: received ${tables.length} table(s) (${tables.map((table) => table.name).join(', ') || 'none'}). Call proposeSchemaUpdate again with the complete schema: 8-12 tables and all foreign-key relations in one call. Do not send a first step.`,
          };
        }

        if (latestProposal) {
          return toToolResult(latestProposal);
        }

        try {
          latestProposal = createSchemaProposalFromLogical({
            logical: toLogicalSchemaFromCompact({ tables, relations }),
            mode: wantsFullSchema ? 'replace' : (mode ?? 'patch'),
            currentSchema,
            intent: request,
          });
        } catch (error) {
          return {
            error:
              error instanceof Error
                ? error.message
                : 'Failed to build the schema proposal. Call proposeSchemaUpdate again with a complete valid schema.',
          };
        }

        return toToolResult(latestProposal);
      },
    }),
  };
};
