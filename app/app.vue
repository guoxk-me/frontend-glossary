<script setup lang="ts">
import { onMounted } from 'vue'
import { NuxtPage, NuxtRouteAnnouncer, VitePwaManifest } from '#components'
import { createError, navigateTo, queryCollection, useAsyncData, useHead, useRoute, useSiteConfig } from '#imports'
import AppShell from './components/AppShell.vue'
import { Toaster } from './components/ui/sonner'
import { TooltipProvider } from './components/ui/tooltip'
import { useGlossaryLocale } from './composables/use-glossary-locale'
import { useLibraryStore } from './stores/library'
// AI modified: preload one shared catalog so every route and local search can work offline.
const { data: terms, error } = await useAsyncData('glossary-terms', () => queryCollection('terms').order('order', 'ASC').all())
if (error.value)
  throw createError({ statusCode: 500, statusMessage: '词库加载失败，请重试' })
const library = useLibraryStore()
const route = useRoute()
const { isEnglish } = useGlossaryLocale()
const site = useSiteConfig()
// AI modified: point every public route to the same canonical domain, without query parameters.
useHead(() => ({
  htmlAttrs: {
    lang: isEnglish.value ? 'en' : 'zh-CN',
  },
  link: [
    { rel: 'canonical', href: new URL(route.path, site.url).href },
  ],
}))
onMounted(() => {
  library.hydrate(terms.value ?? [])
  try {
    if (route.path === '/' && !Object.keys(route.query).length && localStorage.getItem('frontend-glossary:locale') === 'en')
      void navigateTo('/en', { replace: true })
  }
  catch { /* Chinese is the first-visit fallback when storage is unavailable. */ }
})
</script>

<template>
  <VitePwaManifest />
  <NuxtRouteAnnouncer />
  <TooltipProvider>
    <AppShell>
      <NuxtPage />
    </AppShell>
  </TooltipProvider>
  <Toaster position="bottom-right" />
</template>
