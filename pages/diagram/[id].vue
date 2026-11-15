<script lang="ts" setup>
  definePageMeta({ middleware: 'diagram-validate', key: (route) => route.fullPath });

  const { t } = useI18n();
  const route = useRoute();

  const projectId = Number(getRouteParamValue(route.params.id));

  const currentProject = useCurrentProject();

  // Fetch the project data
  const { status } = useAsyncData(`project-${projectId}`, async () => {
    return await currentProject.fetch(projectId);
  });

  // Check if the project has unsaved changes before leaving the page
  onBeforeRouteLeave(async () => {
    if (currentProject.isCollaborative && !currentProject.saved) {
      try {
        await currentProject.saveConfigToDatabase();
      } catch {
        /* Ask before discarding unsaved work. */
      }
    }
    if (currentProject.saved) return true;
    return window.confirm(t('UNSAVED_CHANGES_WARNING'));
  });

  const beforeUnload = (event: BeforeUnloadEvent) => {
    if (!currentProject.saved) {
      event.preventDefault();
      event.returnValue = '';
    }
  };

  onMounted(() => {
    window.addEventListener('beforeunload', beforeUnload);
    watch(
      () => status.value,
      () => {
        if (status.value === 'success') void currentProject.startCollaboration();
      },
      { immediate: true }
    );
  });

  onBeforeUnmount(() => {
    window.removeEventListener('beforeunload', beforeUnload);
    currentProject.stopCollaboration(projectId);
  });

  onUnmounted(() => {
    currentProject.reset(projectId);
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
        <DiagramCanvas :readonly="!currentProject.canEdit" />
      </main>
    </div>
  </div>
</template>
