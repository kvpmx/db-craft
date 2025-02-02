import type { LiteralUnion, TupleToUnion } from 'type-fest';
import type { DATABASE_FIELD_TYPES, DatabaseType } from '@/lib/constants/diagram';

export interface DiagramConfig<T extends DatabaseType | unknown = unknown> {
  tables: Table<T>[];
  relations: TableRelation[];
}

export interface Table<T extends DatabaseType | unknown = unknown> {
  id: string;
  name: string;
  position: Position;
  color: string;
  fields: TableField<T>[];
}

export interface Position {
  x: number;
  y: number;
}

export type ColumnType<T extends DatabaseType | unknown = unknown> = T extends DatabaseType
  ? LiteralUnion<TupleToUnion<(typeof DATABASE_FIELD_TYPES)[T]>, string>
  : string;

export interface TableField<T extends DatabaseType | unknown = unknown> {
  id: string;
  name: string;
  type: ColumnType<T>;
  primary_key?: boolean;
}

export type HandlePlacement = 'left' | 'right';

export interface TableRelation {
  id: string;
  source: string;
  target: string;
  source_field: string;
  target_field: string;
  source_handle_placement: HandlePlacement;
  target_handle_placement: HandlePlacement;
}
