<script lang="ts" setup>
  import { useEventListener } from '@vueuse/core';
  import {
    DEFAULT_NOTE_HEIGHT,
    DEFAULT_NOTE_WIDTH,
    NOTE_MAX_HEIGHT,
    NOTE_MAX_WIDTH,
    NOTE_MIN_HEIGHT,
    NOTE_MIN_WIDTH,
    STICKY_NOTE_COLORS,
  } from '@/lib/constants/note';

  import type { NodeProps } from '@vue-flow/core';
  import type { Note } from '@/types/diagram';

  const props = defineProps<NodeProps<Note>>();

  const { t } = useI18n();
  const currentProject = useCurrentProject();
  const { viewport } = useCanvas();

  const content = ref(props.data.content);
  const color = ref(props.data.color ?? STICKY_NOTE_COLORS[0]);
  const localWidth = ref(props.data.width ?? DEFAULT_NOTE_WIDTH);
  const localHeight = ref(props.data.height ?? DEFAULT_NOTE_HEIGHT);
  const isResizing = ref(false);

  const resizeStart = {
    x: 0,
    y: 0,
    width: DEFAULT_NOTE_WIDTH,
    height: DEFAULT_NOTE_HEIGHT,
  };

  watch(
    () => props.data.content,
    (value) => {
      content.value = value;
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
    currentProject.updateNoteData(props.id, { color: value });
  });

  watch(
    () => [props.data.width, props.data.height],
    ([width, height]) => {
      if (isResizing.value) return;
      localWidth.value = width ?? DEFAULT_NOTE_WIDTH;
      localHeight.value = height ?? DEFAULT_NOTE_HEIGHT;
    }
  );

  watch(content, (value) => {
    if (!currentProject.canEdit) return;
    currentProject.updateNoteData(props.id, { content: value });
  });

  const noteStyle = computed(() => ({
    width: `${localWidth.value}px`,
    height: `${localHeight.value}px`,
    transform: `rotate(${props.data.rotation ?? 0}deg)`,
    backgroundColor: color.value,
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
      NOTE_MAX_WIDTH,
      Math.max(NOTE_MIN_WIDTH, resizeStart.width + deltaX)
    );
    localHeight.value = Math.min(
      NOTE_MAX_HEIGHT,
      Math.max(NOTE_MIN_HEIGHT, resizeStart.height + deltaY)
    );
  };

  const stopResize = () => {
    if (!isResizing.value) return;

    isResizing.value = false;
    currentProject.updateNoteData(props.id, {
      width: localWidth.value,
      height: localHeight.value,
    });
  };

  useEventListener(window, 'mousemove', onResizeMove);
  useEventListener(window, 'mouseup', stopResize);
</script>

<template>
  <div
    class="sticky-note group relative flex flex-col overflow-hidden"
    :class="selected && 'is-selected'"
    :style="noteStyle"
  >
    <div class="strip">
      <Popover v-if="currentProject.canEdit">
        <PopoverTrigger as-child>
          <button
            type="button"
            class="color-btn nodrag nopan"
            :style="{ backgroundColor: color }"
            :title="t('NOTE_COLOR')"
          />
        </PopoverTrigger>
        <PopoverContent class="nodrag nopan w-52 p-3" @click.stop @open-auto-focus.prevent>
          <DiagramPalette v-model="color" :colors="STICKY_NOTE_COLORS" />
        </PopoverContent>
      </Popover>
    </div>

    <button
      v-if="currentProject.canEdit"
      type="button"
      class="delete-btn nodrag nopan"
      :title="t('REMOVE')"
      @click.stop="currentProject.deleteNote(id)"
    >
      <Icon name="lucide:x" size="0.75rem" class="h-3 w-3" />
    </button>

    <Textarea
      v-if="currentProject.canEdit"
      v-model="content"
      :placeholder="t('NOTE_PLACEHOLDER')"
      class="content nodrag nowheel nopan"
      @click.stop
    />
    <p v-else class="content readonly">
      {{ data.content || t('NOTE_PLACEHOLDER') }}
    </p>
    <div
      v-if="currentProject.canEdit"
      class="resize-handle nodrag nopan"
      @mousedown="startResize"
    />
  </div>
</template>

<style scoped>
  .sticky-note {
    border-radius: 2px;
    box-shadow:
      1px 2px 4px rgba(0, 0, 0, 0.08),
      3px 6px 14px rgba(0, 0, 0, 0.1);
    font-family: 'Caveat', 'Segoe Print', cursive;
    transition: box-shadow 0.15s ease;
  }

  .sticky-note.is-selected {
    box-shadow:
      1px 2px 4px rgba(0, 0, 0, 0.1),
      3px 8px 18px rgba(0, 0, 0, 0.14),
      0 0 0 2px rgba(217, 119, 6, 0.35);
  }

  .strip {
    display: flex;
    align-items: center;
    height: 22px;
    flex-shrink: 0;
    padding: 0 8px;
    background: linear-gradient(
      180deg,
      rgba(0, 0, 0, 0.06) 0%,
      rgba(0, 0, 0, 0.02) 40%,
      transparent 100%
    );
    border-bottom: 1px solid rgba(0, 0, 0, 0.04);
  }

  .color-btn {
    height: 14px;
    width: 14px;
    border-radius: 9999px;
    border: 1px solid rgba(69, 26, 3, 0.2);
    opacity: 0;
    transition:
      opacity 0.15s ease,
      transform 0.15s ease;
  }

  .sticky-note:hover .color-btn,
  .sticky-note.is-selected .color-btn {
    opacity: 1;
  }

  .color-btn:hover {
    transform: scale(1.1);
  }

  .delete-btn {
    position: absolute;
    top: 4px;
    right: 4px;
    z-index: 2;
    display: flex;
    height: 14px;
    width: 14px;
    align-items: center;
    justify-content: center;
    border-radius: 9999px;
    background: rgba(255, 255, 255, 0.55);
    color: rgba(69, 26, 3, 0.45);
    opacity: 0;
    transition:
      opacity 0.15s ease,
      color 0.15s ease,
      background 0.15s ease;
  }

  .sticky-note:hover .delete-btn,
  .sticky-note.is-selected .delete-btn {
    opacity: 1;
  }

  .delete-btn:hover {
    background: rgba(255, 255, 255, 0.9);
    color: #e11d48;
  }

  .content {
    flex: 1;
    min-height: 0;
    resize: none;
    border: 0;
    background: transparent;
    padding: 6px 12px 16px;
    font-family: inherit;
    font-size: 1.125rem;
    line-height: 1.35;
    color: rgba(69, 26, 3, 0.88);
    box-shadow: none;
    scrollbar-width: thin;
  }

  .content:focus-visible {
    outline: none;
  }

  .content.readonly {
    margin: 0;
    white-space: pre-wrap;
    overflow-wrap: break-word;
    overflow-y: auto;
  }

  .content::placeholder {
    color: rgba(69, 26, 3, 0.35);
    font-style: italic;
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

  .sticky-note:hover .resize-handle,
  .sticky-note.is-selected .resize-handle {
    opacity: 1;
  }

  .resize-handle::before {
    content: '';
    position: absolute;
    right: 3px;
    bottom: 3px;
    width: 8px;
    height: 8px;
    border-right: 2px solid rgba(69, 26, 3, 0.3);
    border-bottom: 2px solid rgba(69, 26, 3, 0.3);
    border-radius: 0 0 2px 0;
  }
</style>
