<script lang="ts" setup>
  import { useFormField } from './form-fields';
  import type { HTMLAttributes } from 'vue';

  const props = defineProps<{
    class?: HTMLAttributes['class'];
  }>();

  const { formDescriptionId } = useFormField();
</script>

<template>
  <p :id="formDescriptionId" :class="cn('text-sm text-slate-500', props.class)">
    <slot />
  </p>
</template>
