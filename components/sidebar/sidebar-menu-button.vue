<script lang="ts" setup>
  import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/tooltip';
  import { useSidebar } from './utils';
  import SidebarMenuButtonChild from './sidebar-menu-button-child.vue';

  import type { Component } from 'vue';
  import type { SidebarMenuButtonProps } from './sidebar-menu-button-child.vue';

  defineOptions({
    inheritAttrs: false,
  });

  const props = withDefaults(
    defineProps<
      SidebarMenuButtonProps & {
        tooltip?: string | Component;
      }
    >(),
    {
      as: 'button',
      variant: 'default',
      size: 'default',
    }
  );

  const { isMobile, state } = useSidebar();

  const delegatedProps = computed(() => {
    const { tooltip, ...delegated } = props;
    return delegated;
  });
</script>

<template>
  <SidebarMenuButtonChild v-if="!tooltip" v-bind="{ ...delegatedProps, ...$attrs }">
    <slot />
  </SidebarMenuButtonChild>

  <Tooltip v-else>
    <TooltipTrigger as-child>
      <SidebarMenuButtonChild v-bind="{ ...delegatedProps, ...$attrs }">
        <slot />
      </SidebarMenuButtonChild>
    </TooltipTrigger>
    <TooltipContent side="right" align="center" :hidden="state !== 'collapsed' || isMobile">
      <template v-if="typeof tooltip === 'string'">
        {{ tooltip }}
      </template>
      <component :is="tooltip" v-else />
    </TooltipContent>
  </Tooltip>
</template>
