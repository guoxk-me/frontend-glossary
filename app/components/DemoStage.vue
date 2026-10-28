<script setup lang="ts">
import type { DemoParameters, Term } from '../types/glossary'
import { computed, shallowRef } from 'vue'
import { Icon } from '#components'
import { useGlossaryLocale } from '../composables/use-glossary-locale'
import { defaultParameters } from '../lib/glossary'
import InteractionDemo from './demos/InteractionDemo.vue'
import LayoutDemo from './demos/LayoutDemo.vue'
import MotionDemo from './demos/MotionDemo.vue'
import VisualDemo from './demos/VisualDemo.vue'
import { Alert, AlertDescription } from './ui/alert'
import { Button } from './ui/button'

const props = defineProps<{ term: Term, parameters?: DemoParameters, compact?: boolean }>()

const { text } = useGlossaryLocale()

const replay = shallowRef(0)
const activeParameters = computed(() => props.parameters ?? defaultParameters())
</script>

<template>
  <div class="demo-stage" :class="{ 'demo-compact': compact }">
    <div v-if="!compact" class="demo-toolbar">
      <span>
        <i /> {{ text('实时演示') }}</span>
      <Button variant="ghost" size="sm" @click="replay++">
        <Icon name="lucide:rotate-ccw" :size="13" />{{ text('重播 / 重置') }}
      </Button>
    </div>
    <!-- AI modified: isolate demo failures so definitions and saved schemes remain usable. -->
    <NuxtErrorBoundary>
      <!-- AI modified: catalog previews stay inert; only an opened term runs interactive examples. -->
      <div class="demo-surface" :inert="compact || undefined" :aria-hidden="compact || undefined">
        <LayoutDemo v-if="term.category === 'layout'" :key="replay" :kind="term.demo" :parameters="activeParameters" :compact="compact" />
        <MotionDemo v-else-if="term.category === 'motion'" :kind="term.demo" :parameters="activeParameters" :compact="compact" :replay="replay" />
        <VisualDemo v-else-if="term.category === 'visual'" :kind="term.demo" :compact="compact" />
        <InteractionDemo v-else :key="replay" :kind="term.demo" :parameters="activeParameters" :compact="compact" />
      </div>
      <template #error="{ clearError }">
        <Alert variant="destructive">
          <AlertDescription>
            <p class="mb-3">
              {{ text('演示暂时无法加载，词条说明仍可阅读。') }}
            </p>
            <Button variant="outline" size="sm" @click="clearError">
              {{ text('重试演示') }}
            </Button>
          </AlertDescription>
        </Alert>
      </template>
    </NuxtErrorBoundary>
  </div>
</template>
