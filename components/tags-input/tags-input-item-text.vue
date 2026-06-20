<script lang="ts" setup>
  import { TagsInputItemText, useForwardProps } from 'radix-vue';

  import type { TagsInputItemTextProps } from 'radix-vue';
  import type { HTMLAttributes } from 'vue';

  const props = defineProps<TagsInputItemTextProps & { class?: HTMLAttributes['class'] }>();

  const delegatedProps = computed(() => {
    const { class: _, ...delegated } = props;
    return delegated;
  });

  const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
  <TagsInputItemText
    v-bind="forwardedProps"
    :class="cn('rounded bg-transparent px-0 py-0 text-sm', props.class)"
  >
    <slot />
  </TagsInputItemText>
</template>
