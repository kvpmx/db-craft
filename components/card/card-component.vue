<script lang="ts" setup>
  import type { HTMLAttributes } from 'vue';

  const props = defineProps<{
    class?: HTMLAttributes['class'];
  }>();
</script>

<template>
  <div
    :class="cn('rounded-lg border border-slate-200 bg-white text-slate-950 shadow-sm', props.class)"
  >
    <slot />
  </div>
</template>
