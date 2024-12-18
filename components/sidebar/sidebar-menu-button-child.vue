<script lang="ts" setup>
  import { Primitive } from 'radix-vue';
  import { sidebarMenuButtonVariants } from './index';

  import type { SidebarMenuButtonVariants } from './index';
  import type { HTMLAttributes } from 'vue';
  import type { PrimitiveProps } from 'radix-vue';

  export interface SidebarMenuButtonProps extends PrimitiveProps {
    variant?: SidebarMenuButtonVariants['variant'];
    size?: SidebarMenuButtonVariants['size'];
    isActive?: boolean;
    class?: HTMLAttributes['class'];
  }

  const props = withDefaults(defineProps<SidebarMenuButtonProps>(), {
    as: 'button',
    variant: 'default',
    size: 'default',
  });
</script>

<template>
  <Primitive
    data-sidebar="menu-button"
    :data-size="size"
    :data-active="isActive"
    :class="cn(sidebarMenuButtonVariants({ variant, size }), props.class)"
    :as="as"
    :as-child="asChild"
    v-bind="$attrs"
  >
    <slot />
  </Primitive>
</template>
