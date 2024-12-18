<script lang="ts" setup>
  import { Separator } from '@/components/separator';
  import type { HTMLAttributes } from 'vue';

  const props = defineProps<{
    class?: HTMLAttributes['class'];
  }>();
</script>

<template>
  <Separator data-sidebar="separator" :class="cn('bg-sidebar-border mx-2 w-auto', props.class)">
    <slot />
  </Separator>
</template>
