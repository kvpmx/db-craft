<script lang="ts" setup>
  import type { Database, TablesInsert } from '@/types/database.types';

  const supabase = useSupabaseClient<Database>();
  const user = useSupabaseUser();

  const queryClient = useQueryClient();

  // Get all projects
  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      if (!user) return;
      const { data } = await supabase.from('projects').select('*').eq('author', user.value.id);
      return data;
    },
  });

  // Search projects
  const searchQuery = ref('');

  const filteredProjects = computed(() => {
    return projects.value?.filter((project) => {
      return project.name.toLowerCase().includes(searchQuery.value.toLowerCase());
    });
  });

  // Delete project
  const { mutateAsync: deleteProject } = useMutation({
    mutationKey: ['deleteProject'],
    mutationFn: async (id: number) => {
      await supabase.from('projects').delete().eq('id', id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  // Duplicate project
  const { mutateAsync: duplicateProject } = useMutation({
    mutationKey: ['duplicateProject'],
    mutationFn: async (project: TablesInsert<'projects'>) => {
      await supabase.from('projects').insert({
        ...project,
        id: undefined,
        created_at: undefined,
        last_modified_at: undefined,
        name: `${project.name} (Copy)`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
</script>

<template>
  <PageMeta title="Home" description="DB Craft is a database design tool for developers" />

  <div class="min-h-screen bg-gray-100">
    <PageHeader />

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex justify-between items-center mb-6">
        <div class="relative w-full max-w-md">
          <Icon
            name="lucide:search"
            size="1rem"
            class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <Input
            v-model="searchQuery"
            type="search"
            placeholder="Search projects..."
            class="pl-10"
          />
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
    </main>
  </div>
</template>
