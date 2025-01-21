<script lang="ts" setup>
  import { formatDistanceToNow } from 'date-fns';
  import { DATETIME_LOCALES } from '@/lib/constants/locale';

  const { t, locale } = useI18n();
  const currentProject = useCurrentProject();

  const timeAgo = computed(() => {
    if (!currentProject.state) return null;

    const distanceToNow = formatDistanceToNow(new Date(currentProject.state.last_modified_at), {
      locale: DATETIME_LOCALES[locale.value],
    });

    return distanceToNow[0].toUpperCase() + distanceToNow.slice(1);
  });
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
        <div v-if="currentProject.saved" class="flex flex-col">
          {{ t('ALL_CHANGES_SAVED') }}
          <span class="italic">{{ t('TIME_AGO', { time: timeAgo }) }}</span>
        </div>
        <template v-else>
          {{ t('UNSAVED_CHANGES') }}
        </template>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</template>
