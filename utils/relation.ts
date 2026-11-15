import { normalizeType } from '@/utils/sql';

import type { HandlePlacement, Position, Table, TableRelation } from '@/types/diagram';

export const sanitizeConstraintNamePart = (value: string) => {
  return value
    .trim()
    .replace(/[^a-zA-Z0-9_]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
};

export const sanitizeConstraintName = (value: string) => {
  return sanitizeConstraintNamePart(value) || 'fk_relation';
};

const getRelationField = (tables: Table[], tableId: string, fieldId: string) => {
  const table = tables.find((table) => table.id === tableId);
  return table?.fields.find((field) => field.id === fieldId);
};

export const getRelationFieldName = (tables: Table[], tableId: string, fieldId: string) => {
  return getRelationField(tables, tableId, fieldId)?.name;
};

export const getRelationFieldType = (tables: Table[], tableId: string, fieldId: string) => {
  return getRelationField(tables, tableId, fieldId)?.type;
};

export const relationFieldTypesMatch = (
  tables: Table[],
  sourceTableId: string,
  sourceFieldId: string,
  targetTableId: string,
  targetFieldId: string
) => {
  const sourceType = getRelationFieldType(tables, sourceTableId, sourceFieldId);
  const targetType = getRelationFieldType(tables, targetTableId, targetFieldId);
  if (!sourceType || !targetType) return true;

  return normalizeType(sourceType) === normalizeType(targetType);
};

export const getRelationTableName = (tables: Table[], tableId: string) => {
  return tables.find((table) => table.id === tableId)?.name;
};

export const getDefaultRelationName = (relation: TableRelation, tables: Table[]): string => {
  const sourceTable = getRelationTableName(tables, relation.source);
  const targetTable = getRelationTableName(tables, relation.target);

  const sourceField = getRelationFieldName(tables, relation.source, relation.source_field);
  const targetField = getRelationFieldName(tables, relation.target, relation.target_field);

  if (!sourceTable || !targetTable || !sourceField || !targetField) {
    return relation.id.slice(0, 8);
  }

  return `fk_${sanitizeConstraintNamePart(sourceTable)}_${sanitizeConstraintNamePart(targetTable)}_${sanitizeConstraintNamePart(sourceField)}`;
};

export const getRelationDisplayName = (relation: TableRelation, tables: Table[]) => {
  return relation.name?.trim() || getDefaultRelationName(relation, tables);
};

export const getRelationEndpointLabel = (tables: Table[], tableId: string, fieldId: string) => {
  const tableName = getRelationTableName(tables, tableId) ?? '?';
  const fieldName = getRelationFieldName(tables, tableId, fieldId) ?? '?';
  return `${tableName}.${fieldName}`;
};

export const getHandlePlacement = (
  sourcePosition: Position,
  targetPosition: Position
): { source: HandlePlacement; target: HandlePlacement } => {
  const dist = sourcePosition.x - targetPosition.x;
  const width = 300;

  if (dist > width) return { source: 'left', target: 'right' };
  if (dist >= 0) return { source: 'left', target: 'left' };
  if (dist <= -width) return { source: 'right', target: 'left' };
  return { source: 'right', target: 'right' };
};
