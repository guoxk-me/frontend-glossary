<script setup lang="ts">
import { computed } from 'vue'
import { createError, useRoute } from '#imports'
import TemplateDetail from '../../components/templates/TemplateDetail.vue'
import { useTemplates } from '../../composables/use-templates'

const route = useRoute()
const { templates } = useTemplates()
const template = computed(() => templates.value.find(template => template.slug === route.params.slug))
if (!template.value)
  throw createError({ statusCode: 404, statusMessage: 'Template not found' })
</script>

<template>
  <TemplateDetail v-if="template" :key="template.slug" :template="template" />
</template>
