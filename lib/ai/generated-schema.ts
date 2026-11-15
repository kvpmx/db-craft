import { v4 as uuidv4 } from 'uuid';
import { generateObject } from 'ai';
import { RelationEndpointCardinalitySchema } from '@/lib/constants/schema';
import { DEFAULT_RELATION_CARDINALITY } from '@/lib/constants/diagram';
import { parseFieldType } from '@/lib/diagram/type-migration';
import { DEFAULT_COLORS } from '@/lib/constants/colors';
import { groq, SCHEMA_MODEL } from '@/lib/ai/groq';
import { getGenerationSystemPrompt } from '@/lib/ai/prompts';
import { getHandlePlacement } from '@/utils/relation';
import { z } from 'zod';

import type { DatabaseType } from '@/lib/constants/diagram';
import type { DiagramConfig, Table, TableField, TableRelation } from '@/types/diagram';

const TABLE_LAYOUT_COLUMNS = 3;
const TABLE_LAYOUT_GAP_X = 420;
const TABLE_LAYOUT_GAP_Y = 320;
const TABLE_LAYOUT_ORIGIN = { x: 80, y: 80 };

export const AiGeneratedFieldSchema = z.object({
  name: z.string().describe('Column name'),
  type: z.string().describe('SQL column type'),
  primary_key: z.boolean(),
  nullable: z.boolean(),
  unique: z.boolean(),
  auto_increment: z.boolean(),
});

export const AiGeneratedTableSchema = z.object({
  name: z.string().describe('Table name'),
  fields: z.array(AiGeneratedFieldSchema),
});

export const AiGeneratedRelationSchema = z.object({
  name: z.string().describe('Foreign key constraint name, or empty string'),
  source_table: z.string().describe('Table that holds the foreign key'),
  source_field: z.string().describe('Foreign key column name'),
  target_table: z.string().describe('Referenced table'),
  target_field: z.string().describe('Referenced column name'),
  source_cardinality: RelationEndpointCardinalitySchema,
  target_cardinality: RelationEndpointCardinalitySchema,
});

export const AiGeneratedDiagramSchema = z.object({
  tables: z.array(AiGeneratedTableSchema),
  relations: z.array(AiGeneratedRelationSchema),
});

export type AiGeneratedDiagram = z.infer<typeof AiGeneratedDiagramSchema>;

const findNamed = <T extends { name: string }>(items: T[], name: string) => {
  const needle = name.trim().toLowerCase();

  return items.find((item) => item.name.trim().toLowerCase() === needle);
};

const normalizeFieldType = (type: string) => {
  const { base, params } = parseFieldType(type);

  // Keep arguments an external generator already produced so SQL export can print
  // them. Do not invent defaults such as varchar(255); the SQL generator does that.
  return base ? `${base}${params}` : 'varchar';
};

const gridPosition = (index: number, origin = TABLE_LAYOUT_ORIGIN) => {
  const column = index % TABLE_LAYOUT_COLUMNS;
  const row = Math.floor(index / TABLE_LAYOUT_COLUMNS);

  return {
    x: origin.x + column * TABLE_LAYOUT_GAP_X,
    y: origin.y + row * TABLE_LAYOUT_GAP_Y,
  };
};

export const toLogicalSchema = (schema: DiagramConfig): AiGeneratedDiagram => {
  const tablesById = new Map(schema.tables.map((table) => [table.id, table]));

  return {
    tables: schema.tables.map((table) => ({
      name: table.name,
      fields: table.fields.map((field) => ({
        name: field.name,
        type: parseFieldType(field.type).base,
        primary_key: Boolean(field.primary_key),
        nullable: Boolean(field.nullable),
        unique: Boolean(field.unique),
        auto_increment: Boolean(field.auto_increment),
      })),
    })),
    relations: schema.relations.flatMap((relation) => {
      const sourceTable = tablesById.get(relation.source);
      const targetTable = tablesById.get(relation.target);
      const sourceField = sourceTable?.fields.find((field) => field.id === relation.source_field);
      const targetField = targetTable?.fields.find((field) => field.id === relation.target_field);

      if (!sourceTable || !targetTable || !sourceField || !targetField) {
        return [];
      }

      return [
        {
          name: relation.name ?? '',
          source_table: sourceTable.name,
          source_field: sourceField.name,
          target_table: targetTable.name,
          target_field: targetField.name,
          source_cardinality: relation.cardinality?.source ?? DEFAULT_RELATION_CARDINALITY.source,
          target_cardinality: relation.cardinality?.target ?? DEFAULT_RELATION_CARDINALITY.target,
        },
      ];
    }),
  };
};

export const hydrateLogicalSchema = (logical: AiGeneratedDiagram): DiagramConfig => {
  const tables: Table[] = [];
  const seenTableNames = new Set<string>();

  for (const [index, generatedTable] of logical.tables.entries()) {
    const name = generatedTable.name.trim();
    if (!name) continue;

    const tableKey = name.toLowerCase();
    if (seenTableNames.has(tableKey)) continue;
    seenTableNames.add(tableKey);

    const fields: TableField[] = [];
    const seenFieldNames = new Set<string>();

    for (const generatedField of generatedTable.fields) {
      const fieldName = generatedField.name.trim();
      if (!fieldName) continue;

      const fieldKey = fieldName.toLowerCase();
      if (seenFieldNames.has(fieldKey)) continue;
      seenFieldNames.add(fieldKey);

      fields.push({
        id: uuidv4(),
        name: fieldName,
        type: normalizeFieldType(generatedField.type),
        primary_key: generatedField.primary_key,
        nullable: generatedField.primary_key ? false : generatedField.nullable,
        unique: generatedField.unique,
        auto_increment: generatedField.auto_increment,
      });
    }

    if (!fields.length) continue;

    tables.push({
      id: uuidv4(),
      name,
      position: gridPosition(tables.length),
      color: DEFAULT_COLORS[index % DEFAULT_COLORS.length]!,
      fields,
    });
  }

  if (!tables.length) {
    throw new Error('Generated schema did not contain any valid tables.');
  }

  const relations: TableRelation[] = [];
  const seenRelationKeys = new Set<string>();

  for (const generatedRelation of logical.relations) {
    const sourceTable = findNamed(tables, generatedRelation.source_table);
    const targetTable = findNamed(tables, generatedRelation.target_table);
    const sourceField = sourceTable
      ? findNamed(sourceTable.fields, generatedRelation.source_field)
      : undefined;
    const targetField = targetTable
      ? findNamed(targetTable.fields, generatedRelation.target_field)
      : undefined;

    if (!sourceTable || !targetTable || !sourceField || !targetField) continue;
    if (sourceTable.id === targetTable.id) continue;

    const relationKey = `${sourceTable.id}:${sourceField.id}->${targetTable.id}:${targetField.id}`;
    if (seenRelationKeys.has(relationKey)) continue;
    seenRelationKeys.add(relationKey);

    const placement = getHandlePlacement(sourceTable.position, targetTable.position);
    const name = generatedRelation.name.trim();

    relations.push({
      id: uuidv4(),
      ...(name ? { name } : {}),
      source: sourceTable.id,
      target: targetTable.id,
      source_field: sourceField.id,
      target_field: targetField.id,
      source_handle_placement: placement.source,
      target_handle_placement: placement.target,
      cardinality: {
        source: generatedRelation.source_cardinality,
        target: generatedRelation.target_cardinality,
      },
    });
  }

  return {
    tables,
    relations,
    notes: [],
    tableGroups: [],
  };
};

export const placeNewTables = (current: DiagramConfig, proposed: DiagramConfig): DiagramConfig => {
  const currentIds = new Set(current.tables.map((table) => table.id));
  const newTables = proposed.tables.filter((table) => !currentIds.has(table.id));

  if (!newTables.length) return proposed;

  const origin = current.tables.length
    ? {
        x: Math.max(...current.tables.map((table) => table.position.x)) + TABLE_LAYOUT_GAP_X,
        y: Math.min(...current.tables.map((table) => table.position.y)),
      }
    : TABLE_LAYOUT_ORIGIN;

  const positions = new Map(
    newTables.map((table, index) => [table.id, gridPosition(index, origin)])
  );

  return {
    ...proposed,
    tables: proposed.tables.map((table) => {
      const position = positions.get(table.id);
      return position ? { ...table, position } : table;
    }),
  };
};

export const CompactGeneratedTableSchema = z.object({
  name: z.string().describe('Table name'),
  columns: z
    .array(z.string())
    .describe(
      'Columns as name:type or name:type:flags. Type is a base name with no length or precision, such as varchar or decimal. Flags: pk, unique, nullable, ai. Example: id:int:pk,ai'
    ),
});

export const parseCompactColumn = (spec: string) => {
  const parts = spec
    .split(':')
    .map((part) => part.trim())
    .filter(Boolean);

  const name = parts[0] ?? '';
  const type = parts[1] ?? 'varchar';
  const flags = new Set(
    parts
      .slice(2)
      .join(',')
      .split(',')
      .map((part) => part.trim().toLowerCase())
      .filter(Boolean)
  );

  return {
    name,
    type,
    primary_key: flags.has('pk') || flags.has('primary_key'),
    unique: flags.has('unique') || flags.has('uq'),
    nullable: flags.has('nullable') || flags.has('null'),
    auto_increment: flags.has('ai') || flags.has('auto_increment') || flags.has('autoincrement'),
  };
};

export const parseCompactRelation = (spec: string) => {
  const match = spec.trim().match(/^([^.]+)\.(\S+)\s*->\s*([^.]+)\.(\S+)$/);
  if (!match) return null;

  return {
    name: '',
    source_table: match[1]!.trim(),
    source_field: match[2]!.trim(),
    target_table: match[3]!.trim(),
    target_field: match[4]!.trim(),
    source_cardinality: 'zero-or-many' as const,
    target_cardinality: 'one' as const,
  };
};

export const toLogicalSchemaFromCompact = ({
  tables,
  relations,
}: {
  tables: Array<{ name: string; columns: string[] }>;
  relations: string[];
}): AiGeneratedDiagram => {
  return {
    tables: tables.map((table) => ({
      name: table.name,
      fields: table.columns.map(parseCompactColumn).filter((field) => field.name),
    })),
    relations: relations.flatMap((relation) => {
      const parsed = parseCompactRelation(relation);
      return parsed ? [parsed] : [];
    }),
  };
};

export const FROM_SCRATCH_MIN_TABLES = 5;

export const isFullSchemaRequest = (intent: string) => {
  return (
    /(згенеруй|generate|створи|create|побудуй|build).{0,80}(баз|схем|database|schema|діаграм|diagram)/i.test(
      intent
    ) ||
    /(from scratch|з нуля)/i.test(intent) ||
    /(всі можливі|all possible|добре продумай)/i.test(intent)
  );
};

const isRateLimitError = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);

  return /rate limit/i.test(message);
};

const isSingleTableRequest = (intent: string) => {
  return (
    /(only|just|тільки|лише)\s+(one|a|одн)/i.test(intent) ||
    /(one|single|одн(у|а))\s+table/i.test(intent) ||
    /(одн(у|а)\s+таблиц)/i.test(intent)
  );
};

type GenerationPass = 'full' | 'complete' | 'compact';

const buildGenerationPrompt = ({
  intent,
  currentSchema,
  pass,
}: {
  intent: string;
  currentSchema?: DiagramConfig;
  pass: GenerationPass;
}) => {
  const currentLogical =
    currentSchema && currentSchema.tables.length ? toLogicalSchema(currentSchema) : null;

  const sizeHint = {
    full: 'Generate a practical schema of 8-12 tables unless the request is a small patch. Core columns only. Include relations for every foreign key. Return every table in this single JSON object — do not generate only the first table or a first step.',
    complete:
      'The previous JSON was incomplete. Return the FULL domain schema now: 8-12 tables with relations. Do not stop after the first table.',
    compact:
      'The previous attempt failed. Generate a valid JSON schema with 6-10 tables and at most 8 columns per table. Include every table in one object.',
  }[pass];

  const task = currentLogical
    ? `Current schema JSON:\n${JSON.stringify(currentLogical)}\n\nRequested change:\n${intent}\n\nReturn the complete updated schema JSON. Keep every existing table and relation unless the request explicitly removes them.`
    : `Generate a new database schema from this request:\n${intent}`;

  return `${task}\n\n${sizeHint}\n\nRespond with a single JSON object that matches the schema.`;
};

export const generateLogicalSchema = async ({
  intent,
  databaseType,
  currentSchema,
}: {
  intent: string;
  databaseType: DatabaseType | undefined;
  currentSchema?: DiagramConfig;
}): Promise<AiGeneratedDiagram> => {
  const system = getGenerationSystemPrompt(databaseType);
  const fromScratch = !currentSchema?.tables.length;
  const minTables = fromScratch && !isSingleTableRequest(intent) ? FROM_SCRATCH_MIN_TABLES : 1;

  const run = async (pass: GenerationPass) => {
    const { object } = await generateObject({
      model: groq(SCHEMA_MODEL),
      schema: AiGeneratedDiagramSchema,
      schemaName: 'database_schema',
      schemaDescription: 'Logical database schema with tables and relations.',
      system,
      prompt: buildGenerationPrompt({ intent, currentSchema, pass }),
      mode: 'json',
      maxTokens: 6144,
      temperature: 0.2,
    });

    return object;
  };

  const isCompleteEnough = (schema: AiGeneratedDiagram) => schema.tables.length >= minTables;

  try {
    const object = await run('full');
    if (isCompleteEnough(object)) return object;

    try {
      const complete = await run('complete');
      if (complete.tables.length >= object.tables.length) return complete;
    } catch (error) {
      if (isRateLimitError(error)) return object;
    }

    return object;
  } catch (error) {
    if (isRateLimitError(error)) throw error;
  }

  return await run('compact');
};
