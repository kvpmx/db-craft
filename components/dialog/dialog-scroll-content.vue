<script lang="ts" setup>
  import {
    DialogClose,
    DialogContent,
    DialogOverlay,
    DialogPortal,
    useForwardPropsEmits,
  } from 'radix-vue';

  import type { HTMLAttributes } from 'vue';
  import type { DialogContentEmits, DialogContentProps } from 'radix-vue';

  const props = defineProps<DialogContentProps & { class?: HTMLAttributes['class'] }>();
  const emits = defineEmits<DialogContentEmits>();

  const delegatedProps = computed(() => {
    const { class: _, ...delegated } = props;

    return delegated;
  });

  const { t } = useI18n();
  const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
  <DialogPortal>
    <DialogOverlay
      class="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
    >
      <DialogContent
        :class="
          cn(
            'relative z-50 my-8 grid w-full max-w-lg gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-lg duration-200 md:w-full',
            props.class
          )
        "
        v-bind="forwarded"
        @pointer-down-outside="
          (event) => {
            const originalEvent = event.detail.originalEvent;
            const target = originalEvent.target as HTMLElement;

            if (
              originalEvent.offsetX > target.clientWidth ||
              originalEvent.offsetY > target.clientHeight
            ) {
              event.preventDefault();
            }
          }
        "
      >
        <slot />

        <DialogClose
          class="absolute right-3 top-3 rounded-md p-1 transition-colors hover:bg-slate-100"
          style="line-height: 0.7"
        >
          <Icon name="lucide:x" size="1rem" class="h-4 w-4" />
          <span class="sr-only">{{ t('CLOSE') }}</span>
        </DialogClose>
      </DialogContent>
    </DialogOverlay>
  </DialogPortal>
</template>
