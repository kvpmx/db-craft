export const useSelectedRelation = defineStore('selected-relation', () => {
  const id = ref<string | null>(null);
  const flag = ref(false);

  const setId = (relationId: string | null) => {
    id.value = relationId;
  };

  const toggleFlag = () => {
    flag.value = !flag.value;
  };

  return { id, setId, flag, toggleFlag };
});
