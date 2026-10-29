<script setup lang="ts">
import type { DemoParameters, SchemeChoice, Term } from '../types/glossary'
import { shallowRef } from 'vue'
import { Icon } from '#components'
import { navigateTo } from '#imports'
import { useCatalog } from '../composables/use-catalog'
import { useGlossaryLocale } from '../composables/use-glossary-locale'
import { findConflict } from '../lib/schemes'
import { useLibraryStore } from '../stores/library'
import CollapsePanel from './CollapsePanel.vue'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Field, FieldError, FieldGroup, FieldLabel } from './ui/field'
import { Input } from './ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from './ui/select'

const props = defineProps<{ term: Term, parameters: DemoParameters }>()

const { text, isEnglish, termTitle, localePath } = useGlossaryLocale()

const { terms } = useCatalog()
const library = useLibraryStore()
const isOpen = shallowRef(false)
const schemeId = shallowRef('new')
const title = shallowRef(text('后台管理界面'))
const target = shallowRef(props.term.en?.target ?? props.term.target)
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
    ? findConflict(existing, choice)
    : undefined
  if (conflict && !hasConfirmed) {
    const existingTerm = terms.value.find(term => term.slug === conflict.termSlug)
    conflictTitle.value = existingTerm
      ? termTitle(existingTerm)
      : text('已有选择')
    return
  }
  const scheme = existing ?? library.createScheme(title.value)
  if (!library.addChoice(scheme, choice, terms.value, hasConfirmed))
    return
  isOpen.value = false
  void navigateTo({
    path: localePath('/schemes/edit'),
    query: { id: scheme.id },
  })
}
</script>

<template>
  <Dialog v-model:open="isOpen" @update:open="conflictTitle = ''; error = ''">
    <DialogTrigger as-child>
      <Button :disabled="!library.isReady">
        <Icon name="lucide:plus" />{{ text('加入方案') }}
      </Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{{ isEnglish ? `Add ${termTitle(term)} to a plan` : `把「${termTitle(term)}」加入方案` }}</DialogTitle>
        <DialogDescription>{{ text('同一对象可组合多种效果。重复添加同一效果时，需要确认更新。') }}</DialogDescription>
      </DialogHeader>
      <p class="text-sm text-muted-foreground">
        {{ text('新方案默认英文输出；已有方案沿用原输出语言。') }}
      </p>
      <FieldGroup>
        <Field>
          <FieldLabel for="scheme-destination">
            {{ text('保存到') }}
          </FieldLabel>
          <Select v-model="schemeId" @update:model-value="conflictTitle = ''">
            <SelectTrigger id="scheme-destination">
              <SelectValue />
            </SelectTrigger><SelectContent>
              <SelectGroup>
                <SelectItem value="new">
                  {{ text('新建方案') }}
                </SelectItem>
                <SelectItem v-for="scheme in library.schemes" :key="scheme.id" :value="scheme.id">
                  {{ scheme.title }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
        <Field v-if="schemeId === 'new'">
          <FieldLabel for="scheme-name">
            {{ text('方案名称') }}
          </FieldLabel>
          <Input id="scheme-name" v-model="title" maxlength="80" />
        </Field>
        <Field>
          <FieldLabel for="choice-target">
            {{ text('作用对象') }}
          </FieldLabel>
          <Input id="choice-target" v-model="target" maxlength="60" :placeholder="text('例如：订单列表')" @update:model-value="conflictTitle = ''" />
        </Field>
      </FieldGroup>
      <CollapsePanel :open="!!conflictTitle">
        <Alert>
          <AlertTitle>{{ isEnglish ? `This target already has ${conflictTitle}` : `该对象已有「${conflictTitle}」` }}</AlertTitle>
          <AlertDescription>{{ text('替换后会更新选择；已有手写描述仍会保留并标记待更新。') }}</AlertDescription>
        </Alert>
      </CollapsePanel>
      <CollapsePanel :open="!!error">
        <FieldError role="alert">
          {{ text(error) }}
        </FieldError>
      </CollapsePanel>
      <DialogFooter>
        <Button variant="outline" @click="isOpen = false">
          {{ text('取消') }}
        </Button>
        <Button @click="add(!!conflictTitle)">
          {{ conflictTitle ? text('确认替换并加入') : text('加入并编辑方案') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
