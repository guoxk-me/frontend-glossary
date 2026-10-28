import type { Term } from '../types/glossary'
import { computed } from 'vue'
import { useI18n, useLocalePath } from '#imports'
import { interfaceText } from '../lib/interface-text'

export function useGlossaryLocale() {
  const { locale } = useI18n()
  const localePath = useLocalePath()
  const isEnglish = computed(() => locale.value === 'en')
  function text(source: string): string {
    return isEnglish.value
      ? interfaceText[source] ?? source
      : source
  }
  function termTitle(term: Term): string {
    return isEnglish.value ? term.english : term.title
  }
  function termText(term: Term, field: 'description' | 'usage' | 'comparison' | 'naming' | 'target'): string {
    return isEnglish.value
      ? term.en?.[field] ?? term[field]
      : term[field]
  }
  return {
    locale,
    isEnglish,
    text,
    termTitle,
    termText,
    localePath,
  }
}
