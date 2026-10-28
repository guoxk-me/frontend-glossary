<script setup lang="ts">
import type { DemoParameters } from '../../types/glossary'
import { computed, nextTick, shallowRef, useTemplateRef } from 'vue'
import { Icon } from '#components'
import { useGlossaryLocale } from '../../composables/use-glossary-locale'
import { Button } from '../ui/button'

const props = defineProps<{ parameters: DemoParameters }>()
const { text, isEnglish } = useGlossaryLocale()
const orders = [
  {
    id: '20261026',
    customer: '陈小雨',
    englishCustomer: 'Chen Xiaoyu',
    status: '待处理',
  },
  {
    id: '20261025',
    customer: '李明',
    englishCustomer: 'Li Ming',
    status: '已完成',
  },
  {
    id: '20261024',
    customer: '王海',
    englishCustomer: 'Wang Hai',
    status: '已完成',
  },
  {
    id: '20261023',
    customer: '张晨',
    englishCustomer: 'Zhang Chen',
    status: '已完成',
  },
]
const selectedOrder = shallowRef(orders[0]!)
const isOpen = shallowRef(true)
const query = shallowRef('')
const panel = useTemplateRef<HTMLElement>('panel')
const orderList = useTemplateRef<HTMLElement>('orderList')
let trigger: HTMLButtonElement | null = null
const shown = computed(() => orders.filter(order => `${order.id} ${order.customer} ${order.englishCustomer}`.toLowerCase().includes(query.value.trim().toLowerCase())))
const motion = computed(() => ({ '--drawer-duration': `${props.parameters.duration}ms`, '--drawer-easing': props.parameters.easing }))
async function openOrder(order: typeof orders[number], event: MouseEvent): Promise<void> {
  trigger = event.currentTarget as HTMLButtonElement
  selectedOrder.value = order
  isOpen.value = true
  await nextTick()
  if (panel.value)
    panel.value.inert = false
  panel.value?.querySelector('button')?.focus()
}
function closeOrder(): void {
  // AI modified: an embedded non-modal drawer preserves the list and returns focus to its order.
  const destination = trigger ?? orderList.value?.querySelector<HTMLButtonElement>('button[aria-expanded="true"]')
  if (panel.value)
    panel.value.inert = true
  isOpen.value = false
  destination?.focus()
}
</script>

<template>
  <div class="order-demo" :class="[{ 'is-open': isOpen }, `from-${parameters.direction}`]" :style="motion" @keydown.esc.stop="closeOrder">
    <section ref="orderList" class="order-list">
      <h3>{{ text('订单管理') }}</h3>
      <p>{{ text('选择一条订单查看详情') }}</p>
      <label class="order-search"><Icon name="lucide:search" :size="14" /><input v-model="query" :aria-label="text('搜索订单号或客户')" :placeholder="text('搜索订单号或客户')"></label>
      <table>
        <thead><tr><th>{{ text('订单编号') }}</th><th>{{ text('客户') }}</th><th>{{ text('状态') }}</th></tr></thead>
        <tbody>
          <tr v-for="order in shown" :key="order.id" :class="{ selected: isOpen && selectedOrder.id === order.id }">
            <td>
              <button :aria-label="`${text('查看订单')} #${order.id}`" :aria-expanded="isOpen && selectedOrder.id === order.id" @click="openOrder(order, $event)">
                #{{ order.id }}
              </button>
            </td>
            <td>{{ isEnglish ? order.englishCustomer : order.customer }}</td><td>{{ text(order.status) }}</td>
          </tr>
        </tbody>
      </table>
      <p v-if="!shown.length" role="status">
        {{ text('没有匹配的订单') }}
      </p>
      <div class="order-list-footer">
        {{ shown.length }} {{ text('条演示订单') }}
      </div>
    </section>
    <Transition name="order-drawer">
      <aside v-if="isOpen" ref="panel" class="order-panel" :aria-label="text('订单详情')">
        <header>
          <h3>{{ text('订单详情') }}</h3><Button variant="ghost" size="icon" :aria-label="text('关闭订单详情')" @click="closeOrder">
            <Icon name="lucide:x" :size="16" />
          </Button>
        </header>
        <strong>#{{ selectedOrder.id }}</strong>
        <dl><dt>{{ text('客户') }}</dt><dd>{{ isEnglish ? selectedOrder.englishCustomer : selectedOrder.customer }}</dd><dt>{{ text('当前状态') }}</dt><dd>{{ text(selectedOrder.status) }}</dd><dt>{{ text('创建时间') }}</dt><dd>2026-10-26</dd></dl>
        <div class="order-product">
          <h4>{{ text('商品信息') }}</h4><p>{{ text('专业版订阅 × 1') }}</p><strong>¥299.00</strong>
        </div>
        <Button variant="outline" @click="closeOrder">
          {{ text('返回列表') }}
        </Button>
      </aside>
    </Transition>
  </div>
</template>
