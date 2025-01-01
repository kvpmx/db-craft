import { ProjectsController } from '@/lib/controllers';
import type { Tables } from '@/types/database';
import type { DiagramConfig, TableField } from '@/types/diagram';

export interface UpdateDiagramConfigOptions {
  /** Save modified diagram config to the database */
  saveToDatabase?: boolean;
}

const DEFAULT_UPDATE_DIAGRAM_CONFIG_OPTIONS: UpdateDiagramConfigOptions = {
  saveToDatabase: true,
};

export const useCurrentProject = defineStore('current-project', () => {
  const state = ref<Tables<'projects'> | null>(null);
  const projectsApi = useApiController(ProjectsController);

  const fetch = async (id: number) => {
    const data = await projectsApi.getById(id);
    state.value = data;
    return true;
  };

  const updateDiagramConfig = async (
    payload: Partial<DiagramConfig>,
    options: UpdateDiagramConfigOptions = DEFAULT_UPDATE_DIAGRAM_CONFIG_OPTIONS
  ) => {
    if (!state.value) return;

    state.value.schema = {
      ...state.value.schema,
      ...payload,
    };

    if (options.saveToDatabase) {
      await projectsApi.update(state.value.id, {
        schema: state.value.schema,
      });
    }
  };

  const updateTableFields = async (
    id: string,
    fields: TableField[],
    options: UpdateDiagramConfigOptions = DEFAULT_UPDATE_DIAGRAM_CONFIG_OPTIONS
  ) => {
    if (!state.value) return;

    const table = state.value.schema.tables.find((table) => {
      return table.id === id;
    });

    if (!table) return;
    table.fields = fields;

    if (options.saveToDatabase) {
      await projectsApi.update(state.value.id, {
        schema: state.value.schema,
      });
    }
  };

  return { state, fetch, updateDiagramConfig, updateTableFields };
});
