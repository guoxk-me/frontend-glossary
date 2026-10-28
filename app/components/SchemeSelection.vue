<script setup lang="ts">
import type { DemoParameters, SchemeChoice, Term } from '../types/glossary'
import { shallowRef, useId } from 'vue'
import { Icon, NuxtLink } from '#components'
import { useGlossaryLocale } from '../composables/use-glossary-locale'
import { categories } from '../lib/glossary'
import CollapsePanel from './CollapsePanel.vue'
import DemoStage from './DemoStage.vue'
import TermParameters from './TermParameters.vue'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import { Field, FieldLabel } from './ui/field'
import { Input } from './ui/input'

const props = defineProps<{ choice: SchemeChoice, term: Term }>()

const emit = defineEmits<{ change: [choice: SchemeChoice], remove: [] }>()

const { text, isEnglish, termTitle, localePath } = useGlossaryLocale()

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
  <Card class="scheme-selection">
    <CardHeader>
      <CardTitle class="sr-only">
        {{ termTitle(term) }}
      </CardTitle>
      <div class="selection-header">
        <Badge variant="secondary">
          {{ text(categories.find(category => category.id === term.category)?.label ?? '') }}
        </Badge>
        <NuxtLink :to="localePath(`/terms/${term.slug}`)">{{ termTitle(term) }}<small v-if="!isEnglish" class="selection-english">{{ term.english }}</small></NuxtLink>
        <Button variant="ghost" size="icon-sm" :aria-label="isEnglish ? `Remove ${term.english}` : `移除${term.title}`" @click="emit('remove')">
          <Icon name="lucide:trash-2" />
        </Button>
      </div>
    </CardHeader><CardContent>
      <Field>
        <FieldLabel :for="id">
          {{ text('作用对象') }}
        </FieldLabel>
        <Input :id="id" :model-value="choice.target" maxlength="60" @change="changeTarget" />
      </Field>
      <Collapsible v-model:open="isOpen">
        <CollapsibleTrigger as-child>
          <Button variant="ghost" size="sm" class="mt-3" :aria-expanded="isOpen" :aria-controls="`${id}-details`">
            <Icon name="lucide:chevron-down" class="motion-chevron" :class="{ 'rotate-180': isOpen }" />{{ isOpen ? text('收起预览与参数') : text('预览与调整参数') }}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent force-mount>
          <CollapsePanel :id="`${id}-details`" :open="isOpen">
            <div class="selection-details">
              <DemoStage :term="term" :parameters="choice.parameters" />
              <TermParameters :term="term" :parameters="choice.parameters" @change="changeParameters" />
            </div>
          </CollapsePanel>
        </CollapsibleContent>
      </Collapsible>
    </CardContent>
  </Card>
</template>
