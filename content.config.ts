import { defineCollection, defineContentConfig, z } from '@nuxt/content';
import { TUTORIAL_SECTIONS } from './lib/tutorial/constants';

const tutorialSchema = z.object({
  section: z.enum(TUTORIAL_SECTIONS),
  icon: z.string(),
});

export default defineContentConfig({
  collections: {
    tutorial: defineCollection({
      type: 'page',
      source: 'tutorial/*.md',
      schema: tutorialSchema,
    }),
    tutorial_uk: defineCollection({
      type: 'page',
      source: {
        include: 'tutorial/uk/*.md',
        prefix: '/tutorial',
      },
      schema: tutorialSchema,
    }),
  },
});
