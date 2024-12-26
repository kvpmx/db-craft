<script lang="ts" generic="T extends DatabaseType" setup>
  import { useSortable } from '@vueuse/integrations/useSortable';

  import type { Table } from '@/types/diagram';
  import type { DatabaseType } from '@/lib/constants/diagram';

  const { t } = useI18n();

  const props = defineProps<{
    tables: Table<T>[];
  }>();

  const searchQuery = ref('');

  const tables = computed(() => {
    return props.tables?.filter((table) => {
      const titleMatch = includesText(table.name, searchQuery.value);

      const columnsMatch = table.fields.some((field) => {
        return includesText(field.name, searchQuery.value);
      });

      return titleMatch || columnsMatch;
    });
  });

  useSortable('#sortable-container', tables, {
    handle: '.sortable-handle',
    animation: 150,
  });
</script>

<template>
  <aside class="flex w-80 max-w-[100vh] flex-col border-r">
    <div class="flex items-center justify-between gap-4 border-b p-3">
      <h2 class="text-xl font-semibold">{{ t('TABLES') }}</h2>
      <Button class="justify-start" variant="default" size="sm">
        <Icon name="lucide:plus" size="1rem" class="mr-2" />
        {{ t('NEW_TABLE') }}
      </Button>
    </div>

    <div id="sortable-container" class="flex-1 overflow-y-auto">
      <DiagramTableSection
        v-for="table in tables"
        :key="table.id"
        :table="table"
        :search-query="searchQuery"
      />
    </div>

    <div class="border-t p-3">
      <div class="relative">
        <Icon
          name="lucide:search"
          size="1rem"
          class="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400"
        />
        <Input
          id="search-tables-or-columns"
          v-model="searchQuery"
          type="search"
          :title="t('SEARCH_TABLE_OR_COLUMN')"
          :placeholder="t('SEARCH')"
          class="pl-10"
        />
      </div>
    </div>
  </aside>
</template>
