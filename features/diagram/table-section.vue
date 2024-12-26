<script lang="ts" generic="T extends DatabaseType" setup>
  import type { Table } from '@/types/diagram';
  import type { DatabaseType } from '@/lib/constants/diagram';

  const props = defineProps<{
    table: Table<T>;
    searchQuery?: string;
  }>();

  const isOpen = ref(false);

  watchEffect(() => {
    isOpen.value = Boolean(props.searchQuery);
  });
</script>

<template>
  <Collapsible v-model:open="isOpen" class="w-full">
    <CollapsibleTrigger
      ref="trigger"
      class="hover:bg-accent hover:text-accent-foreground flex w-full items-center justify-between gap-2 border-y-[1px] border-gray-400 p-2 pl-1 text-sm font-medium"
      :style="{ backgroundColor: props.table.color }"
    >
      <span class="flex items-center gap-1">
        <Icon name="clarity:drag-handle-line" size="1.5rem" class="sortable-handle">++</Icon>
        <span v-html="textWithHighlight(props.table.name, props.searchQuery)"></span>
      </span>

      <Icon
        name="lucide:chevron-down"
        size="1rem"
        class="text-muted-foreground"
        :style="{ transform: `rotate(${isOpen ? '180deg' : '0deg'})` }"
      />
    </CollapsibleTrigger>

    <CollapsibleContent class="mb-2 px-2">
      <div
        v-for="column in props.table.fields"
        :key="column.name"
        class="flex items-center justify-between py-1 text-sm"
      >
        <span v-html="textWithHighlight(column.name, props.searchQuery)"></span>
        <span class="text-muted-foreground">{{ column.type }}</span>
      </div>
    </CollapsibleContent>
  </Collapsible>
</template>
