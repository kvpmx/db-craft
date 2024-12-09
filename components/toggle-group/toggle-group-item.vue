<script lang="ts" setup>
  import { toggleVariants } from '@/components/toggle';
  import { ToggleGroupItem, useForwardProps } from 'radix-vue';

  import type { HTMLAttributes } from 'vue';
  import type { ToggleVariants } from '@/components/toggle';
  import type { ToggleGroupItemProps } from 'radix-vue';

  const props = defineProps<
    ToggleGroupItemProps & {
      class?: HTMLAttributes['class'];
      variant?: ToggleVariants['variant'];
      size?: ToggleVariants['size'];
    }
  >();

  const context = inject<ToggleVariants>('toggleGroup');

  const delegatedProps = computed(() => {
    const { class: _, variant, size, ...delegated } = props;
    return delegated;
  });

  const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
  <ToggleGroupItem
    v-bind="forwardedProps"
    :class="
      cn(
        toggleVariants({
          variant: context?.variant || variant,
          size: context?.size || size,
        }),
        props.class
      )
    "
  >
    <slot />
  </ToggleGroupItem>
</template>
