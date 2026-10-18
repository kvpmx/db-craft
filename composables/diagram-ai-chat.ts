import { useChat } from '@ai-sdk/vue';
import { generateId } from '@ai-sdk/ui-utils';
import { toast } from 'vue-sonner';
import { DiagramAiChatsController } from '@/lib/controllers';
import { parseApiErrorBody } from '@/lib/ai/format-error';

import type { Message, ToolInvocation } from '@ai-sdk/ui-utils';
import type { ProposalStates, SchemaProposal } from '@/types/ai-chat';
import type { DiagramConfig } from '@/types/diagram';

export const AI_ERROR_MESSAGE_DATA = { type: 'ai-error' } as const;

const toProposalStates = (applied: Set<string>, dismissed: Set<string>): ProposalStates => {
  const states: ProposalStates = {};

  for (const toolCallId of applied) {
    states[toolCallId] = 'applied';
  }

  for (const toolCallId of dismissed) {
    states[toolCallId] = 'discarded';
  }

  return states;
};

const fromProposalStates = (states: ProposalStates | undefined) => {
  const applied = new Set<string>();
  const dismissed = new Set<string>();

  for (const [toolCallId, state] of Object.entries(states ?? {})) {
    if (state === 'applied') applied.add(toolCallId);
    if (state === 'discarded') dismissed.add(toolCallId);
  }

  return { applied, dismissed };
};

const isSchemaProposal = (value: unknown): value is SchemaProposal => {
  if (!value || typeof value !== 'object') return false;

  const proposal = value as SchemaProposal;

  return (
    typeof proposal.proposalId === 'string' &&
    typeof proposal.summary === 'string' &&
    (proposal.mode === 'patch' || proposal.mode === 'replace') &&
    typeof proposal.proposedSchema === 'object'
  );
};

export const getToolInvocations = (message: Message): ToolInvocation[] => {
  const fromParts = (message.parts ?? [])
    .filter((part) => part.type === 'tool-invocation')
    .map((part) => part.toolInvocation);

  const invocations = fromParts.length ? fromParts : (message.toolInvocations ?? []);
  const seen = new Set<string>();

  return invocations.filter((invocation) => {
    if (seen.has(invocation.toolCallId)) return false;

    seen.add(invocation.toolCallId);
    return true;
  });
};

export const extractSchemaProposals = (messages: Message[]) => {
  const proposals = new Map<string, SchemaProposal>();

  for (const message of messages) {
    if (message.role !== 'assistant') continue;

    const invocations = getToolInvocations(message);

    for (const invocation of invocations) {
      if (invocation.state !== 'result' || invocation.toolName !== 'proposeSchemaUpdate') {
        continue;
      }

      if (isSchemaProposal(invocation.result)) {
        proposals.set(invocation.toolCallId, invocation.result);
      }
    }
  }

  return proposals;
};

export const getMessageText = (message: Message) => {
  if (message.parts?.length) {
    return message.parts
      .filter((part) => part.type === 'text')
      .map((part) => part.text)
      .join('');
  }

  return message.content;
};

export const isAiErrorMessage = (message: Message) => {
  if (message.role !== 'assistant') return false;

  const data = message.data;

  return (
    typeof data === 'object' &&
    data !== null &&
    !Array.isArray(data) &&
    'type' in data &&
    data.type === AI_ERROR_MESSAGE_DATA.type
  );
};

const formatAiErrorMessage = (err: Error, reasonLabel: string, fallback: string) => {
  const parsed = parseApiErrorBody(err.message);
  const details = parsed ?? err.message?.trim();

  if (
    !details ||
    details === 'Failed to fetch' ||
    details === 'Failed to fetch the chat response.' ||
    details === 'An error occurred.'
  ) {
    return `**${reasonLabel}:** ${fallback}`;
  }

  if (details.startsWith('**') || details.includes('\n')) {
    return details.startsWith('**') ? details : `**${reasonLabel}:**\n\n${details}`;
  }

  return `**${reasonLabel}:** ${details}`;
};

const setAssistantErrorMessage = (currentMessages: Message[], text: string): Message[] => {
  const updated = [...currentMessages];
  const last = updated[updated.length - 1];

  if (last?.role === 'assistant') {
    updated[updated.length - 1] = {
      ...last,
      content: text,
      parts: [{ type: 'text', text }],
      data: AI_ERROR_MESSAGE_DATA,
    };

    return updated;
  }

  return [
    ...updated,
    {
      id: generateId(),
      role: 'assistant',
      content: text,
      parts: [{ type: 'text', text }],
      data: AI_ERROR_MESSAGE_DATA,
      createdAt: new Date(),
    },
  ];
};

export const shouldShowAssistantMessage = (message: Message) => {
  if (message.role !== 'assistant') return true;

  return getMessageText(message).trim().length > 0 || isAiErrorMessage(message);
};

export const getSchemaProposalsForMessage = (message: Message) => {
  const byProposalId = new Map<string, { toolCallId: string; proposal: SchemaProposal }>();

  for (const invocation of getToolInvocations(message)) {
    if (invocation.toolName !== 'proposeSchemaUpdate' || invocation.state !== 'result') {
      continue;
    }

    if (!isSchemaProposal(invocation.result)) continue;

    byProposalId.set(invocation.result.proposalId, {
      toolCallId: invocation.toolCallId,
      proposal: invocation.result,
    });
  }

  const proposals = [...byProposalId.values()];

  return proposals.length > 1 ? [proposals[proposals.length - 1]!] : proposals;
};

export const isGeneratingSchemaProposal = (messages: Message[], loading: boolean) => {
  if (!loading) return false;

  const last = messages.at(-1);

  if (!last || last.role !== 'assistant') return false;

  return getToolInvocations(last).some(
    (invocation) => invocation.toolName === 'proposeSchemaUpdate' && invocation.state !== 'result'
  );
};

export const shouldShowTypingIndicator = (messages: Message[], loading: boolean) => {
  if (!loading) return false;

  const last = messages.at(-1);

  if (!last || last.role !== 'assistant') return true;

  if (shouldShowAssistantMessage(last)) return false;

  return getSchemaProposalsForMessage(last).length === 0;
};

const normalizeSchemaForCompare = (schema: DiagramConfig) => {
  return JSON.stringify({
    tables: schema.tables ?? [],
    relations: schema.relations ?? [],
    notes: schema.notes ?? [],
    tableGroups: schema.tableGroups ?? [],
  });
};

const inferAppliedProposals = (messages: Message[], schema: DiagramConfig | undefined) => {
  const applied = new Set<string>();

  if (!schema) return applied;

  const currentSchema = normalizeSchemaForCompare(schema);

  for (const [toolCallId, proposal] of extractSchemaProposals(messages).entries()) {
    if (normalizeSchemaForCompare(proposal.proposedSchema) === currentSchema) {
      applied.add(toolCallId);
    }
  }

  return applied;
};

export const useDiagramAiChat = () => {
  const { t } = useI18n();
  const currentProject = useCurrentProject();
  const aiChatsApi = useApiController(DiagramAiChatsController);

  const ready = ref(false);
  const dismissedProposals = ref(new Set<string>());
  const appliedProposals = ref(new Set<string>());

  const projectId = computed(() => currentProject.state?.id);
  const databaseType = computed(() => currentProject.state?.type);
  const currentSchema = computed(() => currentProject.state?.schema);

  const chatBody = computed(() => ({
    projectId: projectId.value,
    databaseType: databaseType.value,
    currentSchema: currentSchema.value,
  }));

  const persistChat = async () => {
    if (!projectId.value) return;

    await aiChatsApi.upsert(
      projectId.value,
      messages.value,
      toProposalStates(appliedProposals.value, dismissedProposals.value)
    );
  };

  const { messages, input, isLoading, setMessages, append, stop } = useChat({
    api: '/api/diagram-ai/chat',
    body: chatBody,
    maxSteps: 5,
    onFinish: async () => {
      if (!projectId.value) return;

      try {
        await persistChat();
      } catch {
        toast.error(t('SOMETHING_WENT_WRONG'));
      }
    },
    onError: async (err) => {
      const text = formatAiErrorMessage(err, t('AI_ERROR_REASON'), t('SOMETHING_WENT_WRONG'));

      setMessages((currentMessages) => setAssistantErrorMessage(currentMessages, text));

      if (!projectId.value) return;

      try {
        await nextTick();
        await persistChat();
      } catch {
        // Persistence failure is non-blocking; error is already visible in chat.
      }
    },
  });

  const loadChat = async () => {
    ready.value = false;

    if (!projectId.value) {
      setMessages([]);
      ready.value = true;
      return;
    }

    try {
      const chat = await aiChatsApi.getByProjectId(projectId.value);
      const loadedMessages = (chat?.messages as Message[]) ?? [];
      setMessages(loadedMessages);

      const { applied, dismissed } = fromProposalStates(chat?.proposal_states);

      if (!applied.size && !dismissed.size) {
        const inferred = inferAppliedProposals(loadedMessages, currentSchema.value);
        appliedProposals.value = inferred;

        if (inferred.size) {
          await aiChatsApi.upsert(
            projectId.value,
            loadedMessages,
            toProposalStates(inferred, dismissed)
          );
        }
      } else {
        appliedProposals.value = applied;
      }

      dismissedProposals.value = dismissed;
    } catch {
      setMessages([]);
      appliedProposals.value = new Set();
      dismissedProposals.value = new Set();
      toast.error(t('SOMETHING_WENT_WRONG'));
    } finally {
      ready.value = true;
    }
  };

  const clearChat = async () => {
    if (!projectId.value) return;

    stop();

    try {
      await aiChatsApi.clear(projectId.value);
      setMessages([]);
      dismissedProposals.value = new Set();
      appliedProposals.value = new Set();
    } catch {
      toast.error(t('SOMETHING_WENT_WRONG'));
    }
  };

  const applyProposal = async (toolCallId: string, proposal: SchemaProposal) => {
    stop();

    currentProject.restoreSchema(proposal.proposedSchema);

    appliedProposals.value = new Set([...appliedProposals.value, toolCallId]);

    try {
      await persistChat();
    } catch {
      toast.error(t('SOMETHING_WENT_WRONG'));
    }
  };

  const discardProposal = async (toolCallId: string) => {
    dismissedProposals.value = new Set([...dismissedProposals.value, toolCallId]);

    try {
      await persistChat();
    } catch {
      toast.error(t('SOMETHING_WENT_WRONG'));
    }
  };

  const submitMessage = (event?: Event) => {
    event?.preventDefault();

    const value = input.value.trim();
    if (!value || isLoading.value || !projectId.value) return;

    append({ role: 'user', content: value });
    input.value = '';
  };

  watch(projectId, () => {
    stop();
    loadChat();
  });

  onMounted(() => {
    loadChat();
  });

  return {
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
  };
};
