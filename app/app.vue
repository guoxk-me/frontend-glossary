<script setup lang="ts">
import { onMounted } from 'vue'
import { NuxtPage, NuxtRouteAnnouncer, VitePwaManifest } from '#components'
import { createError, queryCollection, useAsyncData, useHead, useRoute, useSiteConfig } from '#imports'
import AppShell from './components/AppShell.vue'
import { useLibraryStore } from './stores/library'
// AI modified: preload one shared catalog so every route and local search can work offline.
const { data: terms, error } = await useAsyncData('glossary-terms', () => queryCollection('terms').order('order', 'ASC').all())
if (error.value)
  throw createError({ statusCode: 500, statusMessage: '词库加载失败，请重试' })
const library = useLibraryStore()
const route = useRoute()
const site = useSiteConfig()
// AI modified: point every public route to the same canonical domain, without query parameters.
useHead(() => ({
  link: [
    { rel: 'canonical', href: new URL(route.path, site.url).href },
  ],
}))
onMounted(() => library.hydrate(terms.value ?? []))
</script>

<template>
  <VitePwaManifest />
  <NuxtRouteAnnouncer />
  <AppShell>
    <NuxtPage />
  </AppShell>
</template>
