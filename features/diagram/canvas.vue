<script lang="ts" generic="T extends DatabaseType" setup>
  import { VueFlow } from '@vue-flow/core';
  import { Background } from '@vue-flow/background';
  import { Controls } from '@vue-flow/controls';
  import { MiniMap } from '@vue-flow/minimap';

  import type { DiagramConfig } from '@/types/diagram';
  import type { DatabaseType } from '@/lib/constants/diagram';
  import type { Node, Edge } from '@vue-flow/core';

  const props = defineProps<{
    schema?: DiagramConfig<T>;
  }>();

  // Convert tables to nodes
  const nodes = ref<Node[]>([]);

  watchEffect(() => {
    if (!props.schema) return;

    nodes.value = props.schema.tables.map((table) => ({
      id: table.id,
      type: 'table',
      position: table.position,
      data: table,
    }));
  });

  // Convert refs to edges
  const edges = ref<Edge[]>([]);

  watchEffect(() => {
    if (!props.schema) return;

    edges.value = props.schema.refs.map((ref) => ({
      id: ref.id,
      source: ref.source,
      target: ref.target,
      sourceHandle: `source-${ref.source}-${ref.source_field}`,
      targetHandle: `target-${ref.target}-${ref.target_field}`,
    }));
  });
</script>

<template>
  <ClientOnly>
    <VueFlow v-model:nodes="nodes" v-model:edges="edges" style="height: 100vh; width: 100%">
      <template #node-table="tableNodeProps">
        <DiagramTableNode v-bind="tableNodeProps" />
      </template>

      <Background />
      <Controls />
      <MiniMap :pannable="true" :zoomable="true" :width="150" :height="100" />
    </VueFlow>
  </ClientOnly>
</template>

<style>
  /* Default styles */
  @import '@vue-flow/core/dist/style.css';
  @import '@vue-flow/core/dist/theme-default.css';

  /* Additional component styles */
  @import '@vue-flow/controls/dist/style.css';
  @import '@vue-flow/minimap/dist/style.css';
</style>
