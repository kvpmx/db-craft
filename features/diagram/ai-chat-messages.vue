<script lang="ts" setup>
  import {
    getMessageText,
    getSchemaProposalsForMessage,
    isAiErrorMessage,
    isGeneratingSchemaProposal,
    shouldShowAssistantMessage,
    shouldShowTypingIndicator,
  } from '@/composables/diagram-ai-chat';
  import DiagramAiSchemaProposalCard from '@/features/diagram/ai-schema-proposal-card.vue';
  import DiagramAiChatMarkdown from '@/features/diagram/ai-chat-markdown.vue';
  import DiagramAiChatTypingIndicator from '@/features/diagram/ai-chat-typing-indicator.vue';

  import type { Message } from '@ai-sdk/ui-utils';
  import type { SchemaProposal } from '@/types/ai-chat';

  const props = defineProps<{
    messages: Message[];
    isLoading?: boolean;
    appliedProposals: Set<string>;
    dismissedProposals: Set<string>;
  }>();

  const emit = defineEmits<{
    apply: [toolCallId: string, proposal: SchemaProposal];
    discard: [toolCallId: string];
    suggest: [prompt: string];
  }>();

  const { t } = useI18n();

  const scrollContainer = ref<HTMLElement | null>(null);

  const suggestions = computed(() => [
    t('AI_SUGGEST_DESCRIBE'),
    t('AI_SUGGEST_ADD_TABLE'),
    t('AI_SUGGEST_REVIEW'),
  ]);

  const showTypingIndicator = computed(() =>
    shouldShowTypingIndicator(props.messages, !!props.isLoading)
  );

  const loadingStatus = computed(() => {
    if (isGeneratingSchemaProposal(props.messages, !!props.isLoading)) {
      return t('AI_GENERATING_PROPOSAL');
    }

    return t('AI_THINKING');
  });

  const scrollToBottom = async () => {
    await nextTick();

    if (!scrollContainer.value) return;

    scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight;
  };

  watch(
    () => {
      const last = props.messages.at(-1);

      return [
        props.messages.length,
        props.isLoading,
        last ? getMessageText(last) : '',
        last?.parts?.length ?? 0,
      ];
    },
    () => {
      scrollToBottom();
    },
    { flush: 'post' }
  );

  onMounted(() => {
    scrollToBottom();
  });
</script>

<template>
  <div ref="scrollContainer" class="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto px-3 py-3">
    <div
      v-if="!messages.length && !isLoading"
      class="flex flex-1 flex-col items-center justify-center gap-4 px-2 py-6 text-center"
    >
      <div
        class="flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 text-violet-700"
      >
        <Icon name="hugeicons:ai-magic" size="1.25rem" class="h-5 w-5" />
      </div>

      <div class="space-y-1">
        <p class="text-sm font-medium text-slate-900">{{ t('AI_CHAT_EMPTY_TITLE') }}</p>
        <p class="text-xs leading-relaxed text-slate-500">{{ t('AI_CHAT_EMPTY') }}</p>
      </div>

      <div class="flex w-full flex-col gap-2">
        <button
          v-for="suggestion in suggestions"
          :key="suggestion"
          type="button"
          class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-xs text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
          @click="emit('suggest', suggestion)"
        >
          {{ suggestion }}
        </button>
      </div>
    </div>

    <div v-else class="flex min-w-0 flex-col gap-4">
      <div v-for="message in messages" :key="message.id" class="flex min-w-0 flex-col gap-1.5">
        <div
          v-if="shouldShowAssistantMessage(message)"
          :class="
            cn('flex min-w-0 flex-col gap-1', message.role === 'user' ? 'items-end' : 'items-start')
          "
        >
          <span class="px-1 text-[10px] font-medium uppercase tracking-wide text-slate-400">
            {{ message.role === 'user' ? t('AI_YOU') : t('AI') }}
          </span>

          <div
            :class="
              cn(
                'min-w-0 max-w-[92%] overflow-hidden rounded-2xl px-3 py-2.5 text-xs shadow-sm',
                message.role === 'user'
                  ? 'whitespace-pre-wrap rounded-br-md bg-slate-900 text-white'
                  : isAiErrorMessage(message)
                    ? 'rounded-bl-md border border-red-200 bg-red-50 text-red-900'
                    : 'rounded-bl-md border border-slate-200/80 bg-white text-slate-900'
              )
            "
          >
            <p
              v-if="isAiErrorMessage(message)"
              class="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide"
            >
              <Icon name="lucide:alert-circle" size="0.875rem" class="h-3.5 w-3.5" />
              {{ t('AI_ERROR') }}
            </p>

            <DiagramAiChatMarkdown
              v-if="message.role === 'assistant'"
              :content="getMessageText(message)"
            />
            <template v-else>
              {{ getMessageText(message) }}
            </template>
          </div>
        </div>

        <template v-for="item in getSchemaProposalsForMessage(message)" :key="item.toolCallId">
          <DiagramAiSchemaProposalCard
            class="max-w-[92%]"
            :proposal="item.proposal"
            :applied="appliedProposals.has(item.toolCallId)"
            :discarded="dismissedProposals.has(item.toolCallId)"
            @apply="emit('apply', item.toolCallId, item.proposal)"
            @discard="emit('discard', item.toolCallId)"
          />
        </template>
      </div>

      <div v-if="showTypingIndicator" class="flex flex-col items-start gap-1">
        <span class="px-1 text-[10px] font-medium uppercase tracking-wide text-slate-400">
          {{ t('AI') }}
        </span>
        <DiagramAiChatTypingIndicator :label="loadingStatus" />
      </div>
    </div>
  </div>
</template>
