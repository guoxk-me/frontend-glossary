<script setup lang="ts">
import type { DemoParameters, SchemeChoice, Term } from '../types/glossary'
import { shallowRef, useId } from 'vue'
import { Icon, NuxtLink } from '#components'
import { categories } from '../lib/glossary'
import DemoStage from './DemoStage.vue'
import TermParameters from './TermParameters.vue'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Field, FieldLabel } from './ui/field'
import { Input } from './ui/input'

const props = defineProps<{ choice: SchemeChoice, term: Term }>()
const emit = defineEmits<{ change: [choice: SchemeChoice], remove: [] }>()
const isOpen = shallowRef(false)
const id = useId()
function changeTarget(event: Event): void {
  const input = event.target as HTMLInputElement
  if (!input.value.trim()) {
    input.value = props.choice.target
    return
  }
  emit('change', {
    ...props.choice,
    target: input.value.trim(),
  })
  input.value = props.choice.target
}
function changeParameters(parameters: DemoParameters): void {
  emit('change', { ...props.choice, parameters })
}
</script>

<template>
  <article class="scheme-selection">
    <div class="selection-header">
      <Badge variant="secondary">
        {{ categories.find(category => category.id === term.category)?.label }}
      </Badge>
      <NuxtLink :to="`/terms/${term.slug}`">{{ term.title }}</NuxtLink>
      <Button variant="ghost" size="icon-sm" :aria-label="`移除${term.title}`" @click="emit('remove')">
        <Icon name="lucide:trash-2" />
      </Button>
    </div>
    <Field class="mt-4">
      <FieldLabel :for="id">
        作用对象
      </FieldLabel>
      <Input :id="id" :model-value="choice.target" maxlength="60" @change="changeTarget" />
    </Field>
    <Button variant="ghost" size="sm" class="mt-3" :aria-expanded="isOpen" @click="isOpen = !isOpen">
      <Icon name="lucide:chevron-down" :class="{ 'rotate-180': isOpen }" />{{ isOpen ? '收起预览与参数' : '预览与调整参数' }}
    </Button>
    <div v-if="isOpen" class="selection-details">
      <DemoStage :term="term" :parameters="choice.parameters" />
      <TermParameters :term="term" :parameters="choice.parameters" @change="changeParameters" />
    </div>
  </article>
</template>
