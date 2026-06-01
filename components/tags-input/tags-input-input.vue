<script lang="ts" setup>
  import { TagsInputInput, useForwardProps } from 'radix-vue';

  import type { TagsInputInputProps } from 'radix-vue';
  import type { HTMLAttributes } from 'vue';

  const props = defineProps<TagsInputInputProps & { class?: HTMLAttributes['class'] }>();

  const delegatedProps = computed(() => {
    const { class: _, ...delegated } = props;
    return delegated;
  });

  const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
  <TagsInputInput
    v-bind="forwardedProps"
    :class="
      cn(
        'min-w-[8rem] flex-1 bg-transparent px-1 py-1 text-sm outline-none placeholder:text-slate-500',
        props.class
      )
    "
  />
</template>
