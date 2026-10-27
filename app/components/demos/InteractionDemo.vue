<script setup lang="ts">
import type { DemoParameters } from '../../types/glossary'
import { ArrowUpRight, ChevronDown, Search } from '@lucide/vue'
import { shallowRef } from 'vue'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Input } from '../ui/input'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet'

const props = defineProps<{ kind: string, parameters: DemoParameters, compact?: boolean }>()
const activeTab = shallowRef('概览')
const count = shallowRef(3)
const command = shallowRef('')
const selected = shallowRef('')
const tabLabels = ['概览', '成员', '设置']
// AI modified: keyboard tab changes move focus with selection, matching the visible tab state.
function moveTab(event: KeyboardEvent, index: number): void {
  const next = (index + tabLabels.length) % tabLabels.length
  activeTab.value = tabLabels[next]!
  const current = event.currentTarget as HTMLElement
  current.parentElement?.querySelector<HTMLButtonElement>(`#demo-tab-${next}`)?.focus()
}
</script>

<template>
  <div class="interaction-demo" :class="{ compact }">
    <template v-if="compact">
      <div class="interaction-mini">
        <span class="demo-annotation">{{ kind.toUpperCase().replace('-', ' ') }}</span>
        <template v-if="kind === 'drawer' || kind === 'modal'">
          <div v-for="n in 3" :key="n" class="mini-row">
            <span class="mini-avatar" />
            <span>项目 {{ n }}</span>
            <em>查看</em>
          </div>
          <div :class="kind === 'drawer' ? 'mock-drawer' : 'mock-modal'">
            <strong>订单详情</strong>
            <div class="mini-line" />
            <div class="mini-line short" />
            <span class="tiny-muted">保留当前上下文</span>
          </div>
        </template>
        <template v-else-if="kind === 'command'">
          <div class="mock-command">
            <Search :size="13" />
            <span>搜索命令…</span>
            <div>↗ 打开项目</div>
            <div>⌘ 切换工作空间</div>
          </div>
        </template>
        <template v-else-if="kind === 'tabs'">
          <div class="demo-tablist">
            <span class="selected">概览</span>
            <span>成员</span>
            <span>设置</span>
          </div>
          <div class="mini-stats">
            <div>
              <b>12,480</b>
              <span>总访问量</span>
            </div>
          </div>
        </template>
        <template v-else-if="kind === 'disclosure'">
          <div class="demo-disclosure">
            <strong>如何开始使用？ ⌄</strong>
            <p>从选择一个词条开始。</p>
          </div>
          <div class="demo-disclosure">
            数据保存在哪里？ ﹢
          </div>
        </template>
        <template v-else-if="kind === 'load-more'">
          <div v-for="n in 3" :key="n" class="mini-line" />
          <div class="mock-button">
            加载更多 ↓
          </div>
        </template>
        <template v-else>
          <div class="mock-float">
            {{ kind === 'tooltip' ? '查看项目的详细信息' : '项目设置 · 公开可见' }}
          </div>
          <div class="mock-button">
            {{ kind === 'tooltip' ? '悬停提示' : '打开浮层' }}
          </div>
        </template>
      </div>
    </template>
    <template v-else>
      <Sheet v-if="kind === 'drawer'">
        <div class="demo-order">
          <span class="mini-avatar" />
          <div>
            <strong>订单 #20261027</strong>
            <p>前端词典 · 专业版</p>
          </div>
          <SheetTrigger as-child>
            <Button variant="outline">
              查看订单
            </Button>
          </SheetTrigger>
        </div>
        <SheetContent :side="parameters.direction" :style="{ animationDuration: `${parameters.duration}ms`, animationTimingFunction: parameters.easing }">
          <SheetHeader>
            <SheetTitle>订单详情</SheetTitle>
            <SheetDescription>订单 #20261027 · 保留列表上下文</SheetDescription>
          </SheetHeader>
          <div class="p-6 space-y-6">
            <p>这是一个从侧边打开的抽屉。按 Esc、点击遮罩或关闭按钮返回原列表。</p>
            <dl class="space-y-3">
              <dt>项目</dt>
              <dd>前端词典</dd>
              <dt>状态</dt>
              <dd>进行中</dd>
            </dl>
          </div>
        </SheetContent>
      </Sheet>
      <Dialog v-else-if="kind === 'modal'">
        <DialogTrigger as-child>
          <Button>预览确认弹窗</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>发布这个项目？</DialogTitle>
            <DialogDescription>模态弹窗会暂时聚焦当前任务。这里是演示，不会真正发布。</DialogDescription>
          </DialogHeader>
          <p>按 Esc 或点击关闭按钮退出，焦点将回到触发按钮。</p>
        </DialogContent>
      </Dialog>
      <Dialog v-else-if="kind === 'command'">
        <DialogTrigger as-child>
          <Button variant="outline">
            <Search />打开命令面板
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>搜索命令</DialogTitle>
            <DialogDescription>输入名称筛选，再选择一项演示命令。</DialogDescription>
          </DialogHeader>
          <Input v-model="command" aria-label="搜索演示命令" placeholder="搜索项目、设置…" />
          <Button v-for="label in ['打开项目', '邀请成员', '工作空间设置'].filter(label => label.includes(command))" :key="label" variant="ghost" class="justify-between" @click="selected = label">
            {{ label }}<ArrowUpRight />
          </Button>
          <p role="status">
            {{ selected ? `已选择：${selected}（演示）` : '支持 Tab 切换和 Enter 选择。' }}
          </p>
        </DialogContent>
      </Dialog>
      <div v-else-if="kind === 'tooltip'" class="tooltip-example">
        <Button variant="outline" aria-describedby="demo-tooltip">
          悬停或聚焦我
        </Button>
        <span id="demo-tooltip" role="tooltip">查看项目的详细信息</span>
      </div>
      <details v-else-if="kind === 'popover'" class="popover-example">
        <summary class="mock-button">
          项目设置 <ChevronDown :size="14" />
        </summary>
        <div class="popover-content">
          <strong>可见范围</strong>
          <label>
            <input type="radio" name="visibility" checked> 公开可见</label>
          <label>
            <input type="radio" name="visibility"> 仅团队可见</label>
          <p>再次点击按钮收起浮层。</p>
        </div>
      </details>
      <div v-else-if="kind === 'disclosure'" class="disclosure-example">
        <details open>
          <summary>如何开始使用？</summary>
          <p>浏览词条、调整演示参数，再加入方案。</p>
        </details>
        <details>
          <summary>数据保存在哪里？</summary>
          <p>收藏和方案只保存在当前浏览器。</p>
        </details>
      </div>
      <div v-else-if="kind === 'tabs'" class="tabs-example">
        <div class="demo-tablist" role="tablist" aria-label="演示项目内容">
          <button v-for="(label, index) in ['概览', '成员', '设置']" :id="`demo-tab-${index}`" :key="label" role="tab" :aria-selected="activeTab === label" :aria-controls="`demo-panel-${index}`" :tabindex="activeTab === label ? 0 : -1" :class="{ selected: activeTab === label }" @click="activeTab = label" @keydown.right.prevent="moveTab($event, index + 1)" @keydown.left.prevent="moveTab($event, index - 1)" @keydown.home.prevent="moveTab($event, 0)" @keydown.end.prevent="moveTab($event, 2)">
            {{ label }}
          </button>
        </div>
        <div v-for="(label, index) in ['概览', '成员', '设置']" v-show="activeTab === label" :id="`demo-panel-${index}`" :key="label" role="tabpanel" :aria-labelledby="`demo-tab-${index}`" tabindex="0" class="demo-tab-panel">
          <strong>{{ ['项目进展 86%', '团队成员 6 人', '通知设置'][index] }}</strong>
          <p>{{ ['所有任务正在有序进行。', '每个角色，都有自己的职责。', '按需接收项目动态。'][index] }}</p>
        </div>
      </div>
      <div v-else-if="kind === 'load-more'" class="load-more-example">
        <div v-for="n in count" :key="n" class="mini-row">
          <span class="mini-avatar" />
          <span>项目记录 {{ n }}</span>
          <span class="tiny-muted">已完成</span>
        </div>
        <Button v-if="count < 9" variant="outline" class="mt-4 w-full" @click="count += 3">
          加载更多
        </Button>
        <p v-else role="status" class="text-center mt-4 text-sm">
          已展示全部 9 条
        </p>
      </div>
      <p class="interaction-caption">
        {{ props.kind === 'drawer' ? '点击查看订单，感受上下文保留。' : '试着操作，理解这个交互模式。' }}
      </p>
    </template>
  </div>
</template>
