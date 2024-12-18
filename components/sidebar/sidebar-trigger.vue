<script lang="ts" setup>
  import { Button } from '@/components/button';
  import { useSidebar } from './utils';

  import type { HTMLAttributes } from 'vue';

  const props = defineProps<{
    class?: HTMLAttributes['class'];
  }>();

  const { toggleSidebar } = useSidebar();
</script>

<template>
  <Button
    data-sidebar="trigger"
    variant="ghost"
    size="icon"
    :class="cn('h-7 w-7', props.class)"
    @click="toggleSidebar"
  >
    <Icon name="lucide:panel-left" size="1.5rem" />
    <span class="sr-only">Toggle Sidebar</span>
  </Button>
</template>
