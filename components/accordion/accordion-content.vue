<script lang="ts" setup>
  import { AccordionContent } from 'radix-vue';

  import type { AccordionContentProps } from 'radix-vue';
  import type { HTMLAttributes } from 'vue';

  const props = defineProps<AccordionContentProps & { class?: HTMLAttributes['class'] }>();

  const delegatedProps = computed(() => {
    const { class: _, ...delegated } = props;
    return delegated;
  });
</script>

<template>
  <AccordionContent
    v-bind="delegatedProps"
    :class="
      cn(
        'overflow-hidden pb-4 pt-0 text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down',
        props.class
      )
    "
  >
    <slot />
  </AccordionContent>
</template>
