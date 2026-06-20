import { useVueFlow } from '@vue-flow/core';

export const useCanvas = () => {
  return useVueFlow('main-canvas');
};

export const useDiagramFitViewParams = () => {
  const currentProject = useCurrentProject();

  const padding = computed(() => {
    const tableCount = currentProject.state?.schema.tables.length ?? 0;

    if (tableCount <= 3) return 0.5;
    if (tableCount <= 8) return 0.2;
    return 0.1;
  });

  return computed(() => ({ padding: padding.value }));
};
