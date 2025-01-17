<script lang="ts" generic="T extends DatabaseType" setup>
  import { useVueFlow, VueFlow } from '@vue-flow/core';
  import { Background } from '@vue-flow/background';
  import { Controls } from '@vue-flow/controls';
  import { MiniMap } from '@vue-flow/minimap';
  import { v4 as uuidv4 } from 'uuid';

  import type { DatabaseType } from '@/lib/constants/diagram';
  import type { Node, Edge } from '@vue-flow/core';

  const currentProject = useCurrentProject();

  // Convert tables to nodes
  const nodes = ref<Node[]>([]);

  watchEffect(() => {
    if (!currentProject.state?.schema) return;

    nodes.value = currentProject.state.schema.tables.map((table) => ({
      id: table.id,
      type: 'table',
      position: table.position,
      data: table,
    }));
  });

  // Convert refs to edges
  const edges = ref<Edge[]>([]);

  watchEffect(() => {
    if (!currentProject.state?.schema) return;

    edges.value = currentProject.state.schema.refs.map((ref) => ({
      id: ref.id,
      source: ref.source,
      target: ref.target,
      sourceHandle: `${ref.source_handle_placement}-${ref.source}-${ref.source_field}`,
      targetHandle: `${ref.target_handle_placement}-${ref.target}-${ref.target_field}`,
      style: { strokeWidth: 2 },
      updatable: true,
    }));
  });

  // Update the node position
  const { onNodeDragStop, onConnect, onEdgeUpdate } = useVueFlow();

  onNodeDragStop((event) => {
    currentProject.updateTableData(event.node.id, {
      position: event.node.position,
    });
  });

  onConnect((connection) => {
    const tableRef = createOrUpdateConnection(uuidv4(), connection);
    if (!currentProject.state?.schema || !tableRef) return;
    currentProject.state.schema.refs.push(tableRef);
  });

  onEdgeUpdate(({ edge, connection }) => {
    const tableRef = createOrUpdateConnection(edge.id, connection);
    if (!currentProject.state?.schema || !tableRef) return;

    const idx = currentProject.state.schema.refs.findIndex((item) => item.id === edge.id);
    currentProject.state.schema.refs[idx] = tableRef;
  });
</script>

<template>
  <ClientOnly>
    <VueFlow
      v-model:nodes="nodes"
      v-model:edges="edges"
      style="height: 100%; width: 100%"
      fit-view-on-init
    >
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
