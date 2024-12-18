<script lang="ts" setup>
  import type { HTMLAttributes } from 'vue';

  interface SkeletonProps {
    class?: HTMLAttributes['class'];
  }

  const props = defineProps<SkeletonProps>();
</script>

<template>
  <div :class="cn('animate-pulse rounded-md bg-slate-100', props.class)" />
</template>
