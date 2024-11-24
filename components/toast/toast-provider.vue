<script lang="ts" setup>
  import { ToastProvider } from 'radix-vue';
  import type { ToastProviderProps } from 'radix-vue';

  const props = defineProps<ToastProviderProps>();
</script>

<template>
  <ToastProvider v-bind="props">
    <slot />
  </ToastProvider>
</template>
