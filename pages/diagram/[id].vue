<script lang="ts" setup>
  import { ProjectsController } from '@/lib/controllers';

  definePageMeta({ middleware: 'diagram-validate' });

  const { t } = useI18n();

  const route = useRoute();
  const projectsApi = useApiController(ProjectsController);

  const projectId = computed(() => {
    return Number(getRouteParamValue(route.params.id));
  });

  const { data, suspense } = useQuery({
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
  <PageMeta v-if="data?.name" :title="data?.name" :description="t('DIAGRAM_PAGE_DESCRIPTION')" />

  <div class="flex h-[100vh]">
    <DiagramSidebar :id="projectId" :schema="data?.schema" />

    <main class="bg-muted/10 w-full flex-1">
      <DiagramCanvas :schema="data?.schema" />
    </main>
  </div>
</template>
