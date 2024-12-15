<script lang="ts" setup>
  import { Primitive } from 'radix-vue';
  import { buttonVariants } from './index';

  import type { HTMLAttributes } from 'vue';
  import type { PrimitiveProps } from 'radix-vue';
  import type { ButtonVariants } from './index';

  interface ButtonWithLoadingProps extends PrimitiveProps {
    loading: boolean;
    variant?: ButtonVariants['variant'];
    size?: ButtonVariants['size'];
    class?: HTMLAttributes['class'];
  }

  const props = withDefaults(defineProps<ButtonWithLoadingProps>(), {
    as: 'button',
  });
</script>

<template>
  <Primitive
    :as="as"
    :as-child="asChild"
    :class="cn(buttonVariants({ variant, size }), props.class, 'select-none')"
    :disabled="props.loading"
  >
    <Icon
      v-if="props.loading"
      name="lucide:loader-circle"
      size="1rem"
      class="mr-2 animate-spin text-white"
    />
    <slot />
  </Primitive>
</template>
