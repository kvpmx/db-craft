<script lang="ts" setup>
  import { cn } from '@/lib/utils';
  import { computed } from 'vue';
  import { ToastAction } from 'radix-vue';

  import type { HTMLAttributes } from 'vue';
  import type { ToastActionProps } from 'radix-vue';

  const props = defineProps<ToastActionProps & { class?: HTMLAttributes['class'] }>();

  const delegatedProps = computed(() => {
    const { class: _, ...delegated } = props;

    return delegated;
  });
</script>

<template>
  <ToastAction
    v-bind="delegatedProps"
    :class="
      cn(
        'inline-flex h-8 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-transparent px-3 text-sm font-medium ring-offset-white transition-colors hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-slate-100/40 group-[.destructive]:hover:border-red-500/30 group-[.destructive]:hover:bg-red-500 group-[.destructive]:hover:text-slate-50 group-[.destructive]:focus:ring-red-500',
        props.class
      )
    "
  >
    <slot />
  </ToastAction>
</template>
