<script setup lang="ts">
import type { Term } from '../types/glossary'
import { Icon, NuxtLink } from '#components'
import { useGlossaryLocale } from '../composables/use-glossary-locale'
import { categories } from '../lib/glossary'
import { useLibraryStore } from '../stores/library'
import DemoStage from './DemoStage.vue'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'

defineProps<{ term: Term }>()
const { text, isEnglish, termTitle, termText, localePath } = useGlossaryLocale()
const library = useLibraryStore()
</script>

<template>
  <Card class="term-card gap-0 overflow-hidden py-0">
    <NuxtLink :to="localePath(`/terms/${term.slug}`)" :aria-label="`${text('查看')} ${termTitle(term)}`" class="preview-link">
      <DemoStage :term="term" compact />
    </NuxtLink>
    <CardContent class="term-card-content">
      <div class="card-title-row">
        <NuxtLink :to="localePath(`/terms/${term.slug}`)">
          <h2>{{ termTitle(term) }} <Icon name="lucide:arrow-up-right" :size="14" />
          </h2>
        </NuxtLink>
        <Button variant="ghost" size="icon-sm" :disabled="!library.isReady" :aria-label="`${text(library.favorites.includes(term.slug) ? '取消收藏' : '收藏')} ${termTitle(term)}`" :aria-pressed="library.favorites.includes(term.slug)" @click="library.toggleFavorite(term.slug)">
          <span :key="String(library.favorites.includes(term.slug))" class="bookmark-feedback" :class="{ 'is-saved': library.favorites.includes(term.slug) }"><Icon name="lucide:bookmark" :class="{ '[&_path]:fill-current': library.favorites.includes(term.slug) }" /></span>
        </Button>
      </div>
      <p v-if="!isEnglish" class="english-name">
        {{ term.english }}
      </p>
      <p class="card-description">
        {{ termText(term, 'description') }}
      </p>
      <Badge variant="secondary">
        {{ text(categories.find(category => category.id === term.category)?.label ?? '') }}
      </Badge>
    </CardContent>
  </Card>
</template>
