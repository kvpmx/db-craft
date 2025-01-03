<script lang="ts" setup>
  definePageMeta({ middleware: 'diagram-validate' });

  const { t } = useI18n();
  const route = useRoute();

  const projectId = computed(() => {
    return Number(getRouteParamValue(route.params.id));
  });

  const currentProject = useCurrentProject();

  // Fetch the project data
  useAsyncData(`project-${projectId.value}`, async () => {
    return await currentProject.fetch(projectId.value);
  });

  // Check if the project has unsaved changes before leaving the page
  onBeforeRouteLeave(() => {
    if (currentProject.saved) return true;
    return window.confirm(t('UNSAVED_CHANGES_WARNING'));
  });

  onUnmounted(() => {
    currentProject.reset();
  });
</script>

<template>
  <PageMeta
    v-if="currentProject.state?.name"
    :title="currentProject.state.name"
    :description="t('DIAGRAM_PAGE_DESCRIPTION')"
  />
  <div class="flex h-[100vh] flex-col overflow-hidden">
    <DiagramPageHeader />

    <div class="flex max-h-[calc(100vh-58px)] flex-1">
      <DiagramSidebar />
      <main class="bg-muted/10 w-full flex-1">
        <DiagramCanvas />
      </main>
    </div>
  </div>
</template>
