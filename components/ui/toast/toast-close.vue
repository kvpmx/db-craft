<script lang="ts" setup>
  import { cn } from '@/lib/utils';
  import { computed } from 'vue';
  import { ToastClose } from 'radix-vue';

  import type { HTMLAttributes } from 'vue';
  import type { ToastCloseProps } from 'radix-vue';

  const props = defineProps<
    ToastCloseProps & {
      class?: HTMLAttributes['class'];
    }
  >();

  const delegatedProps = computed(() => {
    const { class: _, ...delegated } = props;

    return delegated;
  });
</script>

<template>
  <ToastClose
    v-bind="delegatedProps"
    :class="
      cn(
        'absolute right-2 top-2 rounded-md p-1 text-slate-950/50 opacity-0 transition-opacity hover:text-slate-950 focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600',
        props.class
      )
    "
  >
    <Icon name="lucide:x" size="1rem" />
  </ToastClose>
</template>
