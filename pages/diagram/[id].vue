<script lang="ts" setup>
  definePageMeta({ middleware: 'diagram-validate' });

  const { t } = useI18n();
  const route = useRoute();

  const projectId = computed(() => {
    return Number(getRouteParamValue(route.params.id));
  });

  const currentProject = useCurrentProject();

  useAsyncData(`project-${projectId.value}`, async () => {
    return await currentProject.fetch(projectId.value);
  });
</script>

<template>
  <PageMeta
    v-if="currentProject.state?.name"
    :title="currentProject.state.name"
    :description="t('DIAGRAM_PAGE_DESCRIPTION')"
  />

  <div class="flex h-[100vh]">
    <DiagramSidebar />
    <main class="bg-muted/10 w-full flex-1">
      <DiagramCanvas />
    </main>
  </div>
</template>
