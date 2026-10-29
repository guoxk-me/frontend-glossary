<script setup lang="ts">
import type { Locale } from '../../types/glossary'
import type { TemplateDecision, TemplateSelection } from '../../types/template'
import { computed, shallowRef, watch } from 'vue'
import { Icon } from '#components'
import { navigateTo } from '#imports'
import { useCatalog } from '../../composables/use-catalog'
import { useGlossaryLocale } from '../../composables/use-glossary-locale'
import { adoptTemplateSelection, describeTemplate, hasTemplateOverlap } from '../../lib/templates'
import { useLibraryStore } from '../../stores/library'
import { Alert, AlertDescription, AlertTitle } from '../ui/alert'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Field, FieldGroup, FieldLabel } from '../ui/field'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

const props = defineProps<{ selection: TemplateSelection, outputLocale: Locale, schemeId?: string, isEditing?: boolean, disabled?: boolean }>()
const { text, isEnglish, localePath } = useGlossaryLocale()
const { terms } = useCatalog()
const library = useLibraryStore()
const isOpen = shallowRef(false)
const destination = shallowRef('new')
const title = shallowRef('Customer workspace')
const pendingId = shallowRef('')
const error = shallowRef('')
const decision = shallowRef<TemplateDecision | ''>('')
const scheme = computed(() => library.schemes.find(scheme => scheme.id === destination.value))
const language = computed(() => scheme.value?.outputLocale ?? props.outputLocale)
// AI modified: the preview must reflect keeping existing regions rather than promising discarded changes.
const effectiveSelection = computed(() => {
  if (decision.value !== 'keep' || !scheme.value)
    return props.selection
  const preview = {
    ...scheme.value,
    templateSelections: [
      ...(scheme.value.templateSelections ?? []),
    ],
  }
  const incoming = { ...props.selection, id: pendingId.value }
  adoptTemplateSelection(preview, incoming, 'keep')
  return preview.templateSelections?.find(saved => saved.id === incoming.id) ?? { ...incoming, regions: [] }
})
const candidate = computed(() => effectiveSelection.value.regions.length
  ? describeTemplate(effectiveSelection.value, language.value)
  : text('所选区域均已存在，将保留原方案，不追加内容。'))
const hasOverlap = computed(() => !props.isEditing && !!scheme.value && hasTemplateOverlap(scheme.value, props.selection))
watch(isOpen, (open) => {
  if (open) {
    destination.value = props.schemeId || 'new'
    error.value = ''
    decision.value = ''
    pendingId.value = props.isEditing
      ? props.selection.id
      : crypto.randomUUID()
  }
})
watch(destination, () => {
  decision.value = ''
  error.value = ''
})
function adopt(): void {
  error.value = ''
  if (!props.selection.regions.length || !library.isReady || library.restoreError)
    return
  if (destination.value !== 'new' && !scheme.value) {
    error.value = '目标方案不存在，请重新选择。'
    return
  }
  if (!scheme.value && (!title.value.trim() || library.schemes.length >= 100)) {
    error.value = '请填写方案名称，且最多保留 100 个方案。'
    return
  }
  if (hasOverlap.value && !decision.value) {
    error.value = '请先决定如何处理已有区域。'
    return
  }
  const target = scheme.value ?? library.createScheme(title.value)
  if (!scheme.value)
    target.outputLocale = props.outputLocale
  const selection = { ...props.selection, id: pendingId.value }
  if (!library.adoptTemplate(target, selection, terms.value, decision.value || undefined)) {
    error.value = library.saveError || '无法加入模板，请检查选择。'
    return
  }
  isOpen.value = false
  void navigateTo({
    path: localePath('/schemes/edit'),
    query: { id: target.id },
  })
}
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogTrigger as-child>
      <Button variant="outline" :disabled="disabled || !library.isReady || !!library.restoreError || !selection.regions.length">
        <Icon name="lucide:plus" />{{ text(isEditing ? '更新方案中的选择' : '保存到方案') }}
      </Button>
    </DialogTrigger>
    <DialogContent class="template-join-dialog sm:max-w-3xl">
      <DialogHeader><DialogTitle>{{ text(isEditing ? '更新方案中的选择' : '保存到方案') }}</DialogTitle><DialogDescription>{{ text('检查待加入的区域与描述。已有内容和手写补充会保留。') }}</DialogDescription></DialogHeader>
      <FieldGroup>
        <Field>
          <FieldLabel for="template-destination">
            {{ text('保存到') }}
          </FieldLabel><Select v-model="destination" :disabled="isEditing">
            <SelectTrigger id="template-destination">
              <SelectValue />
            </SelectTrigger><SelectContent>
              <SelectGroup>
                <SelectItem value="new">
                  {{ text('新建方案') }}
                </SelectItem><SelectItem v-for="saved in library.schemes" :key="saved.id" :value="saved.id">
                  {{ saved.title }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
        <Field v-if="destination === 'new'">
          <FieldLabel for="template-scheme-title">
            {{ text('方案名称') }}
          </FieldLabel><Input id="template-scheme-title" v-model="title" maxlength="80" />
        </Field>
      </FieldGroup>
      <p class="text-sm text-muted-foreground">
        {{ text('输出语言') }}: {{ language === 'en' ? 'English' : '中文' }}
      </p>
      <ul class="text-sm flex flex-col gap-2">
        <li v-for="region in effectiveSelection.regions" :key="region.id">
          <Icon name="lucide:check" :size="14" /> {{ region.title[isEnglish ? 'en' : 'zh'] }}
        </li>
      </ul>
      <Alert v-if="hasOverlap">
        <AlertTitle>{{ text('这个模板的区域已经加入过') }}</AlertTitle><AlertDescription>{{ text('保留已有要求，或采用本次区域。其他区域与手写正文不会静默覆盖。') }}</AlertDescription>
      </Alert>
      <Field v-if="hasOverlap">
        <FieldLabel for="template-decision">
          {{ text('已有区域的处理方式') }}
        </FieldLabel><Select v-model="decision">
          <SelectTrigger id="template-decision">
            <SelectValue :placeholder="text('请选择')" />
          </SelectTrigger><SelectContent>
            <SelectGroup>
              <SelectItem value="keep">
                {{ text('保留已有区域') }}
              </SelectItem><SelectItem value="replace">
                {{ text('采用本次区域') }}
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>
      <p v-if="scheme?.hasManualEdits && (isEditing || decision === 'replace')" class="text-sm text-muted-foreground">
        {{ text('已有手写正文将保留并标记待更新，重新生成需要确认。') }}
      </p>
      <details open>
        <summary class="mb-3 text-sm font-medium">
          {{ text('待加入的需求描述') }}
        </summary><pre class="template-candidate">{{ candidate }}</pre>
      </details>
      <p v-if="language === 'en' && /[\u3400-\u9fff]/u.test(candidate)" class="text-sm text-muted-foreground">
        {{ text('输出包含未翻译的自定义内容，方案名、作用对象及手写内容会保留原文。') }}
      </p>
      <p v-if="error" role="alert" class="text-sm text-destructive">
        {{ text(error) }}
      </p>
      <DialogFooter>
        <Button variant="outline" @click="isOpen = false">
          {{ text('取消') }}
        </Button><Button :disabled="hasOverlap && !decision" @click="adopt">
          {{ text(isEditing ? '确认更新并编辑' : '确认加入并编辑') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<style scoped>
.template-join-dialog { max-height: 90dvh; overflow-y: auto; }
.template-candidate { max-height: 32dvh; overflow: auto; white-space: pre-wrap; overflow-wrap: anywhere; font: inherit; font-size: 13px; line-height: 1.8; padding: 16px; background: var(--muted); border-radius: 6px; }
</style>
