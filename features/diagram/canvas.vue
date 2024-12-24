<script lang="ts" generic="T extends DatabaseType" setup>
  import { VueFlow } from '@vue-flow/core';

  import type { DiagramConfig } from '@/types/diagram';
  import type { DatabaseType } from '@/lib/constants/diagram';

  const props = defineProps<{
    schema: DiagramConfig<T>;
  }>();

  // Convert tables to nodes
  const nodes = ref(
    props.schema.tables.map((table) => ({
      id: table.id,
      type: 'table',
      position: table.position,
      data: table,
    }))
  );

  // Convert refs to edges
  const edges = ref(
    props.schema.refs.map((ref) => ({
      id: ref.id,
      source: ref.source,
      target: ref.target,
      sourceHandle: `source-${ref.source}-${ref.source_field}`,
      targetHandle: `target-${ref.target}-${ref.target_field}`,
    }))
  );
</script>

<template>
  <ClientOnly>
    <VueFlow v-model:nodes="nodes" v-model:edges="edges" style="height: 100vh; width: 100%">
      <template #node-table="tableNodeProps">
        <DiagramTableNode v-bind="tableNodeProps" />
      </template>
    </VueFlow>
  </ClientOnly>
</template>

<style>
  @import '@vue-flow/core/dist/style.css';
  @import '@vue-flow/core/dist/theme-default.css';
</style>
