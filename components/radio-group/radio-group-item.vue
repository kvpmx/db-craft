<script lang="ts" setup>
  import { RadioGroupIndicator, RadioGroupItem, useForwardProps } from 'radix-vue';

  import type { HTMLAttributes } from 'vue';
  import type { RadioGroupItemProps } from 'radix-vue';

  const props = defineProps<RadioGroupItemProps & { class?: HTMLAttributes['class'] }>();

  const delegatedProps = computed(() => {
    const { class: _, ...delegated } = props;

    return delegated;
  });

  const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
  <RadioGroupItem
    v-bind="forwardedProps"
    :class="
      cn(
        'aspect-square h-4 w-4 rounded-full border border-slate-900 text-slate-900 ring-offset-white focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        props.class
      )
    "
  >
    <RadioGroupIndicator class="flex items-center justify-center">
      <Icon name="lucide:circle" size="0.625rem" class="fill-current text-current" />
    </RadioGroupIndicator>
  </RadioGroupItem>
</template>
