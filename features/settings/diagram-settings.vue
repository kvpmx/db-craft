<script lang="ts" setup>
  import type { DiagramSettings } from '@/types/user-settings';

  const { t } = useI18n();

  const emit = defineEmits<{ submit: [] }>();
  const settings = defineModel<DiagramSettings>({ required: true });

  const submitSettingsForm = () => {
    emit('submit');
  };
</script>

<template>
  <form class="space-y-6 pt-4" @submit.prevent="submitSettingsForm">
    <div class="flex items-center justify-between gap-3 rounded-md">
      <div class="space-y-1">
        <Label for="show-relation-cardinality" class="font-semibold">
          {{ t('SHOW_RELATION_CARDINALITY') }}
        </Label>
        <p class="text-sm text-slate-500">
          {{ t('SHOW_RELATION_CARDINALITY_DESCRIPTION') }}
        </p>
      </div>

      <Switch
        id="show-relation-cardinality"
        :checked="settings.show_relation_cardinality"
        :aria-label="t('SHOW_RELATION_CARDINALITY')"
        @update:checked="settings.show_relation_cardinality = $event"
      />
    </div>

    <div class="flex items-center justify-end gap-3 border-t border-slate-200 pt-6">
      <slot name="actions" />
    </div>
  </form>
</template>
