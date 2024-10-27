<script lang="ts" setup>
  import { Label } from '@/components/ui/label';
  import { cn } from '@/lib/utils';
  import { useFormField } from './use-form-fields';

  import type { HTMLAttributes } from 'vue';
  import type { LabelProps } from 'radix-vue';

  const props = defineProps<LabelProps & { class?: HTMLAttributes['class'] }>();

  const { error, formItemId } = useFormField();
</script>

<template>
  <Label :class="cn(error && 'text-red-500', props.class)" :for="formItemId">
    <slot />
  </Label>
</template>
