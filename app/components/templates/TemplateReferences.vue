<script setup lang="ts">
import type { Scheme } from '../../types/glossary'
import { Icon, NuxtLink } from '#components'
import { useCatalog } from '../../composables/use-catalog'
import { useGlossaryLocale } from '../../composables/use-glossary-locale'
import { useLibraryStore } from '../../stores/library'
import { Button } from '../ui/button'

defineProps<{ scheme: Scheme }>()
const { text, isEnglish, localePath } = useGlossaryLocale()
const { terms } = useCatalog()
const library = useLibraryStore()
</script>

<template>
  <section v-if="scheme.templateSelections?.length" class="template-references">
    <h2>{{ text('模板参考') }} · {{ scheme.templateSelections.length }}</h2>
    <article v-for="selection in scheme.templateSelections" :key="selection.id" class="saved-template">
      <header>
        <div><h3>{{ selection.title[isEnglish ? 'en' : 'zh'] }}</h3><p>{{ selection.source.title }} · {{ selection.pageTitle[isEnglish ? 'en' : 'zh'] }}</p></div><Button variant="ghost" size="icon" :aria-label="text('移除模板参考')" @click="library.removeTemplate(scheme, selection.id, terms)">
          <Icon name="lucide:trash-2" />
        </Button>
      </header>
      <ul>
        <li v-for="region in selection.regions" :key="region.id">
          {{ region.title[isEnglish ? 'en' : 'zh'] }}<p v-if="region.adjustments">
            {{ region.adjustments }}
          </p>
        </li>
      </ul>
      <Button as-child variant="outline" size="sm">
        <NuxtLink :to="{ path: localePath(`/templates/${selection.templateSlug}`), query: { page: selection.pageId, schemeId: scheme.id, selectionId: selection.id } }"><Icon name="lucide:sliders-horizontal" />{{ text('调整选择') }}</NuxtLink>
      </Button>
    </article>
  </section>
</template>

<style scoped>
.template-references { display: flex; flex-direction: column; gap: 16px; margin-bottom: 30px; }
.template-references h2 { font-size: 18px; font-weight: 600; }
.saved-template { border: 1px solid var(--border); border-radius: 8px; padding: 18px; }
.saved-template header { display: flex; align-items: start; justify-content: space-between; gap: 10px; }
.saved-template h3 { font-size: 15px; font-weight: 600; }
.saved-template p { font-size: 12px; color: var(--muted-foreground); line-height: 1.7; margin-top: 4px; overflow-wrap: anywhere; }
.saved-template ul { display: flex; flex-direction: column; gap: 10px; font-size: 13px; margin: 18px 0; }
</style>
