import {
  APICallError,
  InvalidToolArgumentsError,
  NoObjectGeneratedError,
  ToolExecutionError,
} from 'ai';
import { ZodError } from 'zod';

const formatZodError = (error: ZodError) => {
  const issues = error.issues.map((issue) => {
    const path = issue.path.length ? issue.path.join('.') : 'schema';

    return `- \`${path}\`: ${issue.message}`;
  });

  return `Schema validation failed:\n\n${issues.join('\n')}`;
};

export const formatAiStreamError = (error: unknown): string => {
  if (error instanceof ZodError) {
    return formatZodError(error);
  }

  if (ToolExecutionError.isInstance(error)) {
    const cause =
      error.cause instanceof ZodError
        ? formatZodError(error.cause)
        : error.cause instanceof Error
          ? error.cause.message
          : error.cause
            ? String(error.cause)
            : error.message;

    return `Tool **${error.toolName}** failed:\n\n${cause}`;
  }

  if (NoObjectGeneratedError.isInstance(error)) {
    return `Failed to generate schema JSON:\n\n${error.message}`;
  }

  if (InvalidToolArgumentsError.isInstance(error)) {
    return `Invalid arguments for tool **${error.toolName}**:\n\n${error.message}`;
  }

  if (APICallError.isInstance(error)) {
    const status = error.statusCode ? ` (HTTP ${error.statusCode})` : '';

    return `AI provider error${status}:\n\n${error.message}`;
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return 'Unknown error occurred while processing the request.';
};

export const parseApiErrorBody = (body: string) => {
  const trimmed = body.trim();

  if (!trimmed) return null;

  try {
    const parsed = JSON.parse(trimmed) as {
      statusMessage?: string;
      message?: string;
      data?: { message?: string; reason?: string };
    };

    if (parsed.data?.message) return parsed.data.message;
    if (parsed.data?.reason) return parsed.data.reason;
    if (parsed.statusMessage) return parsed.statusMessage;
    if (parsed.message) return parsed.message;
  } catch {
    // Response body is plain text.
  }

  return trimmed;
};
