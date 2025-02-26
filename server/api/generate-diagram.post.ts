import { generateDiagramObject } from '@/lib/ai';
import type { DatabaseType } from '@/lib/constants/diagram';

export default defineEventHandler(async (event) => {
  try {
    const { prompt, type } = await readBody<{
      prompt: string;
      type: DatabaseType | undefined;
    }>(event);

    return await generateDiagramObject(prompt, type);
  } catch (err) {
    return createError({
      statusCode: 400,
      statusMessage: (err as Error).message,
    });
  }
});
