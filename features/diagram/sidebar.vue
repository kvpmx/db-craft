<script lang="ts" generic="T extends DatabaseType" setup>
  import { useSortable } from '@vueuse/integrations/useSortable';

  import type { Table } from '@/types/diagram';
  import type { DatabaseType } from '@/lib/constants/diagram';

  // TODO: add translation keys

  const props = defineProps<{
    tables: Table<T>[];
  }>();

  const tables = ref(props.tables);

  // @ts-expect-error: The `useSortable` composable does not have proper type definitions to work in Nuxt.js
  useSortable('#sortable-container', tables, {
    handle: '.sortable-handle',
    animation: 150,
  });
</script>

<template>
  <aside class="flex w-80 max-w-[100vh] flex-col border-r">
    <div class="flex items-center justify-between gap-4 border-b p-3">
      <h2 class="text-xl font-semibold">Tables</h2>
      <Button class="justify-start" variant="default" size="sm">
        <Icon name="lucide:plus" size="1rem" class="mr-2" />
        New table
      </Button>
    </div>

    <div id="sortable-container" class="flex-1 overflow-y-auto">
      <DiagramTableSection v-for="table in tables" :key="table.id" :table="table" />
    </div>

    <div class="border-t p-3">
      <div class="relative">
        <Icon
          name="lucide:search"
          size="1rem"
          class="text-muted-foreground absolute left-2 top-2.5"
        />
        <Input placeholder="Search for a table name" class="pl-8" />
      </div>
    </div>
  </aside>
</template>
