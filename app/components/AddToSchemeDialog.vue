<script setup lang="ts">
import type { DemoParameters, SchemeChoice, Term } from '../types/glossary'
import { shallowRef } from 'vue'
import { navigateTo } from '#imports'
import { useCatalog } from '../composables/use-catalog'
import { findConflict } from '../lib/schemes'
import { useLibraryStore } from '../stores/library'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Field, FieldGroup, FieldLabel } from './ui/field'
import { Input } from './ui/input'

const props = defineProps<{ term: Term, parameters: DemoParameters }>()
const { terms } = useCatalog()
const library = useLibraryStore()
const isOpen = shallowRef(false)
const schemeId = shallowRef('new')
const title = shallowRef('后台管理界面')
const target = shallowRef(props.term.target)
const conflictTitle = shallowRef('')
const error = shallowRef('')
function add(hasConfirmed = false): void {
  error.value = ''
  if (!target.value.trim()) {
    error.value = '请填写作用对象。'
    return
  }
  const existing = library.schemes.find(scheme => scheme.id === schemeId.value)
  if (!existing && !title.value.trim()) {
    error.value = '请填写方案名称。'
    return
  }
  if (!existing && library.schemes.length >= 100) {
    error.value = '最多保留 100 个方案，请先备份并整理。'
    return
  }
  const choice: SchemeChoice = {
    id: crypto.randomUUID(),
    termSlug: props.term.slug,
    target: target.value.trim(),
    parameters: { ...props.parameters },
  }
  const conflict = existing
    ? findConflict(existing, choice, terms.value)
    : undefined
  if (conflict && !hasConfirmed) {
    conflictTitle.value = terms.value.find(term => term.slug === conflict.termSlug)?.title ?? '已有选择'
    return
  }
  const scheme = existing ?? library.createScheme(title.value)
  if (!library.addChoice(scheme, choice, terms.value, hasConfirmed))
    return
  isOpen.value = false
  void navigateTo({
    path: '/schemes/edit',
    query: { id: scheme.id },
  })
}
</script>

<template>
  <Dialog v-model:open="isOpen" @update:open="conflictTitle = ''; error = ''">
    <DialogTrigger as-child>
      <Button :disabled="!library.isReady">
        ＋ 加入方案
      </Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>把「{{ term.title }}」加入方案</DialogTitle>
        <DialogDescription>同一个对象可组合不同类别。同类效果冲突时，需要确认替换。</DialogDescription>
      </DialogHeader>
      <FieldGroup>
        <Field>
          <FieldLabel for="scheme-destination">
            保存到
          </FieldLabel>
          <select id="scheme-destination" v-model="schemeId" class="native-select" @change="conflictTitle = ''">
            <option value="new">
              ＋ 新建方案
            </option>
            <option v-for="scheme in library.schemes" :key="scheme.id" :value="scheme.id">
              {{ scheme.title }}
            </option>
          </select>
        </Field>
        <Field v-if="schemeId === 'new'">
          <FieldLabel for="scheme-name">
            方案名称
          </FieldLabel>
          <Input id="scheme-name" v-model="title" maxlength="80" />
        </Field>
        <Field>
          <FieldLabel for="choice-target">
            作用对象
          </FieldLabel>
          <Input id="choice-target" v-model="target" maxlength="60" placeholder="例如：订单列表" @update:model-value="conflictTitle = ''" />
        </Field>
      </FieldGroup>
      <Alert v-if="conflictTitle">
        <AlertTitle>该对象已有「{{ conflictTitle }}」</AlertTitle>
        <AlertDescription>替换后会更新选择；已有手写描述仍会保留并标记待更新。</AlertDescription>
      </Alert>
      <p v-if="error" role="alert" class="text-destructive text-sm">
        {{ error }}
      </p>
      <DialogFooter>
        <Button variant="outline" @click="isOpen = false">
          取消
        </Button>
        <Button @click="add(!!conflictTitle)">
          {{ conflictTitle ? '确认替换并加入' : '加入并编辑方案' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
