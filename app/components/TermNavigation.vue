<script setup lang="ts">
import type { Category } from '../types/glossary'
import { computed, nextTick, onMounted, useId, useTemplateRef, watch } from 'vue'
import { Icon, NuxtLink } from '#components'
import { useRoute, useState } from '#imports'
import { useCatalog } from '../composables/use-catalog'
import { useGlossaryLocale } from '../composables/use-glossary-locale'
import { categories } from '../lib/glossary'
import CollapsePanel from './CollapsePanel.vue'
import { Button } from './ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from './ui/sidebar'

const emit = defineEmits<{ navigate: [] }>()

const { text, termTitle, isEnglish, localePath } = useGlossaryLocale()

const { terms } = useCatalog()
const route = useRoute()
const id = useId()
const navigation = useTemplateRef<HTMLElement>('navigation')
const groups = computed(() => categories.map(category => ({
  ...category,
  terms: terms.value.filter(term => term.category === category.id),
})))
const collapsed = useState<Category[]>('collapsed-term-groups', () => [])
const isRestored = useState('navigation-preferences-restored', () => false)
async function showCurrentCategory(): Promise<void> {
  const current = terms.value.find(term => term.slug === route.params.slug)
  if (!current)
    return
  collapsed.value = collapsed.value.filter(category => category !== current.category)
  await nextTick()
  // AI modified: long expanded groups must not leave the current term outside the navigation viewport.
  revealCurrentTerm()
}
function revealCurrentTerm(): void {
  navigation.value?.querySelector<HTMLElement>('[aria-current="page"]')?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' })
}
// AI modified: recheck visibility after an auto-expanded group reaches its full height.
function finishExpansion(event: TransitionEvent, category: Category): void {
  if (event.target !== event.currentTarget || event.propertyName !== 'grid-template-rows' || collapsed.value.includes(category))
    return
  if (terms.value.some(term => term.slug === route.params.slug && term.category === category))
    revealCurrentTerm()
}
onMounted(() => {
  if (!isRestored.value) {
    try {
      const stored: unknown = JSON.parse(localStorage.getItem('frontend-glossary:collapsed-groups') ?? '[]')
      if (Array.isArray(stored))
        collapsed.value = categories.filter(category => stored.includes(category.id)).map(category => category.id)
    }
    catch { /* First visit and unavailable storage both start expanded. */ }
    isRestored.value = true
  }
  void showCurrentCategory()
})
watch(() => route.params.slug, showCurrentCategory)
function toggleGroup(category: Category): void {
  // AI modified: each group is independent; changing it never shrinks the sidebar.
  collapsed.value = collapsed.value.includes(category)
    ? collapsed.value.filter(entry => entry !== category)
    : [...collapsed.value, category]
  try {
    localStorage.setItem('frontend-glossary:collapsed-groups', JSON.stringify(collapsed.value))
  }
  catch { /* Keep the session usable. */ }
}
</script>

<template>
  <nav ref="navigation" :aria-label="text('词条分类')" class="term-navigation">
    <p class="nav-caption">
      {{ text('开始使用') }}
    </p>
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton as-child>
          <NuxtLink :to="localePath('/')" @click="emit('navigate')">{{ text('全部词条') }} <span class="ml-auto">{{ terms.length }}</span></NuxtLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton as-child>
          <NuxtLink :to="localePath('/about')" @click="emit('navigate')">{{ text('使用说明') }}</NuxtLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
    <SidebarMenu class="mobile-library-links">
      <SidebarMenuItem>
        <SidebarMenuButton as-child>
          <NuxtLink :to="localePath('/templates')" @click="emit('navigate')">Templates</NuxtLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton as-child>
          <NuxtLink :to="localePath('/favorites')" @click="emit('navigate')">{{ text('我的收藏') }}</NuxtLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton as-child>
          <NuxtLink :to="localePath('/schemes')" @click="emit('navigate')">{{ text('我的方案') }}</NuxtLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
    <Collapsible v-for="group in groups" :key="group.id" :open="!collapsed.includes(group.id)" @update:open="toggleGroup(group.id)">
      <SidebarGroup class="mt-4 p-0">
        <SidebarGroupLabel as-child>
          <CollapsibleTrigger as-child>
            <Button variant="ghost" class="nav-group-toggle" :aria-expanded="!collapsed.includes(group.id)" :aria-controls="`${id}-${group.id}`">
              {{ text(group.label) }}<Icon name="lucide:chevron-down" class="motion-chevron" :class="{ '-rotate-90': collapsed.includes(group.id) }" :size="14" />
            </Button>
          </CollapsibleTrigger>
        </SidebarGroupLabel>
        <CollapsibleContent force-mount>
          <CollapsePanel :id="`${id}-${group.id}`" :open="!collapsed.includes(group.id)" @transitionend="finishExpansion($event, group.id)">
            <SidebarGroupContent>
              <SidebarMenu class="nav-group-terms">
                <SidebarMenuItem v-for="term in group.terms" :key="term.slug">
                  <SidebarMenuButton as-child class="h-auto min-h-9 items-start" :is-active="route.params.slug === term.slug">
                    <NuxtLink :to="localePath(`/terms/${term.slug}`)" @click="emit('navigate')"><span class="flex min-w-0 flex-col"><span>{{ termTitle(term) }}</span><small v-if="!isEnglish">{{ term.english }}</small></span></NuxtLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsePanel>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  </nav>
</template>
