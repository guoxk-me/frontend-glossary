<script setup lang="ts">
import type { DemoParameters } from '../../types/glossary'
import { shallowRef, watch } from 'vue'
import { Icon } from '#components'
import { useGlossaryLocale } from '../../composables/use-glossary-locale'
import { Button } from '../ui/button'
import { Slider } from '../ui/slider'

const props = defineProps<{ kind: string, parameters: DemoParameters, compact?: boolean }>()

const { text } = useGlossaryLocale()

const selected = shallowRef(0)
const split = shallowRef(45)
const expanded = shallowRef<boolean | null>(null)
watch(() => props.parameters.collapsed, () => {
  expanded.value = null
})
</script>

<template>
  <div class="layout-demo" :class="[`layout-${kind}`, { compact }]">
    <template v-if="kind === 'card-grid' || kind === 'masonry'">
      <div class="demo-board-title">
        {{ text('项目概览') }} <span>{{ text('项目管理') }} <Icon name="lucide:arrow-up-right" :size="12" /></span>
      </div>
      <div class="mini-card-grid" :class="{ masonry: kind === 'masonry' }">
        <div v-for="(title, index) in ['数据分析', '设计系统', '工作空间', '项目管理', '营销页面', '内容中心']" :key="title" class="mini-project" :style="kind === 'masonry' ? { minHeight: `${[108, 152, 88, 126, 92, 148][index]}px` } : {}">
          <span class="project-symbol">{{ ['◒', '◫', '✳', '◇', '◐', '▦'][index] }}</span>
          <strong>{{ text(title) }}</strong>
          <span class="tiny-muted">{{ text('最近更新 · 今天') }}</span>
          <div class="mini-line" />
        </div>
      </div>
    </template>
    <template v-else>
      <div class="mini-admin" :class="{ 'with-top': ['sidebar', 'top-nav', 'holy-grail', 'sticky-header'].includes(kind) }">
        <div v-if="['sidebar', 'top-nav', 'holy-grail', 'sticky-header'].includes(kind)" class="mini-top">
          <strong>Workspace</strong>
          <span>{{ text('概览 项目 团队') }}</span>
          <i />
        </div>
        <div class="mini-admin-body">
          <aside v-if="!['top-nav', 'sticky-header', 'split-pane', 'master-detail'].includes(kind)" class="mini-sidebar" :style="{ width: (expanded ?? !parameters.collapsed) ? `${compact ? 74 : parameters.width * 0.65}px` : '40px' }">
            <div class="mini-logo">
              ◈ <b v-if="expanded ?? !parameters.collapsed">Acme Inc.</b>
            </div>
            <div v-for="(icon, index) in ['lucide:layout-dashboard', 'lucide:package', 'lucide:users', 'lucide:settings']" :key="index" :class="{ active: index === 0 }">
              <Icon :name="icon" :size="12" />
              <span v-if="expanded ?? !parameters.collapsed">{{ [text('工作台'), text('项目管理'), text('团队成员'), text('设置')][index] }}</span>
            </div>
          </aside>
          <div v-if="kind === 'split-pane' || kind === 'master-detail'" class="mini-master" :style="{ width: `${kind === 'split-pane' ? split : 38}%` }">
            <strong>{{ kind === 'split-pane' ? text('文件列表') : text('订单列表') }}</strong>
            <Button v-for="(title, index) in ['设计系统', '前端词典', '数据看板']" :key="title" variant="ghost" :class="{ selected: selected === index }" @click="selected = index">
              {{ text(title) }} <Icon name="lucide:chevron-right" :size="12" />
            </Button>
            <Slider v-if="kind === 'split-pane' && !compact" :model-value="[split]" :min="30" :max="65" :aria-label="text('左右分栏比例')" @update:model-value="split = $event?.[0] ?? split" />
          </div>
          <div class="mini-content" :class="{ 'scroll-demo': ['sidebar', 'sticky-header'].includes(kind) }">
            <header class="mini-content-header">
              <Button v-if="kind === 'sidebar' && !compact" variant="ghost" size="icon-sm" :aria-label="text('切换演示侧栏')" @click="expanded = !(expanded ?? !props.parameters.collapsed)">
                <Icon name="lucide:panel-left" :size="14" />
              </Button>
              <strong>{{ kind === 'master-detail' || kind === 'split-pane' ? [text('设计系统'), text('前端词典'), text('数据看板')][selected] : text('工作台') }}</strong>
              <span>{{ text('今天，星期二') }}</span>
            </header>
            <div class="mini-stats">
              <div v-for="(stat, index) in ['总访问量', '活跃用户', '完成任务']" :key="stat">
                <span>{{ text(stat) }}</span>
                <b>{{ ['12,480', '1,286', '86'][index] }}</b>
                <small>↗ {{ [12.8, 8.2, 16][index] }}%</small>
              </div>
            </div>
            <div class="mini-table">
              <div class="mini-table-heading">
                {{ text('最近项目') }} <span>{{ text('状态') }}</span>
              </div>
              <div v-for="n in ['sidebar', 'sticky-header'].includes(kind) ? 12 : 3" :key="n" class="mini-row">
                <span class="mini-avatar" />
                <span>{{ [text('官网改版'), text('订单管理系统'), text('数据可视化')][(n - 1) % 3] }}</span>
                <em>{{ n % 2 ? text('进行中') : text('已完成') }}</em>
              </div>
            </div>
          </div>
          <aside v-if="kind === 'holy-grail'" class="mini-right">
            <strong>{{ text('动态') }}</strong>
            <div v-for="n in 4" :key="n" class="mini-line" />
          </aside>
        </div>
        <div v-if="kind === 'holy-grail'" class="mini-bottom">
          {{ text('© Workspace · 帮助中心') }}
        </div>
      </div>
    </template>
  </div>
</template>
