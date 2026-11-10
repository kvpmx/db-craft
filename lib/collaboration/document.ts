import * as Y from 'yjs';
import { getRelationFieldName } from '../../utils/relation';

import type { DiagramConfig } from '../../types/diagram';
import type { SharedDiagram } from '../../types/collaboration';

type Scalar = string | number | boolean;
type Entity = { id: string; [key: string]: unknown };
type DiagramMap = Y.Map<Scalar | Y.Text>;
type Properties = Map<string, Scalar>;

interface DocumentEntry {
  path: string[];
  value: Scalar;
}

const COLLECTIONS = ['tables', 'relations', 'notes', 'tableGroups'] as const;
const EXISTS_KEY = '$exists';
const ORDER_KEY = '$order';
const MAX_UPDATE_LENGTH = 8_000_000;

export const LOCAL_ORIGIN = 'diagram-local';
export const REMOTE_ORIGIN = 'diagram-remote';

const keyOf = (path: string[]) => JSON.stringify(path);
const startsWithPath = (path: string[], prefix: string[]) =>
  prefix.every((part, index) => path[index] === part);

// Entity IDs keep edits independent of array order. Each property gets its own
// CRDT entry so replacing one object cannot overwrite another editor's changes.
function flattenDiagram(diagram: SharedDiagram): Properties {
  const properties: Properties = new Map();

  const visit = (object: Record<string, unknown>, path: string[]) => {
    const entries = Object.entries(object).sort(([a], [b]) => a.localeCompare(b));
    for (const [key, value] of entries) {
      if (value === undefined || key === 'id') continue;
      const propertyPath = [...path, key];
      if (Array.isArray(value)) {
        value.forEach((entity: Entity, index) => {
          const entityPath = [...propertyPath, entity.id];
          properties.set(keyOf([...entityPath, EXISTS_KEY]), true);
          properties.set(keyOf([...entityPath, ORDER_KEY]), index);
          visit(entity, entityPath);
        });
      } else if (value !== null && typeof value === 'object') {
        visit(value as Record<string, unknown>, propertyPath);
      } else if (
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean'
      ) {
        properties.set(keyOf(propertyPath), value);
      }
    }
  };

  visit(diagram as unknown as Record<string, unknown>, []);
  return properties;
}

function updateText(text: Y.Text, value: string) {
  // Replace only the edited span, preserving concurrent insertions elsewhere.
  const previous = text.toString();
  let prefixLength = 0;
  while (
    prefixLength < previous.length &&
    prefixLength < value.length &&
    previous[prefixLength] === value[prefixLength]
  ) {
    prefixLength++;
  }
  let suffixLength = 0;
  while (
    suffixLength < previous.length - prefixLength &&
    suffixLength < value.length - prefixLength &&
    previous[previous.length - suffixLength - 1] === value[value.length - suffixLength - 1]
  ) {
    suffixLength++;
  }
  const deletedLength = previous.length - prefixLength - suffixLength;
  const insertedText = value.slice(prefixLength, value.length - suffixLength);
  if (deletedLength) text.delete(prefixLength, deletedLength);
  if (insertedText) text.insert(prefixLength, insertedText);
}

function writeProperty(root: DiagramMap, key: string, value: Scalar) {
  const property = (JSON.parse(key) as string[]).at(-1);
  const isSharedText = typeof value === 'string' && (property === 'name' || property === 'content');
  if (!isSharedText) {
    root.set(key, value);
    return;
  }
  const existing = root.get(key);
  const text = existing instanceof Y.Text ? existing : new Y.Text();
  if (text !== existing) root.set(key, text);
  updateText(text, value);
}

function belongsToRemovedEntity(path: string[], previous: Properties, next: Properties) {
  return path.some((_, index) => {
    const entityKey = keyOf([...path.slice(0, index + 1), EXISTS_KEY]);
    return previous.has(entityKey) && !next.has(entityKey);
  });
}

export function writeDiagram(doc: Y.Doc, before: SharedDiagram | null, after: SharedDiagram) {
  const previous = before ? flattenDiagram(before) : new Map<string, Scalar>();
  const next = flattenDiagram(after);
  const root = doc.getMap<Scalar | Y.Text>('diagram');
  doc.transact(() => {
    for (const [key, value] of next) {
      if (previous.get(key) !== value) writeProperty(root, key, value);
    }
    for (const key of previous.keys()) {
      if (next.has(key)) continue;
      const path = JSON.parse(key) as string[];
      if (path.at(-1) === EXISTS_KEY) {
        root.set(key, false);
      } else if (!belongsToRemovedEntity(path, previous, next)) {
        root.delete(key);
      }
      // Keep deleted entity properties behind a tombstone, so concurrent edits
      // cannot bring it back. An explicit restore can reuse them later.
    }
  }, LOCAL_ORIGIN);
}

function readEntity(entries: DocumentEntry[], path: string[], id: string): Entity {
  const entity: Entity = { id };
  for (const entry of entries) {
    if (!startsWithPath(entry.path, path)) continue;
    const [property, nestedProperty] = entry.path.slice(path.length);
    const depth = entry.path.length - path.length;
    if (depth === 1 && property && !property.startsWith('$')) {
      entity[property] = entry.value;
    } else if (
      depth === 2 &&
      nestedProperty &&
      (property === 'position' || property === 'cardinality')
    ) {
      const nested = (entity[property] ??= {}) as Record<string, Scalar>;
      nested[nestedProperty] = entry.value;
    }
  }
  return entity;
}

function readEntities(entries: DocumentEntry[], root: DiagramMap, path: string[]): Entity[] {
  const ids = entries
    .filter(
      (entry) =>
        entry.path.length === path.length + 2 &&
        entry.path.at(-1) === EXISTS_KEY &&
        entry.value === true &&
        startsWithPath(entry.path, path)
    )
    .map((entry) => entry.path[path.length]!);
  const orderOf = (id: string) => Number(root.get(keyOf([...path, id, ORDER_KEY])) ?? 0);

  return ids
    .sort((a, b) => orderOf(a) - orderOf(b) || a.localeCompare(b))
    .map((id) => {
      const entityPath = [...path, id];
      const entity = readEntity(entries, entityPath, id);
      if (path.at(-1) === 'tables')
        entity.fields = readEntities(entries, root, [...entityPath, 'fields']);
      return entity;
    });
}

export function readDiagram(doc: Y.Doc): SharedDiagram {
  const root = doc.getMap<Scalar | Y.Text>('diagram');
  // Decode each property once, rather than reparsing every key for every entity.
  const entries = Array.from(root, ([key, value]): DocumentEntry => ({
    path: JSON.parse(key) as string[],
    value: value instanceof Y.Text ? value.toString() : value,
  }));
  const schema = Object.fromEntries(
    COLLECTIONS.map((collection) => [
      collection,
      readEntities(entries, root, ['schema', collection]),
    ])
  ) as unknown as DiagramConfig;
  // Concurrent deletion of a table or column must not leave a dangling relation.
  schema.relations = schema.relations.filter(
    (relation) =>
      getRelationFieldName(schema.tables, relation.source, relation.source_field) !== undefined &&
      getRelationFieldName(schema.tables, relation.target, relation.target_field) !== undefined
  );
  return {
    name: String(root.get(keyOf(['name'])) ?? ''),
    visibility: root.get(keyOf(['visibility'])) === 'public' ? 'public' : 'private',
    schema,
  };
}

export function createDiagramDocument(baseline: SharedDiagram) {
  // Only the immutable database baseline uses a fixed ID; live editors get a
  // random client ID. This makes simultaneous initialization deterministic.
  const seed = new Y.Doc();
  seed.clientID = 0;
  writeDiagram(seed, null, baseline);
  const doc = new Y.Doc();
  Y.applyUpdate(doc, Y.encodeStateAsUpdate(seed), REMOTE_ORIGIN);
  seed.destroy();
  return doc;
}

export function encodeUpdate(update: Uint8Array): string {
  let binary = '';
  for (const byte of update) binary += String.fromCharCode(byte);
  return btoa(binary);
}

export function decodeUpdate(value: string): Uint8Array {
  if (typeof value !== 'string' || value.length > MAX_UPDATE_LENGTH) {
    throw new Error('Invalid diagram update');
  }
  return Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
}
