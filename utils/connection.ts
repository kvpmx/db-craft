import { v4 as uuidv4 } from 'uuid';
import type { Connection } from '@vue-flow/core';
import type { HandlePlacement, TableReference } from '@/types/diagram';

/**
 * Parse a handle ID string into placement and field values.
 *
 * @param connectionHandle - A string that represents a unique identifier for a connection handle.
 * It is expected to be in the format "placement:table:field", where each part is separated by a colon.
 * @returns A tuple containing the `placement` and `fieldId` values parsed from the `handleId`.
 */
export const parseConnectionData = (connectionHandle: string) => {
  const [placement, _tableId, fieldId] = connectionHandle.split(':');
  return [placement as HandlePlacement, fieldId] as const;
};

/**
 * Create a relation between two tables based on the provided connection data.
 *
 * @param connection - An object that represents a connection between two nodes.
 * @returns A `TableReference` object or `undefined` when connection is not valid.
 */
export const createRelation = (connection: Connection): TableReference | undefined => {
  if (!connection.sourceHandle || !connection.targetHandle) {
    return;
  }

  const [sourcePlacement, sourceField] = parseConnectionData(connection.sourceHandle);
  const [targetPlacement, targetField] = parseConnectionData(connection.targetHandle);

  if (!sourceField || !targetField) return;

  return {
    id: uuidv4(),
    source: connection.source,
    target: connection.target,
    source_field: sourceField,
    target_field: targetField,
    source_handle_placement: sourcePlacement,
    target_handle_placement: targetPlacement,
  };
};
