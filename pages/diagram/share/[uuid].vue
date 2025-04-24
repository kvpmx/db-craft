<script lang="ts" setup>
  definePageMeta({ middleware: 'public-diagram-validate' });

  const { t } = useI18n();
  const route = useRoute();

  const uuid = computed(() => getRouteParamValue(route.params.uuid));
  const currentProject = useCurrentProject();

  // Fetch the project data by UUID
  useAsyncData(`project-${uuid.value}`, async () => {
    return await currentProject.fetchPublic(uuid.value);
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
  <main class="h-screen w-screen overflow-hidden">
    <DiagramCanvas :readonly="true" />
  </main>
</template>
