import type { z } from 'zod'
import type { styleAspectSchema, templateCopySchema, templateSchema, templateSelectionSchema } from '../lib/template-schema'

export type TemplateCopy = z.infer<typeof templateCopySchema>
export type TemplateEntry = z.infer<typeof templateSchema>
export type StyleAspect = z.infer<typeof styleAspectSchema>
export type TemplateSelection = z.infer<typeof templateSelectionSchema>
export interface RegionChoice {
  regionId: string
  isSelected: boolean
  aspects: StyleAspect[]
  adjustments: string
}
export type TemplateDecision = 'keep' | 'replace'
