<script lang="ts" setup>
  import { TagsInputRoot, useForwardPropsEmits } from 'radix-vue';

  import type { TagsInputRootEmits, TagsInputRootProps } from 'radix-vue';
  import type { HTMLAttributes } from 'vue';

  const props = defineProps<TagsInputRootProps & { class?: HTMLAttributes['class'] }>();
  const emits = defineEmits<TagsInputRootEmits>();

  const delegatedProps = computed(() => {
    const { class: _, ...delegated } = props;
    return delegated;
  });

  const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
  <TagsInputRoot
    v-bind="forwarded"
    :class="
      cn(
        'flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm ring-offset-white focus-within:ring-2 focus-within:ring-slate-950 focus-within:ring-offset-2',
        props.class
      )
    "
  >
    <slot />
  </TagsInputRoot>
</template>
