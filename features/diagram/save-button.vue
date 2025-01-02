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
            :name="currentProject.saved ? 'iconamoon:cloud-yes' : 'iconamoon:cloud-error'"
            size="1rem"
            :class="['h-4 w-4', currentProject.saved ? 'text-gray-600' : 'text-yellow-600']"
          />
          {{ t('SAVE') }}
        </Button>
      </TooltipTrigger>

      <TooltipContent class="text-[12px]">
        {{ currentProject.saved ? t('ALL_CHANGES_SAVED') : t('UNSAVED_CHANGES') }}
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</template>
