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
  const { data: projects, suspense } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => await projectsApi.getAll(),
  });

  onServerPrefetch(async () => {
    await suspense();
  });

  // Search projects
  const searchQuery = ref('');

  const filteredProjects = computed(() => {
    return projects.value?.filter((project) => {
      return project.name.toLowerCase().includes(searchQuery.value.toLowerCase());
    });
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
        class="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400"
      />
      <Input
        v-model="searchQuery"
        type="search"
        :placeholder="t('SEARCH_PROJECTS')"
        class="pl-10"
      />
    </div>

    <CreateDiagramModal />
  </div>

  <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
    <ProjectCard
      v-for="project in filteredProjects"
      :key="project.id"
      :project="project"
      @delete="deleteProject"
      @duplicate="duplicateProject"
    />
  </div>
</template>
