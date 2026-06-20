<script lang="ts" setup>
  import z from 'zod';

  import {
    TagsInput,
    TagsInputInput,
    TagsInputItem,
    TagsInputItemDelete,
    TagsInputItemText,
  } from '@/components/tags-input';

  import type { HTMLAttributes } from 'vue';

  const props = withDefaults(
    defineProps<{
      modelValue: string[];
      placeholder?: string;
      class?: HTMLAttributes['class'];
    }>(),
    {
      modelValue: () => [],
    }
  );

  const emit = defineEmits<{
    (event: 'update:modelValue', value: string[]): void;
  }>();

  const emailSchema = z.string().trim().email();

  const normalizeEmail = (value: string) => value.trim().toLowerCase();
  const isValidEmail = (value: string) => emailSchema.safeParse(value).success;

  const emails = computed({
    get: () => props.modelValue,
    set: (value: string[]) => {
      const next = [...new Set(value.map(normalizeEmail).filter(isValidEmail))];
      emit('update:modelValue', next);
    },
  });

  const convertEmail = (value: string) => normalizeEmail(value);
</script>

<template>
  <TagsInput
    v-model="emails"
    :convert-value="convertEmail"
    :delimiter="'/[\\s,;]+/'"
    :add-on-paste="true"
    :add-on-blur="true"
    :class="props.class"
  >
    <TagsInputItem v-for="email in emails" :key="email" :value="email">
      <TagsInputItemText />
      <TagsInputItemDelete />
    </TagsInputItem>

    <TagsInputInput
      type="email"
      autocomplete="off"
      :placeholder="emails.length === 0 ? placeholder : undefined"
    />
  </TagsInput>
</template>
