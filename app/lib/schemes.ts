import type { Scheme, SchemeChoice, Term } from '../types/glossary'
import { describeTerm } from './glossary'

export function describeScheme(scheme: Scheme, terms: Term[]): string {
  return [
    `# ${scheme.title}`,
    ...scheme.choices.map((choice) => {
      const term = terms.find(term => term.slug === choice.termSlug)
      return `## ${choice.target}\n${term
        ? describeTerm(term, choice.parameters)
        : '词条已不可用，请重新选择。'}`
    }),
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
export function findConflict(scheme: Scheme, incoming: SchemeChoice, terms: Term[]): SchemeChoice | undefined {
  const term = terms.find(term => term.slug === incoming.termSlug)
  return scheme.choices.find((choice) => {
    if (choice.id === incoming.id || choice.target.trim() !== incoming.target.trim())
      return false
    const existing = terms.find(term => term.slug === choice.termSlug)
    return existing?.category === term?.category
  })
}
