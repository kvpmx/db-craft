import { ProjectsController } from '@/lib/controllers';
import type { Tables } from '@/types/database';
import type { DiagramConfig, TableField } from '@/types/diagram';

export const useCurrentProject = defineStore('current-project', () => {
  const state = ref<Tables<'projects'> | null>(null);
  const saved = ref(true);

  const projectsApi = useApiController(ProjectsController);

  const fetch = async (id: number) => {
    const data = await projectsApi.getById(id);
    state.value = data;
    return true;
  };

  const updateDiagramConfig = async (payload: Partial<DiagramConfig>) => {
    if (!state.value) return;

    state.value.schema = {
      ...state.value.schema,
      ...payload,
    };
  };

  const updateTableFields = async (id: string, fields: TableField[]) => {
    if (!state.value) return;

    const table = state.value.schema.tables.find((table) => {
      return table.id === id;
    });

    if (!table) return;
    table.fields = fields;
  };

  const reset = () => {
    state.value = null;
    saved.value = true;
  };

  const saveConfigToDatabase = async () => {
    if (!state.value) return;

    await projectsApi.update(state.value.id, {
      schema: state.value.schema,
    });

    saved.value = true;
  };

  watch(
    state,
    (currentValue, previousValue) => {
      if (!currentValue || !previousValue) return;
      saved.value = false;
    },
    { deep: true }
  );

  return {
    state,
    saved,
    fetch,
    updateDiagramConfig,
    updateTableFields,
    reset,
    saveConfigToDatabase,
  };
});
