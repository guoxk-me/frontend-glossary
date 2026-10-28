<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { Icon, NuxtLink } from '#components'
import { useRoute, useRouter, useState } from '#imports'
import { useCatalog } from '../composables/use-catalog'
import { useGlossaryLocale } from '../composables/use-glossary-locale'
import { categories, searchTerms } from '../lib/glossary'
import { releaseLeavingRow, retainLeavingRow } from '../lib/list-motion'
import { useLibraryStore } from '../stores/library'
import TermCard from './TermCard.vue'
import { Button } from './ui/button'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from './ui/empty'
import { InputGroup, InputGroupAddon, InputGroupInput } from './ui/input-group'
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group'

const props = defineProps<{ favoritesOnly?: boolean }>()

const { text, localePath } = useGlossaryLocale()

const { terms } = useCatalog()
const library = useLibraryStore()
const route = useRoute()
const router = useRouter()
const lastCatalog = useState('last-catalog-location', () => '/')
const scrollPositions = useState<Record<string, number>>('catalog-scroll-positions', () => ({}))
function updateFilter(name: 'q' | 'category', entry: string): void {
  // AI modified: shareable query parameters are the source of truth; scroll is session-only.
  void router.replace({
    query: {
      ...route.query,
      [name]: entry && entry !== 'all'
        ? entry
        : undefined,
    },
  })
}
const query = computed({
  get: () => typeof route.query.q === 'string'
    ? route.query.q
    : '',
  set: entry => updateFilter('q', entry),
})
const category = computed({
  get: () => categories.some(group => group.id === route.query.category)
    ? String(route.query.category)
    : 'all',
  set: entry => updateFilter('category', entry),
})
const shown = computed(() => searchTerms(props.favoritesOnly
  ? terms.value.filter(term => library.favorites.includes(term.slug))
  : terms.value, query.value, category.value))
function clearFilters(): void {
  void router.replace({ query: {} })
}
onBeforeRouteLeave(() => {
  lastCatalog.value = route.fullPath
  scrollPositions.value[route.fullPath] = window.scrollY
})
onMounted(() => {
  const position = scrollPositions.value[route.fullPath] ?? 0
  requestAnimationFrame(() => window.scrollTo({ top: position, behavior: 'instant' }))
})
</script>

<template>
  <div class="catalog-page">
    <h1>{{ text(favoritesOnly ? '我的收藏' : '看见效果，找到名字。') }}</h1>
    <p class="page-lead">
      {{ text(favoritesOnly ? '随手收藏的灵感，下次不用重新找。收藏仅保存在当前浏览器。' : '从布局、动效与交互中找到名字，把想法变成清楚的需求。') }}
    </p>
    <InputGroup class="catalog-search">
      <InputGroupAddon><Icon name="lucide:search" /></InputGroupAddon>
      <InputGroupInput id="term-search" v-model="query" type="search" :aria-label="text('搜索词条')" :placeholder="text('搜索名称，或试试「左边菜单不动，右边滚动」')" autocomplete="off" />
    </InputGroup>
    <div class="catalog-filter">
      <ToggleGroup :model-value="category" type="single" variant="outline" :spacing="1" :aria-label="text('词条分类')" @update:model-value="category = String($event || 'all')">
        <ToggleGroupItem value="all">
          {{ text('全部') }} <span>{{ terms.length }}</span>
        </ToggleGroupItem>
        <ToggleGroupItem v-for="group in categories" :key="group.id" :value="group.id">
          {{ text(group.label) }} <span>{{ terms.filter(term => term.category === group.id).length }}</span>
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
    <div class="catalog-results-heading">
      <h2>{{ text('先从这些常见效果开始') }}</h2><span aria-live="polite">{{ shown.length }} {{ text('个词条') }}</span>
    </div>
    <TransitionGroup name="list" tag="div" class="term-grid motion-list" @before-leave="retainLeavingRow" @after-leave="releaseLeavingRow" @before-enter="releaseLeavingRow">
      <TermCard v-for="term in shown" :key="term.slug" :term="term" />
      <Empty v-if="!shown.length" key="empty" class="border min-h-64 col-span-full">
        <EmptyHeader><Icon name="lucide:book-open" class="mx-auto text-muted-foreground" /><EmptyTitle>{{ text(favoritesOnly && !query ? '还没有收藏词条' : '暂时没有找到匹配的词条') }}</EmptyTitle><EmptyDescription>{{ text('试试更短的描述，例如“侧栏”“淡入”；也可以从分类里看效果。') }}</EmptyDescription></EmptyHeader>
        <EmptyContent>
          <Button variant="outline" @click="clearFilters">
            {{ text('清除筛选') }}
          </Button><NuxtLink v-if="favoritesOnly" :to="localePath('/')">{{ text('全部词条') }}</NuxtLink>
        </EmptyContent>
      </Empty>
    </TransitionGroup>
  </div>
</template>
