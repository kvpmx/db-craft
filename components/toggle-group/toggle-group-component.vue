<script lang="ts" setup>
  import { ToggleGroupRoot, useForwardPropsEmits } from 'radix-vue';

  import type { HTMLAttributes } from 'vue';
  import type { ToggleVariants } from '@/components/toggle';
  import type { ToggleGroupRootEmits, ToggleGroupRootProps } from 'radix-vue';

  const props = defineProps<
    ToggleGroupRootProps & {
      class?: HTMLAttributes['class'];
      variant?: ToggleVariants['variant'];
      size?: ToggleVariants['size'];
    }
  >();

  const emits = defineEmits<ToggleGroupRootEmits>();

  provide('toggleGroup', {
    variant: props.variant,
    size: props.size,
  });

  const delegatedProps = computed(() => {
    const { class: _, ...delegated } = props;
    return delegated;
  });

  const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
  <ToggleGroupRoot
    v-bind="forwarded"
    :class="cn('flex items-center justify-center gap-1', props.class)"
  >
    <slot />
  </ToggleGroupRoot>
</template>
