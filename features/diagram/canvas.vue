<script lang="ts" generic="T extends DatabaseType" setup>
  import { useMagicKeys } from '@vueuse/core';
  import { getConnectedEdges, VueFlow } from '@vue-flow/core';
  import { Background } from '@vue-flow/background';
  import { ControlButton, Controls } from '@vue-flow/controls';
  import { MiniMap } from '@vue-flow/minimap';
  import { DEFAULT_RELATION_CARDINALITY } from '@/lib/constants/diagram';
  import { DEFAULT_NOTE_HEIGHT, DEFAULT_NOTE_WIDTH } from '@/lib/constants/note';

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

  const { t } = useI18n();
  const currentProject = useCurrentProject();

  // Convert tables and notes to nodes
  const nodes = ref<Node[]>([]);

  watchEffect(() => {
    if (!currentProject.state?.schema) return;

    const tableNodes = currentProject.state.schema.tables.map((table) => ({
      id: table.id,
      type: 'table',
      position: table.position,
      data: table,
    }));

    const noteNodes = (currentProject.state.schema.notes ?? []).map((note) => ({
      id: note.id,
      type: 'note',
      position: note.position,
      data: note,
      connectable: false,
      style: {
        width: `${note.width ?? DEFAULT_NOTE_WIDTH}px`,
        height: `${note.height ?? DEFAULT_NOTE_HEIGHT}px`,
      },
    }));

    nodes.value = [...tableNodes, ...noteNodes];
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
      type: 'relation',
      data: {
        ...DEFAULT_RELATION_CARDINALITY,
        ...rel.cardinality,
        readonly: props.readonly,
      },
    }));
  });

  const updateNodePosition = (event: NodeDragEvent) => {
    if (event.node.type === 'note') {
      currentProject.updateNoteData(event.node.id, {
        position: event.node.position,
      });
      return;
    }

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

  const { fitView, getSelectedEdges, getSelectedNodes, setInteractive } = useCanvas();
  const { delete: deleteKey, ctrl_z, ctrl_y } = useMagicKeys();

  const fitViewParams = useDiagramFitViewParams();
  const initialViewFitted = ref(false);

  const fitInitialView = async () => {
    if (initialViewFitted.value || !nodes.value.length) return;

    initialViewFitted.value = true;
    await nextTick();
    fitView(fitViewParams.value);
  };

  // Set interactive to false when the canvas is readonly
  watchEffect(() => {
    setInteractive(!props.readonly);
  });

  // Remove selected edges and notes using the 'delete' key
  watch(deleteKey, () => {
    if (props.readonly) return;

    getSelectedEdges.value.forEach((edge) => {
      if (!currentProject.state?.schema) return;
      const idx = currentProject.state.schema.relations.findIndex((rel) => rel.id === edge.id);
      currentProject.state.schema.relations.splice(idx, 1);
    });

    getSelectedNodes.value.forEach((node) => {
      if (node.type === 'note') {
        currentProject.deleteNote(node.id);
      }
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
    if (props.readonly || event.node.type !== 'table') return;
    updateHandlePlacement(event.node.id);
    updateConnectedEdges(event, true);
  };

  const onNodeDragStop = (event: NodeDragEvent) => {
    if (props.readonly) return;
    updateNodePosition(event);

    if (event.node.type === 'table') {
      updateConnectedEdges(event, false);
    }
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
      :fit-view-on-init="false"
      :is-valid-connection="validateConnection"
      @node-drag-stop="onNodeDragStop"
      @connect="createNewConnection"
      @node-drag="onNodeDrag"
      @nodes-initialized="fitInitialView"
    >
      <template #node-table="tableNodeProps">
        <DiagramTableNode v-bind="tableNodeProps" />
      </template>

      <template #node-note="noteNodeProps">
        <DiagramNoteNode v-bind="noteNodeProps" />
      </template>

      <template #edge-relation="relationEdgeProps">
        <DiagramRelationEdge v-bind="relationEdgeProps" />
      </template>

      <Background />
      <Controls
        position="bottom-left"
        :show-interactive="!readonly"
        :fit-view-params="fitViewParams"
      >
        <template #icon-zoom-in>
          <Icon name="lucide:plus" size="1rem" class="h-4 w-4" />
        </template>
        <template #icon-zoom-out>
          <Icon name="lucide:minus" size="1rem" class="h-4 w-4" />
        </template>
        <template #icon-fit-view>
          <Icon name="lucide:maximize" size="1rem" class="h-4 w-4" />
        </template>
        <template #icon-unlock>
          <Icon name="lucide:unlock" size="1rem" class="h-4 w-4" />
        </template>
        <template #icon-lock>
          <Icon name="lucide:lock" size="1rem" class="h-4 w-4" />
        </template>
        <ControlButton
          v-if="!readonly"
          class="vue-flow__controls-add-note"
          :title="t('NEW_NOTE')"
          @click="currentProject.addNote()"
        >
          <Icon name="lucide:sticky-note" size="1rem" class="h-4 w-4" />
        </ControlButton>
      </Controls>
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

<style>
  .vue-flow__panel {
    margin-bottom: 1.25rem;
    background: rgb(255 255 255 / 0.95);
    backdrop-filter: blur(8px);
    border: 1px solid rgb(229 231 235);
    border-radius: 0.75rem;
    overflow: hidden;
    box-shadow:
      0 4px 6px -1px rgb(0 0 0 / 0.08),
      0 2px 4px -2px rgb(0 0 0 / 0.06);
  }

  .vue-flow__panel.vue-flow__controls {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.125rem;
    padding: 0.375rem;
  }

  .vue-flow__panel .vue-flow__controls-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.25rem;
    height: 2.25rem;
    padding: 0;
    border: none;
    border-bottom: none;
    border-radius: 0.5rem;
    background: transparent;
    color: rgb(55 65 81);
    cursor: pointer;
    transition: background-color 150ms ease;
  }

  .vue-flow__panel .vue-flow__controls-button:hover:not(:disabled) {
    background: rgb(243 244 246);
  }

  .vue-flow__panel .vue-flow__controls-button:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  .vue-flow__panel .vue-flow__controls-button svg {
    width: auto;
    max-width: none;
    max-height: none;
  }
</style>
