<script lang="ts" setup>
  import type { HTMLAttributes } from 'vue';

  const props = defineProps<{
    class?: HTMLAttributes['class'];
  }>();
</script>

<template>
  <span :class="cn('ml-auto text-xs tracking-widest text-slate-500', props.class)">
    <slot />
  </span>
</template>
