<script lang="ts" generic="T extends DatabaseType" setup>
  import { useSortable } from '@vueuse/integrations/useSortable';

  import type { Table } from '@/types/diagram';
  import type { DatabaseType } from '@/lib/constants/diagram';

  const props = defineProps<{
    table: Table<T>;
    searchQuery?: string;
  }>();

  // Open collapsible on search
  const isOpen = ref(false);

  watchEffect(() => {
    isOpen.value = Boolean(props.searchQuery);
  });

  // Make columns list sortable
  const columns = ref(props.table.fields);
  const columnsContainerRef = ref<HTMLElement | null>(null);

  const isDragging = ref(false);

  useSortable(columnsContainerRef, columns, {
    handle: '.sortable-handle',
    animation: 150,
    forceFallback: true,
    onStart: () => {
      isDragging.value = true;
    },
    onEnd: () => {
      isDragging.value = false;
    },
  });
</script>

<template>
  <Collapsible
    v-model:open="isOpen"
    class="mb-2 w-full overflow-hidden rounded-md border-[1px] border-gray-500 bg-white"
  >
    <CollapsibleTrigger
      class="table-section-header hover:bg-accent hover:text-accent-foreground flex w-full items-center gap-2 p-2 text-sm font-medium data-[state=closed]:rounded-md"
      :style="{ backgroundColor: props.table.color }"
    >
      <Icon
        name="lucide:chevron-down"
        size="1rem"
        class="text-muted-foreground"
        :style="{ transform: `rotate(${isOpen ? '180deg' : '0deg'})` }"
      />
      <span v-html="highlightTextOccurrences(props.table.name, props.searchQuery)"></span>
    </CollapsibleTrigger>

    <CollapsibleContent ref="columnsContainerRef" class="py-2">
      <div
        v-for="column in columns"
        :key="column.id"
        class="column-item transition-color flex items-center justify-between gap-2 p-3 py-1 pl-1"
        :data-dragging="isDragging"
      >
        <Icon
          name="clarity:drag-handle-line"
          size="1.5rem"
          class="sortable-handle h-6 w-6 flex-shrink-0 cursor-move"
        />
        <Input :default-value="column.name" class="h-7 flex-1 p-1.5 text-xs" />
        <Input :default-value="column.type" class="h-7 flex-1 p-1.5 text-xs" />
        <Button variant="secondary" size="xs">
          <Icon name="lucide:key-round" size="0.8rem" />
        </Button>
      </div>
    </CollapsibleContent>
  </Collapsible>
</template>

<style scoped>
  .column-item.sortable-chosen,
  .column-item[data-dragging='false']:hover {
    background-color: rgba(203, 213, 225, 0.5); /* bg-slate-300/50 */
  }

  .sortable-ghost {
    opacity: 0;
  }
</style>
