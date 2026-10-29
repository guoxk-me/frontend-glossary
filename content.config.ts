import { defineCollection, defineContentConfig, z } from '@nuxt/content'
import { templateSchema } from './app/lib/template-schema'

// AI modified: content metadata is validated before it can enter the public glossary.
export default defineContentConfig({
  collections: {
    // AI modified: authored template metadata shares the existing offline content pipeline.
    templates: defineCollection({ type: 'data', source: 'templates/*.json', schema: templateSchema }),
    terms: defineCollection({
      type: 'page',
      source: 'terms/*.md',
      schema: z.object({
        slug: z.string(),
        english: z.string(),
        category: z.enum([
          'layout',
          'motion',
          'visual',
          'interaction',
        ]),
        aliases: z.array(z.string()),
        keywords: z.array(z.string()),
        demo: z.string(),
        order: z.number(),
        naming: z.string(),
        usage: z.string(),
        comparison: z.string(),
        target: z.string(),
        phrase: z.string(),
        en: z.object({
          description: z.string(),
          naming: z.string(),
          usage: z.string(),
          comparison: z.string(),
          target: z.string(),
          phrase: z.string(),
          explanation: z.string(),
        }),
        sources: z.array(z.object({
          title: z.string(),
          url: z.string(),
        })),
      }),
    }),
  },
})
