<script setup lang="ts">
import type { DemoParameters, Term } from '../types/glossary'
import { computed, useId } from 'vue'
import { parameterProfile } from '../lib/glossary'
import { Button } from './ui/button'
import { Field, FieldDescription, FieldGroup, FieldLabel } from './ui/field'

const props = defineProps<{ term: Term, parameters: DemoParameters }>()
const emit = defineEmits<{ change: [parameters: DemoParameters] }>()
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
          侧栏宽度 <span>{{ parameters.width }} px</span>
        </FieldLabel>
        <input :id="`${id}-width`" type="range" min="180" max="300" step="10" :value="parameters.width" @input="change({ width: Number(($event.target as HTMLInputElement).value) })">
        <FieldDescription>展开时的目标宽度</FieldDescription>
      </Field>
      <Field>
        <FieldLabel>默认状态</FieldLabel>
        <Button variant="outline" :aria-pressed="parameters.collapsed" @click="change({ collapsed: !parameters.collapsed })">
          {{ parameters.collapsed ? '已收起 · 点击展开' : '已展开 · 点击收起' }}
        </Button>
      </Field>
    </template>
    <template v-else>
      <Field>
        <FieldLabel :for="`${id}-duration`">
          动画时长 <span>{{ parameters.duration }} ms</span>
        </FieldLabel>
        <input :id="`${id}-duration`" type="range" min="80" max="1600" step="40" :value="parameters.duration" @input="change({ duration: Number(($event.target as HTMLInputElement).value) })">
      </Field>
      <Field>
        <FieldLabel :for="`${id}-easing`">
          缓动曲线
        </FieldLabel>
        <select :id="`${id}-easing`" class="native-select" :value="parameters.easing" @change="change({ easing: ($event.target as HTMLSelectElement).value as DemoParameters['easing'] })">
          <option value="ease-out">
            ease-out · 先快后慢
          </option>
          <option value="ease-in-out">
            ease-in-out · 两端平缓
          </option>
          <option value="linear">
            linear · 匀速
          </option>
        </select>
      </Field>
      <Field v-if="term.demo === 'slide' || profile === 'drawer'">
        <FieldLabel :for="`${id}-direction`">
          进入方向
        </FieldLabel>
        <select :id="`${id}-direction`" class="native-select" :value="parameters.direction" @change="change({ direction: ($event.target as HTMLSelectElement).value as DemoParameters['direction'] })">
          <option value="right">
            从右侧进入
          </option>
          <option value="left">
            从左侧进入
          </option>
        </select>
      </Field>
    </template>
  </FieldGroup>
</template>
