<script lang="ts" setup>
  import { DialogTitle } from 'radix-vue';

  import type { DialogTitleProps } from 'radix-vue';
  import type { HTMLAttributes } from 'vue';

  const props = defineProps<DialogTitleProps & { class?: HTMLAttributes['class'] }>();

  const delegatedProps = computed(() => {
    const { class: _, ...delegated } = props;

    return delegated;
  });
</script>

<template>
  <DialogTitle
    :class="cn('text-lg font-semibold text-slate-950', props.class)"
    v-bind="delegatedProps"
  >
    <slot />
  </DialogTitle>
</template>
