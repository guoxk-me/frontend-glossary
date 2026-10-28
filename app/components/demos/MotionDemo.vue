<script setup lang="ts">
import type { DemoParameters } from '../../types/glossary'
import { useIntersectionObserver } from '@vueuse/core'
import { computed, shallowRef, useTemplateRef, watch } from 'vue'
import { Icon } from '#components'
import { useGlossaryLocale } from '../../composables/use-glossary-locale'
import { Button } from '../ui/button'

const props = defineProps<{ kind: string, parameters: DemoParameters, compact?: boolean, replay: number }>()

const { text } = useGlossaryLocale()

const stage = useTemplateRef<HTMLElement>('stage')
const hasEntered = shallowRef(!!props.compact)
const isVisible = shallowRef(false)
// AI modified: one entrance per mounted demo, with continuous loading motion paused offscreen.
if (!props.compact) {
  useIntersectionObserver(stage, ([entry]) => {
    isVisible.value = !!entry?.isIntersecting
    if (isVisible.value)
      hasEntered.value = true
  }, { threshold: 0.1 })
}
const expanded = shallowRef(true)
const isFlipped = shallowRef(false)
watch(() => props.replay, () => {
  hasEntered.value = true
  expanded.value = true
  isFlipped.value = false
})
const styles = computed(() => ({
  '--duration': `${props.parameters.duration}ms`,
  '--easing': props.parameters.easing,
  '--enter-x': props.parameters.direction === 'right'
    ? '55px'
    : '-55px',
}))
</script>

<template>
  <div ref="stage" class="motion-demo" :style="styles" :class="{ compact, 'is-static': compact, 'is-waiting': !hasEntered, 'is-offscreen': !isVisible }">
    <span class="demo-annotation">{{ kind === 'hover-lift' ? 'HOVER TO EXPLORE' : 'MOTION PREVIEW' }}</span>
    <div v-if="kind === 'stagger'" :key="replay" class="stagger-list">
      <div v-for="n in 3" :key="n" class="stagger-row motion-element" :style="{ animationDelay: compact ? '0ms' : `${(n - 1) * 100}ms` }">
        <span class="mini-avatar" />
        <div>
          <strong>{{ [text('新建项目'), text('邀请团队'), text('发布上线')][n - 1] }}</strong>
          <div class="mini-line" />
        </div>
        <Icon name="lucide:check" :size="14" />
      </div>
    </div>
    <div v-else-if="kind === 'shimmer'" :key="replay" class="skeleton-card">
      <div class="skeleton-circle shimmer-bar" />
      <div class="shimmer-bar" />
      <div class="shimmer-bar short" />
      <div class="shimmer-bar" />
    </div>
    <div v-else-if="kind === 'collapse'" class="collapse-card">
      <Button variant="ghost" class="w-full justify-between" :aria-expanded="expanded" @click="expanded = !expanded">
        {{ text('项目设置') }} <Icon :name="expanded ? 'lucide:minus' : 'lucide:plus'" :size="16" />
      </Button>
      <div :key="replay" class="collapse-body" :class="{ closed: !expanded }" :inert="!expanded || undefined" :aria-hidden="!expanded">
        <div>
          <p>{{ text('成员权限和通知偏好') }}</p>
          <div class="mini-line" />
          <div class="mini-line short" />
        </div>
      </div>
    </div>
    <div v-else-if="kind === 'flip'" class="flip-scene">
      <button class="flip-button" :class="{ 'is-flipped': isFlipped }" :aria-pressed="isFlipped" :aria-label="text('翻转卡片')" @click="isFlipped = !isFlipped">
        <span class="flip-face flip-front">
          <strong>{{ text('项目概览') }}</strong>
          <span>{{ text('点击查看另一面 ↻') }}</span>
        </span>
        <span class="flip-face flip-back">
          <strong>{{ text('补充信息') }}</strong>
          <span>{{ text('负责人：设计团队') }}<br>{{ text('进度：86%') }}</span>
        </span>
      </button>
    </div>
    <div v-else :key="replay" class="motion-element motion-card" :class="`effect-${kind}`" :tabindex="kind === 'hover-lift' && !compact ? 0 : undefined">
      <div class="motion-icon">
        <Icon name="lucide:check" :size="20" />
      </div>
      <strong>{{ text('一切准备就绪') }}</strong>
      <p>{{ text('让每一次变化自然发生。') }}</p>
      <span class="motion-card-bottom">{{ text('查看项目') }} <Icon name="lucide:arrow-up-right" :size="13" />
      </span>
    </div>
    <span class="demo-timing">{{ parameters.duration }}ms · {{ parameters.easing }}</span>
  </div>
</template>
