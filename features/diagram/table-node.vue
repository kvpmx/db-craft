<script lang="ts" generic="T extends DatabaseType" setup>
  import { Position, Handle } from '@vue-flow/core';
  import { onClickOutside } from '@vueuse/core';

  import type { NodeProps } from '@vue-flow/core';
  import type { Table } from '@/types/diagram';
  import type { DatabaseType } from '@/lib/constants/diagram';

  const props = defineProps<NodeProps<Table<T>>>();

  const emit = defineEmits<{
    (e: 'update-node-internals', id: string): void;
  }>();

  watch(
    () => props.data.fields,
    () => nextTick(() => emit('update-node-internals', props.id)),
    { immediate: true, deep: true }
  );

  // Select the table node
  const selected = ref(false);
  const target = ref<HTMLDivElement | null>(null);

  onClickOutside(target, () => {
    selected.value = false;
  });

  // Select the table section
  const selectedTable = useSelectedTable();
</script>

<template>
  <div
    ref="target"
    :class="[
      'w-60 rounded-md bg-white font-mono text-xs ring-2',
      selected ? 'ring-rose-600' : 'ring-slate-600',
    ]"
    :style="{ fontFamily: 'JetBrains Mono, monospace' }"
    @click="selected = !selected"
  >
    <div
      class="flex items-center justify-between gap-2 rounded-t-md border-b-[1px] border-solid border-slate-300 p-2 text-sm font-semibold"
      :style="{ backgroundColor: data.color }"
    >
      <span class="truncate">{{ data.name }}</span>
      <Icon
        name="lucide:maximize"
        size="0.75rem"
        class="h-3 min-h-3 w-3 min-w-3 cursor-pointer"
        @click.stop="
          () => {
            selectedTable.setId(data.id);
            selectedTable.toggleFlag();
          }
        "
      />
    </div>
    <div
      v-for="field in data.fields"
      :key="field.id"
      class="relative cursor-pointer border-solid border-slate-300 px-2 py-1 [&:not(:last-child)]:border-b-[1px]"
    >
      <Handle
        :id="`left:${data.id}:${field.id}`"
        :position="Position.Left"
        :class="!selected && 'invisible'"
      />
      <div class="flex items-center justify-between gap-4">
        <span class="flex-grow truncate" :title="field.name">{{ field.name }}</span>

        <div class="flex items-baseline gap-1">
          <Icon
            v-if="field.primary_key"
            name="lucide:key-round"
            size="0.625rem"
            class="h-2.5 w-2.5 flex-shrink-0 text-yellow-600"
          />

          <span class="text-gray-500">{{ field.type + (field.nullable ? '?' : '') }}</span>
        </div>
      </div>
      <Handle
        :id="`right:${data.id}:${field.id}`"
        :position="Position.Right"
        :class="!selected && 'invisible'"
      />
    </div>
  </div>
</template>

<style scoped>
  .vue-flow__handle {
    width: 8px;
    height: 8px;
    background: #e11d48; /* bg-rose-600 */
  }

  .vue-flow__handle-right {
    right: -1px;
  }

  .vue-flow__handle-left {
    left: -1px;
  }
</style>
