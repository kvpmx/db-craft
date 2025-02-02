<script lang="ts" generic="T extends DatabaseType" setup>
  import { useMagicKeys } from '@vueuse/core';
  import { getConnectedEdges, useVueFlow, VueFlow } from '@vue-flow/core';
  import { Background } from '@vue-flow/background';
  import { Controls } from '@vue-flow/controls';
  import { MiniMap } from '@vue-flow/minimap';

  import type { DatabaseType } from '@/lib/constants/diagram';
  import type {
    Node,
    Edge,
    ValidConnectionFunc,
    NodeDragEvent,
    Connection,
    GraphEdge,
  } from '@vue-flow/core';

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

  // Convert relations to edges
  const edges = ref<Edge[]>([]);

  watchEffect(() => {
    if (!currentProject.state?.schema) return;

    edges.value = currentProject.state.schema.relations.map((rel) => ({
      id: rel.id,
      source: rel.source,
      target: rel.target,
      sourceHandle: `${rel.source_handle_placement}:${rel.source}:${rel.source_field}`,
      targetHandle: `${rel.target_handle_placement}:${rel.target}:${rel.target_field}`,
      style: { strokeWidth: 3 },
    }));
  });

  // Handle Vue Flow events
  const updateNodePosition = (event: NodeDragEvent) => {
    currentProject.updateTableData(event.node.id, {
      position: event.node.position,
    });
  };

  const createNewConnection = (connection: Connection) => {
    const relation = createRelation(connection);
    if (!currentProject.state?.schema || !relation) return;
    currentProject.state.schema.relations.push(relation);

    nextTick(() => updateHandlePlacement(relation.source));
  };

  // Remove selected edges using the 'delete' key
  const { getSelectedEdges, vueFlowRef, fitView, onPaneReady } = useVueFlow();
  const { delete: deleteKey } = useMagicKeys();

  watch(deleteKey, () => {
    getSelectedEdges.value.forEach((edge) => {
      if (!currentProject.state?.schema) return;
      const idx = currentProject.state.schema.relations.findIndex((rel) => rel.id === edge.id);
      currentProject.state.schema.relations.splice(idx, 1);
    });
  });

  // Do not allow to connect two field in the same table
  const validateConnection: ValidConnectionFunc = (connection) => {
    return connection.source !== connection.target;
  };

  // Save canvas ref to the global store
  const canvas = useVueFlowCanvas();

  watchEffect(() => {
    if (!vueFlowRef.value) return;
    canvas.set(vueFlowRef.value);
  });

  // Register `fitView` function to the global store
  onPaneReady(() => {
    canvas.registerFitViewFunction((nodes) => {
      fitView({
        nodes,
        duration: 1000,
        padding: 0.5,
      });
    });
  });

  // Change handle placement based on the position of the nodes
  const getHandlePlacement = (firstNode: Node, secondNode: Node) => {
    return firstNode.position.x - secondNode.position.x < 0 ? 'right' : 'left';
  };

  const updateHandlePlacement = (nodeId: string) => {
    const connectedEdges = getConnectedEdges(nodeId, edges.value) as GraphEdge[];
    connectedEdges.forEach((edge) => {
      const relation = currentProject.state?.schema.relations.find((rel) => rel.id === edge.id);

      if (relation) {
        relation.source_handle_placement = getHandlePlacement(edge.sourceNode, edge.targetNode);
        relation.target_handle_placement = getHandlePlacement(edge.targetNode, edge.sourceNode);
      }
    });
  };

  const onNodeDrag = (event: NodeDragEvent) => {
    updateHandlePlacement(event.node.id);
  };
</script>

<template>
  <ClientOnly>
    <VueFlow
      v-model:nodes="nodes"
      v-model:edges="edges"
      style="height: 100%; width: 100%"
      :min-zoom="0.1"
      :delete-key-code="null"
      :fit-view-on-init="true"
      :is-valid-connection="validateConnection"
      @node-drag-stop="updateNodePosition"
      @connect="createNewConnection"
      @node-drag="onNodeDrag"
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
