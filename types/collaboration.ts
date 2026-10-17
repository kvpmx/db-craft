import type { DiagramConfig, Position } from './diagram';

export type CollaborationStatus = 'inactive' | 'connecting' | 'live' | 'offline' | 'error';

export interface SharedDiagram {
  name: string;
  visibility: 'public' | 'private';
  schema: DiagramConfig;
}

export interface Participant {
  sessionId: string;
  userId: string;
  name: string;
  avatar: string;
  color: string;
  cursor: Position | null;
}

export interface DocumentSnapshot {
  baseline: SharedDiagram;
  state: string | null;
  revision: number;
  updated_at: string;
}

export interface DocumentSaveResult extends DocumentSnapshot {
  accepted: boolean;
}
