<script lang="ts" setup>
  import { cn } from '@/lib/utils';
  import { computed } from 'vue';
  import { ToastRoot, useForwardPropsEmits } from 'radix-vue';
  import { toastVariants } from './index';

  import type { ToastRootEmits } from 'radix-vue';
  import type { ToastProps } from './index';

  const props = defineProps<ToastProps>();

  const emits = defineEmits<ToastRootEmits>();

  const delegatedProps = computed(() => {
    const { class: _, ...delegated } = props;

    return delegated;
  });

  const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
  <ToastRoot
    v-bind="forwarded"
    :class="cn(toastVariants({ variant }), props.class)"
    @update:open="onOpenChange"
  >
    <slot />
  </ToastRoot>
</template>
