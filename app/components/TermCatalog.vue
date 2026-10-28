<script setup lang="ts">
import { useEventListener } from '@vueuse/core'
import { computed, shallowRef, useTemplateRef } from 'vue'
import { Icon, NuxtLink } from '#components'
import { useCatalog } from '../composables/use-catalog'
import { categories, searchTerms } from '../lib/glossary'
import { useLibraryStore } from '../stores/library'
import TermCard from './TermCard.vue'
import { Button } from './ui/button'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from './ui/empty'
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group'

const props = defineProps<{ favoritesOnly?: boolean }>()
const { terms } = useCatalog()
const library = useLibraryStore()
const query = shallowRef('')
const category = shallowRef('all')
const search = useTemplateRef<HTMLInputElement>('search')
const shown = computed(() => searchTerms(props.favoritesOnly
  ? terms.value.filter(term => library.favorites.includes(term.slug))
  : terms.value, query.value, category.value || 'all'))
useEventListener('keydown', (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
    event.preventDefault()
    search.value?.focus()
  }
})
</script>

<template>
  <div class="catalog-page">
    <div class="eyebrow">
      <span class="small-dot" /> 为你的想法，找到准确的表达
    </div>
    <h1>{{ favoritesOnly ? '我的收藏' : '看见效果，找到名字。' }}</h1>
    <p class="page-lead">
      {{ favoritesOnly ? '随手收藏的灵感，下次不用重新找。收藏仅保存在当前浏览器。' : '不用先知道术语。从布局、动效到交互，找到你想要的效果，把脑海里的画面，变成清楚的需求。' }}
    </p>
    <div v-if="!favoritesOnly" class="intro-actions">
      <Button as-child>
        <a href="#term-search">开始找词 <Icon name="lucide:arrow-up-right" />
        </a>
      </Button>
      <NuxtLink to="/schemes">或者，组合一个方案 <span>→</span>
      </NuxtLink>
    </div>
    <div class="catalog-search">
      <Icon name="lucide:search" :size="18" />
      <input id="term-search" ref="search" v-model="query" type="search" aria-label="搜索词条" placeholder="试试「左侧导航」「淡入」「卡片排列」…" autocomplete="off">
      <kbd>⌘ / Ctrl K</kbd>
    </div>
    <div class="search-suggestions">
      <span>不知道名字？</span>
      <button v-for="suggestion in ['左侧导航', '依次出现', '毛玻璃', '右侧详情']" :key="suggestion" @click="query = suggestion; category = 'all'">
        {{ suggestion }}
      </button>
    </div>
    <div class="catalog-filter">
      <ToggleGroup :model-value="category" type="single" variant="outline" :spacing="1" aria-label="词条分类" @update:model-value="category = String($event || 'all')">
        <ToggleGroupItem value="all">
          全部 <span>{{ terms.length }}</span>
        </ToggleGroupItem>
        <ToggleGroupItem v-for="group in categories" :key="group.id" :value="group.id">
          {{ group.label }}
        </ToggleGroupItem>
      </ToggleGroup>
      <span class="results-count" aria-live="polite">{{ shown.length }} 个词条</span>
    </div>
    <div v-if="shown.length" class="term-grid">
      <TermCard v-for="term in shown" :key="term.slug" :term="term" />
    </div>
    <Empty v-else class="border min-h-64">
      <EmptyHeader>
        <Icon name="lucide:book-open" class="mx-auto text-muted-foreground" />
        <EmptyTitle>{{ favoritesOnly && !query ? '还没有收藏词条' : '暂时没有找到匹配的词条' }}</EmptyTitle>
        <EmptyDescription>试试更短的描述，例如“侧栏”“淡入”；也可以从分类里看效果。</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline" @click="query = ''; category = 'all'">
          清除筛选
        </Button>
        <NuxtLink v-if="favoritesOnly" to="/">浏览全部词条 →</NuxtLink>
      </EmptyContent>
    </Empty>
  </div>
</template>
