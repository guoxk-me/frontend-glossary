<script setup lang="ts">
import { computed } from 'vue'
import { createError, useRoute } from '#imports'
import TermDetail from '../../components/TermDetail.vue'
import { useCatalog } from '../../composables/use-catalog'

const route = useRoute()
const { terms } = useCatalog()
const term = computed(() => terms.value.find(term => term.slug === route.params.slug))
if (!term.value)
  throw createError({ statusCode: 404, statusMessage: '没有找到这个词条' })
</script>

<template>
  <TermDetail v-if="term" :key="term.slug" :term="term" />
</template>
