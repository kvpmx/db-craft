import { generateSchemaFromPrompt } from '@/lib/ai/schema-proposal';

import type { DatabaseType } from '@/lib/constants/diagram';

export const generateDiagramObject = async (prompt: string, type: DatabaseType | undefined) => {
  return generateSchemaFromPrompt(prompt, type);
};
