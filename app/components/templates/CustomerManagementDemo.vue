<script setup lang="ts">
import type { CustomerDraft, CustomerStatus, PreviewCustomer } from '../../lib/customer-preview'
import { useMediaQuery } from '@vueuse/core'
import { computed, shallowRef } from 'vue'
import { Icon } from '#components'
import { useGlossaryLocale } from '../../composables/use-glossary-locale'
import { customerStatuses, previewCustomers } from '../../lib/customer-preview'
import { Button } from '../ui/button'
import CustomerPreviewPanel from './CustomerPreviewPanel.vue'
import CustomerPreviewTable from './CustomerPreviewTable.vue'

const { text, isEnglish } = useGlossaryLocale()
const isCompact = useMediaQuery('(max-width: 760px)')
const isCollapsed = shallowRef(false)
const isMobileMenuOpen = shallowRef(false)
const section = shallowRef<'overview' | 'customers' | 'activity'>('customers')
const customers = shallowRef<PreviewCustomer[]>([...previewCustomers])
const panelMode = shallowRef<'create' | 'detail' | null>(null)
const selectedId = shallowRef<number>()
const selected = computed(() => customers.value.find(customer => customer.id === selectedId.value))
const activities = shallowRef<{ id: number, customer: string, englishCustomer: string, action: string }[]>([])
const feedback = shallowRef('')
function openCustomer(customer: PreviewCustomer): void {
  selectedId.value = customer.id
  panelMode.value = 'detail'
}
function createCustomer(draft: CustomerDraft): void {
  // AI modified: preview actions mutate only this mounted session, never plans or authored content.
  const customer: PreviewCustomer = {
    id: Math.max(...customers.value.map(customer => customer.id)) + 1,
    ...draft,
    englishName: draft.name,
    englishContact: draft.contact,
    lastContact: '刚刚',
  }
  customers.value = [customer, ...customers.value]
  selectedId.value = customer.id
  activities.value = [
    {
      id: activities.value.length + 1,
      customer: customer.name,
      englishCustomer: customer.englishName,
      action: '添加了客户',
    },
    ...activities.value,
  ]
  feedback.value = '客户已加入演示列表。'
  panelMode.value = null
  section.value = 'customers'
}
function changeStatus(status: CustomerStatus): void {
  const customer = selected.value
  if (!customer)
    return
  customers.value = customers.value.map(saved => saved.id === customer.id
    ? { ...saved, status, lastContact: '刚刚' }
    : saved)
  activities.value = [
    {
      id: activities.value.length + 1,
      customer: customer.name,
      englishCustomer: customer.englishName,
      action: '更新了客户状态',
    },
    ...activities.value,
  ]
  feedback.value = '客户状态已更新。'
  panelMode.value = null
}
function toggleSidebar(): void {
  if (isCompact.value)
    isMobileMenuOpen.value = !isMobileMenuOpen.value
  else
    isCollapsed.value = !isCollapsed.value
}
</script>

<template>
  <div class="customer-preview-theme customer-workspace" :class="{ 'sidebar-collapsed': isCollapsed, 'mobile-menu-open': isMobileMenuOpen }">
    <button v-if="isMobileMenuOpen && isCompact" class="customer-nav-backdrop" :aria-label="text('关闭导航')" @click="isMobileMenuOpen = false" />
    <aside id="customer-preview-nav" class="customer-sidebar" :inert="isCompact && !isMobileMenuOpen">
      <strong class="customer-brand"><span class="brand-mark">A</span><span class="sidebar-label">ACME {{ text('工作台') }}</span></strong>
      <p class="sidebar-label workspace-caption">
        {{ text('工作空间') }}
      </p>
      <nav :aria-label="text('演示导航')">
        <button :class="{ active: section === 'overview' }" :aria-label="text('工作概览')" :aria-current="section === 'overview' ? 'page' : undefined" @click="section = 'overview'; isMobileMenuOpen = false">
          <Icon name="lucide:layout-dashboard" /><span class="sidebar-label">{{ text('工作概览') }}</span>
        </button>
        <button :class="{ active: section === 'customers' }" :aria-label="text('客户管理')" :aria-current="section === 'customers' ? 'page' : undefined" @click="section = 'customers'; isMobileMenuOpen = false">
          <Icon name="lucide:users" /><span class="sidebar-label">{{ text('客户管理') }}</span>
        </button>
        <button :class="{ active: section === 'activity' }" :aria-label="text('活动记录')" :aria-current="section === 'activity' ? 'page' : undefined" @click="section = 'activity'; isMobileMenuOpen = false">
          <Icon name="lucide:history" /><span class="sidebar-label">{{ text('活动记录') }}</span>
        </button>
      </nav>
      <div class="customer-sidebar-foot sidebar-label">
        {{ text('演示工作空间') }}
      </div>
    </aside>
    <main class="customer-content">
      <header class="customer-page-header">
        <div class="customer-page-heading">
          <Button variant="outline" size="icon" :aria-label="text('切换侧栏')" :aria-expanded="isCompact ? isMobileMenuOpen : !isCollapsed" aria-controls="customer-preview-nav" @click="toggleSidebar">
            <Icon name="lucide:panel-left" />
          </Button>
          <div><h2>{{ text(section === 'customers' ? '客户管理' : section === 'overview' ? '工作概览' : '活动记录') }}</h2><p>{{ text('统一查看客户，保持清晰的工作视图') }}</p></div>
        </div>
        <Button v-if="section === 'customers'" @click="panelMode = 'create'">
          <Icon name="lucide:plus" />{{ text('新增客户') }}
        </Button>
      </header>
      <p v-if="feedback" class="customer-feedback" role="status">
        {{ text(feedback) }}
      </p>
      <CustomerPreviewTable v-show="section === 'customers'" :customers="customers" :selected-id="selectedId" @open="openCustomer" />
      <section v-if="section === 'overview'" class="customer-overview">
        <p>{{ text('客户总数') }} <strong>{{ customers.length }}</strong></p>
        <div class="customer-overview-counts">
          <p v-for="status in customerStatuses" :key="status.id">
            {{ text(status.title) }}<strong>{{ customers.filter(customer => customer.status === status.id).length }}</strong>
          </p>
        </div>
        <Button variant="outline" @click="section = 'customers'">
          {{ text('查看客户列表') }}
        </Button>
      </section>
      <section v-if="section === 'activity'" class="customer-activity">
        <p v-if="!activities.length">
          {{ text('暂无活动。试着新增客户或更新客户状态。') }}
        </p>
        <ol v-else>
          <li v-for="activity in activities" :key="activity.id">
            <strong>{{ isEnglish ? activity.englishCustomer : activity.customer }}</strong><span>{{ text(activity.action) }}</span>
          </li>
        </ol>
      </section>
    </main>
    <CustomerPreviewPanel :mode="panelMode" :customer="selected" @close="panelMode = null" @create="createCustomer" @status="changeStatus" />
  </div>
</template>

<style scoped>
/* AI modified: the authored light template remains light even inside a dark glossary shell. */
:global(.customer-preview-theme) { color-scheme: light; color: #0f172a; --background: #f8fafc; --foreground: #0f172a; --popover: #fff; --popover-foreground: #0f172a; --muted: #f1f5f9; --muted-foreground: #64748b; --border: #e2e8f0; --input: #e2e8f0; --primary: #0f172a; --primary-foreground: #fff; --accent: #eff6ff; --accent-foreground: #1d4ed8; --ring: #93c5fd; }
.customer-workspace { display: flex; width: 100%; height: 100%; overflow: hidden; position: relative; background: #f8fafc; text-align: left; }
.customer-sidebar { width: 220px; flex: none; background: #fff; border-right: 1px solid #e2e8f0; display: flex; flex-direction: column; padding: 28px 18px; overflow-y: auto; }
.customer-brand { display: flex; align-items: center; gap: 10px; white-space: nowrap; font-size: 17px; }
.brand-mark { width: 30px; height: 30px; flex: none; display: grid; place-items: center; background: #0f172a; color: white; border-radius: 6px; font-size: 14px; }
.workspace-caption { margin: 34px 12px 14px; font-size: 12px; color: #94a3b8; }
.customer-sidebar nav { display: flex; flex-direction: column; gap: 8px; margin-top: 12px; }
.customer-sidebar nav button { display: flex; align-items: center; gap: 12px; width: 100%; padding: 12px; min-height: 44px; color: #64748b; font-size: 14px; text-align: left; cursor: pointer; border-radius: 6px; }
.customer-sidebar nav button:hover { background: #f8fafc; }.customer-sidebar nav button.active { color: #2563eb; background: #eff6ff; }
.customer-sidebar nav :deep(svg) { width: 19px; height: 19px; flex: none; }
.customer-sidebar-foot { margin-top: auto; padding: 30px 12px 0; font-size: 11px; color: #94a3b8; }
.customer-content { flex: 1; min-width: 0; overflow-y: auto; padding: 40px; }
.customer-page-header { display: flex; align-items: center; justify-content: space-between; gap: 20px; margin-bottom: 28px; }
.customer-page-heading { display: flex; align-items: start; gap: 14px; }.customer-page-heading :deep(button) { margin-top: 4px; }
.customer-page-heading h2 { font-size: 28px; font-weight: 650; line-height: 1.3; letter-spacing: -.03em; }.customer-page-heading p { font-size: 13px; color: #94a3b8; margin-top: 8px; }
.customer-feedback { margin-bottom: 18px; font-size: 13px; color: #047857; }
.sidebar-collapsed .customer-sidebar { width: 72px; padding-left: 14px; padding-right: 14px; }.sidebar-collapsed .sidebar-label { display: none; }
.customer-overview, .customer-activity { background: #fff; padding: 28px; border: 1px solid #e2e8f0; border-radius: 6px; }
.customer-overview > p strong { display: block; font-size: 48px; margin-top: 14px; }.customer-overview-counts { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; border-top: 1px solid #e2e8f0; padding-top: 24px; margin: 24px 0; color: #64748b; font-size: 13px; }.customer-overview-counts strong { display: block; font-size: 25px; color: #0f172a; }
.customer-activity li { display: flex; justify-content: space-between; gap: 20px; padding: 20px 0; border-bottom: 1px solid #e2e8f0; }.customer-activity li span, .customer-activity > p { color: #64748b; }
.customer-nav-backdrop { position: absolute; inset: 0; background: #0f172a55; z-index: 1; }
@media (max-width: 1000px) { .customer-content { padding: 28px; }.customer-sidebar { width: 190px; } }
@media (max-width: 760px) {
  .customer-sidebar { display: none; }.mobile-menu-open .customer-sidebar { display: flex; position: absolute; inset: 0 auto 0 0; z-index: 2; width: 220px; }.mobile-menu-open .sidebar-label { display: initial; }
  .customer-content { padding: 22px 16px; }.customer-page-header { align-items: start; flex-direction: column; gap: 18px; }.customer-page-heading h2 { font-size: 24px; }.customer-page-heading p { max-width: 240px; }.customer-content :deep([data-slot="button"]) { min-height: 40px; }
}
</style>
