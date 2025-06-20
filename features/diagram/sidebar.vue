<script lang="ts" generic="T extends DatabaseType" setup>
  import { v4 as uuidv4 } from 'uuid';
  import { useSortable } from '@vueuse/integrations/useSortable';
  import { DEFAULT_COLORS } from '@/lib/constants/colors';
  import { PRIMARY_KEY_DEFAULT_TYPES } from '@/lib/constants/diagram';

  import type { DatabaseType } from '@/lib/constants/diagram';

  const props = defineProps<{
    pending: boolean;
  }>();

  const { t } = useI18n();
  const currentProject = useCurrentProject();
  const searchQuery = ref('');

  const tables = computed({
    get: () => currentProject.state?.schema.tables ?? [],
    set: (value) => currentProject.updateDiagramConfig({ tables: value }),
  });

  // Make a table list sortable
  useSortable('#tables-sortable-container', tables, {
    handle: '.table-section-header',
    filter: '.edit-table-name-input',
    preventOnFilter: false,
    animation: 150,
    forceFallback: true,
    fallbackTolerance: 5,
  });

  // Hide sidebar
  const sidebarHidden = ref(false);

  // Add a new table
  const addTable = () => {
    if (!currentProject.state) return;
    const count = currentProject.state.schema.tables.length;

    currentProject.state.schema.tables.push({
      id: uuidv4(),
      name: `new_table_${count + 1}`,
      fields: [
        {
          id: uuidv4(),
          name: 'id',
          type: PRIMARY_KEY_DEFAULT_TYPES[currentProject.state.type],
          primary_key: true,
        },
      ],
      color: chooseRandom(DEFAULT_COLORS),
      position: { x: getRandomNumber(-300, 300), y: getRandomNumber(-300, 300) },
    });
  };

  // Open the selected table section
  const openedTableId = ref<string>();
  const selectedTable = useSelectedTable();

  watch(
    () => [selectedTable.id, selectedTable.flag],
    () => (openedTableId.value = selectedTable.id ?? openedTableId.value)
  );
</script>

<template>
  <aside
    class="relative flex w-[350px] flex-col border-r transition-all"
    :style="{ marginLeft: sidebarHidden ? '-350px' : '0' }"
  >
    <div class="flex items-center justify-between gap-4 border-b px-3 py-2">
      <h2 class="text-md font-semibold">{{ t('TABLES') }}</h2>
      <Button class="justify-start" variant="secondary" size="xs" @click="addTable">
        <Icon name="lucide:table-2" size="1rem" class="mr-2 h-4 w-4" />
        {{ t('NEW_TABLE') }}
      </Button>
    </div>

    <div
      v-if="tables.every((table) => !includesIgnoreCase(table.name, searchQuery)) && !pending"
      class="flex flex-1 items-center justify-center gap-4 overflow-y-scroll text-center text-xl font-medium italic text-gray-600"
    >
      {{ t('NO_TABLES_FOUND') }}
    </div>

    <Accordion
      v-else
      id="tables-sortable-container"
      v-model:model-value="openedTableId"
      type="single"
      :collapsible="true"
      class="flex-1 overflow-y-scroll p-2"
      @update:model-value="
        () => {
          if (selectedTable.id) {
            selectedTable.setId(null);
          }
        }
      "
    >
      <DiagramTableSection
        v-for="table in tables"
        :key="table.id"
        :table="table"
        :search-query="searchQuery"
      />
    </Accordion>

    <div class="border-t p-3">
      <div class="relative">
        <Icon
          name="lucide:search"
          size="1rem"
          class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400"
        />
        <Input
          id="search-tables-or-columns"
          v-model="searchQuery"
          type="search"
          :title="t('SEARCH_TABLE')"
          :placeholder="t('SEARCH')"
          class="pl-10"
        />
      </div>
    </div>

    <Button
      variant="outline"
      size="xs"
      class="absolute -right-10 top-2 z-10 px-1.5"
      @click="sidebarHidden = !sidebarHidden"
    >
      <Icon
        :name="sidebarHidden ? 'lucide:panel-left-open' : 'lucide:panel-left-close'"
        size="1rem"
        class="h-4 w-4"
      />
    </Button>
  </aside>
</template>
