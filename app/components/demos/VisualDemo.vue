<script setup lang="ts">
import { Icon } from '#components'

defineProps<{ kind: string, compact?: boolean }>()
</script>

<template>
  <div class="visual-demo" :class="[`visual-${kind}`, { compact }]">
    <div class="visual-orb orb-one" />
    <div class="visual-orb orb-two" />
    <article class="visual-card">
      <span class="visual-eyebrow">
        <Icon name="lucide:sparkles" :size="13" /> DESIGN SYSTEM</span>
      <h3>好的设计，<br>让内容更清晰。</h3>
      <p>关注内容、层级与恰到好处的细节。</p>
      <div class="visual-card-bottom">
        探索设计 <span>
          <Icon name="lucide:arrow-up-right" :size="16" />
        </span>
      </div>
    </article>
  </div>
</template>
