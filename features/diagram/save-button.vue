<script lang="ts" setup>
  import { formatDistanceToNow } from 'date-fns';
  import { ProjectsController } from '@/lib/controllers';
  import { DATETIME_LOCALES } from '@/lib/constants/locale';

  const { t, locale } = useI18n();
  const currentProject = useCurrentProject();
  const projectsApi = useApiController(ProjectsController);

  // Time of the last modification
  const timeAgo = computed(() => {
    if (!currentProject.state) return null;

    const distanceToNow = formatDistanceToNow(new Date(currentProject.state.last_modified_at), {
      locale: DATETIME_LOCALES[locale.value],
    });

    return distanceToNow[0].toUpperCase() + distanceToNow.slice(1);
  });

  // Update the thumbnail
  const canvas = useVueFlowCanvas();

  const { mutateAsync: save, isPending } = useMutation({
    mutationFn: async () => {
      if (currentProject.saved) return;
      await projectsApi.updateThumbnail(currentProject.state?.id, canvas.state);
      await currentProject.saveConfigToDatabase();
    },
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
          :disabled="isPending"
          @click="save"
        >
          <template v-if="isPending">
            <Icon
              name="lucide:loader-circle"
              size="1rem"
              class="h-4 w-4 animate-spin text-gray-600"
            />
          </template>
          <template v-else>
            <Icon
              :name="currentProject.saved ? 'iconamoon:cloud-yes' : 'iconamoon:cloud-error'"
              size="1rem"
              :class="['h-4 w-4', currentProject.saved ? 'text-gray-600' : 'text-yellow-600']"
            />
          </template>
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
