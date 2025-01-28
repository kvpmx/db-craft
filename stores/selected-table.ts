export const useSelectedTable = defineStore('selected-table', () => {
  const id = ref<string | null>(null);
  const flag = ref(false);

  const setId = (tableId: string | null) => {
    id.value = tableId;
  };

  const toggleFlag = () => {
    flag.value = !flag.value;
  };

  return { id, setId, flag, toggleFlag };
});
