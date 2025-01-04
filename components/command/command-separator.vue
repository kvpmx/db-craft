<script lang="ts" setup>
  import { ComboboxSeparator } from 'radix-vue';

  import type { HTMLAttributes } from 'vue';
  import type { ComboboxSeparatorProps } from 'radix-vue';

  const props = defineProps<ComboboxSeparatorProps & { class?: HTMLAttributes['class'] }>();

  const delegatedProps = computed(() => {
    const { class: _, ...delegated } = props;
    return delegated;
  });
</script>

<template>
  <ComboboxSeparator v-bind="delegatedProps" :class="cn('-mx-1 h-px bg-slate-200', props.class)">
    <slot />
  </ComboboxSeparator>
</template>
