<script setup lang="ts">
import type { PreviewCustomer } from '../../lib/customer-preview'
import { computed, shallowRef, watch } from 'vue'
import { useGlossaryLocale } from '../../composables/use-glossary-locale'
import { customerStatuses } from '../../lib/customer-preview'
import { Button } from '../ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import CustomerPreviewFilters from './CustomerPreviewFilters.vue'

const props = defineProps<{ customers: PreviewCustomer[], selectedId?: number }>()
const emit = defineEmits<{ open: [customer: PreviewCustomer] }>()
const { text, isEnglish } = useGlossaryLocale()
const query = shallowRef('')
const status = shallowRef('all')
const owner = shallowRef('all')
const currentPage = shallowRef(1)
const pageSize = 5
const matches = computed(() => props.customers.filter(customer =>
  `${customer.name} ${customer.englishName} ${customer.contact} ${customer.englishContact}`.toLowerCase().includes(query.value.trim().toLowerCase())
  && (status.value === 'all' || customer.status === status.value)
  && (owner.value === 'all' || customer.owner === owner.value),
))
const pageCount = computed(() => Math.max(1, Math.ceil(matches.value.length / pageSize)))
const shown = computed(() => matches.value.slice((currentPage.value - 1) * pageSize, currentPage.value * pageSize))
// AI modified: new filters or customers must not leave the preview on an empty later page.
watch([
  query,
  status,
  owner,
  () => props.customers.length,
], () => {
  currentPage.value = 1
})
watch(pageCount, (count) => {
  currentPage.value = Math.min(currentPage.value, count)
})
</script>

<template>
  <section class="customer-preview-list" :aria-label="text('客户列表')">
    <CustomerPreviewFilters v-model:query="query" v-model:status="status" v-model:owner="owner" />
    <div class="customer-preview-table">
      <Table>
        <TableHeader><TableRow><TableHead>{{ text('客户名称') }}</TableHead><TableHead>{{ text('联系人') }}</TableHead><TableHead>{{ text('状态') }}</TableHead><TableHead>{{ text('最近联系') }}</TableHead></TableRow></TableHeader>
        <TableBody>
          <TableRow v-for="customer in shown" :key="customer.id" :data-state="selectedId === customer.id ? 'selected' : undefined">
            <TableCell>
              <button class="customer-name" :aria-label="`${text('查看客户')} ${isEnglish ? customer.englishName : customer.name}`" @click="emit('open', customer)">
                {{ isEnglish ? customer.englishName : customer.name }}
              </button>
            </TableCell>
            <TableCell>{{ isEnglish ? customer.englishContact : customer.contact }}</TableCell>
            <TableCell><span class="customer-status" :class="`status-${customer.status}`">{{ text(customerStatuses.find(entry => entry.id === customer.status)!.title) }}</span></TableCell>
            <TableCell>{{ text(customer.lastContact) }}</TableCell>
          </TableRow>
          <TableRow v-if="!shown.length">
            <TableCell :colspan="4">
              <div class="customer-empty" role="status">
                {{ text('没有匹配的客户，请调整筛选条件。') }}
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
    <footer class="customer-pagination">
      <p role="status">
        {{ isEnglish ? `${matches.length} customers · Page ${currentPage} of ${pageCount}` : `共 ${matches.length} 位客户 · 第 ${currentPage} / ${pageCount} 页` }}
      </p>
      <div>
        <Button variant="outline" :disabled="currentPage === 1" @click="currentPage--">
          {{ text('上一页') }}
        </Button>
        <Button variant="outline" :disabled="currentPage === pageCount" @click="currentPage++">
          {{ text('下一页') }}
        </Button>
      </div>
    </footer>
  </section>
</template>

<style scoped>
.customer-preview-list { display: flex; flex-direction: column; gap: 22px; }
.customer-preview-table { border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; background: #fff; }
.customer-preview-table :deep(table) { min-width: 620px; }
.customer-preview-table :deep(th) { padding: 17px 20px; color: #64748b; background: #f8fafc; font-size: 12px; font-weight: 500; }
.customer-preview-table :deep(td) { padding: 18px 20px; color: #475569; }
.customer-preview-table :deep(tr[data-state="selected"]) { background: #eff6ff; }
.customer-preview-table :deep(tbody tr:hover) { background: #f8fafc; }
.customer-name { text-align: left; font-weight: 500; cursor: pointer; color: #334155; }
.customer-name:hover { color: #2563eb; text-decoration: underline; }
.customer-status { font-size: 12px; color: #2563eb; }
.status-active { color: #047857; }.status-new { color: #64748b; }
.customer-empty { padding: 32px 0; text-align: center; }
.customer-pagination { display: flex; align-items: center; justify-content: space-between; gap: 16px; font-size: 12px; color: #64748b; }
.customer-pagination > div { display: flex; gap: 8px; }
@media (max-width: 540px) { .customer-pagination { align-items: start; flex-direction: column; }.customer-pagination :deep(button) { min-height: 44px; } }
</style>
