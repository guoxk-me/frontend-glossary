<script setup lang="ts">
import type { DemoParameters } from '../../types/glossary'
import { shallowRef, useId } from 'vue'
import { Icon } from '#components'
import { useGlossaryLocale } from '../../composables/use-glossary-locale'
import { releaseLeavingRow, retainLeavingRow } from '../../lib/list-motion'
import CollapsePanel from '../CollapsePanel.vue'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion'
import { Button } from '../ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Field, FieldLabel } from '../ui/field'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { RadioGroup, RadioGroupItem } from '../ui/radio-group'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'
import DrawerDemo from './DrawerDemo.vue'

const props = defineProps<{ kind: string, parameters: DemoParameters, compact?: boolean }>()

const { text, isEnglish } = useGlossaryLocale()

const id = useId()
const isPopoverOpen = shallowRef(false)
const disclosureOpen = shallowRef(['0'])
const visibility = shallowRef('public')
const activeTab = shallowRef('概览')
const count = shallowRef(3)
const command = shallowRef('')
const selected = shallowRef('')
const tabLabels = ['概览', '成员', '设置']
// AI modified: Reka primitives coordinate focus, Escape and arrow keys with each visible state.
</script>

<template>
  <div class="interaction-demo" :class="{ compact, 'drawer-preview': kind === 'drawer' && !compact }">
    <template v-if="compact">
      <div class="interaction-mini">
        <span class="demo-annotation">{{ kind.toUpperCase().replace('-', ' ') }}</span>
        <template v-if="kind === 'drawer' || kind === 'modal'">
          <div v-for="n in 3" :key="n" class="mini-row">
            <span class="mini-avatar" />
            <span>{{ text('项目') }} {{ n }}</span>
            <em>{{ text('查看') }}</em>
          </div>
          <div :class="kind === 'drawer' ? 'mock-drawer' : 'mock-modal'">
            <strong>{{ text('订单详情') }}</strong>
            <div class="mini-line" />
            <div class="mini-line short" />
            <span class="tiny-muted">{{ text('保留当前上下文') }}</span>
          </div>
        </template>
        <template v-else-if="kind === 'command'">
          <div class="mock-command">
            <Icon name="lucide:search" :size="13" />
            <span>{{ text('搜索命令…') }}</span>
            <div>{{ text('↗ 打开项目') }}</div>
            <div>{{ text('⌘ 切换工作空间') }}</div>
          </div>
        </template>
        <template v-else-if="kind === 'tabs'">
          <div class="demo-tablist">
            <span class="selected">{{ text('概览') }}</span>
            <span>{{ text('成员') }}</span>
            <span>{{ text('设置') }}</span>
          </div>
          <div class="mini-stats">
            <div>
              <b>12,480</b>
              <span>{{ text('总访问量') }}</span>
            </div>
          </div>
        </template>
        <template v-else-if="kind === 'disclosure'">
          <div class="demo-disclosure">
            <strong>{{ text('如何开始使用？ ⌄') }}</strong>
            <p>{{ text('从选择一个词条开始。') }}</p>
          </div>
          <div class="demo-disclosure">
            {{ text('数据保存在哪里？ ﹢') }}
          </div>
        </template>
        <template v-else-if="kind === 'load-more'">
          <div v-for="n in 3" :key="n" class="mini-line" />
          <div class="mock-button">
            {{ text('加载更多 ↓') }}
          </div>
        </template>
        <template v-else>
          <div class="mock-float">
            {{ kind === 'tooltip' ? text('查看项目的详细信息') : text('项目设置 · 公开可见') }}
          </div>
          <div class="mock-button">
            {{ kind === 'tooltip' ? text('悬停提示') : text('打开浮层') }}
          </div>
        </template>
      </div>
    </template>
    <template v-else>
      <DrawerDemo v-if="kind === 'drawer'" :parameters="parameters" />
      <Dialog v-else-if="kind === 'modal'">
        <DialogTrigger as-child>
          <Button>{{ text('预览确认弹窗') }}</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{{ text('发布这个项目？') }}</DialogTitle>
            <DialogDescription>{{ text('模态弹窗会暂时聚焦当前任务。这里是演示，不会真正发布。') }}</DialogDescription>
          </DialogHeader>
          <p>{{ text('按 Esc 或点击关闭按钮退出，焦点将回到触发按钮。') }}</p>
        </DialogContent>
      </Dialog>
      <Dialog v-else-if="kind === 'command'">
        <DialogTrigger as-child>
          <Button variant="outline">
            <Icon name="lucide:search" />{{ text('打开命令面板') }}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{{ text('搜索命令') }}</DialogTitle>
            <DialogDescription>{{ text('输入名称筛选，再选择一项演示命令。') }}</DialogDescription>
          </DialogHeader>
          <Command>
            <CommandInput v-model="command" :aria-label="text('搜索演示命令')" :placeholder="text('搜索项目、设置…')" />
            <CommandList>
              <CommandEmpty>{{ text('没有找到匹配的词条') }}</CommandEmpty><CommandGroup>
                <CommandItem v-for="label in ['打开项目', '邀请成员', '工作空间设置']" :key="label" :value="label" @select="selected = label">
                  {{ text(label) }}<Icon name="lucide:arrow-up-right" />
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
          <p role="status">
            {{ selected ? (isEnglish ? `Selected: ${text(selected)} (demo)` : `已选择：${selected}（演示）`) : text('支持 Tab 切换和 Enter 选择。') }}
          </p>
        </DialogContent>
      </Dialog>
      <TooltipProvider v-else-if="kind === 'tooltip'">
        <Tooltip>
          <TooltipTrigger as-child>
            <Button variant="outline">
              {{ text('悬停或聚焦我') }}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{{ text('查看项目的详细信息') }}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <Popover v-else-if="kind === 'popover'" v-model:open="isPopoverOpen">
        <PopoverTrigger as-child>
          <Button variant="outline">
            {{ text('项目设置') }}<Icon name="lucide:chevron-down" class="motion-chevron" :class="{ 'rotate-180': isPopoverOpen }" />
          </Button>
        </PopoverTrigger>
        <PopoverContent class="w-64">
          <strong>{{ text('可见范围') }}</strong>
          <RadioGroup v-model="visibility" class="my-4" :aria-label="text('可见范围')">
            <Field orientation="horizontal">
              <RadioGroupItem :id="`${id}-public`" value="public" /><FieldLabel :for="`${id}-public`">
                {{ text('公开可见') }}
              </FieldLabel>
            </Field>
            <Field orientation="horizontal">
              <RadioGroupItem :id="`${id}-team`" value="team" /><FieldLabel :for="`${id}-team`">
                {{ text('仅团队可见') }}
              </FieldLabel>
            </Field>
          </RadioGroup>
          <p class="text-sm text-muted-foreground">
            {{ text('再次点击按钮收起浮层。') }}
          </p>
        </PopoverContent>
      </Popover>
      <Accordion v-else-if="kind === 'disclosure'" v-model="disclosureOpen" type="multiple" class="w-full max-w-sm">
        <AccordionItem v-for="(label, index) in ['如何开始使用？', '数据保存在哪里？']" :key="label" :value="String(index)">
          <AccordionTrigger>{{ text(label) }}</AccordionTrigger>
          <AccordionContent force-mount :style="{ animation: 'none' }" class="p-0">
            <CollapsePanel :open="disclosureOpen.includes(String(index))">
              <div class="pb-3">
                {{ text(index === 0 ? '浏览词条、调整演示参数，再加入方案。' : '收藏和方案只保存在当前浏览器。') }}
              </div>
            </CollapsePanel>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <Tabs v-else-if="kind === 'tabs'" v-model="activeTab" class="w-full max-w-sm">
        <TabsList :aria-label="text('演示项目内容')">
          <TabsTrigger v-for="label in tabLabels" :key="label" :value="label">
            {{ text(label) }}
          </TabsTrigger>
        </TabsList>
        <TabsContent v-for="(label, index) in tabLabels" :key="label" :value="label" class="demo-tab-panel">
          <strong>{{ [text('项目进展 86%'), text('团队成员 6 人'), text('通知设置')][index] }}</strong>
          <p>{{ [text('所有任务正在有序进行。'), text('每个角色，都有自己的职责。'), text('按需接收项目动态。')][index] }}</p>
        </TabsContent>
      </Tabs>
      <div v-else-if="kind === 'load-more'" class="load-more-example">
        <TransitionGroup name="list" tag="div" class="motion-list" @before-leave="retainLeavingRow" @after-leave="releaseLeavingRow" @before-enter="releaseLeavingRow">
          <div v-for="n in count" :key="n" class="mini-row">
            <span class="mini-avatar" />
            <span>{{ text('项目') }} {{ n }}</span>
            <span class="tiny-muted">{{ text('已完成') }}</span>
          </div>
        </TransitionGroup>
        <Button variant="outline" class="mt-4 w-full" :aria-disabled="count >= 9" @click="count = Math.min(9, count + 3)">
          {{ text(count < 9 ? '加载更多' : '已展示全部 9 条') }}
        </Button>
        <p v-if="count >= 9" role="status" class="text-center mt-4 text-sm">
          {{ text('已展示全部 9 条') }}
        </p>
      </div>
      <p class="interaction-caption">
        {{ props.kind === 'drawer' ? text('点击查看订单，感受上下文保留。') : text('试着操作，理解这个交互模式。') }}
      </p>
    </template>
  </div>
</template>
