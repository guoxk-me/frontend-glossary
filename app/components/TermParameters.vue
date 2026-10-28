<script setup lang="ts">
import type { DemoParameters, Term } from '../types/glossary'
import { computed, useId } from 'vue'
import { useGlossaryLocale } from '../composables/use-glossary-locale'
import { parameterProfile } from '../lib/glossary'
import { Field, FieldDescription, FieldGroup, FieldLabel } from './ui/field'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Slider } from './ui/slider'
import { Switch } from './ui/switch'

const props = defineProps<{ term: Term, parameters: DemoParameters }>()

const emit = defineEmits<{ change: [parameters: DemoParameters] }>()

const { text } = useGlossaryLocale()

// AI modified: shadcn controls emit typed values without depending on native select events.
const profile = computed(() => parameterProfile(props.term))
const id = useId()
function change(patch: Partial<DemoParameters>): void {
  emit('change', {
    ...props.parameters,
    ...patch,
  })
}
</script>

<template>
  <FieldGroup v-if="profile !== 'none'" class="parameter-grid">
    <template v-if="profile === 'sidebar'">
      <Field>
        <FieldLabel :for="`${id}-width`">
          {{ text('侧栏宽度') }} <span>{{ parameters.width }} px</span>
        </FieldLabel>
        <Slider :id="`${id}-width`" :min="180" :max="300" :step="10" :model-value="[parameters.width]" :aria-label="text('侧栏宽度')" @update:model-value="change({ width: $event?.[0] ?? parameters.width })" />
        <FieldDescription>{{ text('展开时的目标宽度') }}</FieldDescription>
      </Field>
      <Field>
        <FieldLabel>{{ text('默认状态') }}</FieldLabel>
        <div class="flex items-center gap-3">
          <Switch :id="`${id}-collapsed`" :model-value="parameters.collapsed" :aria-label="text('默认状态')" @update:model-value="change({ collapsed: $event })" /><FieldLabel :for="`${id}-collapsed`">
            {{ parameters.collapsed ? text('已收起 · 点击展开') : text('已展开 · 点击收起') }}
          </FieldLabel>
        </div>
      </Field>
    </template>
    <template v-else>
      <Field>
        <FieldLabel :for="`${id}-duration`">
          {{ text('动画时长') }} <span>{{ parameters.duration }} ms</span>
        </FieldLabel>
        <Slider :id="`${id}-duration`" :min="80" :max="1600" :step="40" :model-value="[parameters.duration]" :aria-label="text('动画时长')" @update:model-value="change({ duration: $event?.[0] ?? parameters.duration })" />
      </Field>
      <Field>
        <FieldLabel :for="`${id}-easing`">
          {{ text('缓动曲线') }}
        </FieldLabel>
        <Select :model-value="parameters.easing" @update:model-value="change({ easing: $event as DemoParameters['easing'] })">
          <SelectTrigger :id="`${id}-easing`">
            <SelectValue />
          </SelectTrigger><SelectContent>
            <SelectGroup>
              <SelectItem value="ease-out">
                {{ text('ease-out · 先快后慢') }}
              </SelectItem>
              <SelectItem value="ease-in-out">
                {{ text('ease-in-out · 两端平缓') }}
              </SelectItem>
              <SelectItem value="linear">
                {{ text('linear · 匀速') }}
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>
      <Field v-if="term.demo === 'slide' || profile === 'drawer'">
        <FieldLabel :for="`${id}-direction`">
          {{ text('进入方向') }}
        </FieldLabel>
        <Select :model-value="parameters.direction" @update:model-value="change({ direction: $event as DemoParameters['direction'] })">
          <SelectTrigger :id="`${id}-direction`">
            <SelectValue />
          </SelectTrigger><SelectContent>
            <SelectGroup>
              <SelectItem value="right">
                {{ text('从右侧进入') }}
              </SelectItem>
              <SelectItem value="left">
                {{ text('从左侧进入') }}
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>
    </template>
  </FieldGroup>
</template>
