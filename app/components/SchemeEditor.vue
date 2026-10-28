<script setup lang="ts">
import type { Scheme, SchemeChoice } from '../types/glossary'
import { shallowRef } from 'vue'
import { Icon, NuxtLink } from '#components'
import { useCatalog } from '../composables/use-catalog'
import { useDelivery } from '../composables/use-delivery'
import { findConflict } from '../lib/schemes'
import { useLibraryStore } from '../stores/library'
import SchemeSelection from './SchemeSelection.vue'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog'
import { Field, FieldLabel } from './ui/field'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'

const props = defineProps<{ scheme: Scheme }>()
const { terms } = useCatalog()
const library = useLibraryStore()
const { copyText, downloadText, message } = useDelivery()
const isRegenerateOpen = shallowRef(false)
const pendingChoice = shallowRef<SchemeChoice | null>(null)
const conflictTitle = shallowRef('')
function updateChoice(choice: SchemeChoice): void {
  const conflict = findConflict(props.scheme, choice, terms.value)
  if (conflict) {
    pendingChoice.value = choice
    conflictTitle.value = terms.value.find(term => term.slug === conflict.termSlug)?.title ?? '已有选择'
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
  <NuxtLink to="/schemes" class="back-link">
    <Icon name="lucide:arrow-left" :size="13" />我的方案</NuxtLink>
  <div class="page-title-row">
    <div>
      <h1>编辑方案</h1>
      <p class="page-lead">
        选择效果，明确对象，让需求可以被准确理解。
      </p>
    </div>
    <Button variant="outline" @click="library.saveLibrary()">
      <Icon name="lucide:check" />保存到本机
    </Button>
  </div>
  <Field class="mb-8 max-w-lg">
    <FieldLabel for="edit-scheme-title">
      方案名称
    </FieldLabel>
    <Input id="edit-scheme-title" :model-value="scheme.title" maxlength="80" @change="library.renameScheme(scheme, ($event.target as HTMLInputElement).value, terms)" />
  </Field>
  <div class="scheme-editor-grid">
    <section>
      <div class="section-heading">
        <h2>
          已选效果 <span>{{ scheme.choices.length }}</span>
        </h2>
        <Button as-child variant="ghost" size="sm">
          <NuxtLink to="/">
            <Icon name="lucide:plus" />添加词条</NuxtLink>
        </Button>
      </div>
      <p v-if="!scheme.choices.length" class="empty-selection">
        还没有选择效果。去词典找到一个，点击“加入方案”即可。
      </p>
      <template v-for="choice in scheme.choices" :key="`${choice.id}-${choice.target}`">
        <SchemeSelection v-if="terms.find(term => term.slug === choice.termSlug)" :choice="choice" :term="terms.find(term => term.slug === choice.termSlug)!" @change="updateChoice" @remove="library.removeChoice(scheme, choice.id, terms)" />
      </template>
      <p class="local-note">
        同一个对象的同类效果需要确认替换，不同对象可以分别设置。
      </p>
    </section>
    <section class="scheme-description">
      <div class="section-heading">
        <h2>需求描述</h2>
        <Button variant="ghost" size="sm" :disabled="!scheme.choices.length" @click="regenerate">
          <Icon name="lucide:rotate-ccw" />重新生成
        </Button>
      </div>
      <Alert v-if="scheme.isStale" class="stale-alert mb-4">
        <AlertTitle>参数已变化，描述待更新</AlertTitle>
        <AlertDescription>手写内容已保留。重新生成需要确认替换，也可以继续手动修改。</AlertDescription>
      </Alert>
      <label for="scheme-description" class="sr-only">需求描述</label>
      <Textarea id="scheme-description" :model-value="scheme.description" maxlength="100000" class="description-editor" placeholder="加入词条后自动生成，也可以在这里写下自己的要求…" @update:model-value="library.editDescription(scheme, String($event))" />
      <div class="description-meta">
        <span>{{ scheme.hasManualEdits ? '已手动编辑' : '根据已选效果生成' }}</span>
        <span>{{ scheme.description.length }} 字</span>
      </div>
      <div class="export-actions">
        <Button :disabled="!scheme.description" @click="copyText(scheme.description)">
          <Icon name="lucide:copy" />复制描述
        </Button>
        <Button variant="outline" :disabled="!scheme.description" @click="downloadText(scheme.description, `${scheme.title}.md`, 'text/markdown')">
          <Icon name="lucide:download" />导出 Markdown
        </Button>
      </div>
      <p role="status" class="delivery-status">
        {{ message || (library.saveError ? library.saveError : '更改已自动保存到当前浏览器') }}
      </p>
      <div class="description-help">
        <strong>准备好，可以开始沟通了。</strong>
        <p>将描述粘贴给同事或 AI 工具，作为实现需求的起点。</p>
      </div>
    </section>
  </div>
  <Dialog v-model:open="isRegenerateOpen">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>重新生成并替换手写内容？</DialogTitle>
        <DialogDescription>会按当前效果与参数重新生成描述，并替换现有正文。取消后保留原文和待更新状态。</DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" @click="isRegenerateOpen = false">
          取消，保留原文
        </Button>
        <Button @click="library.regenerate(scheme, terms, true); isRegenerateOpen = false">
          确认替换描述
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
  <Dialog :open="!!pendingChoice" @update:open="($event) => { if (!$event) pendingChoice = null }">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>替换「{{ conflictTitle }}」？</DialogTitle>
        <DialogDescription>这个作用对象已经有同类别的效果。确认后保留新选择，移除冲突选择；手写正文仍会保留。</DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" @click="pendingChoice = null">
          取消
        </Button>
        <Button @click="confirmChoice">
          确认替换效果
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
