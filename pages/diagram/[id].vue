<script lang="ts" setup>
  definePageMeta({ middleware: 'diagram-validate' });

  const { t } = useI18n();
  const route = useRoute();

  const projectId = computed(() => {
    return Number(getRouteParamValue(route.params.id));
  });

  const currentProject = useCurrentProject();

  // Fetch the project data
  const { status } = useAsyncData(`project-${projectId.value}`, async () => {
    return await currentProject.fetch(projectId.value);
  });

  // Check if the project has unsaved changes before leaving the page
  onBeforeRouteLeave(() => {
    if (currentProject.saved) return true;
    return window.confirm(t('UNSAVED_CHANGES_WARNING'));
  });

  onMounted(() => {
    window.addEventListener('beforeunload', (e) => {
      if (!currentProject.saved) {
        e.preventDefault();
      }
    });
  });

  onUnmounted(() => {
    currentProject.reset();
  });
</script>

<template>
  <PageMeta
    v-if="currentProject.state?.name"
    :title="`${currentProject.state.name} - DB Craft`"
    :description="t('DIAGRAM_PAGE_DESCRIPTION')"
  />
  <div class="flex h-[100vh] flex-col overflow-hidden">
    <DiagramPageHeader />

    <div class="flex max-h-[calc(100vh-58px)] flex-1">
      <DiagramSidebar :pending="status === 'pending'" />
      <main class="w-full flex-1 bg-neutral-100/10">
        <DiagramCanvas />
      </main>
    </div>
  </div>
</template>
