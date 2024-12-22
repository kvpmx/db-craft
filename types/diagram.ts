import type { DatabaseFieldTypes, DatabaseType } from '@/lib/constants/diagram';

export interface DiagramConfig<T extends DatabaseType | unknown = unknown> {
  tables: Table<T>[];
  refs: TableReference[];
}

export interface Table<T extends DatabaseType | unknown = unknown> {
  id: string;
  name: string;
  position: Position;
  fields: TableField<T>[];
}

export interface Position {
  x: number;
  y: number;
}

export interface TableField<T extends DatabaseType | unknown = unknown> {
  id: string;
  name: string;
  type: T extends DatabaseType ? (typeof DatabaseFieldTypes)[T][number] : string;
  primary_key?: boolean;
}

export interface TableReference {
  id: string;
  source: string;
  target: string;
  source_field: string;
  target_field: string;
}
