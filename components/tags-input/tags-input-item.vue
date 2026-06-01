<script lang="ts" setup>
  import { TagsInputItem, useForwardProps } from 'radix-vue';

  import type { TagsInputItemProps } from 'radix-vue';
  import type { HTMLAttributes } from 'vue';

  const props = defineProps<TagsInputItemProps & { class?: HTMLAttributes['class'] }>();

  const delegatedProps = computed(() => {
    const { class: _, ...delegated } = props;
    return delegated;
  });

  const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
  <TagsInputItem
    v-bind="forwardedProps"
    :class="
      cn(
        'inline-flex h-auto items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-slate-700 data-[state=active]:ring-2 data-[state=active]:ring-slate-950 data-[state=active]:ring-offset-2',
        props.class
      )
    "
  >
    <slot />
  </TagsInputItem>
</template>
