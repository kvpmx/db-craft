<script lang="ts" setup>
  import { AccordionHeader, AccordionTrigger } from 'radix-vue';

  import type { AccordionTriggerProps } from 'radix-vue';
  import type { HTMLAttributes } from 'vue';

  const props = defineProps<AccordionTriggerProps & { class?: HTMLAttributes['class'] }>();

  const delegatedProps = computed(() => {
    const { class: _, ...delegated } = props;
    return delegated;
  });
</script>

<template>
  <AccordionHeader class="flex">
    <AccordionTrigger
      v-bind="delegatedProps"
      :class="
        cn(
          'flex flex-1 items-center justify-between py-4 font-medium transition-all [&[data-state=open]>.accordion-trigger-icon]:rotate-180',
          props.class
        )
      "
    >
      <slot name="icon">
        <Icon
          name="lucide:chevron-down"
          size="1rem"
          class="accordion-trigger-icon h-4 w-4 shrink-0 transition-transform duration-200"
        />
      </slot>
      <slot />
    </AccordionTrigger>
  </AccordionHeader>
</template>
