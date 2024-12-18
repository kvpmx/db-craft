<script lang="ts" setup>
  import { DialogDescription } from 'radix-vue';

  import type { HTMLAttributes } from 'vue';
  import type { DialogDescriptionProps } from 'radix-vue';

  const props = defineProps<DialogDescriptionProps & { class?: HTMLAttributes['class'] }>();

  const delegatedProps = computed(() => {
    const { class: _, ...delegated } = props;

    return delegated;
  });
</script>

<template>
  <DialogDescription :class="cn('text-sm text-slate-500', props.class)" v-bind="delegatedProps">
    <slot />
  </DialogDescription>
</template>
