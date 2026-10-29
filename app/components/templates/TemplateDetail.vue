<script setup lang="ts">
import type { Locale } from '../../types/glossary'
import type { RegionChoice, TemplateEntry } from '../../types/template'
import { useOnline } from '@vueuse/core'
import { computed, onMounted, shallowRef } from 'vue'
import { Icon, NuxtLink } from '#components'
import { useRoute, useRouter, useSeoMeta, useState } from '#imports'
import { useDelivery } from '../../composables/use-delivery'
import { useGlossaryLocale } from '../../composables/use-glossary-locale'
import { describeTemplate, selectTemplateRegions } from '../../lib/templates'
import { useLibraryStore } from '../../stores/library'
import { Alert, AlertDescription, AlertTitle } from '../ui/alert'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Field, FieldLabel } from '../ui/field'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import TemplateFullscreenPreview from './TemplateFullscreenPreview.vue'
import TemplateJoinDialog from './TemplateJoinDialog.vue'
import TemplatePreview from './TemplatePreview.vue'
import TemplateRegionEditor from './TemplateRegionEditor.vue'

const props = defineProps<{ template: TemplateEntry }>()
const { text, isEnglish, localePath } = useGlossaryLocale()
const { copyText, message } = useDelivery()
const route = useRoute()
const router = useRouter()
const library = useLibraryStore()
const networkOnline = useOnline()
const hasMounted = shallowRef(false)
// AI modified: match SSR first, then apply connectivity so offline reloads patch disabled attributes.
const isOnline = computed(() => !hasMounted.value || networkOnline.value)
onMounted(() => {
  hasMounted.value = true
})
const language = computed(() => isEnglish.value ? 'en' : 'zh')
const title = computed(() => isEnglish.value ? props.template.english : props.template.title)
const page = computed(() => props.template.pages.find(page => page.id === route.query.page) ?? props.template.pages[0]!)
const scheme = computed(() => library.schemes.find(scheme => scheme.id === route.query.schemeId))
const saved = computed(() => scheme.value?.templateSelections?.find(selection => selection.id === route.query.selectionId))
const isMissingReference = computed(() => library.isReady && !!route.query.selectionId && !saved.value)
// AI modified: preserve in-session regional edits across locale changes and dictionary navigation.
const drafts = useState<Record<string, RegionChoice[]>>(`template-draft:${props.template.slug}:${route.query.selectionId ?? 'new'}`, () => ({}))
const choices = computed(() => drafts.value[page.value.id] ?? page.value.regions.map((region) => {
  const adopted = saved.value?.pageId === page.value.id
    ? saved.value.regions.find(saved => saved.id === region.id)
    : undefined
  return {
    regionId: region.id,
    isSelected: saved.value
      ? !!adopted
      : region.id !== 'toolbar',
    aspects: adopted
      ? adopted.features.map(feature => feature.aspect)
      : region.features.map(feature => feature.aspect),
    adjustments: adopted?.adjustments ?? '',
  }
}))
const selected = computed(() => choices.value.filter(choice => choice.isSelected))
const activeRegionId = shallowRef('sidebar')
const activeRegion = computed(() => page.value.regions.find(region => region.id === activeRegionId.value && selected.value.some(choice => choice.regionId === region.id)) ?? page.value.regions.find(region => selected.value.some(choice => choice.regionId === region.id)))
const activeChoice = computed(() => choices.value.find(choice => choice.regionId === activeRegion.value?.id))
const selection = computed(() => selectTemplateRegions(props.template, page.value.id, choices.value, saved.value?.id ?? 'preview'))
const outputLocale = shallowRef<Locale>('en')
const description = computed(() => describeTemplate(selection.value, outputLocale.value))
const missingRelations = computed(() => page.value.regions.filter(region => selected.value.some(choice => choice.regionId === region.id)).flatMap(region => region.relatedRegionIds).filter(id => !selected.value.some(choice => choice.regionId === id)))
function changeChoice(choice: RegionChoice): void {
  drafts.value[page.value.id] = choices.value.map(saved => saved.regionId === choice.regionId
    ? choice
    : saved)
}
function changePage(pageId: unknown): void {
  if (typeof pageId === 'string') {
    void router.replace({
      query: { ...route.query, page: pageId },
    })
  }
}
function changeOutputLocale(locale: unknown): void {
  if (locale === 'zh' || locale === 'en')
    outputLocale.value = locale
}
useSeoMeta({
  title: () => `${title.value} · Templates`,
  description: () => props.template.description[language.value],
})
</script>

<template>
  <article class="template-detail">
    <NuxtLink :to="localePath('/templates')" class="back-link"><Icon name="lucide:arrow-left" :size="14" /> Templates</NuxtLink>
    <header class="page-title-row">
      <div>
        <h1>{{ title }}</h1><p v-if="!isEnglish" class="page-lead">
          {{ template.english }}
        </p>
      </div><Button variant="outline" :disabled="!library.isReady" :aria-pressed="library.templateFavorites.includes(template.slug)" @click="library.toggleTemplateFavorite(template.slug)">
        <Icon :name="library.templateFavorites.includes(template.slug) ? 'lucide:bookmark-check' : 'lucide:bookmark'" />{{ text(library.templateFavorites.includes(template.slug) ? '取消收藏模板' : '收藏模板') }}
      </Button>
    </header>
    <div class="flex flex-wrap gap-2">
      <Badge variant="secondary">
        {{ text(template.origin === 'original' ? '原创' : '外部参考') }}
      </Badge><Badge variant="secondary">
        {{ text(template.kind === 'page' ? '页面模板' : '整站模板') }}
      </Badge><Badge variant="secondary">
        {{ text('后台管理') }}
      </Badge><Badge variant="secondary">
        {{ text(page.demo ? '可交互预览' : '静态预览') }}
      </Badge>
    </div>
    <Alert v-if="!isOnline">
      <AlertTitle>{{ text('当前离线') }}</AlertTitle><AlertDescription>{{ text(page.demo ? '当前离线，页面演示与需求整理仍可使用。' : '文字、区域拆解与需求整理可用。高清图和外部演示需要联网。') }}</AlertDescription>
    </Alert>
    <Alert v-if="isMissingReference" variant="destructive">
      <AlertTitle>{{ text('原方案中的模板参考不存在') }}</AlertTitle><AlertDescription>{{ text('请返回方案检查，当前页面不会覆盖任何已保存内容。') }}</AlertDescription>
    </Alert>
    <Field v-if="template.pages.length > 1">
      <FieldLabel for="template-page">
        {{ text('模板页面') }}
      </FieldLabel><Select :model-value="page.id" @update:model-value="changePage">
        <SelectTrigger id="template-page">
          <SelectValue />
        </SelectTrigger><SelectContent>
          <SelectGroup>
            <SelectItem v-for="entry in template.pages" :key="entry.id" :value="entry.id">
              {{ entry.title[language] }}
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </Field>
    <div class="template-detail-grid">
      <div class="template-main-column">
        <TemplatePreview :src="page.thumbnail" :title="title" />
        <div class="flex flex-wrap items-center gap-3">
          <TemplateFullscreenPreview :key="page.id" :src="page.preview" :title="title" :demo="page.demo" :disabled="!page.demo && !isOnline" />
          <p class="text-xs text-muted-foreground">
            {{ text('原始参考不会随样式调整改变。') }}
          </p>
        </div>
        <section class="template-regions" aria-labelledby="region-heading">
          <h2 id="region-heading">
            {{ text('区域拆解') }}
          </h2><p>{{ text('选择需要借鉴的区域，再调整各区域的样式。') }}</p>
          <label v-for="(region, index) in page.regions" :key="region.id" class="template-region" :class="{ 'region-selected': choices[index]!.isSelected }">
            <input type="checkbox" :checked="choices[index]!.isSelected" @change="changeChoice({ ...choices[index]!, isSelected: !choices[index]!.isSelected })">
            <span class="region-number">{{ String(index + 1).padStart(2, '0') }}</span>
            <span class="region-copy"><strong>{{ region.title[language] }}</strong><small v-if="!isEnglish">{{ region.title.en }}</small><span>{{ region.relation[language] }}</span></span>
          </label>
        </section>
        <section v-if="selected.length" id="template-style-editor" class="template-style-editor" aria-labelledby="style-heading">
          <h2 id="style-heading">
            {{ text('调整样式与需求') }}
          </h2>
          <p class="text-sm text-muted-foreground">
            {{ text('调整的是需求描述，不会实时改变原始参考。') }}
          </p>
          <div class="region-tabs" :aria-label="text('选择要调整的区域')">
            <Button v-for="region in selection.regions" :key="region.id" :variant="activeRegion?.id === region.id ? 'default' : 'outline'" :aria-pressed="activeRegion?.id === region.id" @click="activeRegionId = region.id">
              {{ region.title[language] }}
            </Button>
          </div>
          <TemplateRegionEditor v-if="activeRegion && activeChoice" :region="activeRegion" :choice="activeChoice" @change="changeChoice" />
        </section>
        <p class="template-source">
          {{ text('参考来源') }}: <NuxtLink :to="template.source.url" :external="!template.source.url.startsWith('/')" :target="template.source.url.startsWith('/') ? undefined : '_blank'" rel="noopener noreferrer">{{ template.source.title }}</NuxtLink> · {{ text('示例内容不作为业务要求。') }}
        </p>
      </div>
      <aside class="template-selection-summary" :aria-label="text('本次选择')">
        <h2>{{ text('本次选择') }}</h2><p class="selection-count">
          {{ selected.length }} / {{ page.regions.length }} {{ text('个区域') }}
        </p>
        <ul>
          <li v-for="region in selection.regions" :key="region.id">
            <Icon name="lucide:check" :size="15" /><span>{{ region.title[language] }}</span>
          </li>
        </ul>
        <p v-if="selection.excludedRegions.length" class="text-xs text-muted-foreground">
          {{ text('未采用') }}: {{ selection.excludedRegions.map(title => title[language]).join(' / ') }}
        </p>
        <Alert v-if="missingRelations.length">
          <AlertDescription>{{ text('部分相邻区域未选择，仅保留位置上下文，不采用它们的样式。') }}</AlertDescription>
        </Alert>
        <p v-if="!selected.length" role="status">
          {{ text('请至少选择一个区域。') }}
        </p>
        <Button v-if="selected.length" as-child variant="outline">
          <a href="#template-style-editor"><Icon name="lucide:sliders-horizontal" />{{ text('调整样式与需求') }}</a>
        </Button>
        <Field>
          <FieldLabel for="template-output-locale">
            {{ text('输出语言') }}
          </FieldLabel><Select :model-value="outputLocale" @update:model-value="changeOutputLocale">
            <SelectTrigger id="template-output-locale">
              <SelectValue />
            </SelectTrigger><SelectContent>
              <SelectGroup>
                <SelectItem value="en">
                  English
                </SelectItem><SelectItem value="zh">
                  中文
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
        <details v-if="selected.length">
          <summary>{{ text('需求描述预览') }}</summary><pre class="template-draft-preview">{{ description }}</pre>
        </details>
        <!-- AI modified: copying requirements does not create or mutate a saved plan. -->
        <Button :disabled="!selected.length" @click="copyText(description)">
          <Icon name="lucide:copy" />{{ text('复制需求') }}
        </Button>
        <p v-if="message" role="status" class="text-xs text-muted-foreground">
          {{ text(message) }}
        </p>
        <TemplateJoinDialog :selection="selection" :output-locale="outputLocale" :scheme-id="saved ? scheme?.id : undefined" :is-editing="!!saved" :disabled="isMissingReference" />
        <p class="text-xs text-muted-foreground">
          {{ text('需要反复使用时，再保存到方案。') }}
        </p>
      </aside>
    </div>
  </article>
</template>

<style scoped>
.template-detail { display: flex; flex-direction: column; gap: 22px; }
.template-detail .page-title-row { margin: 0; }
.template-detail h2 { font-size: 20px; font-weight: 600; }
.template-detail-grid { display: grid; grid-template-columns: minmax(0,1fr) 290px; gap: 24px; align-items: start; }
.template-main-column { min-width: 0; display: flex; flex-direction: column; gap: 20px; }
.template-regions > p { font-size: 13px; color: var(--muted-foreground); margin: 14px 0; }
.template-region { display: flex; gap: 12px; align-items: start; padding: 20px 0; border-bottom: 1px solid var(--border); cursor: pointer; min-height: 64px; }
.template-region input { margin-top: 5px; width: 18px; height: 18px; accent-color: var(--selection-foreground); }
.region-number { padding: 4px 6px; border-radius: 4px; background: var(--muted); font-size: 11px; }
.region-selected .region-number { background: var(--selection); color: var(--selection-foreground); }
.region-copy { display: flex; flex-direction: column; gap: 5px; font-size: 13px; min-width: 0; }
.region-copy small, .region-copy > span { font-size: 12px; color: var(--muted-foreground); }
.template-style-editor { display: flex; flex-direction: column; gap: 22px; padding-top: 14px; scroll-margin-top: 90px; }
.region-tabs { display: flex; flex-wrap: wrap; gap: 8px; }
.template-selection-summary { min-width: 0; position: sticky; top: 90px; border: 1px solid var(--border); border-radius: 8px; padding: 20px; display: flex; flex-direction: column; gap: 18px; max-height: calc(100dvh - 110px); overflow-y: auto; }
.selection-count { font-size: 13px; color: var(--selection-foreground); }
.template-selection-summary ul { display: flex; flex-direction: column; gap: 14px; }
.template-selection-summary li { display: flex; align-items: start; gap: 8px; font-size: 13px; }
.template-selection-summary small { display: block; font-size: 11px; color: var(--muted-foreground); margin-top: 3px; }
.template-selection-summary summary { font-size: 13px; cursor: pointer; }
.template-draft-preview { margin-top: 12px; padding: 12px; background: var(--muted); white-space: pre-wrap; overflow-wrap: anywhere; font: inherit; font-size: 12px; line-height: 1.8; }
.template-source { font-size: 12px; color: var(--muted-foreground); line-height: 1.8; }
.template-source a { text-decoration: underline; }
@media(max-width:1150px) { .template-detail-grid { grid-template-columns: 1fr; }.template-selection-summary { position: static; max-height: none; }.region-tabs button { min-height: 44px; } }
@media(max-width:540px) { .template-detail :deep([data-slot="button"]) { min-height: 44px; } }
</style>
