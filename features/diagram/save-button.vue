<script lang="ts" setup>
  const { t } = useI18n();
  const currentProject = useCurrentProject();
</script>

<template>
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger class="flex items-center" as-child>
        <Button
          variant="secondary"
          size="sm"
          :class="[
            'flex gap-2 border-[1px] font-medium',
            !currentProject.saved && 'border-yellow-600',
          ]"
          @click="currentProject.saveConfigToDatabase"
        >
          <Icon
            v-if="currentProject.saved"
            name="iconamoon:cloud-yes"
            size="1rem"
            class="h-4 w-4 text-gray-600"
          />
          <Icon v-else name="iconamoon:cloud-error" size="1rem" class="h-4 w-4 text-yellow-600" />
          {{ t('SAVE') }}
        </Button>
      </TooltipTrigger>

      <TooltipContent class="text-[12px]">
        <span v-if="currentProject.saved">{{ t('ALL_CHANGES_SAVED') }}</span>
        <span v-else>{{ t('UNSAVED_CHANGES') }}</span>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</template>
