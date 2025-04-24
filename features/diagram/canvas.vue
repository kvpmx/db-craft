<script lang="ts" generic="T extends DatabaseType" setup>
  import { useMagicKeys } from '@vueuse/core';
  import { getConnectedEdges, VueFlow } from '@vue-flow/core';
  import { Background } from '@vue-flow/background';
  import { Controls } from '@vue-flow/controls';
  import { MiniMap } from '@vue-flow/minimap';

  import type { DatabaseType } from '@/lib/constants/diagram';
  import type { HandlePlacement } from '@/types/diagram';
  import type {
    Node,
    Edge,
    ValidConnectionFunc,
    NodeDragEvent,
    Connection,
    GraphEdge,
  } from '@vue-flow/core';

  const props = withDefaults(defineProps<{ readonly?: boolean }>(), {
    readonly: false,
  });

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
      type: 'smoothstep', // TODO: create a custom type for smoothstep
      pathOptions: { borderRadius: 20 },
    }));
  });

  // Handle table node events
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

  const { getSelectedEdges, setInteractive } = useCanvas();
  const { delete: deleteKey, ctrl_z, ctrl_y } = useMagicKeys();

  // Set interactive to false when the canvas is readonly
  watchEffect(() => {
    setInteractive(!props.readonly);
  });

  // Remove selected edges using the 'delete' key
  watch(deleteKey, () => {
    if (props.readonly) return;

    getSelectedEdges.value.forEach((edge) => {
      if (!currentProject.state?.schema) return;
      const idx = currentProject.state.schema.relations.findIndex((rel) => rel.id === edge.id);
      currentProject.state.schema.relations.splice(idx, 1);
    });
  });

  watch(ctrl_z, (pressed) => {
    if (props.readonly) return;

    // The first value is the default value (null), and the second value is the value
    // retrieved from the database. We can't remove these two values, so we set a condition
    // that checks if the history length is greater than 2.
    if (
      pressed &&
      currentProject.changesHistory.canUndo &&
      currentProject.changesHistory.history.length > 2
    ) {
      currentProject.changesHistory.undo();
    }
  });

  watch(ctrl_y, (pressed) => {
    if (props.readonly) return;

    if (pressed && currentProject.changesHistory.canRedo) {
      currentProject.changesHistory.redo();
    }
  });

  // Do not allow to connect two field in the same table
  const validateConnection: ValidConnectionFunc = (connection) => {
    return connection.source !== connection.target;
  };

  // Change handle placement based on the position of the nodes
  const getHandlePlacement = (
    sourceNode: Node,
    targetNode: Node
  ): Record<'source' | 'target', HandlePlacement | null> => {
    const dist = sourceNode.position.x - targetNode.position.x;
    const width = 300; // Node width + Edge offset

    if (dist > width) return { source: 'left', target: 'right' };
    if (dist >= 0) return { source: 'left', target: 'left' };
    if (dist <= -width) return { source: 'right', target: 'left' };
    if (dist < width / 2) return { source: 'right', target: 'right' };

    // This line should never be reached!
    return { source: null, target: null };
  };

  const updateHandlePlacement = (nodeId: string) => {
    const connectedEdges = getConnectedEdges(nodeId, edges.value) as GraphEdge[];

    connectedEdges.forEach((edge) => {
      const relation = currentProject.state?.schema.relations.find((rel) => rel.id === edge.id);
      const placement = getHandlePlacement(edge.sourceNode, edge.targetNode);

      if (relation && placement.source && placement.target) {
        relation.source_handle_placement = placement.source;
        relation.target_handle_placement = placement.target;
      }
    });
  };

  const updateConnectedEdges = (event: NodeDragEvent, animate: boolean) => {
    const connectedEdges = getConnectedEdges(event.node.id, edges.value);
    connectedEdges.forEach((edge) => (edge.animated = animate));
  };

  // Handle drag events
  const onNodeDrag = (event: NodeDragEvent) => {
    if (props.readonly) return;
    updateHandlePlacement(event.node.id);
    updateConnectedEdges(event, true);
  };

  const onNodeDragStop = (event: NodeDragEvent) => {
    if (props.readonly) return;
    updateNodePosition(event);
    updateConnectedEdges(event, false);
  };
</script>

<template>
  <ClientOnly>
    <VueFlow
      id="main-canvas"
      v-model:nodes="nodes"
      v-model:edges="edges"
      style="height: 100%; width: 100%"
      :min-zoom="0.1"
      :delete-key-code="null"
      :fit-view-on-init="true"
      :is-valid-connection="validateConnection"
      @node-drag-stop="onNodeDragStop"
      @connect="createNewConnection"
      @node-drag="onNodeDrag"
    >
      <template #node-table="tableNodeProps">
        <DiagramTableNode v-bind="tableNodeProps" />
      </template>

      <Background />
      <Controls :show-interactive="!readonly" />
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
