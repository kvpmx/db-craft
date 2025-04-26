<script lang="ts" generic="T extends DatabaseType" setup>
  import { toast } from 'vue-sonner';
  import type { NuxtError } from 'nuxt/app';
  import type { DatabaseType } from '@/lib/constants/diagram';
  import type { DiagramConfig } from '@/types/diagram';

  const { t } = useI18n();

  const prompt = ref('');
  const currentProject = useCurrentProject();

  const { mutateAsync: generateDiagram, isPending } = useMutation({
    mutationKey: ['generateDiagram'],
    mutationFn: async () => {
      const result = await $fetch<DiagramConfig<T>>('/api/generate-diagram', {
        method: 'POST',
        body: { prompt: prompt.value, type: currentProject.state?.type },
      });

      if (!result) return;

      currentProject.updateDiagramConfig({
        tables: result.tables,
        relations: result.relations,
      });
    },
    onError: (err: NuxtError) => {
      toast.error(
        import.meta.dev && err.statusMessage ? err.statusMessage : t('SOMETHING_WENT_WRONG')
      );
    },
  });
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <Button variant="secondary" size="sm">
        <Icon name="hugeicons:ai-magic" size="1.25rem" class="h-5 w-5" />
      </Button>
    </PopoverTrigger>

    <PopoverContent class="w-96 space-y-3" @open-auto-focus.prevent>
      <h4 class="text-md font-semibold">{{ t('GENERATE_WITH_AI') }}</h4>
      <Textarea
        v-model:model-value="prompt"
        class="h-40 resize-none"
        :placeholder="t('DESCRIBE_YOUR_DIAGRAM')"
      />

      <ButtonWithLoading
        :loading="isPending"
        type="submit"
        class="w-full"
        :disabled="!prompt.trim()"
        @click="generateDiagram"
      >
        {{ t('GENERATE') }}
      </ButtonWithLoading>
    </PopoverContent>
  </Popover>
</template>
