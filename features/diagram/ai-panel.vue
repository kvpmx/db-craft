<script lang="ts" generic="T extends DatabaseType" setup>
  import { toast } from 'vue-sonner';
  import { SIDEBAR_PANEL_HEADER_CLASS } from '@/features/diagram/sidebar-tabs';

  import type { NuxtError } from 'nuxt/app';
  import type { DatabaseType } from '@/lib/constants/diagram';
  import type { DiagramConfig } from '@/types/diagram';

  defineProps<{ pending: boolean }>();

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
  <div class="flex min-h-0 flex-1 flex-col">
    <div :class="SIDEBAR_PANEL_HEADER_CLASS">
      <h2 class="text-md font-semibold">{{ t('GENERATE_WITH_AI') }}</h2>
    </div>

    <div class="flex flex-1 flex-col gap-3 p-3">
      <Textarea
        v-model:model-value="prompt"
        class="min-h-40 flex-1 resize-none"
        :placeholder="t('DESCRIBE_YOUR_DIAGRAM')"
        :disabled="pending"
      />

      <ButtonWithLoading
        :loading="isPending"
        type="submit"
        class="w-full"
        :disabled="!prompt.trim() || pending"
        @click="generateDiagram"
      >
        {{ t('GENERATE') }}
      </ButtonWithLoading>
    </div>
  </div>
</template>
