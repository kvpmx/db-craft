<script lang="ts" generic="T extends DatabaseType" setup>
  import type { Table } from '@/types/diagram';
  import type { DatabaseType } from '@/lib/constants/diagram';

  const props = defineProps<{
    table: Table<T>;
  }>();
</script>

<template>
  <Collapsible class="w-full">
    <CollapsibleTrigger
      class="hover:bg-accent hover:text-accent-foreground mb-2 flex w-full items-center gap-2 rounded-md bg-blue-200 p-2 text-sm font-medium"
    >
      <Icon name="lucide:chevron-down" size="1rem" class="text-muted-foreground" />
      {{ props.table.name }}
    </CollapsibleTrigger>

    <CollapsibleContent class="mb-2 px-2">
      <div
        v-for="column in props.table.fields"
        :key="column.name"
        class="flex items-center justify-between py-1 text-sm"
      >
        <span>{{ column.name }}</span>
        <span class="text-muted-foreground">{{ column.type }}</span>
      </div>
    </CollapsibleContent>
  </Collapsible>
</template>
