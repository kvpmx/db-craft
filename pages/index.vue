<script lang="ts" setup>
  import type { Database, TablesInsert } from '@/types/database.types';

  const supabase = useSupabaseClient<Database>();
  const user = useSupabaseUser();

  const { data: projects } = await useAsyncData('projects', async () => {
    if (!user) return;
    const { data } = await supabase.from('projects').select('*').eq('author', user.value.id);
    return data;
  });

  const searchQuery = ref('');

  const filteredProjects = computed(() => {
    return projects.value?.filter((project) => {
      return project.name.toLowerCase().includes(searchQuery.value.toLowerCase());
    });
  });

  const handleDelete = async (id: number) => {
    // await supabase.from('projects').delete().eq('id', id);
  };

  const handleDuplicate = async (project: TablesInsert<'projects'>) => {
    // delete project.id;
    // delete project.created_at;
    // delete project.last_modified_at;
    //
    // await supabase.from('projects').insert({
    //   ...project,
    //   name: `${project.name} (Copy)`,
    // });
  };
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
          @delete="handleDelete"
          @duplicate="handleDuplicate"
        />
      </div>
    </main>
  </div>
</template>
