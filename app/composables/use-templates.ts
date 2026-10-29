import type { TemplateEntry } from '../types/template'
import { computed } from 'vue'
import { useNuxtData } from '#imports'

// AI modified: reuse the preloaded catalog for SSR, search and offline navigation.
export function useTemplates() {
  const { data: templates } = useNuxtData<TemplateEntry[]>('glossary-templates')
  return {
    templates: computed(() => templates.value ?? []),
  }
}
