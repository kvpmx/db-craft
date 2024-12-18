<script lang="ts" setup>
  import { Input } from '@/components/input';
  import type { HTMLAttributes } from 'vue';

  const props = defineProps<{
    class?: HTMLAttributes['class'];
  }>();
</script>

<template>
  <Input
    data-sidebar="input"
    :class="
      cn(
        'focus-visible:ring-sidebar-ring h-8 w-full bg-white shadow-none focus-visible:ring-2',
        props.class
      )
    "
  >
    <slot />
  </Input>
</template>
