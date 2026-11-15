import { v4 as uuidv4 } from 'uuid';
import { DiagramConfigSchema } from '@/lib/constants/schema';
import { normalizeDiagramConfig } from '@/lib/diagram/normalize-config';
import { parseFieldType } from '@/lib/diagram/type-migration';
import {
  generateLogicalSchema,
  hydrateLogicalSchema,
  placeNewTables,
  toLogicalSchema,
} from '@/lib/ai/generated-schema';

import type { AiGeneratedDiagram } from '@/lib/ai/generated-schema';
import type { DatabaseType } from '@/lib/constants/diagram';
import type { DiagramConfig, Table, TableField, TableRelation } from '@/types/diagram';
import type { SchemaProposal, SchemaProposalMode, SchemaSummaryFocus } from '@/types/ai-chat';

const normalizeSchema = (schema: DiagramConfig): DiagramConfig => {
  return normalizeDiagramConfig({
    tables: schema.tables ?? [],
    relations: schema.relations ?? [],
    notes: schema.notes ?? [],
    tableGroups: schema.tableGroups ?? [],
  });
};

export const buildSchemaSummary = (schema: DiagramConfig, focus: SchemaSummaryFocus = 'all') => {
  const normalized = normalizeSchema(schema);

  if (focus === 'tables') {
    return {
      tableCount: normalized.tables.length,
      tables: normalized.tables.map((table) => ({
        id: table.id,
        name: table.name,
        fields: table.fields.map((field) => ({
          id: field.id,
          name: field.name,
          type: parseFieldType(field.type).base,
          primary_key: field.primary_key ?? false,
          nullable: field.nullable ?? false,
          unique: field.unique ?? false,
        })),
      })),
    };
  }

  if (focus === 'relations') {
    const tableNames = new Map(normalized.tables.map((table) => [table.id, table.name]));

    return {
      relationCount: normalized.relations.length,
      relations: normalized.relations.map((relation) => ({
        id: relation.id,
        name: relation.name,
        sourceTable: tableNames.get(relation.source),
        targetTable: tableNames.get(relation.target),
        source_field: relation.source_field,
        target_field: relation.target_field,
        cardinality: relation.cardinality,
      })),
    };
  }

  return {
    tableCount: normalized.tables.length,
    relationCount: normalized.relations.length,
    noteCount: normalized.notes?.length ?? 0,
    tableGroupCount: normalized.tableGroups?.length ?? 0,
    tables: normalized.tables.map((table) => ({
      id: table.id,
      name: table.name,
      fieldCount: table.fields.length,
      fields: table.fields.map((field) => ({
        name: field.name,
        type: parseFieldType(field.type).base,
        primary_key: field.primary_key ?? false,
      })),
    })),
    relations: normalized.relations.map((relation) => ({
      id: relation.id,
      source: relation.source,
      target: relation.target,
      source_field: relation.source_field,
      target_field: relation.target_field,
    })),
  };
};

type NamedEntity = { id: string; name: string };

const fieldSignature = (field: TableField) =>
  JSON.stringify({
    name: field.name,
    type: parseFieldType(field.type).base,
    primary_key: field.primary_key ?? false,
    nullable: field.nullable ?? false,
    unique: field.unique ?? false,
    auto_increment: field.auto_increment ?? false,
  });

const matchNamed = <T extends NamedEntity>(
  items: T[],
  candidate: T,
  usedIds: Set<string>
): T | undefined => {
  const byId = items.find((item) => item.id === candidate.id && !usedIds.has(item.id));
  if (byId) {
    usedIds.add(byId.id);
    return byId;
  }

  const byName = items.find((item) => item.name === candidate.name && !usedIds.has(item.id));
  if (byName) {
    usedIds.add(byName.id);
    return byName;
  }

  return undefined;
};

const describeTableUpdate = (currentTable: Table, proposedTable: Table) => {
  const usedFieldIds = new Set<string>();
  const added: string[] = [];
  const changed: string[] = [];

  for (const field of proposedTable.fields) {
    const currentField = matchNamed(currentTable.fields, field, usedFieldIds);
    if (!currentField) {
      added.push(field.name);
      continue;
    }

    if (fieldSignature(currentField) !== fieldSignature(field)) {
      changed.push(
        currentField.name === field.name ? field.name : `${currentField.name} → ${field.name}`
      );
    }
  }

  const removed = currentTable.fields
    .filter((field) => !usedFieldIds.has(field.id))
    .map((field) => field.name);

  const parts: string[] = [];
  if (added.length) parts.push(`add ${added.join(', ')}`);
  if (removed.length) parts.push(`remove ${removed.join(', ')}`);
  if (changed.length) parts.push(`change ${changed.join(', ')}`);

  const renamed =
    currentTable.name !== proposedTable.name
      ? `${currentTable.name} → ${proposedTable.name}`
      : proposedTable.name;

  if (!parts.length) {
    return currentTable.name === proposedTable.name ? null : `Rename ${renamed}`;
  }

  return `Update ${renamed}: ${parts.join('; ')}`;
};

const relationEndpointKey = (relation: TableRelation, tables: Table[]) => {
  const sourceTable = tables.find((table) => table.id === relation.source);
  const targetTable = tables.find((table) => table.id === relation.target);
  const sourceField = sourceTable?.fields.find((field) => field.id === relation.source_field);
  const targetField = targetTable?.fields.find((field) => field.id === relation.target_field);

  return [
    sourceTable?.name ?? relation.source,
    sourceField?.name ?? relation.source_field,
    targetTable?.name ?? relation.target,
    targetField?.name ?? relation.target_field,
  ].join('|');
};

export const computeSchemaChangeSummary = (
  currentSchema: DiagramConfig,
  proposedSchema: DiagramConfig
) => {
  const current = normalizeSchema(currentSchema);
  const proposed = normalizeSchema(proposedSchema);

  const usedCurrentTableIds = new Set<string>();
  const addedTables: string[] = [];
  const tableUpdates: string[] = [];

  for (const proposedTable of proposed.tables) {
    const currentTable = matchNamed(current.tables, proposedTable, usedCurrentTableIds);
    if (!currentTable) {
      addedTables.push(proposedTable.name);
      continue;
    }

    const update = describeTableUpdate(currentTable, proposedTable);
    if (update) tableUpdates.push(update);
  }

  const removedTables = current.tables
    .filter((table) => !usedCurrentTableIds.has(table.id))
    .map((table) => table.name);

  const currentRelationKeys = new Set(
    current.relations.map((relation) => relationEndpointKey(relation, current.tables))
  );
  const proposedRelationKeys = new Set(
    proposed.relations.map((relation) => relationEndpointKey(relation, proposed.tables))
  );

  const addedRelations = [...proposedRelationKeys].filter(
    (key) => !currentRelationKeys.has(key)
  ).length;
  const removedRelations = [...currentRelationKeys].filter(
    (key) => !proposedRelationKeys.has(key)
  ).length;

  const lines: string[] = [];

  if (addedTables.length) {
    lines.push(`Add tables: ${addedTables.join(', ')}`);
  }

  if (removedTables.length) {
    lines.push(`Remove tables: ${removedTables.join(', ')}`);
  }

  lines.push(...tableUpdates);

  if (addedRelations) {
    lines.push(`Add ${addedRelations} relation(s)`);
  }

  if (removedRelations) {
    lines.push(`Remove ${removedRelations} relation(s)`);
  }

  if (!lines.length) {
    lines.push('Update diagram layout or metadata');
  }

  return lines.join('\n');
};

const intentSuggestsRemoval = (intent: string) => {
  return (
    /\b(remove|delete|drop|clear|wipe|reset)\b/i.test(intent) ||
    /(видалити|видали|прибрати|прибери|usuń|usun|skasuj)/i.test(intent)
  );
};

const sameRelationEndpoints = (left: TableRelation, right: TableRelation) => {
  return (
    left.source === right.source &&
    left.target === right.target &&
    left.source_field === right.source_field &&
    left.target_field === right.target_field
  );
};

const rebasePatchSchema = (
  current: DiagramConfig,
  proposed: DiagramConfig,
  { keepDroppedTables }: { keepDroppedTables: boolean }
): DiagramConfig => {
  const usedCurrentTableIds = new Set<string>();
  const tableIdMap = new Map<string, string>();
  const fieldIdMap = new Map<string, string>();

  const mergedTables = proposed.tables.map((proposedTable) => {
    const currentTable = matchNamed(current.tables, proposedTable, usedCurrentTableIds);
    if (!currentTable) {
      tableIdMap.set(proposedTable.id, proposedTable.id);
      for (const field of proposedTable.fields) {
        fieldIdMap.set(field.id, field.id);
      }
      return proposedTable;
    }

    tableIdMap.set(proposedTable.id, currentTable.id);
    tableIdMap.set(currentTable.id, currentTable.id);

    const usedFieldIds = new Set<string>();
    const mergedFields = proposedTable.fields.map((proposedField) => {
      const currentField = matchNamed(currentTable.fields, proposedField, usedFieldIds);
      if (!currentField) {
        fieldIdMap.set(proposedField.id, proposedField.id);
        return proposedField;
      }

      fieldIdMap.set(proposedField.id, currentField.id);
      fieldIdMap.set(currentField.id, currentField.id);

      if (fieldSignature(currentField) === fieldSignature(proposedField)) {
        return currentField;
      }

      return {
        ...proposedField,
        id: currentField.id,
      };
    });

    const structurallySame =
      proposedTable.name === currentTable.name &&
      mergedFields.length === currentTable.fields.length &&
      mergedFields.every((field) => {
        const original = currentTable.fields.find((item) => item.id === field.id);
        return original && fieldSignature(original) === fieldSignature(field);
      });

    if (structurallySame) {
      return currentTable;
    }

    return {
      ...currentTable,
      name: proposedTable.name,
      fields: mergedFields,
    };
  });

  if (keepDroppedTables) {
    for (const table of current.tables) {
      if (usedCurrentTableIds.has(table.id)) continue;
      mergedTables.push(table);
      tableIdMap.set(table.id, table.id);
      for (const field of table.fields) {
        fieldIdMap.set(field.id, field.id);
      }
    }
  }

  const remappedRelations = proposed.relations.map((relation) => ({
    ...relation,
    source: tableIdMap.get(relation.source) ?? relation.source,
    target: tableIdMap.get(relation.target) ?? relation.target,
    source_field: fieldIdMap.get(relation.source_field) ?? relation.source_field,
    target_field: fieldIdMap.get(relation.target_field) ?? relation.target_field,
  }));

  const usedRelationIds = new Set<string>();
  const mergedRelations = remappedRelations.map((relation) => {
    const currentRelation =
      current.relations.find(
        (item) => !usedRelationIds.has(item.id) && sameRelationEndpoints(item, relation)
      ) ??
      current.relations.find((item) => item.id === relation.id && !usedRelationIds.has(item.id));

    if (!currentRelation) return relation;

    usedRelationIds.add(currentRelation.id);

    const sameCardinality =
      JSON.stringify(currentRelation.cardinality ?? null) ===
      JSON.stringify(relation.cardinality ?? null);
    const sameName = (currentRelation.name ?? '') === (relation.name ?? '');

    if (sameCardinality && sameName) {
      return currentRelation;
    }

    return {
      ...relation,
      id: currentRelation.id,
      source_handle_placement: currentRelation.source_handle_placement,
      target_handle_placement: currentRelation.target_handle_placement,
    };
  });

  if (keepDroppedTables) {
    const mergedTableIds = new Set(mergedTables.map((table) => table.id));

    for (const relation of current.relations) {
      if (usedRelationIds.has(relation.id)) continue;
      if (!mergedTableIds.has(relation.source) || !mergedTableIds.has(relation.target)) continue;
      if (mergedRelations.some((item) => sameRelationEndpoints(item, relation))) continue;

      mergedRelations.push(relation);
    }
  }

  return normalizeSchema({
    ...proposed,
    tables: mergedTables,
    relations: mergedRelations,
    notes: proposed.notes?.length ? proposed.notes : current.notes,
    tableGroups: proposed.tableGroups?.length ? proposed.tableGroups : current.tableGroups,
  });
};

export const generateSchemaFromPrompt = async (
  prompt: string,
  databaseType: DatabaseType | undefined,
  currentSchema?: DiagramConfig
) => {
  const logical = await generateLogicalSchema({
    intent: prompt,
    databaseType,
    currentSchema,
  });

  return normalizeSchema(hydrateLogicalSchema(logical));
};

export const createSchemaProposalFromLogical = ({
  logical,
  mode,
  currentSchema,
  intent,
}: {
  logical: AiGeneratedDiagram;
  mode: SchemaProposalMode;
  currentSchema: DiagramConfig;
  intent: string;
}): SchemaProposal => {
  const normalizedCurrent = normalizeSchema(currentSchema);
  const resolvedMode: SchemaProposalMode = normalizedCurrent.tables.length === 0 ? 'replace' : mode;

  const proposedSchema = normalizeSchema(hydrateLogicalSchema(logical));

  let validated: DiagramConfig = DiagramConfigSchema.parse({
    ...proposedSchema,
    notes: resolvedMode === 'replace' ? [] : (normalizedCurrent.notes ?? []),
    tableGroups: resolvedMode === 'replace' ? [] : (normalizedCurrent.tableGroups ?? []),
  });

  if (resolvedMode === 'patch') {
    validated = placeNewTables(
      normalizedCurrent,
      rebasePatchSchema(normalizedCurrent, validated, {
        keepDroppedTables: !intentSuggestsRemoval(intent),
      })
    );
  }

  return {
    proposalId: uuidv4(),
    summary: computeSchemaChangeSummary(normalizedCurrent, validated),
    mode: resolvedMode,
    proposedSchema: validated,
  };
};

export const createSchemaProposal = async ({
  intent,
  mode,
  currentSchema,
  databaseType,
}: {
  intent: string;
  mode: SchemaProposalMode;
  currentSchema: DiagramConfig;
  databaseType: DatabaseType | undefined;
}): Promise<SchemaProposal> => {
  const normalizedCurrent = normalizeSchema(currentSchema);
  const resolvedMode: SchemaProposalMode = normalizedCurrent.tables.length === 0 ? 'replace' : mode;

  const proposedSchema = await generateSchemaFromPrompt(
    intent,
    databaseType,
    resolvedMode === 'replace' ? undefined : normalizedCurrent
  );

  return createSchemaProposalFromLogical({
    logical: toLogicalSchema(proposedSchema),
    mode: resolvedMode,
    currentSchema: normalizedCurrent,
    intent,
  });
};
