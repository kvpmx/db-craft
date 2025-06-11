<script lang="ts" setup>
  import { ProjectsController } from '@/lib/controllers';
  import type { TablesInsert } from '@/types/database';

  definePageMeta({ layout: 'main' });

  const queryClient = useQueryClient();
  const projectsApi = useApiController(ProjectsController);

  const { t } = useI18n();

  const invalidateProjectsQuery = () => {
    queryClient.invalidateQueries({ queryKey: ['projects'] });
  };

  // Get all projects
  const { data, suspense, isPending } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => await projectsApi.getAll(),
  });

  onServerPrefetch(async () => {
    await suspense();
  });

  // Search projects
  const searchQuery = ref('');

  const filteredProjects = computed(() => {
    return data.value?.filter((project) => includesIgnoreCase(project.name, searchQuery.value));
  });

  // Delete project
  const { mutateAsync: deleteProject } = useAdvancedMutation({
    mutationKey: ['deleteProject'],
    mutationFn: async (id: number) => await projectsApi.delete(id),
    successMessage: t('PROJECT_DELETED'),
    onSuccess: invalidateProjectsQuery,
  });

  // Duplicate project
  const { mutateAsync: duplicateProject } = useAdvancedMutation({
    mutationKey: ['duplicateProject'],
    mutationFn: async (project: TablesInsert<'projects'>) => await projectsApi.duplicate(project),
    successMessage: t('PROJECT_DUPLICATED'),
    onSuccess: invalidateProjectsQuery,
  });
</script>

<template>
  <PageMeta :title="t('HOME_PAGE_TITLE')" :description="t('HOME_PAGE_DESCRIPTION')" />

  <div class="mb-6 flex items-center justify-between gap-2">
    <div class="relative w-full max-w-md">
      <Icon
        name="lucide:search"
        size="1rem"
        class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400"
      />
      <Input
        id="search-projects"
        v-model="searchQuery"
        type="search"
        :placeholder="t('SEARCH_PROJECTS')"
        class="pl-10"
      />
    </div>

    <HomeCreateDiagramModal />
  </div>

  <div
    v-if="!isPending && !filteredProjects?.length"
    class="my-40 flex flex-1 items-center justify-center text-center text-xl font-medium italic text-gray-600"
  >
    {{ t('NO_PROJECTS_FOUND') }}
  </div>
  <div v-else class="grid grid-cols-1 gap-6 sm-tablet:grid-cols-2 lg:grid-cols-3">
    <template v-if="isPending">
      <Skeleton
        v-for="index in 6"
        :key="index"
        class="h-[315px] rounded-lg border border-slate-200 bg-white shadow-sm"
      />
    </template>
    <template v-else>
      <HomeProjectCard
        v-for="project in filteredProjects"
        :key="project.id"
        :project="project"
        :search-query="searchQuery"
        @delete="deleteProject"
        @duplicate="duplicateProject"
      />
    </template>
  </div>
</template>
