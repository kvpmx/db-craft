import type { DatabaseFieldTypes, DatabaseType } from '@/lib/constants/diagram';

export interface DiagramConfig<T extends DatabaseType> {
  tables: Table<T>[];
  refs: TableReference[];
}

export interface Table<T extends DatabaseType> {
  id: string;
  name: string;
  position: Position;
  fields: TableField<T>[];
}

export interface Position {
  x: number;
  y: number;
}

export interface TableField<T extends DatabaseType> {
  id: string;
  name: string;
  type: (typeof DatabaseFieldTypes)[T][number];
  primary_key?: boolean;
}

export interface TableReference {
  id: string;
  source: string;
  target: string;
  source_field: string;
  target_field: string;
}
