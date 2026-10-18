import { createGroq } from '@ai-sdk/groq';

export const CHAT_MODEL = 'openai/gpt-oss-120b';

/** JSON schema generation: smaller gpt-oss model, separate TPM budget, low reasoning. */
export const SCHEMA_MODEL = 'openai/gpt-oss-20b';

export const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
  fetch: async (input, init) => {
    if (!init?.body || typeof init.body !== 'string') {
      return fetch(input, init);
    }

    try {
      const body = JSON.parse(init.body) as {
        model?: string;
        response_format?: { type?: string };
        reasoning_effort?: string;
      };

      if (
        body.model === SCHEMA_MODEL &&
        body.response_format?.type === 'json_object' &&
        !body.reasoning_effort
      ) {
        return fetch(input, {
          ...init,
          body: JSON.stringify({ ...body, reasoning_effort: 'low' }),
        });
      }
    } catch {
      // Use the original request when the body is not JSON.
    }

    return fetch(input, init);
  },
});
