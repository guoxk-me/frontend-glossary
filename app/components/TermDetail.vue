<script setup lang="ts">
import type { TermsCollectionItem } from '@nuxt/content'
import { computed, shallowRef } from 'vue'
import { ContentRenderer, Icon, NuxtLink } from '#components'
import { useSeoMeta, useState } from '#imports'
import { useDelivery } from '../composables/use-delivery'
import { useGlossaryLocale } from '../composables/use-glossary-locale'
import { categories, defaultParameters, describeTerm, parameterProfile } from '../lib/glossary'
import { useLibraryStore } from '../stores/library'
import AddToSchemeDialog from './AddToSchemeDialog.vue'
import CollapsePanel from './CollapsePanel.vue'
import DemoStage from './DemoStage.vue'
import TermParameters from './TermParameters.vue'
import { Badge } from './ui/badge'
import { Button } from './ui/button'

const props = defineProps<{ term: TermsCollectionItem }>()

const { text, isEnglish, termTitle, termText, localePath } = useGlossaryLocale()

// AI modified: interface navigation keeps demo choices and output language within this session.
const parameters = useState(`term-parameters:${props.term.slug}`, defaultParameters)
const library = useLibraryStore()
const { message, deliveryCount, copyText } = useDelivery()
const outputLocale = useState<'zh' | 'en'>('term-output-locale', () => 'en')
const isTocOpen = shallowRef(false)
const isParametersOpen = shallowRef(false)
const lastCatalog = useState('last-catalog-location', () => '/')
const description = computed(() => describeTerm(props.term, parameters.value, outputLocale.value))
useSeoMeta({
  title: () => `${termTitle(props.term)} · ${text('前端词典')}`,
  description: () => termText(props.term, 'description'),
})
</script>

<template>
  <div class="detail-layout">
    <article class="term-detail">
      <NuxtLink :to="localePath(lastCatalog)" class="back-link">
        <Icon name="lucide:arrow-left" :size="13" />{{ text('全部词条') }} <span>/ {{ text(categories.find(category => category.id === term.category)?.label ?? '') }}</span>
      </NuxtLink>
      <header class="detail-heading">
        <div class="flex items-center gap-2 mb-3">
          <Badge variant="secondary">
            {{ text(categories.find(category => category.id === term.category)?.label ?? '') }}
          </Badge>
          <span class="text-xs text-muted-foreground">{{ termText(term, 'naming') }}</span>
        </div>
        <h1>{{ termTitle(term) }}</h1>
        <p v-if="!isEnglish" class="detail-english">
          {{ term.english }}
        </p>
        <p class="page-lead">
          {{ termText(term, 'description') }}
        </p>
        <div v-if="!isEnglish" class="alias-list">
          <span>{{ text('也叫') }}</span>
          <span v-for="alias in term.aliases" :key="alias">{{ alias }}</span>
        </div>
        <div class="detail-actions">
          <Button variant="outline" @click="copyText(term.english)">
            <Icon name="lucide:copy" />{{ text('复制英文术语') }}
          </Button>
          <Button variant="outline" :disabled="!library.isReady" :aria-pressed="library.favorites.includes(term.slug)" @click="library.toggleFavorite(term.slug)">
            <span :key="String(library.favorites.includes(term.slug))" class="bookmark-feedback" :class="{ 'is-saved': library.favorites.includes(term.slug) }"><Icon name="lucide:bookmark" :class="{ '[&_path]:fill-current': library.favorites.includes(term.slug) }" /></span>{{ library.favorites.includes(term.slug) ? text('已收藏') : text('收藏词条') }}
          </Button>
        </div>
      </header>
      <div class="mobile-toc">
        <button :aria-expanded="isTocOpen" aria-controls="mobile-toc-links" @click="isTocOpen = !isTocOpen">
          {{ text('本页内容') }}<Icon name="lucide:chevron-down" class="motion-chevron" :class="{ 'rotate-180': isTocOpen }" />
        </button>
        <CollapsePanel id="mobile-toc-links" :open="isTocOpen">
          <nav :aria-label="text('本页内容')">
            <a v-for="section in [['preview', '效果预览'], ['understand', '这是什么'], ['describe', '可以这样描述'], ['sources', '参考资料']]" :key="section[0]" :href="`#${section[0]}`" @click="isTocOpen = false">{{ text(section[1]!) }}</a>
          </nav>
        </CollapsePanel>
      </div>
      <section id="preview">
        <h2 class="section-heading">
          {{ text('效果预览') }} <span>{{ text('先看，再试一试') }}</span>
        </h2>
        <DemoStage :term="term" :parameters="parameters" />
        <div v-if="parameterProfile(term) !== 'none'" class="detail-parameters">
          <button class="parameter-toggle" :aria-expanded="isParametersOpen" aria-controls="term-parameter-controls" @click="isParametersOpen = !isParametersOpen">
            <Icon name="lucide:sliders-horizontal" :size="16" />{{ text('调整效果参数') }}<Icon name="lucide:chevron-down" class="motion-chevron" :class="{ 'rotate-180': isParametersOpen }" :size="16" />
          </button>
          <CollapsePanel id="term-parameter-controls" :open="isParametersOpen">
            <div class="parameter-controls">
              <TermParameters :term="term" :parameters="parameters" @change="parameters = $event" /><Button variant="outline" class="mt-4" @click="parameters = defaultParameters()">
                {{ text('恢复默认') }}
              </Button>
            </div>
          </CollapsePanel>
        </div>
        <p class="demo-note">
          {{ text('演示用于理解模式。具体样式和尺寸可按项目需要调整。') }}
        </p>
      </section>
      <section id="understand" class="prose-section">
        <h2>{{ text('这是什么') }}</h2>
        <p v-if="isEnglish">
          {{ term.en.explanation }}
        </p>
        <ContentRenderer v-else :value="term" />
        <div class="knowledge-grid">
          <div>
            <h3>{{ text('什么时候用') }}</h3>
            <p>{{ termText(term, 'usage') }}</p>
          </div>
          <div>
            <h3>{{ text('容易混淆') }}</h3>
            <p>{{ termText(term, 'comparison') }}</p>
          </div>
        </div>
      </section>
      <section id="describe" class="description-section">
        <div class="section-heading">
          <h2>{{ text('可以这样描述') }}</h2>
          <Button variant="ghost" size="sm" @click="copyText(description)">
            <Icon name="lucide:copy" />{{ text('复制描述') }}
          </Button>
        </div>
        <div class="output-locale-control">
          <label for="term-output-locale">{{ text('输出语言') }}</label><select id="term-output-locale" v-model="outputLocale" class="native-select">
            <option value="en">
              English
            </option><option value="zh">
              中文
            </option>
          </select>
        </div>
        <p class="generated-description">
          {{ description }}
        </p>
        <AddToSchemeDialog :term="term" :parameters="parameters" />
        <div class="description-foot">
          <span>{{ text('随上方参数同步生成 · 可加入方案后编辑') }}</span>
          <span role="status"><Transition name="feedback"><span v-if="message" :key="deliveryCount" class="inline-block">{{ text(message) }}</span></Transition></span>
        </div>
      </section>
      <section id="sources" class="prose-section">
        <h2>{{ text('参考资料') }}</h2>
        <a v-for="source in term.sources" :key="source.url" :href="source.url" target="_blank" rel="noopener noreferrer" class="source-link">{{ text(source.title) }}<Icon name="lucide:external-link" :size="13" />
        </a>
        <p class="text-xs text-muted-foreground mt-4">
          {{ text('释义为编辑整理；“常用说法 / 描述性命名”不代表标准规范名称。') }}
        </p>
      </section>
    </article>
    <aside class="page-toc">
      <p>{{ text('本页内容') }}</p>
      <a href="#preview">{{ text('效果预览') }}</a>
      <a href="#understand">{{ text('这是什么') }}</a>
      <a href="#describe">{{ text('可以这样描述') }}</a>
      <a href="#sources">{{ text('参考资料') }}</a>
      <div class="toc-note">
        {{ text('不必记住每个名词。') }}<br>{{ text('找到想要的，') }}<br>{{ text('说清楚就好。') }}
      </div>
    </aside>
  </div>
</template>
