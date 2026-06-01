<script lang="ts" setup>
  import { TagsInputItemDelete, useForwardProps } from 'radix-vue';

  import type { TagsInputItemDeleteProps } from 'radix-vue';
  import type { HTMLAttributes } from 'vue';

  const props = defineProps<TagsInputItemDeleteProps & { class?: HTMLAttributes['class'] }>();

  const delegatedProps = computed(() => {
    const { class: _, ...delegated } = props;
    return delegated;
  });

  const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
  <TagsInputItemDelete
    v-bind="forwardedProps"
    :class="
      cn('mr-0 flex rounded-sm bg-transparent text-slate-500 hover:text-slate-900', props.class)
    "
  >
    <slot>
      <Icon name="lucide:x" size="0.75rem" class="h-3 w-3" />
    </slot>
  </TagsInputItemDelete>
</template>
