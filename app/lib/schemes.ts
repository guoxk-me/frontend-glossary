import type { Locale, Scheme, SchemeChoice, Term } from '../types/glossary'
import { describeTerm } from './glossary'
import { describeTemplate } from './templates'

export function describeScheme(scheme: Scheme, terms: Term[], locale: Locale = scheme.outputLocale): string {
  return [
    `# ${scheme.title}`,
    ...scheme.choices.map((choice) => {
      const term = terms.find(term => term.slug === choice.termSlug)
      return `## ${choice.target}\n${term
        ? describeTerm(term, choice.parameters, locale)
        : locale === 'en'
          ? 'This term is unavailable. Please select another.'
          : '词条已不可用，请重新选择。'}`
    }),
    // AI modified: saved template snapshots participate in regeneration and language previews.
    ...(scheme.templateSelections ?? []).map(selection => describeTemplate(selection, locale)),
  ].join('\n\n')
}
export function refreshDescription(scheme: Scheme, terms: Term[]): void {
  // AI modified: parameter changes must never silently replace hand-written requirements.
  if (scheme.hasManualEdits)
    scheme.isStale = true
  else scheme.description = describeScheme(scheme, terms)
  scheme.updatedAt = new Date().toISOString()
}
export function regenerateDescription(scheme: Scheme, terms: Term[], hasConfirmed: boolean): boolean {
  if (scheme.hasManualEdits && !hasConfirmed)
    return false
  scheme.description = describeScheme(scheme, terms)
  scheme.hasManualEdits = false
  scheme.isStale = false
  scheme.updatedAt = new Date().toISOString()
  return true
}
export function findConflict(scheme: Scheme, incoming: SchemeChoice): SchemeChoice | undefined {
  return scheme.choices.find((choice) => {
    if (choice.id === incoming.id || choice.target.trim() !== incoming.target.trim())
      return false
    // AI modified: categories describe discovery, not mutually exclusive styles.
    return choice.termSlug === incoming.termSlug
  })
}

// AI modified: only an explicit confirmation commits a language candidate and discards manual edits.
export function changeOutputLocale(scheme: Scheme, terms: Term[], locale: Locale, hasConfirmed: boolean): boolean {
  if (!hasConfirmed || locale === scheme.outputLocale)
    return false
  scheme.description = describeScheme(scheme, terms, locale)
  scheme.outputLocale = locale
  scheme.hasManualEdits = false
  scheme.isStale = false
  scheme.updatedAt = new Date().toISOString()
  return true
}
