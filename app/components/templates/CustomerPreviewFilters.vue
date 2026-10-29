<script setup lang="ts">
import { useGlossaryLocale } from '../../composables/use-glossary-locale'
import { customerOwners, customerStatuses } from '../../lib/customer-preview'
import { Button } from '../ui/button'
import { Input } from '../ui/input'

const query = defineModel<string>('query', { required: true })
const status = defineModel<string>('status', { required: true })
const owner = defineModel<string>('owner', { required: true })
const { text, isEnglish } = useGlossaryLocale()
</script>

<template>
  <div class="customer-preview-filters">
    <Input v-model="query" type="search" :aria-label="text('搜索客户名称或联系人')" :placeholder="text('搜索客户名称或联系人')" />
    <select v-model="status" :aria-label="text('客户状态')">
      <option value="all">
        {{ text('全部状态') }}
      </option>
      <option v-for="entry in customerStatuses" :key="entry.id" :value="entry.id">
        {{ text(entry.title) }}
      </option>
    </select>
    <select v-model="owner" :aria-label="text('负责人')">
      <option value="all">
        {{ text('全部负责人') }}
      </option>
      <option v-for="entry in customerOwners" :key="entry.id" :value="entry.id">
        {{ isEnglish ? entry.english : entry.name }}
      </option>
    </select>
    <Button variant="ghost" :disabled="!query && status === 'all' && owner === 'all'" @click="query = ''; status = 'all'; owner = 'all'">
      {{ text('清除筛选') }}
    </Button>
  </div>
</template>

<style scoped>
.customer-preview-filters { display: grid; grid-template-columns: minmax(180px, 1.5fr) 1fr 1fr auto; gap: 14px; padding: 18px; border: 1px solid #e2e8f0; border-radius: 6px; background: #fff; }
.customer-preview-filters select { width: 100%; min-width: 0; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px 10px; background: #fff; font-size: 13px; }
.customer-preview-filters :deep(input) { height: 38px; background: #fff; }
@media (max-width: 900px) { .customer-preview-filters { grid-template-columns: 1fr 1fr; }.customer-preview-filters :deep(input) { grid-column: 1 / -1; } }
@media (max-width: 540px) { .customer-preview-filters { gap: 10px; padding: 12px; }.customer-preview-filters :deep(input), .customer-preview-filters select { min-height: 44px; } }
</style>
