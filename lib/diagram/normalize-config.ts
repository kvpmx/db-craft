import { v4 as uuidv4 } from 'uuid';
import { DEFAULT_NOTE_HEIGHT, DEFAULT_NOTE_WIDTH, STICKY_NOTE_COLORS } from '@/lib/constants/note';
import {
  DEFAULT_TABLE_GROUP_HEIGHT,
  DEFAULT_TABLE_GROUP_WIDTH,
  TABLE_GROUP_COLORS,
} from '@/lib/constants/table-group';
import { chooseRandom, getRandomNumber } from '@/utils/random';

import type { DiagramConfig, Note, TableGroup } from '@/types/diagram';

const isStickyNoteColor = (
  color: string | undefined
): color is (typeof STICKY_NOTE_COLORS)[number] => {
  if (!color) return false;

  return (STICKY_NOTE_COLORS as readonly string[]).includes(color);
};

const isTableGroupColor = (
  color: string | undefined
): color is (typeof TABLE_GROUP_COLORS)[number] => {
  if (!color) return false;

  return (TABLE_GROUP_COLORS as readonly string[]).includes(color);
};

export const normalizeNote = (note: Note): Note => {
  return {
    ...note,
    id: note.id || uuidv4(),
    color: isStickyNoteColor(note.color) ? note.color : chooseRandom(STICKY_NOTE_COLORS),
    width: note.width ?? DEFAULT_NOTE_WIDTH,
    height: note.height ?? DEFAULT_NOTE_HEIGHT,
    rotation: note.rotation ?? getRandomNumber(-2, 2),
  };
};

export const normalizeTableGroup = (group: TableGroup): TableGroup => {
  return {
    ...group,
    id: group.id || uuidv4(),
    color: isTableGroupColor(group.color) ? group.color : chooseRandom(TABLE_GROUP_COLORS),
    width: group.width ?? DEFAULT_TABLE_GROUP_WIDTH,
    height: group.height ?? DEFAULT_TABLE_GROUP_HEIGHT,
  };
};

export const normalizeDiagramConfig = (schema: DiagramConfig): DiagramConfig => {
  return {
    ...schema,
    tables: schema.tables ?? [],
    relations: schema.relations ?? [],
    notes: (schema.notes ?? []).map(normalizeNote),
    tableGroups: (schema.tableGroups ?? []).map(normalizeTableGroup),
  };
};
