<script setup lang="ts">
import { onMounted } from 'vue'
import { NuxtPage, NuxtRouteAnnouncer, VitePwaManifest } from '#components'
import { createError, queryCollection, useAsyncData } from '#imports'
import AppShell from './components/AppShell.vue'
import { useLibraryStore } from './stores/library'
// AI modified: preload one shared catalog so every route and local search can work offline.
const { data: terms, error } = await useAsyncData('glossary-terms', () => queryCollection('terms').order('order', 'ASC').all())
if (error.value)
  throw createError({ statusCode: 500, statusMessage: '词库加载失败，请重试' })
const library = useLibraryStore()
onMounted(() => library.hydrate(terms.value ?? []))
</script>

<template>
  <VitePwaManifest />
  <NuxtRouteAnnouncer />
  <AppShell>
    <NuxtPage />
  </AppShell>
</template>
