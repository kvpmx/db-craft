<script lang="ts" setup>
  import { SelectScrollDownButton, useForwardProps } from 'radix-vue';

  import type { HTMLAttributes } from 'vue';
  import type { SelectScrollDownButtonProps } from 'radix-vue';

  const props = defineProps<SelectScrollDownButtonProps & { class?: HTMLAttributes['class'] }>();

  const delegatedProps = computed(() => {
    const { class: _, ...delegated } = props;
    return delegated;
  });

  const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
  <SelectScrollDownButton
    v-bind="forwardedProps"
    :class="cn('flex cursor-default items-center justify-center py-1', props.class)"
  >
    <slot>
      <Icon name="lucide:chevron-down" size="1rem" class="h-4 w-4" />
    </slot>
  </SelectScrollDownButton>
</template>
