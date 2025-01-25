export const useVueFlowCanvas = defineStore('vue-flow-canvas', () => {
  const state = ref<HTMLDivElement | null>(null);
  const fitView = ref<((nodes: string[]) => void) | null>(null);

  const set = (canvas: HTMLDivElement) => {
    state.value = canvas;
  };

  const registerFitViewFunction = (fitViewFn: (nodes: string[]) => void) => {
    fitView.value = fitViewFn;
  };

  return { state, set, fitView, registerFitViewFunction };
});
