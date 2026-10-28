<script setup lang="ts">
import { useEventListener } from '@vueuse/core'
import { computed, nextTick, shallowRef, useId, useTemplateRef, watch } from 'vue'
import { Icon } from '#components'
import { navigateTo, useRoute } from '#imports'
import { useCatalog } from '../composables/use-catalog'
import { useGlossaryLocale } from '../composables/use-glossary-locale'
import { searchTerms } from '../lib/glossary'
import { releaseLeavingRow, retainLeavingRow } from '../lib/list-motion'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'

const { text, termTitle, termText, isEnglish, localePath } = useGlossaryLocale()

const { terms } = useCatalog()
const route = useRoute()
const isOpen = shallowRef(false)
const query = shallowRef('')
const selected = shallowRef(0)
const input = useTemplateRef<HTMLInputElement>('input')
const list = useTemplateRef<HTMLElement>('list')
const id = useId()
const matches = computed(() => searchTerms(terms.value, query.value))
let previousFocus: HTMLElement | null = null
watch(query, () => {
  selected.value = 0
})
watch(isOpen, async (open) => {
  if (!open)
    return
  previousFocus = document.activeElement instanceof HTMLElement
    ? document.activeElement
    : null
  query.value = ''
  selected.value = 0
  await nextTick()
  input.value?.focus()
})
watch(() => route.fullPath, () => {
  isOpen.value = false
})
useEventListener('keydown', (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    isOpen.value = !isOpen.value
  }
})
async function selectResult(index: number): Promise<void> {
  const term = matches.value[index]
  if (!term)
    return
  isOpen.value = false
  await navigateTo(localePath(`/terms/${term.slug}`))
}
async function moveSelection(direction: number): Promise<void> {
  if (!matches.value.length)
    return
  selected.value = (selected.value + direction + matches.value.length) % matches.value.length
  await nextTick()
  list.value?.querySelector('[aria-selected="true"]:not([aria-hidden="true"])')?.scrollIntoView({ block: 'nearest' })
}
function restoreFocus(event: Event): void {
  // AI modified: keyboard-opened dialogs restore the actual previous focus, not just the header trigger.
  event.preventDefault()
  previousFocus?.focus()
}
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogTrigger as-child>
      <Button variant="ghost" class="global-search-trigger" :aria-label="text('全局搜索')">
        <Icon name="lucide:search" /><span>{{ text('搜索词条…') }}</span><kbd>⌘ K</kbd>
      </Button>
    </DialogTrigger>
    <DialogContent class="search-dialog sm:max-w-2xl" @close-auto-focus="restoreFocus">
      <DialogHeader class="sr-only">
        <DialogTitle>{{ text('全局搜索') }}</DialogTitle>
        <DialogDescription>{{ text('输入中英文名、别名或通俗描述。') }}</DialogDescription>
      </DialogHeader>
      <div class="global-search-input">
        <Icon name="lucide:search" />
        <input :id="`${id}-input`" ref="input" v-model="query" role="combobox" aria-autocomplete="list" :aria-expanded="true" :aria-controls="`${id}-results`" :aria-activedescendant="matches.length ? `${id}-option-${matches[selected]?.slug}` : undefined" :aria-label="text('搜索词条')" :placeholder="text('搜索词条…')" autocomplete="off" @keydown.down.prevent="moveSelection(1)" @keydown.up.prevent="moveSelection(-1)" @keydown.enter.prevent="selectResult(selected)">
      </div>
      <div :id="`${id}-results`" ref="list" role="listbox" :aria-label="text('全部词条')" class="global-search-results">
        <TransitionGroup name="list" tag="div" class="motion-list" @before-leave="retainLeavingRow" @after-leave="releaseLeavingRow" @before-enter="releaseLeavingRow">
          <div v-for="(term, index) in matches" :id="`${id}-option-${term.slug}`" :key="term.slug" role="option" :aria-selected="selected === index" class="search-result" @pointermove="selected = index" @click="selectResult(index)">
            <Icon name="lucide:book-open" :size="18" />
            <div><strong>{{ termTitle(term) }}</strong><span v-if="!isEnglish">{{ term.english }}</span><p>{{ termText(term, 'description') }}</p></div>
            <Icon name="lucide:arrow-up-right" :size="16" />
          </div>
          <div v-if="!matches.length" key="empty" class="search-empty">
            <p>{{ text('没有找到匹配的词条') }}</p><Button variant="outline" @click="query = ''; input?.focus()">
              {{ text('清空关键词') }}
            </Button>
          </div>
        </TransitionGroup>
      </div>
      <p class="search-keyboard-help">
        {{ text('通过箭头键选择，Enter 查看详情，Escape 关闭。') }}
      </p>
    </DialogContent>
  </Dialog>
</template>
