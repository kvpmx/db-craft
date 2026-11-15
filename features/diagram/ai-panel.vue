<script lang="ts" generic="T extends DatabaseType" setup>
  import DiagramAiChatMessages from '@/features/diagram/ai-chat-messages.vue';

  import { SIDEBAR_PANEL_HEADER_CLASS } from '@/features/diagram/sidebar-tabs';
  import { useDiagramAiChat } from '@/composables/diagram-ai-chat';

  import type { DatabaseType } from '@/lib/constants/diagram';

  defineProps<{ pending: boolean }>();

  const { t } = useI18n();

  const {
    ready,
    messages,
    input,
    submitMessage,
    isLoading,
    stop,
    clearChat,
    applyProposal,
    discardProposal,
    appliedProposals,
    dismissedProposals,
  } = useDiagramAiChat();

  const onInputKeydown = (event: KeyboardEvent) => {
    if (event.key !== 'Enter' || event.shiftKey) return;

    event.preventDefault();
    submitMessage();
  };

  const onSuggest = (prompt: string) => {
    input.value = prompt;
  };
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col bg-slate-50/60">
    <div :class="SIDEBAR_PANEL_HEADER_CLASS">
      <div class="flex min-w-0 items-center gap-2">
        <div
          class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-violet-100 text-violet-700"
        >
          <Icon name="hugeicons:ai-magic" size="0.875rem" class="h-3.5 w-3.5" />
        </div>
        <h2 class="text-md truncate font-semibold">{{ t('AI') }}</h2>
      </div>

      <Button
        v-if="ready && messages.length"
        variant="ghost"
        size="xs"
        class="shrink-0 text-slate-500"
        :disabled="pending || !!isLoading"
        @click="clearChat"
      >
        {{ t('AI_CLEAR_CHAT') }}
      </Button>
    </div>

    <div v-if="!ready" class="flex flex-1 items-center justify-center p-3 text-sm text-slate-500">
      {{ t('DEFAULT_LOADING_MESSAGE') }}
    </div>

    <template v-else>
      <DiagramAiChatMessages
        :messages="messages"
        :is-loading="!!isLoading"
        :applied-proposals="appliedProposals"
        :dismissed-proposals="dismissedProposals"
        @apply="applyProposal"
        @discard="discardProposal"
        @suggest="onSuggest"
      />

      <form class="shrink-0 border-t border-slate-200 bg-white p-3" @submit="submitMessage">
        <div class="relative">
          <Textarea
            v-model:model-value="input"
            class="max-h-32 min-h-11 w-full min-w-0 resize-none py-2.5 pb-9 pr-10"
            rows="2"
            :placeholder="t('AI_CHAT_PLACEHOLDER')"
            :disabled="pending || !!isLoading"
            @keydown="onInputKeydown"
          />

          <Button
            v-if="isLoading"
            type="button"
            variant="outline"
            size="sm"
            class="absolute bottom-2 right-2 h-8 shrink-0 px-2.5"
            @click="stop"
          >
            {{ t('AI_STOP') }}
          </Button>

          <ButtonWithLoading
            v-else
            class="absolute bottom-2 right-2 h-8 w-8 shrink-0 p-0"
            :loading="false"
            type="submit"
            size="sm"
            :disabled="!input.trim() || pending"
          >
            <Icon name="lucide:send" size="0.875rem" class="h-3.5 w-3.5" />
          </ButtonWithLoading>
        </div>

        <p class="mt-2 text-[10px] text-slate-400">
          {{ t('AI_INPUT_HINT') }}
        </p>
      </form>
    </template>
  </div>
</template>
