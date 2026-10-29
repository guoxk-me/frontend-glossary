<script setup lang="ts">
import { useEventListener } from '@vueuse/core'
import { computed, shallowRef, watch } from 'vue'
import { Icon } from '#components'
import { navigateTo, useRoute } from '#imports'
import { useCatalog } from '../composables/use-catalog'
import { useGlossaryLocale } from '../composables/use-glossary-locale'
import { useTemplates } from '../composables/use-templates'
import { searchTerms } from '../lib/glossary'
import { releaseLeavingRow, retainLeavingRow } from '../lib/list-motion'
import { searchTemplates } from '../lib/templates'
import { Button } from './ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Kbd } from './ui/kbd'

const { text, termTitle, termText, isEnglish, localePath } = useGlossaryLocale()

const { terms } = useCatalog()
const { templates } = useTemplates()
const route = useRoute()
const isOpen = shallowRef(false)
const query = shallowRef('')
const templateMatches = computed(() => searchTemplates(templates.value, query.value))
const matches = computed(() => searchTerms(terms.value, query.value))
let previousFocus: HTMLElement | null = null
watch(isOpen, (open) => {
  if (!open)
    return
  previousFocus = document.activeElement instanceof HTMLElement
    ? document.activeElement
    : null
  query.value = ''
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
async function selectTemplate(slug: string): Promise<void> {
  isOpen.value = false
  await navigateTo(localePath(`/templates/${slug}`))
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
      <Button variant="outline" class="global-search-trigger" :aria-label="text('全局搜索')">
        <Icon name="lucide:search" /><span>{{ text('搜索词条或模板…') }}</span><Kbd>⌘ K</Kbd>
      </Button>
    </DialogTrigger>
    <DialogContent class="search-dialog sm:max-w-2xl" @close-auto-focus="restoreFocus">
      <DialogHeader class="sr-only">
        <DialogTitle>{{ text('全局搜索') }}</DialogTitle>
        <DialogDescription>{{ text('输入中英文名、别名或通俗描述。') }}</DialogDescription>
      </DialogHeader>
      <Command :should-filter="false">
        <CommandInput v-model="query" :aria-label="text('搜索词条')" :placeholder="text('搜索词条或模板…')" />
        <CommandList :aria-label="text('全部词条')" class="max-h-[60vh]">
          <CommandEmpty>
            {{ text('没有找到匹配的词条或模板') }}<Button variant="outline" class="ml-3" @click="query = ''">
              {{ text('清空关键词') }}
            </Button>
          </CommandEmpty>
          <CommandGroup :heading="text('词条')">
            <TransitionGroup name="list" tag="div" class="motion-list" @before-leave="retainLeavingRow" @after-leave="releaseLeavingRow" @before-enter="releaseLeavingRow">
              <CommandItem v-for="(term, index) in matches" :key="term.slug" :value="term.slug" @select="selectResult(index)">
                <Icon name="lucide:book-open" />
                <div class="min-w-0 py-2">
                  <strong>{{ termTitle(term) }}</strong><span v-if="!isEnglish" class="ml-2 text-muted-foreground">{{ term.english }}</span><p class="text-xs text-muted-foreground">
                    {{ termText(term, 'description') }}
                  </p>
                </div>
              </CommandItem>
            </TransitionGroup>
          </CommandGroup>
          <!-- AI modified: keep template results separate from individual dictionary concepts. -->
          <CommandGroup v-if="templateMatches.length" heading="Templates">
            <CommandItem v-for="template in templateMatches" :key="template.slug" :value="`template:${template.slug}`" @select="selectTemplate(template.slug)">
              <Icon name="lucide:layout-template" />
              <div class="min-w-0 py-2">
                <strong>{{ isEnglish ? template.english : template.title }}</strong><p class="text-xs text-muted-foreground">
                  {{ text(template.kind === 'page' ? '页面模板' : '整站模板') }} · {{ template.description[isEnglish ? 'en' : 'zh'] }}
                </p>
              </div>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
      <p class="search-keyboard-help">
        {{ text('通过箭头键选择，Enter 查看详情，Escape 关闭。') }}
      </p>
    </DialogContent>
  </Dialog>
</template>
