<script setup lang="ts">
import type { TermsCollectionItem } from '@nuxt/content'
import { ArrowLeft, Bookmark, Copy, ExternalLink } from '@lucide/vue'
import { computed, shallowRef } from 'vue'
import { ContentRenderer, NuxtLink } from '#components'
import { useSeoMeta } from '#imports'
import { useDelivery } from '../composables/use-delivery'
import { categories, defaultParameters, describeTerm, parameterProfile } from '../lib/glossary'
import { useLibraryStore } from '../stores/library'
import AddToSchemeDialog from './AddToSchemeDialog.vue'
import DemoStage from './DemoStage.vue'
import TermParameters from './TermParameters.vue'
import { Badge } from './ui/badge'
import { Button } from './ui/button'

const props = defineProps<{ term: TermsCollectionItem }>()
const parameters = shallowRef(defaultParameters())
const library = useLibraryStore()
const { message, copyText } = useDelivery()
const description = computed(() => describeTerm(props.term, parameters.value))
useSeoMeta({
  title: () => `${props.term.title} ${props.term.english} · 前端词典`,
  description: () => props.term.description,
})
</script>

<template>
  <div class="detail-layout">
    <article class="term-detail">
      <NuxtLink to="/" class="back-link">
        <ArrowLeft :size="13" />全部词条 <span>/ {{ categories.find(category => category.id === term.category)?.label }}</span>
      </NuxtLink>
      <header class="detail-heading">
        <div class="flex items-center gap-2 mb-3">
          <Badge variant="secondary">
            {{ categories.find(category => category.id === term.category)?.label }}
          </Badge>
          <span class="text-xs text-muted-foreground">{{ term.naming }}</span>
        </div>
        <h1>{{ term.title }}</h1>
        <p class="detail-english">
          {{ term.english }}
        </p>
        <p class="page-lead">
          {{ term.description }}
        </p>
        <div class="alias-list">
          <span>也叫</span>
          <span v-for="alias in term.aliases" :key="alias">{{ alias }}</span>
        </div>
        <div class="detail-actions">
          <AddToSchemeDialog :term="term" :parameters="parameters" />
          <Button variant="outline" :disabled="!library.isReady" :aria-pressed="library.favorites.includes(term.slug)" @click="library.toggleFavorite(term.slug)">
            <Bookmark :fill="library.favorites.includes(term.slug) ? 'currentColor' : 'none'" />{{ library.favorites.includes(term.slug) ? '已收藏' : '收藏词条' }}
          </Button>
        </div>
      </header>
      <section id="preview">
        <h2 class="section-heading">
          效果预览 <span>先看，再试一试</span>
        </h2>
        <DemoStage :term="term" :parameters="parameters" />
        <div v-if="parameterProfile(term) !== 'none'" class="detail-parameters">
          <TermParameters :term="term" :parameters="parameters" @change="parameters = $event" />
        </div>
        <p class="demo-note">
          演示用于理解模式。具体样式和尺寸可按项目需要调整。
        </p>
      </section>
      <section id="understand" class="prose-section">
        <h2>这是什么</h2>
        <ContentRenderer :value="term" />
        <div class="knowledge-grid">
          <div>
            <h3>什么时候用</h3>
            <p>{{ term.usage }}</p>
          </div>
          <div>
            <h3>容易混淆</h3>
            <p>{{ term.comparison }}</p>
          </div>
        </div>
      </section>
      <section id="describe" class="description-section">
        <div class="section-heading">
          <h2>可以这样描述</h2>
          <Button variant="ghost" size="sm" @click="copyText(description)">
            <Copy />复制描述
          </Button>
        </div>
        <p class="generated-description">
          {{ description }}
        </p>
        <div class="description-foot">
          <span>随上方参数同步生成 · 可加入方案后编辑</span>
          <span role="status">{{ message }}</span>
        </div>
      </section>
      <section id="sources" class="prose-section">
        <h2>参考资料</h2>
        <a v-for="source in term.sources" :key="source.url" :href="source.url" target="_blank" rel="noopener noreferrer" class="source-link">{{ source.title }}<ExternalLink :size="13" />
        </a>
        <p class="text-xs text-muted-foreground mt-4">
          释义为编辑整理；“常用说法 / 描述性命名”不代表标准规范名称。
        </p>
      </section>
    </article>
    <aside class="page-toc">
      <p>本页内容</p>
      <a href="#preview">效果预览</a>
      <a href="#understand">这是什么</a>
      <a href="#describe">可以这样描述</a>
      <a href="#sources">参考资料</a>
      <div class="toc-note">
        不必记住每个名词。<br>找到想要的，<br>说清楚就好。
      </div>
    </aside>
  </div>
</template>
