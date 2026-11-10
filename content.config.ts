import { defineCollection, defineContentConfig, z } from '@nuxt/content';
import { TUTORIAL_SECTIONS } from './lib/tutorial/constants';

export default defineContentConfig({
  collections: {
    tutorial: defineCollection({
      type: 'page',
      source: 'tutorial/*.md',
      schema: z.object({
        section: z.enum(TUTORIAL_SECTIONS),
        icon: z.string(),
      }),
    }),
  },
});
