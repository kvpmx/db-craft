import type { Message } from '@ai-sdk/ui-utils';
import type { DiagramConfig } from '@/types/diagram';

export type StoredAiChatMessage = Message;

export type SchemaProposalMode = 'patch' | 'replace';

export type SchemaProposal = {
  proposalId: string;
  summary: string;
  mode: SchemaProposalMode;
  proposedSchema: DiagramConfig;
};

export type SchemaSummaryFocus = 'tables' | 'relations' | 'all';

export type ProposalState = 'applied' | 'discarded';

export type ProposalStates = Record<string, ProposalState>;
