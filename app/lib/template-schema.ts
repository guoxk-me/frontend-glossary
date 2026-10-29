import { z } from 'zod'

// AI modified: validate authored templates and saved visual requirements at their boundaries.
export const templateCopySchema = z.object({
  zh: z.string().max(4000),
  en: z.string().max(4000),
}).strict()
export const styleAspectSchema = z.enum([
  'layout',
  'palette',
  'typography',
  'decoration',
  'states',
])
const featureSchema = z.object({ aspect: styleAspectSchema, description: templateCopySchema }).strict()
const sourceSchema = z.object({
  title: z.string().max(200),
  url: z.string().max(2000).refine(url => (url.startsWith('/') && !url.startsWith('//')) || /^https?:\/\//u.test(url)),
}).strict()
const regionSchema = z.object({
  id: z.string().min(1).max(80),
  title: templateCopySchema,
  relation: templateCopySchema,
  relatedRegionIds: z.array(z.string()).max(30),
  features: z.array(featureSchema).max(5),
  termSlugs: z.array(z.string()).max(20),
}).strict()
export const templateSchema = z.object({
  slug: z.string().min(1),
  title: z.string(),
  english: z.string(),
  description: templateCopySchema,
  kind: z.enum(['page', 'website']),
  scene: z.literal('admin'),
  origin: z.enum(['original', 'reference']),
  source: sourceSchema,
  keywords: z.array(z.string()),
  pages: z.array(z.object({
    id: z.string(),
    title: templateCopySchema,
    thumbnail: z.string().startsWith('/'),
    preview: z.string().startsWith('/'),
    demo: z.literal('customer-management').optional(),
    regions: z.array(regionSchema).min(1),
  }).strict()).min(1),
})
export const templateSelectionSchema = z.object({
  id: z.string().min(1).max(100),
  templateSlug: z.string().max(100),
  pageId: z.string().max(100),
  title: templateCopySchema,
  pageTitle: templateCopySchema,
  source: sourceSchema,
  regions: z.array(regionSchema.omit({ relatedRegionIds: true, termSlugs: true }).extend({
    adjustments: z.string().max(2000),
  }).strict()).min(1).max(30),
  excludedRegions: z.array(templateCopySchema).max(30),
}).strict()
