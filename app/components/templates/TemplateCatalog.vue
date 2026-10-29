<script setup lang="ts">
import { computed } from 'vue'
import { Icon, NuxtLink } from '#components'
import { useGlossaryLocale } from '../../composables/use-glossary-locale'
import { useTemplates } from '../../composables/use-templates'
import { useLibraryStore } from '../../stores/library'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '../ui/empty'
import TemplatePreview from './TemplatePreview.vue'

const props = defineProps<{ favoritesOnly?: boolean }>()
const { text, isEnglish, localePath } = useGlossaryLocale()
const { templates } = useTemplates()
const library = useLibraryStore()
// AI modified: a small catalog needs no separate search or empty type filters.
const available = computed(() => templates.value.filter(template => !props.favoritesOnly || library.templateFavorites.includes(template.slug)))
</script>

<template>
  <section class="template-catalog">
    <header>
      <div class="eyebrow">
        TEMPLATES
      </div>
      <h1>{{ favoritesOnly ? text('收藏的模板') : text('完整页面，拆成你的灵感。') }}</h1>
      <p class="page-lead">
        {{ text('从整体参考出发，选取区域与样式，整理成自己的需求描述。') }}
      </p>
    </header>
    <div class="template-results-heading">
      <h2>{{ text('后台管理') }}</h2><span>{{ available.length }} {{ text('个模板') }}</span>
    </div>
    <article v-for="template in available" :key="template.slug" class="template-card">
      <NuxtLink :to="localePath(`/templates/${template.slug}`)" :aria-label="isEnglish ? template.english : template.title" class="template-card-preview">
        <TemplatePreview :src="template.pages[0]!.thumbnail" :title="isEnglish ? template.english : template.title" />
      </NuxtLink>
      <div class="template-card-copy">
        <div class="flex flex-wrap gap-2">
          <Badge variant="secondary">
            {{ text(template.origin === 'original' ? '原创' : '外部参考') }}
          </Badge><Badge variant="secondary">
            {{ text(template.kind === 'page' ? '页面模板' : '整站模板') }}
          </Badge>
        </div>
        <h2><NuxtLink :to="localePath(`/templates/${template.slug}`)">{{ isEnglish ? template.english : template.title }}</NuxtLink></h2>
        <p v-if="!isEnglish" class="text-xs text-muted-foreground">
          {{ template.english }}
        </p>
        <p class="text-sm leading-6 text-muted-foreground">
          {{ template.description[isEnglish ? 'en' : 'zh'] }}
        </p>
        <p class="text-xs text-muted-foreground">
          {{ text(template.pages.some(page => page.demo) ? '可交互预览' : '静态预览') }} · {{ template.pages.length }} {{ text('个页面') }}
        </p>
        <div class="flex flex-wrap gap-2">
          <Button as-child>
            <NuxtLink :to="localePath(`/templates/${template.slug}`)"><Icon name="lucide:arrow-right" />{{ text('查看模板与区域') }}</NuxtLink>
          </Button>
          <Button variant="outline" size="icon" :disabled="!library.isReady" :aria-label="text(library.templateFavorites.includes(template.slug) ? '取消收藏模板' : '收藏模板')" :aria-pressed="library.templateFavorites.includes(template.slug)" @click="library.toggleTemplateFavorite(template.slug)">
            <Icon :name="library.templateFavorites.includes(template.slug) ? 'lucide:bookmark-check' : 'lucide:bookmark'" />
          </Button>
        </div>
      </div>
    </article>
    <Empty v-if="!available.length" class="border min-h-64">
      <EmptyHeader><EmptyTitle>{{ text(favoritesOnly ? '还没有收藏模板' : '暂无模板') }}</EmptyTitle><EmptyDescription>{{ text('收藏喜欢的模板，下次可以在这里找到。') }}</EmptyDescription></EmptyHeader>
      <Button v-if="favoritesOnly" as-child variant="outline">
        <NuxtLink :to="localePath('/templates')">{{ text('浏览模板') }}</NuxtLink>
      </Button>
    </Empty>
  </section>
</template>

<style scoped>
.template-catalog { display: flex; flex-direction: column; gap: 24px; }
.template-results-heading { display: flex; justify-content: space-between; font-size: 13px; }
.template-results-heading span { color: var(--muted-foreground); }
.template-card { display: grid; grid-template-columns: minmax(0,1.45fr) minmax(280px,1fr); border: 1px solid var(--border); border-radius: 8px; overflow: hidden; }
.template-card-preview { display: flex; align-items: center; padding: 20px; background: var(--muted); min-width: 0; }
.template-card-copy { display: flex; flex-direction: column; align-items: start; gap: 16px; padding: 26px; }
.template-card-copy h2 { font-size: 21px; font-weight: 600; }
@media(max-width:1100px) { .template-card { grid-template-columns: 1fr; }.template-card-preview { padding: 16px; } }
@media(max-width:540px) { .template-card-copy { padding: 20px; } }
@media(max-width:540px) { .template-catalog :deep([data-slot="button"]) { min-height: 44px; } }
</style>
