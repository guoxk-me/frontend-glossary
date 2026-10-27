import type { LibraryBackup, Term } from '../types/glossary'
import { z } from 'zod'

export const storageKey = 'frontend-glossary:library:v1'
const parametersSchema = z.object({
  duration: z.number().int().min(80).max(1600),
  direction: z.enum(['left', 'right']),
  easing: z.enum(['ease-out', 'ease-in-out', 'linear']),
  width: z.number().int().min(180).max(300),
  collapsed: z.boolean(),
}).strict()
const schemeSchema = z.object({
  id: z.string().min(1).max(100),
  title: z.string().trim().min(1).max(80),
  choices: z.array(z.object({
    id: z.string().min(1).max(100),
    termSlug: z.string(),
    target: z.string().trim().min(1).max(60),
    parameters: parametersSchema,
  }).strict()).max(100),
  description: z.string().max(100000),
  hasManualEdits: z.boolean(),
  isStale: z.boolean(),
  updatedAt: z.iso.datetime(),
}).strict()
const backupSchema = z.object({
  version: z.literal(1),
  favorites: z.array(z.string()).max(500),
  schemes: z.array(schemeSchema).max(100),
}).strict()

// AI modified: validate the complete backup before changing any existing local records.
export function readBackup(text: string, terms: Term[]): LibraryBackup {
  if (text.length > 5_000_000)
    throw new Error('备份超过 5MB，请检查文件。')
  let content: unknown
  try {
    content = JSON.parse(text)
  }
  catch { throw new Error('无法读取 JSON 备份，现有内容未修改。') }
  const backup = backupSchema.safeParse(content)
  if (!backup.success)
    throw new Error('备份结构或版本不受支持，现有内容未修改。')
  const slugs = new Set(terms.map(term => term.slug))
  const ids = new Set<string>()
  for (const scheme of backup.data.schemes) {
    if (ids.has(scheme.id))
      throw new Error('备份包含重复方案编号。')
    ids.add(scheme.id)
    const choiceIds = new Set<string>()
    for (const choice of scheme.choices) {
      if (!slugs.has(choice.termSlug))
        throw new Error('备份包含当前词库没有的词条。')
      if (choiceIds.has(choice.id))
        throw new Error('备份包含重复选择编号。')
      choiceIds.add(choice.id)
    }
  }
  if (backup.data.favorites.some(slug => !slugs.has(slug)))
    throw new Error('收藏包含当前词库没有的词条。')
  return backup.data
}
