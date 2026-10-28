<script setup lang="ts">
import type { Term } from '../types/glossary'
import { Icon, NuxtLink } from '#components'
import { categories } from '../lib/glossary'
import { useLibraryStore } from '../stores/library'
import DemoStage from './DemoStage.vue'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'

defineProps<{ term: Term }>()
const library = useLibraryStore()
</script>

<template>
  <Card class="term-card gap-0 overflow-hidden py-0">
    <NuxtLink :to="`/terms/${term.slug}`" :aria-label="`查看${term.title}`" class="preview-link">
      <DemoStage :term="term" compact />
    </NuxtLink>
    <CardContent class="term-card-content">
      <div class="card-title-row">
        <NuxtLink :to="`/terms/${term.slug}`">
          <h2>{{ term.title }} <Icon name="lucide:arrow-up-right" :size="14" />
          </h2>
        </NuxtLink>
        <Button variant="ghost" size="icon-sm" :disabled="!library.isReady" :aria-label="`${library.favorites.includes(term.slug) ? '取消收藏' : '收藏'}${term.title}`" :aria-pressed="library.favorites.includes(term.slug)" @click="library.toggleFavorite(term.slug)">
          <Icon name="lucide:bookmark" :class="{ '[&_path]:fill-current': library.favorites.includes(term.slug) }" />
        </Button>
      </div>
      <p class="english-name">
        {{ term.english }}
      </p>
      <p class="card-description">
        {{ term.description }}
      </p>
      <Badge variant="secondary">
        {{ categories.find(category => category.id === term.category)?.label }}
      </Badge>
    </CardContent>
  </Card>
</template>
