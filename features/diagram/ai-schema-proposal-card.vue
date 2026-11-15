<script lang="ts" setup>
  import type { SchemaProposal } from '@/types/ai-chat';

  defineProps<{
    proposal: SchemaProposal;
    applied?: boolean;
    discarded?: boolean;
  }>();

  const emit = defineEmits<{
    apply: [];
    discard: [];
  }>();

  const { t } = useI18n();
</script>

<template>
  <div
    class="overflow-hidden rounded-xl border border-amber-200/90 bg-gradient-to-b from-amber-50 to-amber-50/40 p-3 text-sm shadow-sm"
  >
    <div class="mb-2 flex items-center gap-2 text-amber-950">
      <Icon name="lucide:sparkles" size="0.875rem" class="h-3.5 w-3.5 shrink-0" />
      <p class="font-medium">{{ t('AI_PROPOSED_CHANGES') }}</p>
    </div>

    <pre
      class="mb-3 whitespace-pre-wrap rounded-lg border border-amber-100 bg-white/70 p-2.5 font-sans text-xs leading-5 text-amber-950"
      >{{ proposal.summary }}</pre>

    <div v-if="applied" class="flex items-center gap-1.5 text-xs font-medium text-green-700">
      <Icon name="lucide:check-circle-2" size="0.875rem" class="h-3.5 w-3.5" />
      {{ t('AI_CHANGES_APPLIED') }}
    </div>

    <div v-else-if="discarded" class="flex items-center gap-1.5 text-xs font-medium text-slate-500">
      <Icon name="lucide:x-circle" size="0.875rem" class="h-3.5 w-3.5" />
      {{ t('AI_CHANGES_DISCARDED') }}
    </div>

    <div v-else class="flex gap-2">
      <Button size="xs" class="gap-1" @click="emit('apply')">
        <Icon name="lucide:check" size="0.75rem" class="h-3 w-3" />
        {{ t('AI_APPLY_CHANGES') }}
      </Button>
      <Button size="xs" variant="outline" class="gap-1" @click="emit('discard')">
        <Icon name="lucide:x" size="0.75rem" class="h-3 w-3" />
        {{ t('AI_DISCARD_CHANGES') }}
      </Button>
    </div>
  </div>
</template>
