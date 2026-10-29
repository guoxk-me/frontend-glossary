<script setup lang="ts">
import { useSeoMeta } from '#imports'
import TemplateCatalog from '../../components/templates/TemplateCatalog.vue'
import { useGlossaryLocale } from '../../composables/use-glossary-locale'

const { text } = useGlossaryLocale()
useSeoMeta({
  title: () => `Templates · ${text('前端词典')}`,
})
</script>

<template>
  <TemplateCatalog />
</template>
