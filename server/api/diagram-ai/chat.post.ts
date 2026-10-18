import { streamText } from 'ai';
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server';
import { canEditProject, getAccessibleProject } from '@/lib/server/project-access';
import { createDiagramAiTools } from '@/lib/ai/tools';
import { getChatSystemPrompt } from '@/lib/ai/prompts';
import { formatAiStreamError } from '@/lib/ai/format-error';
import { groq, CHAT_MODEL } from '@/lib/ai/groq';

import type { Message } from '@ai-sdk/ui-utils';
import type { Database } from '@/types/database';
import type { DatabaseType } from '@/lib/constants/diagram';
import type { DiagramConfig } from '@/types/diagram';

type ChatRequestBody = {
  messages: Message[];
  projectId: number;
  databaseType: DatabaseType | undefined;
  currentSchema: DiagramConfig;
};

export default defineEventHandler(async (event) => {
  try {
    const user = await serverSupabaseUser(event);

    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized: sign in to use AI chat.',
      });
    }

    const body = await readBody<ChatRequestBody>(event);
    const { messages, projectId, databaseType, currentSchema } = body;

    if (!projectId || !messages?.length) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid request: projectId and at least one message are required.',
      });
    }

    const supabase = await serverSupabaseClient<Database>(event);
    const project = await getAccessibleProject(supabase, user, projectId);

    if (!project) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Project not found or you do not have access to it.',
      });
    }

    const editable = await canEditProject(supabase, user, project);

    if (!editable) {
      throw createError({
        statusCode: 403,
        statusMessage: 'You do not have permission to edit this diagram.',
      });
    }

    const schema = currentSchema ?? project.schema;
    const resolvedDatabaseType = (databaseType ?? project.type) as DatabaseType;

    const getMessageText = (message: Message) => {
      if (message.parts?.length) {
        const text = message.parts
          .filter((part) => part.type === 'text')
          .map((part) => part.text)
          .join('');

        if (text.trim()) return text.trim();
      }

      return typeof message.content === 'string' ? message.content.trim() : '';
    };

    const lastUserMessage = [...messages].reverse().find((message) => message.role === 'user');
    const userRequest = lastUserMessage ? getMessageText(lastUserMessage) || undefined : undefined;

    const result = streamText({
      model: groq(CHAT_MODEL),
      system: getChatSystemPrompt(resolvedDatabaseType),
      messages,
      tools: createDiagramAiTools({
        currentSchema: schema,
        databaseType: resolvedDatabaseType,
        userRequest,
      }),
      maxSteps: 5,
    });

    return result.toDataStreamResponse({
      getErrorMessage: formatAiStreamError,
    });
  } catch (error) {
    const statusCode =
      typeof error === 'object' &&
      error !== null &&
      'statusCode' in error &&
      typeof error.statusCode === 'number'
        ? error.statusCode
        : 500;

    throw createError({
      statusCode,
      statusMessage: formatAiStreamError(error),
    });
  }
});
