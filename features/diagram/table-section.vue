<script lang="ts" generic="T extends DatabaseType" setup>
  import { useSortable } from '@vueuse/integrations/useSortable';
  import { colors } from '@/lib/constants/colors';

  import type { TableWithVisibility } from '@/types/diagram';
  import type { DatabaseType } from '@/lib/constants/diagram';

  const props = defineProps<{
    table: TableWithVisibility<T>;
    searchQuery?: string;
  }>();

  // Open collapsible on search
  const isOpen = ref(false);

  watchEffect(() => {
    isOpen.value = Boolean(props.searchQuery);
  });

  // Update table fields
  const currentProject = useCurrentProject();

  watch(
    props.table.fields,
    () => currentProject.updateTableFields(props.table.id, props.table.fields),
    { deep: true }
  );

  // Make a column list sortable
  const columnsContainerRef = ref<HTMLElement | null>(null);
  const isDragging = ref(false);

  useSortable(columnsContainerRef, props.table.fields, {
    handle: '.sortable-handle',
    animation: 150,
    forceFallback: true,
    onStart: () => (isDragging.value = true),
    onEnd: () => (isDragging.value = false),
  });

  // Change table color
  const color = ref<string>(props.table.color ?? colors[0]);

  watch(color, () => {
    if (!color.value) return;
    currentProject.updateColor(props.table.id, color.value);
  });
</script>

<template>
  <Collapsible
    v-if="table.visible"
    v-model:open="isOpen"
    class="mb-2 w-full overflow-hidden rounded-md border-[1px] border-gray-500 bg-white"
  >
    <CollapsibleTrigger
      class="table-section-header hover:bg-accent hover:text-accent-foreground flex w-full items-center gap-2 p-2 text-sm font-medium data-[state=closed]:rounded-md"
      :style="{ backgroundColor: table.color }"
    >
      <Icon
        name="lucide:chevron-down"
        size="1rem"
        class="text-muted-foreground h-4 w-4"
        :style="{ transform: `rotate(${isOpen ? '180deg' : '0deg'})` }"
      />
      <span v-html="highlightTextOccurrences(table.name, searchQuery)"></span>
    </CollapsibleTrigger>

    <CollapsibleContent ref="columnsContainerRef" class="py-2">
      <div
        v-for="column in table.fields"
        :key="column.id"
        class="column-item transition-color flex items-center justify-between gap-2 p-3 py-1 pl-1"
        :data-dragging="isDragging"
      >
        <Icon
          name="clarity:drag-handle-line"
          size="1.5rem"
          class="sortable-handle h-6 w-6 flex-shrink-0 cursor-move"
        />
        <Input v-model="column.name" class="h-7 flex-1 p-1.5 text-xs" />
        <Input v-model="column.type" class="h-7 flex-1 p-1.5 text-xs" />
        <!-- TODO -->
        <Button variant="secondary" size="xs">
          <Icon name="lucide:key-round" size="0.75rem" class="h-3 w-3" />
        </Button>
      </div>

      <DiagramColorPicker v-model="color" />
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
