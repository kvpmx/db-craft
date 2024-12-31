<script lang="ts" setup>
  import { DropdownMenuSubTrigger, useForwardProps } from 'radix-vue';

  import type { HTMLAttributes } from 'vue';
  import type { DropdownMenuSubTriggerProps } from 'radix-vue';

  const props = defineProps<DropdownMenuSubTriggerProps & { class?: HTMLAttributes['class'] }>();

  const delegatedProps = computed(() => {
    const { class: _, ...delegated } = props;
    return delegated;
  });

  const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
  <DropdownMenuSubTrigger
    v-bind="forwardedProps"
    :class="
      cn(
        'flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-slate-100 data-[state=open]:bg-slate-100',
        props.class
      )
    "
  >
    <slot />
    <Icon name="lucide:chevron-right" size="1rem" class="ml-auto h-4 w-4" />
  </DropdownMenuSubTrigger>
</template>
