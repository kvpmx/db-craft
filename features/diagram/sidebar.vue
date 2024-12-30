<script lang="ts" generic="T extends DatabaseType" setup>
  import { useSortable } from '@vueuse/integrations/useSortable';
  import { ProjectsController } from '@/lib/controllers';

  import type { DiagramConfig, Table } from '@/types/diagram';
  import type { DatabaseType } from '@/lib/constants/diagram';

  const { t } = useI18n();
  const projectsApi = useApiController(ProjectsController);

  const props = defineProps<{
    id: number;
    schema?: DiagramConfig<T>;
  }>();

  // Get tables
  const tables = ref<Table<T>[]>([]);

  watchEffect(() => {
    if (!props.schema) return;
    tables.value = props.schema.tables;
  });

  // Search tables or columns
  const searchQuery = ref('');

  const filteredTables = computed(() => {
    return tables.value?.filter((table) => {
      const titleMatch = includesIgnoreCase(table.name, searchQuery.value);

      const columnsMatch = table.fields.some((field) => {
        return includesIgnoreCase(field.name, searchQuery.value);
      });

      return titleMatch || columnsMatch;
    });
  });

  // Make tables list sortable
  useSortable('#tables-sortable-container', tables, {
    handle: '.table-section-header',
    animation: 150,
    forceFallback: true,
    delay: 100,
    touchStartThreshold: 10,
    onEnd: () => {
      nextTick(async () => {
        if (!props.schema) return;

        await projectsApi.update(props.id, {
          schema: {
            ...props.schema,
            tables: tables.value,
          },
        });
      });
    },
  });
</script>

<template>
  <aside class="flex w-[350px] max-w-[100vh] flex-col border-r">
    <div class="flex items-center justify-between gap-4 border-b p-3">
      <h2 class="text-xl font-semibold">{{ t('TABLES') }}</h2>
      <Button class="justify-start" variant="default" size="sm">
        <Icon name="lucide:plus" size="1rem" class="mr-2" />
        {{ t('NEW_TABLE') }}
      </Button>
    </div>

    <div id="tables-sortable-container" class="flex-1 overflow-y-auto p-2">
      <DiagramTableSection
        v-for="table in filteredTables"
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
