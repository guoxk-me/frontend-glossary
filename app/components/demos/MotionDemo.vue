<script setup lang="ts">
import type { DemoParameters } from '../../types/glossary'
import { ArrowUpRight, Check } from '@lucide/vue'
import { computed, shallowRef, watch } from 'vue'
import { Button } from '../ui/button'

const props = defineProps<{ kind: string, parameters: DemoParameters, compact?: boolean, replay: number }>()
const expanded = shallowRef(true)
const isFlipped = shallowRef(false)
watch(() => props.replay, () => {
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
  <div class="motion-demo" :style="styles" :class="{ compact, 'is-static': compact }">
    <span class="demo-annotation">{{ kind === 'hover-lift' ? 'HOVER TO EXPLORE' : 'MOTION PREVIEW' }}</span>
    <div v-if="kind === 'stagger'" :key="replay" class="stagger-list">
      <div v-for="n in 3" :key="n" class="stagger-row motion-element" :style="{ animationDelay: compact ? '0ms' : `${(n - 1) * 100}ms` }">
        <span class="mini-avatar" />
        <div>
          <strong>{{ ['新建项目', '邀请团队', '发布上线'][n - 1] }}</strong>
          <div class="mini-line" />
        </div>
        <Check :size="14" />
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
        项目设置 <span>{{ expanded ? '−' : '+' }}</span>
      </Button>
      <div :key="replay" class="collapse-body" :class="{ closed: !expanded }">
        <div>
          <p>成员权限和通知偏好</p>
          <div class="mini-line" />
          <div class="mini-line short" />
        </div>
      </div>
    </div>
    <div v-else-if="kind === 'flip'" class="flip-scene">
      <button class="flip-button" :class="{ 'is-flipped': isFlipped }" :aria-pressed="isFlipped" aria-label="翻转卡片" @click="isFlipped = !isFlipped">
        <span class="flip-face flip-front">
          <strong>项目概览</strong>
          <span>点击查看另一面 ↻</span>
        </span>
        <span class="flip-face flip-back">
          <strong>补充信息</strong>
          <span>负责人：设计团队<br>进度：86%</span>
        </span>
      </button>
    </div>
    <div v-else :key="replay" class="motion-element motion-card" :class="`effect-${kind}`" :tabindex="kind === 'hover-lift' && !compact ? 0 : undefined">
      <div class="motion-icon">
        <Check :size="20" />
      </div>
      <strong>一切准备就绪</strong>
      <p>让每一次变化自然发生。</p>
      <span class="motion-card-bottom">查看项目 <ArrowUpRight :size="13" />
      </span>
    </div>
    <span class="demo-timing">{{ parameters.duration }}ms · {{ parameters.easing }}</span>
  </div>
</template>
