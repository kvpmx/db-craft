import { v4 as uuidv4 } from 'uuid';
import { useRefHistory } from '@vueuse/core';
import { cloneDeep } from 'es-toolkit';
import { DiagramProvider } from '@/lib/collaboration/provider';
import type { CollaborationStatus, Participant, SharedDiagram } from '@/types/collaboration';
import { ProjectsController } from '@/lib/controllers';
import { DEFAULT_NOTE_HEIGHT, DEFAULT_NOTE_WIDTH, STICKY_NOTE_COLORS } from '@/lib/constants/note';
import {
  DEFAULT_TABLE_GROUP_HEIGHT,
  DEFAULT_TABLE_GROUP_WIDTH,
  TABLE_GROUP_COLORS,
} from '@/lib/constants/table-group';

import type { Tables } from '@/types/database';
import type {
  DiagramConfig,
  Note,
  Position,
  Table,
  TableGroup,
  TableRelation,
} from '@/types/diagram';

export const useCurrentProject = defineStore('current-project', () => {
  const state = ref<Tables<'projects'> | null>(null);
  const saved = ref(true);
  const editPermission = ref(false);
  const publicView = ref(false);
  const collaborationReady = ref(false);
  const collaborationStatus = ref<CollaborationStatus>('inactive');
  const participants = ref<Participant[]>([]);
  const isCollaborative = computed(() => !!state.value?.team_id && !publicView.value);
  const canEdit = computed(
    () => editPermission.value && (!isCollaborative.value || collaborationReady.value)
  );
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();
  let provider: DiagramProvider | undefined;
  let providerProjectId: number | undefined;
  let applyingRemote = false;
  let previousDiagram: SharedDiagram | null = null;

  const sharedDiagram = (): SharedDiagram | null =>
    state.value
      ? cloneDeep({
          name: state.value.name,
          visibility: state.value.visibility,
          schema: state.value.schema,
        })
      : null;

  const startCollaboration = async () => {
    if (!isCollaborative.value || !state.value || !user.value) return;
    const projectId = state.value.id;
    if (providerProjectId === projectId) return;
    stopCollaboration();
    providerProjectId = projectId;
    changesHistory.pause();
    previousDiagram = sharedDiagram();
    provider = new DiagramProvider({
      client: supabase,
      projectId,
      user: user.value,
      canEdit: editPermission.value,
      onChange: (diagram) => {
        if (state.value?.id !== projectId) return;
        applyingRemote = true;
        previousDiagram = cloneDeep(diagram);
        Object.assign(state.value, diagram);
        applyingRemote = false;
      },
      onStatus: (status) => {
        collaborationStatus.value = status;
      },
      onParticipants: (value) => {
        participants.value = value;
      },
      onSaved: (value, timestamp) => {
        saved.value = value;
        if (state.value && timestamp) state.value.last_modified_at = timestamp;
      },
      onReady: () => {
        collaborationReady.value = true;
      },
    });
    try {
      await provider.connect();
    } catch {
      collaborationStatus.value = 'error';
    }
  };

  const stopCollaboration = (projectId?: number) => {
    if (projectId !== undefined && providerProjectId !== projectId) return;
    provider?.destroy();
    provider = undefined;
    providerProjectId = undefined;
    previousDiagram = null;
    collaborationReady.value = false;
    participants.value = [];
    collaborationStatus.value = 'inactive';
  };

  const updateCursor = (position: Position | null) => provider?.setCursor(position);
  const undo = () => {
    if (!canEdit.value) return;
    if (isCollaborative.value) provider?.undo();
    else if (changesHistory.canUndo.value && changesHistory.history.value.length > 2)
      changesHistory.undo();
  };
  const redo = () => {
    if (!canEdit.value) return;
    if (isCollaborative.value) provider?.redo();
    else if (changesHistory.canRedo.value) changesHistory.redo();
  };

  const projectsApi = useApiController(ProjectsController);
  const changesHistory = useRefHistory(state, { deep: true, capacity: 20 });

  const updateCanEdit = async () => {
    if (!state.value) return;
    editPermission.value = await projectsApi.canEdit(state.value);
  };

  const fetch = async (id: number) => {
    if (state.value?.id !== id) {
      stopCollaboration();
      changesHistory.resume();
      editPermission.value = false;
    }
    try {
      publicView.value = false;
      state.value = await projectsApi.getById(id);
      if (state.value) await updateCanEdit();
      saved.value = true;
      return true;
    } catch {
      return false;
    }
  };

  const fetchPublic = async (uuid: string) => {
    try {
      publicView.value = true;
      editPermission.value = false;
      state.value = await projectsApi.getPublic(uuid);
      return true;
    } catch {
      return false;
    }
  };

  const updateDiagramConfig = async (payload: Partial<DiagramConfig>) => {
    if (!state.value || !canEdit.value) return;

    state.value.schema = {
      ...state.value.schema,
      ...payload,
    };
  };

  const updateTableData = async (id: string, payload: Partial<Table>) => {
    if (!state.value || !canEdit.value) return;

    const table = state.value.schema.tables.find((table) => {
      return table.id === id;
    });

    if (!table) return;

    Object.assign(table, payload);
  };

  const deleteTable = async (id: string) => {
    if (!state.value || !canEdit.value) return;

    state.value.schema.tables = state.value.schema.tables.filter((table) => {
      return table.id !== id;
    });

    state.value.schema.relations = state.value.schema.relations.filter((rel) => {
      return rel.source !== id && rel.target !== id;
    });
  };

  const addNote = (position?: Position) => {
    if (!state.value || !canEdit.value) return;

    if (!state.value.schema.notes) {
      state.value.schema.notes = [];
    }

    state.value.schema.notes.push({
      id: uuidv4(),
      content: '',
      position: position ?? { x: getRandomNumber(-300, 300), y: getRandomNumber(-300, 300) },
      color: chooseRandom(STICKY_NOTE_COLORS),
      width: DEFAULT_NOTE_WIDTH,
      height: DEFAULT_NOTE_HEIGHT,
      rotation: getRandomNumber(-2, 2),
    });
  };

  const updateNoteData = (id: string, payload: Partial<Note>) => {
    if (!state.value?.schema.notes || !canEdit.value) return;

    const note = state.value.schema.notes.find((note) => note.id === id);
    if (!note) return;

    Object.assign(note, payload);
  };

  const deleteNote = (id: string) => {
    if (!state.value?.schema.notes || !canEdit.value) return;
    state.value.schema.notes = state.value.schema.notes.filter((note) => note.id !== id);
  };

  const addTableGroup = (position?: Position) => {
    if (!state.value || !canEdit.value) return;

    if (!state.value.schema.tableGroups) {
      state.value.schema.tableGroups = [];
    }

    const count = state.value.schema.tableGroups.length;

    state.value.schema.tableGroups.push({
      id: uuidv4(),
      name: `Group ${count + 1}`,
      position: position ?? { x: getRandomNumber(-300, 300), y: getRandomNumber(-300, 300) },
      color: chooseRandom(TABLE_GROUP_COLORS),
      width: DEFAULT_TABLE_GROUP_WIDTH,
      height: DEFAULT_TABLE_GROUP_HEIGHT,
    });
  };

  const updateTableGroupData = (id: string, payload: Partial<TableGroup>) => {
    if (!state.value?.schema.tableGroups || !canEdit.value) return;

    const group = state.value.schema.tableGroups.find((group) => group.id === id);
    if (!group) return;

    Object.assign(group, payload);
  };

  const deleteTableGroup = (id: string) => {
    if (!state.value?.schema.tableGroups || !canEdit.value) return;
    state.value.schema.tableGroups = state.value.schema.tableGroups.filter(
      (group) => group.id !== id
    );
  };

  const deleteField = async (tableId: string, fieldId: string) => {
    if (!state.value || !canEdit.value) return;

    const table = state.value.schema.tables.find((table) => {
      return table.id === tableId;
    });

    if (!table) return;

    table.fields = table.fields.filter((field) => {
      return field.id !== fieldId;
    });

    state.value.schema.relations = state.value.schema.relations.filter((rel) => {
      return rel.source_field !== fieldId && rel.target_field !== fieldId;
    });
  };

  const addRelation = (relation: TableRelation) => {
    if (!state.value || !canEdit.value) return;
    state.value.schema.relations.push(relation);
  };

  const updateRelation = (id: string, payload: Partial<TableRelation>) => {
    if (!state.value || !canEdit.value) return;

    const relation = state.value.schema.relations.find((relation) => relation.id === id);
    if (!relation) return;

    Object.assign(relation, payload);
  };

  const deleteRelation = (id: string) => {
    if (!state.value || !canEdit.value) return;

    state.value.schema.relations = state.value.schema.relations.filter((relation) => {
      return relation.id !== id;
    });
  };

  const reset = (projectId?: number) => {
    if (projectId !== undefined && state.value?.id !== projectId) return;
    stopCollaboration();
    changesHistory.resume();
    state.value = null;
    saved.value = true;
    editPermission.value = false;
    publicView.value = false;
    changesHistory.clear();
  };

  const saveConfigToDatabase = async () => {
    if (!state.value || !canEdit.value) return;
    if (isCollaborative.value) {
      await provider?.flush();
      return;
    }
    if (saved.value) return;

    state.value.last_modified_at = new Date().toISOString();

    await projectsApi.update(state.value.id, {
      last_modified_at: state.value.last_modified_at,
      name: state.value.name,
      schema: state.value.schema,
      visibility: state.value.visibility,
    });

    saved.value = true;
  };

  const restoreSchema = (schema: DiagramConfig) => {
    if (!state.value || !canEdit.value) return;

    state.value.schema = cloneDeep(schema);
    changesHistory.clear();
  };

  watch(
    state,
    (currentValue, previousValue) => {
      if (
        !currentValue ||
        !previousValue ||
        currentValue.id !== previousValue.id ||
        isCollaborative.value
      )
        return;
      saved.value = false;
    },
    { deep: true }
  );

  watch(
    () => state.value && [state.value.name, state.value.visibility, state.value.schema],
    () => {
      if (applyingRemote || !provider || !canEdit.value) return;
      const next = sharedDiagram();
      if (previousDiagram && next) provider.update(previousDiagram, next);
      previousDiagram = next;
    },
    { deep: true, flush: 'sync' }
  );

  return {
    state,
    // Return permission/lifecycle refs so Pinia hydrates them after SSR.
    editPermission,
    publicView,
    collaborationReady,
    isCollaborative,
    collaborationStatus,
    participants,
    startCollaboration,
    stopCollaboration,
    updateCursor,
    undo,
    redo,
    saved,
    canEdit,
    fetch,
    fetchPublic,
    updateDiagramConfig,
    updateTableData,
    addNote,
    updateNoteData,
    deleteNote,
    addTableGroup,
    updateTableGroupData,
    deleteTableGroup,
    deleteTable,
    deleteField,
    addRelation,
    updateRelation,
    deleteRelation,
    reset,
    changesHistory,
    saveConfigToDatabase,
    restoreSchema,
  };
});
