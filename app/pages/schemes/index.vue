<script setup lang="ts">
import { useSeoMeta } from '#imports'
import SchemeList from '../../components/SchemeList.vue'
import { useGlossaryLocale } from '../../composables/use-glossary-locale'

const { text } = useGlossaryLocale()
useSeoMeta({
  title: () => `${text('我的方案')} · ${text('前端词典')}`,
})
</script>

<template>
  <SchemeList />
</template>
