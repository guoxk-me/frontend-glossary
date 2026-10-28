<script setup lang="ts">
import { definePageMeta, useSeoMeta } from '#imports'
import TermCatalog from '../components/TermCatalog.vue'
import { useGlossaryLocale } from '../composables/use-glossary-locale'

const { text } = useGlossaryLocale()
useSeoMeta({
  title: () => `${text('看见效果，找到名字。')} · ${text('前端词典')}`,
})
// AI modified: the catalog restores its own saved position after rendering.
definePageMeta({ scrollToTop: false })
</script>

<template>
  <TermCatalog />
</template>
