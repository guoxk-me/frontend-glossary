<script setup lang="ts">
import { computed } from 'vue'
import { definePageMeta, useRoute, useRouter, useSeoMeta } from '#imports'
import TemplateCatalog from '../components/templates/TemplateCatalog.vue'
import TermCatalog from '../components/TermCatalog.vue'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { useGlossaryLocale } from '../composables/use-glossary-locale'

const { text } = useGlossaryLocale()
const route = useRoute()
const router = useRouter()
// AI modified: separate template favorites without changing term favorite identities.
const favoriteType = computed(() => route.query.view === 'templates'
  ? 'templates'
  : 'terms')
function changeFavoriteType(view: unknown): void {
  if (view === 'templates' || view === 'terms') {
    void router.replace({
      query: {
        ...route.query,
        view: view === 'templates'
          ? view
          : undefined,
      },
    })
  }
}
useSeoMeta({
  title: () => `${text('我的收藏')} · ${text('前端词典')}`,
})
// AI modified: the catalog restores its own saved position after rendering.
definePageMeta({ scrollToTop: false })
</script>

<template>
  <Tabs :model-value="favoriteType" @update:model-value="changeFavoriteType">
    <TabsList class="mb-6">
      <TabsTrigger value="terms">
        {{ text('词条') }}
      </TabsTrigger><TabsTrigger value="templates">
        Templates
      </TabsTrigger>
    </TabsList>
    <TabsContent value="terms">
      <TermCatalog favorites-only />
    </TabsContent>
    <TabsContent value="templates">
      <TemplateCatalog favorites-only />
    </TabsContent>
  </Tabs>
</template>
