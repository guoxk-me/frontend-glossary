<script setup lang="ts">
import type { Locale, Scheme, SchemeChoice } from '../types/glossary'
import { computed, shallowRef } from 'vue'
import { Icon, NuxtLink } from '#components'
import { useCatalog } from '../composables/use-catalog'
import { useDelivery } from '../composables/use-delivery'
import { useGlossaryLocale } from '../composables/use-glossary-locale'
import { releaseLeavingRow, retainLeavingRow } from '../lib/list-motion'
import { changeOutputLocale, describeScheme, findConflict } from '../lib/schemes'
import { useLibraryStore } from '../stores/library'
import CollapsePanel from './CollapsePanel.vue'
import SchemeSelection from './SchemeSelection.vue'
import TemplateReferences from './templates/TemplateReferences.vue'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog'
import { Button } from './ui/button'
import { Empty, EmptyDescription, EmptyHeader } from './ui/empty'
import { Field, FieldLabel } from './ui/field'
import { Input } from './ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Textarea } from './ui/textarea'

const props = defineProps<{ scheme: Scheme }>()

const { text, isEnglish, termTitle, localePath } = useGlossaryLocale()

const { terms } = useCatalog()
const library = useLibraryStore()
const { copyText, downloadText, message, deliveryCount } = useDelivery()
const isRegenerateOpen = shallowRef(false)
const pendingChoice = shallowRef<SchemeChoice | null>(null)
const conflictTitle = shallowRef('')
const pendingLocale = shallowRef<Locale | null>(null)
const candidate = computed(() => describeScheme(props.scheme, terms.value, pendingLocale.value ?? props.scheme.outputLocale))
const hasUntranslatedText = computed(() => props.scheme.outputLocale === 'en' && /[\u3400-\u9fff]/u.test(props.scheme.description))
// AI modified: selection only proposes an output language; confirmation alone replaces the draft.
function requestOutputLocale(locale: unknown): void {
  if ((locale === 'zh' || locale === 'en') && locale !== props.scheme.outputLocale)
    pendingLocale.value = locale
}
function confirmOutputLocale(): void {
  if (pendingLocale.value && changeOutputLocale(props.scheme, terms.value, pendingLocale.value, true))
    library.saveLibrary()
  pendingLocale.value = null
}
function updateChoice(choice: SchemeChoice): void {
  const conflict = findConflict(props.scheme, choice)
  if (conflict) {
    pendingChoice.value = choice
    const existingTerm = terms.value.find(term => term.slug === conflict.termSlug)
    conflictTitle.value = existingTerm
      ? termTitle(existingTerm)
      : text('已有选择')
    return
  }
  library.addChoice(props.scheme, choice, terms.value)
}
function regenerate(): void {
  if (!library.regenerate(props.scheme, terms.value))
    isRegenerateOpen.value = true
}
function confirmChoice(): void {
  if (pendingChoice.value)
    library.addChoice(props.scheme, pendingChoice.value, terms.value, true)
  pendingChoice.value = null
}
</script>

<template>
  <NuxtLink :to="localePath('/schemes')" class="back-link">
    <Icon name="lucide:arrow-left" :size="13" />{{ text('我的方案') }}</NuxtLink>
  <div class="page-title-row">
    <div>
      <h1>{{ text('编辑方案') }}</h1>
      <p class="page-lead">
        {{ text('选择效果，明确对象，让需求可以被准确理解。') }}
      </p>
    </div>
    <Button variant="outline" @click="library.saveLibrary()">
      <Icon name="lucide:check" />{{ text('保存到本机') }}
    </Button>
  </div>
  <Field class="mb-8 max-w-lg">
    <FieldLabel for="edit-scheme-title">
      {{ text('方案名称') }}
    </FieldLabel>
    <Input id="edit-scheme-title" :model-value="scheme.title" maxlength="80" @change="library.renameScheme(scheme, ($event.target as HTMLInputElement).value, terms)" />
  </Field>
  <div class="scheme-editor-grid">
    <section>
      <TemplateReferences :scheme="scheme" />
      <div class="section-heading">
        <h2>
          {{ text(scheme.templateSelections?.length ? '词条效果' : '已选效果') }} <span>{{ scheme.choices.length }}</span>
        </h2>
        <Button as-child variant="ghost" size="sm">
          <NuxtLink :to="localePath('/')">
            <Icon name="lucide:plus" />{{ text('添加词条') }}</NuxtLink>
        </Button>
      </div>
      <TransitionGroup name="list" tag="div" class="motion-list" @before-leave="retainLeavingRow" @after-leave="releaseLeavingRow" @before-enter="releaseLeavingRow">
        <Empty v-if="!scheme.choices.length" key="empty" class="border">
          <EmptyHeader>
            <EmptyDescription>
              {{ text(scheme.templateSelections?.length ? '可以从词典继续添加单独的效果。' : '还没有选择效果。去词典找到一个，点击“加入方案”即可。') }}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
        <template v-for="choice in scheme.choices" :key="choice.id">
          <SchemeSelection v-if="terms.find(term => term.slug === choice.termSlug)" :choice="choice" :term="terms.find(term => term.slug === choice.termSlug)!" @change="updateChoice" @remove="library.removeChoice(scheme, choice.id, terms)" />
        </template>
      </TransitionGroup>
      <p class="local-note">
        {{ text('同一对象可以组合多种效果，重复添加同一效果时才需要确认。') }}
      </p>
    </section>
    <section class="scheme-description">
      <div class="section-heading">
        <h2>{{ text('需求描述') }}</h2>
        <Button variant="ghost" size="sm" :disabled="!scheme.choices.length && !scheme.templateSelections?.length" @click="regenerate">
          <Icon name="lucide:rotate-ccw" />{{ text('重新生成') }}
        </Button>
      </div>
      <Field orientation="horizontal" class="output-locale-control">
        <FieldLabel for="scheme-output-locale">
          {{ text('输出语言') }}
        </FieldLabel><Select :model-value="scheme.outputLocale" @update:model-value="requestOutputLocale">
          <SelectTrigger id="scheme-output-locale">
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
      <CollapsePanel :open="hasUntranslatedText">
        <Alert class="mixed-language-note" role="status">
          <AlertDescription>
            {{ text('输出包含未翻译的自定义内容，方案名、作用对象及手写内容会保留原文。') }}
          </AlertDescription>
        </Alert>
      </CollapsePanel>
      <CollapsePanel :open="scheme.isStale">
        <Alert class="stale-alert mb-4">
          <AlertTitle>{{ text(scheme.templateSelections?.length ? '选择已变化，描述待更新' : '参数已变化，描述待更新') }}</AlertTitle>
          <AlertDescription>{{ text('手写内容已保留。重新生成需要确认替换，也可以继续手动修改。') }}</AlertDescription>
        </Alert>
      </CollapsePanel>
      <FieldLabel for="scheme-description" class="sr-only">
        {{ text('需求描述') }}
      </FieldLabel>
      <Textarea id="scheme-description" :model-value="scheme.description" maxlength="100000" class="description-editor" :placeholder="text('加入词条后自动生成，也可以在这里写下自己的要求…')" @update:model-value="library.editDescription(scheme, String($event))" />
      <div class="description-meta">
        <span>{{ scheme.hasManualEdits ? text('已手动编辑') : text('根据已选效果生成') }}</span>
        <span>{{ scheme.description.length }} {{ text('字') }}</span>
      </div>
      <div class="export-actions">
        <Button :disabled="!scheme.description" @click="copyText(scheme.description)">
          <Icon name="lucide:copy" />{{ text('复制描述') }}
        </Button>
        <Button variant="outline" :disabled="!scheme.description" @click="downloadText(scheme.description, `${scheme.title}.md`, 'text/markdown')">
          <Icon name="lucide:download" />{{ text('导出 Markdown') }}
        </Button>
      </div>
      <p role="status" class="delivery-status">
        <Transition name="feedback">
          <span :key="`${deliveryCount}:${library.saveError}`" class="inline-block">{{ text(message || library.saveError || '更改已自动保存到当前浏览器') }}</span>
        </Transition>
      </p>
      <div class="description-help">
        <strong>{{ text('准备好，可以开始沟通了。') }}</strong>
        <p>{{ text('将描述粘贴给同事或 AI 工具，作为实现需求的起点。') }}</p>
      </div>
    </section>
  </div>
  <AlertDialog :open="!!pendingLocale" @update:open="($event) => { if (!$event) pendingLocale = null }">
    <AlertDialogContent restore-focus-to="scheme-output-locale" class="output-preview-dialog sm:max-w-3xl">
      <AlertDialogHeader><AlertDialogTitle>{{ text('切换输出语言？') }} {{ pendingLocale === 'en' ? 'English' : '中文' }}</AlertDialogTitle><AlertDialogDescription>{{ text('确认后将替换整份正文，包括手写补充。') }}</AlertDialogDescription></AlertDialogHeader>
      <div class="draft-comparison">
        <section><h3>{{ text('当前正文') }}</h3><pre>{{ scheme.description }}</pre></section><section><h3>{{ text('候选描述') }}</h3><pre>{{ candidate }}</pre></section>
      </div>
      <Alert v-if="pendingLocale === 'en' && /[\u3400-\u9fff]/u.test(candidate)" class="mixed-language-note">
        <AlertDescription>
          {{ text('输出包含未翻译的自定义内容，方案名、作用对象及手写内容会保留原文。') }}
        </AlertDescription>
      </Alert>
      <AlertDialogFooter>
        <AlertDialogCancel @click="pendingLocale = null">
          {{ text('取消，保留原文') }}
        </AlertDialogCancel><Button @click="confirmOutputLocale">
          {{ text('确认替换描述') }}
        </Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
  <AlertDialog v-model:open="isRegenerateOpen">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{{ text('重新生成并替换手写内容？') }}</AlertDialogTitle>
        <AlertDialogDescription>{{ text('会按当前效果与参数重新生成描述，并替换现有正文。取消后保留原文和待更新状态。') }}</AlertDialogDescription>
      </AlertDialogHeader>
      <pre class="regenerate-preview">{{ candidate }}</pre>
      <AlertDialogFooter>
        <AlertDialogCancel @click="isRegenerateOpen = false">
          {{ text('取消，保留原文') }}
        </AlertDialogCancel>
        <Button @click="library.regenerate(scheme, terms, true); isRegenerateOpen = false">
          {{ text('确认替换描述') }}
        </Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
  <AlertDialog :open="!!pendingChoice" @update:open="($event) => { if (!$event) pendingChoice = null }">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{{ isEnglish ? `Replace ${conflictTitle}?` : `替换「${conflictTitle}」？` }}</AlertDialogTitle>
        <AlertDialogDescription>{{ text('这个作用对象已经添加过该效果。确认后更新它的参数；手写正文仍会保留。') }}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel @click="pendingChoice = null">
          {{ text('取消') }}
        </AlertDialogCancel>
        <Button @click="confirmChoice">
          {{ text('确认替换效果') }}
        </Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
