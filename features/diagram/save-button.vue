<script lang="ts" setup>
  const { t } = useI18n();

  // TODO
  const changesSaved = ref(true);
</script>

<template>
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger class="flex items-center">
        <Button
          variant="secondary"
          size="sm"
          :class="['flex gap-2 border-[1px] font-medium', !changesSaved && 'border-yellow-600']"
          @click="changesSaved = !changesSaved"
        >
          <Icon
            v-if="changesSaved"
            name="iconamoon:cloud-yes"
            size="1rem"
            class="h-4 w-4 bg-gray-600"
          />
          <Icon v-else name="iconamoon:cloud-error" size="1rem" class="h-4 w-4 text-yellow-600" />
          {{ t('SAVE') }}
        </Button>
      </TooltipTrigger>

      <TooltipContent class="text-[12px]">
        <span v-if="changesSaved">{{ t('ALL_CHANGES_SAVED') }}</span>
        <span v-else>{{ t('UNSAVED_CHANGES') }}</span>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</template>
