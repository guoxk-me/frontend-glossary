<script setup lang="ts">
import type { CustomerDraft, CustomerStatus, PreviewCustomer } from '../../lib/customer-preview'
import { computed, shallowRef, watch } from 'vue'
import { useGlossaryLocale } from '../../composables/use-glossary-locale'
import { customerOwners, customerStatuses } from '../../lib/customer-preview'
import { Button } from '../ui/button'
import { Field, FieldLabel } from '../ui/field'
import { Input } from '../ui/input'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../ui/sheet'

const props = defineProps<{ mode: 'create' | 'detail' | null, customer?: PreviewCustomer }>()
const emit = defineEmits<{ close: [], create: [draft: CustomerDraft], status: [status: CustomerStatus] }>()
const { text, isEnglish } = useGlossaryLocale()
const name = shallowRef('')
const contact = shallowRef('')
const owner = shallowRef('lin')
const status = shallowRef<CustomerStatus>('new')
const error = shallowRef('')
const customerOwner = computed(() => customerOwners.find(entry => entry.id === props.customer?.owner))
watch(() => [props.mode, props.customer?.id], () => {
  name.value = ''
  contact.value = ''
  owner.value = 'lin'
  status.value = props.mode === 'detail'
    ? props.customer?.status ?? 'new'
    : 'new'
  error.value = ''
})
function createCustomer(): void {
  if (!name.value.trim() || !contact.value.trim()) {
    error.value = '请填写客户名称和联系人。'
    return
  }
  emit('create', {
    name: name.value.trim(),
    contact: contact.value.trim(),
    owner: owner.value,
    status: status.value,
  })
}
</script>

<template>
  <Sheet :open="mode !== null" @update:open="open => { if (!open) emit('close') }">
    <SheetContent class="customer-preview-theme customer-preview-panel" side="right">
      <SheetHeader>
        <SheetTitle>{{ text(mode === 'create' ? '新增客户' : '客户详情') }}</SheetTitle>
        <SheetDescription>{{ text('演示数据仅在本次预览中有效。') }}</SheetDescription>
      </SheetHeader>
      <form v-if="mode === 'create'" class="customer-panel-form" @submit.prevent="createCustomer">
        <Field>
          <FieldLabel for="preview-customer-name">
            {{ text('客户名称') }}
          </FieldLabel><Input id="preview-customer-name" v-model="name" maxlength="80" required />
        </Field>
        <Field>
          <FieldLabel for="preview-customer-contact">
            {{ text('联系人') }}
          </FieldLabel><Input id="preview-customer-contact" v-model="contact" maxlength="40" required />
        </Field>
        <Field>
          <FieldLabel for="preview-customer-owner">
            {{ text('负责人') }}
          </FieldLabel><select id="preview-customer-owner" v-model="owner">
            <option v-for="entry in customerOwners" :key="entry.id" :value="entry.id">
              {{ isEnglish ? entry.english : entry.name }}
            </option>
          </select>
        </Field>
        <Field>
          <FieldLabel for="preview-customer-status">
            {{ text('客户状态') }}
          </FieldLabel><select id="preview-customer-status" v-model="status">
            <option v-for="entry in customerStatuses" :key="entry.id" :value="entry.id">
              {{ text(entry.title) }}
            </option>
          </select>
        </Field>
        <p v-if="error" role="alert">
          {{ text(error) }}
        </p>
        <div class="customer-panel-actions">
          <Button type="button" variant="outline" @click="emit('close')">
            {{ text('取消') }}
          </Button><Button type="submit">
            {{ text('添加客户') }}
          </Button>
        </div>
      </form>
      <div v-else-if="customer" class="customer-panel-form">
        <h3 class="text-xl font-semibold">
          {{ isEnglish ? customer.englishName : customer.name }}
        </h3>
        <dl class="customer-facts">
          <dt>{{ text('联系人') }}</dt><dd>{{ isEnglish ? customer.englishContact : customer.contact }}</dd><dt>{{ text('负责人') }}</dt><dd>{{ isEnglish ? customerOwner?.english : customerOwner?.name }}</dd><dt>{{ text('最近联系') }}</dt><dd>{{ text(customer.lastContact) }}</dd>
        </dl>
        <Field>
          <FieldLabel for="preview-customer-status">
            {{ text('客户状态') }}
          </FieldLabel><select id="preview-customer-status" v-model="status">
            <option v-for="entry in customerStatuses" :key="entry.id" :value="entry.id">
              {{ text(entry.title) }}
            </option>
          </select>
        </Field>
        <Button :disabled="status === customer.status" @click="emit('status', status)">
          {{ text('更新状态') }}
        </Button>
      </div>
    </SheetContent>
  </Sheet>
</template>

<style scoped>
:global(.customer-preview-panel[data-slot="sheet-content"]) { width: min(440px, 100vw); max-width: none; overflow-y: auto; }
.customer-panel-form { padding: 8px 24px 24px; display: flex; flex-direction: column; gap: 24px; }
.customer-panel-form select { background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; width: 100%; }
.customer-panel-form :deep(input) { background: #fff; min-height: 42px; }
.customer-panel-actions { display: flex; justify-content: end; gap: 10px; }
.customer-facts { display: grid; grid-template-columns: 90px 1fr; gap: 18px; font-size: 14px; }.customer-facts dt { color: #64748b; }
</style>
