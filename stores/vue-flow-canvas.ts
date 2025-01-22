export const useVueFlowCanvas = defineStore('vue-flow-canvas', () => {
  const state = ref<HTMLDivElement | null>(null);

  const set = (canvas: HTMLDivElement) => {
    state.value = canvas;
  };

  return { state, set };
});
