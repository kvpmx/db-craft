<script lang="ts" setup>
  import { ProjectsController } from '@/lib/controllers';
  import type { TablesInsert } from '@/types/database';

  definePageMeta({ layout: 'main' });

  const queryClient = useQueryClient();
  const projectsApi = useApiController(ProjectsController);

  const invalidateProjectsQuery = () => {
    queryClient.invalidateQueries({ queryKey: ['projects'] });
  };

  // Get all projects
  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => await projectsApi.getAll(),
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
    successMessage: 'Project has been deleted',
    onSuccess: invalidateProjectsQuery,
  });

  // Duplicate project
  const { mutateAsync: duplicateProject } = useAdvancedMutation({
    mutationKey: ['duplicateProject'],
    mutationFn: async (project: TablesInsert<'projects'>) => await projectsApi.duplicate(project),
    successMessage: 'Project has been duplicated',
    onSuccess: invalidateProjectsQuery,
  });
</script>

<template>
  <PageMeta title="Home" description="DB Craft is a database design tool for developers" />

  <div class="flex justify-between items-center mb-6 gap-2">
    <div class="relative w-full max-w-md">
      <Icon
        name="lucide:search"
        size="1rem"
        class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
      />
      <Input v-model="searchQuery" type="search" placeholder="Search projects..." class="pl-10" />
    </div>
    <Button>
      <Icon name="lucide:plus" size="1rem" class="mr-2" />
      New Project
    </Button>
  </div>

  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    <ProjectCard
      v-for="project in filteredProjects"
      :key="project.id"
      :project="project"
      @delete="deleteProject"
      @duplicate="duplicateProject"
    />
  </div>
</template>
