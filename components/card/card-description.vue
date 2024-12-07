<script lang="ts" setup>
  import type { HTMLAttributes } from 'vue';

  const props = defineProps<{
    class?: HTMLAttributes['class'];
  }>();
</script>

<template>
  <p :class="cn('text-sm text-slate-500', props.class)">
    <slot />
  </p>
</template>
