<script lang="ts" setup>
  import { ProjectsController } from '@/lib/controllers';

  definePageMeta({ middleware: 'diagram-validate' });

  const route = useRoute();
  const projectsApi = useApiController(ProjectsController);

  const projectId = computed(() => {
    return Number(getRouteParamValue(route.params.id));
  });

  const { data, suspense, isPending } = useQuery({
    queryKey: ['project', projectId.value],
    queryFn: async () => {
      return await projectsApi.getById(projectId.value);
    },
  });

  onServerPrefetch(async () => {
    await suspense();
  });
</script>

<template>
  <div class="flex h-[100vh]">
    <DiagramSidebar :tables="data?.schema.tables ?? []" />

    <main class="bg-muted/10 w-full flex-1">
      <DiagramCanvas v-if="!isPending && data?.schema" :schema="data.schema" />
    </main>
  </div>
</template>
