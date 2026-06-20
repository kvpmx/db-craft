<script lang="ts" setup>
  import { useEventListener } from '@vueuse/core';
  import {
    DEFAULT_TABLE_GROUP_HEIGHT,
    DEFAULT_TABLE_GROUP_WIDTH,
    TABLE_GROUP_COLORS,
    TABLE_GROUP_MAX_HEIGHT,
    TABLE_GROUP_MAX_WIDTH,
    TABLE_GROUP_MIN_HEIGHT,
    TABLE_GROUP_MIN_WIDTH,
  } from '@/lib/constants/table-group';

  import type { NodeProps } from '@vue-flow/core';
  import type { TableGroup } from '@/types/diagram';

  const props = defineProps<NodeProps<TableGroup>>();

  const { t } = useI18n();
  const currentProject = useCurrentProject();
  const { viewport } = useCanvas();

  const name = ref(props.data.name);
  const color = ref(props.data.color ?? TABLE_GROUP_COLORS[0]);
  const localWidth = ref(props.data.width ?? DEFAULT_TABLE_GROUP_WIDTH);
  const localHeight = ref(props.data.height ?? DEFAULT_TABLE_GROUP_HEIGHT);
  const isResizing = ref(false);

  const resizeStart = {
    x: 0,
    y: 0,
    width: DEFAULT_TABLE_GROUP_WIDTH,
    height: DEFAULT_TABLE_GROUP_HEIGHT,
  };

  watch(
    () => props.data.name,
    (value) => {
      name.value = value;
    }
  );

  watch(
    () => props.data.color,
    (value) => {
      if (value) color.value = value;
    }
  );

  watch(color, (value) => {
    if (!currentProject.canEdit || !value) return;
    currentProject.updateTableGroupData(props.id, { color: value });
  });

  watch(
    () => [props.data.width, props.data.height],
    ([width, height]) => {
      if (isResizing.value) return;
      localWidth.value = width ?? DEFAULT_TABLE_GROUP_WIDTH;
      localHeight.value = height ?? DEFAULT_TABLE_GROUP_HEIGHT;
    }
  );

  watch(name, (value) => {
    if (!currentProject.canEdit) return;
    currentProject.updateTableGroupData(props.id, { name: value });
  });

  const groupStyle = computed(() => ({
    'width': `${localWidth.value}px`,
    'height': `${localHeight.value}px`,
    '--group-color': color.value,
  }));

  const startResize = (event: MouseEvent) => {
    if (!currentProject.canEdit) return;

    event.stopPropagation();
    isResizing.value = true;
    resizeStart.x = event.clientX;
    resizeStart.y = event.clientY;
    resizeStart.width = localWidth.value;
    resizeStart.height = localHeight.value;
  };

  const onResizeMove = (event: MouseEvent) => {
    if (!isResizing.value) return;

    const zoom = viewport.value.zoom;
    const deltaX = (event.clientX - resizeStart.x) / zoom;
    const deltaY = (event.clientY - resizeStart.y) / zoom;

    localWidth.value = Math.min(
      TABLE_GROUP_MAX_WIDTH,
      Math.max(TABLE_GROUP_MIN_WIDTH, resizeStart.width + deltaX)
    );
    localHeight.value = Math.min(
      TABLE_GROUP_MAX_HEIGHT,
      Math.max(TABLE_GROUP_MIN_HEIGHT, resizeStart.height + deltaY)
    );
  };

  const stopResize = () => {
    if (!isResizing.value) return;

    isResizing.value = false;
    currentProject.updateTableGroupData(props.id, {
      width: localWidth.value,
      height: localHeight.value,
    });
  };

  useEventListener(window, 'mousemove', onResizeMove);
  useEventListener(window, 'mouseup', stopResize);
</script>

<template>
  <div
    class="table-group group relative flex flex-col overflow-hidden rounded-lg"
    :class="selected && 'is-selected'"
    :style="groupStyle"
  >
    <div class="header">
      <Popover v-if="currentProject.canEdit">
        <PopoverTrigger as-child>
          <button
            type="button"
            class="color-btn nodrag nopan"
            :style="{ backgroundColor: color }"
            :title="t('TABLE_GROUP_COLOR')"
          />
        </PopoverTrigger>
        <PopoverContent class="nodrag nopan w-52 p-3" @click.stop @open-auto-focus.prevent>
          <DiagramPalette v-model="color" :colors="TABLE_GROUP_COLORS" />
        </PopoverContent>
      </Popover>

      <Input
        v-if="currentProject.canEdit"
        v-model="name"
        :placeholder="t('TABLE_GROUP_PLACEHOLDER')"
        class="name-input nodrag nowheel nopan"
        @click.stop
      />
      <span v-else class="name-readonly truncate">{{
        data.name || t('TABLE_GROUP_PLACEHOLDER')
      }}</span>

      <button
        v-if="currentProject.canEdit"
        type="button"
        class="delete-btn nodrag nopan"
        :title="t('REMOVE')"
        @click.stop="currentProject.deleteTableGroup(id)"
      >
        <Icon name="lucide:x" size="0.75rem" class="h-3 w-3" />
      </button>
    </div>

    <div
      v-if="currentProject.canEdit"
      class="resize-handle nodrag nopan"
      @mousedown="startResize"
    />
  </div>
</template>

<style scoped>
  .table-group {
    border: 2px dashed color-mix(in srgb, var(--group-color) 45%, #94a3b8);
    background: color-mix(in srgb, var(--group-color) 10%, white);
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--group-color) 8%, transparent);
    transition: box-shadow 0.15s ease;
  }

  .table-group.is-selected {
    box-shadow:
      inset 0 0 0 1px color-mix(in srgb, var(--group-color) 12%, transparent),
      0 0 0 2px color-mix(in srgb, var(--group-color) 35%, transparent);
  }

  .header {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
    padding: 6px 8px;
    background: color-mix(in srgb, var(--group-color) 22%, white);
    border-bottom: 1px solid color-mix(in srgb, var(--group-color) 30%, #e2e8f0);
  }

  .color-btn {
    height: 14px;
    width: 14px;
    flex-shrink: 0;
    border-radius: 9999px;
    border: 1px solid rgba(15, 23, 42, 0.15);
    opacity: 0;
    transition:
      opacity 0.15s ease,
      transform 0.15s ease;
  }

  .table-group:hover .color-btn,
  .table-group.is-selected .color-btn {
    opacity: 1;
  }

  .color-btn:hover {
    transform: scale(1.1);
  }

  .name-input {
    flex: 1;
    min-width: 0;
    height: 24px;
    border: 0;
    background: transparent;
    padding: 0 4px;
    font-size: 0.8125rem;
    font-weight: 600;
    color: rgb(30 41 59);
    box-shadow: none;
  }

  .name-input:focus-visible {
    outline: none;
    background: rgba(255, 255, 255, 0.5);
    border-radius: 4px;
  }

  .name-readonly {
    flex: 1;
    min-width: 0;
    font-size: 0.8125rem;
    font-weight: 600;
    color: rgb(30 41 59);
  }

  .delete-btn {
    display: flex;
    height: 18px;
    width: 18px;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    border-radius: 9999px;
    background: rgba(255, 255, 255, 0.6);
    color: rgb(100 116 139);
    opacity: 0;
    transition:
      opacity 0.15s ease,
      color 0.15s ease,
      background 0.15s ease;
  }

  .table-group:hover .delete-btn,
  .table-group.is-selected .delete-btn {
    opacity: 1;
  }

  .delete-btn:hover {
    background: rgba(255, 255, 255, 0.95);
    color: #e11d48;
  }

  .resize-handle {
    position: absolute;
    right: 2px;
    bottom: 2px;
    z-index: 2;
    width: 14px;
    height: 14px;
    cursor: nwse-resize;
    opacity: 0;
    transition: opacity 0.15s ease;
  }

  .table-group:hover .resize-handle,
  .table-group.is-selected .resize-handle {
    opacity: 1;
  }

  .resize-handle::before {
    content: '';
    position: absolute;
    right: 3px;
    bottom: 3px;
    width: 8px;
    height: 8px;
    border-right: 2px solid rgba(51, 65, 85, 0.35);
    border-bottom: 2px solid rgba(51, 65, 85, 0.35);
    border-radius: 0 0 2px 0;
  }
</style>
