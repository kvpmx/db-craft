<script lang="ts" setup>
  const { t } = useI18n();
  const prompt = ref('');
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <Button variant="secondary" size="sm">
        <Icon name="hugeicons:ai-magic" size="1.25rem" class="h-5 w-5" />
      </Button>
    </PopoverTrigger>

    <PopoverContent class="w-80 space-y-3" @open-auto-focus.prevent>
      <h4 class="text-md font-semibold">{{ t('GENERATE_WITH_AI') }}</h4>
      <Textarea
        v-model:model-value="prompt"
        class="h-40 resize-none"
        :placeholder="t('DESCRIBE_YOUR_DIAGRAM')"
      />

      <ButtonWithLoading :loading="false" type="submit" class="w-full" :disabled="!prompt.trim()">
        {{ t('GENERATE') }}
      </ButtonWithLoading>
    </PopoverContent>
  </Popover>
</template>
