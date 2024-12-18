<script lang="ts" setup>
  import { CollapsibleTrigger } from 'radix-vue';
  import type { CollapsibleTriggerProps } from 'radix-vue';

  const props = defineProps<CollapsibleTriggerProps>();
</script>

<template>
  <CollapsibleTrigger v-bind="props">
    <slot />
  </CollapsibleTrigger>
</template>
