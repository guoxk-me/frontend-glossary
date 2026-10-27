import type { TermsCollectionItem } from '@nuxt/content'
import { computed } from 'vue'
import { useNuxtData } from '#imports'

export function useCatalog() {
  const { data: catalog } = useNuxtData<TermsCollectionItem[]>('glossary-terms')
  return {
    terms: computed(() => catalog.value ?? []),
  }
}
