import type { LiteralUnion, TupleToUnion } from 'type-fest';
import type { DATABASE_FIELD_TYPES, DatabaseType } from '@/lib/constants/diagram';

export interface DiagramConfig<T extends DatabaseType | unknown = unknown> {
  tables: Table<T>[];
  refs: TableReference[];
}

export interface Table<T extends DatabaseType | unknown = unknown> {
  id: string;
  name: string;
  position: Position;
  color: string;
  fields: TableField<T>[];
}

export type TableWithVisibility<T extends DatabaseType | unknown = unknown> = Table<T> & {
  visible: boolean;
};

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

export interface TableReference {
  id: string;
  source: string;
  target: string;
  source_field: string;
  target_field: string;
}
