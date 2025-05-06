<script lang="ts" setup>
  import { AvatarFallback } from 'radix-vue';
  import type { AvatarFallbackProps } from 'radix-vue';

  const props = defineProps<AvatarFallbackProps>();
</script>

<template>
  <AvatarFallback v-bind="props">
    <slot />
  </AvatarFallback>
</template>
