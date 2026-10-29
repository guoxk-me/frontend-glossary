<script setup lang="ts">
import { useEventListener } from '@vueuse/core'
import { onScopeDispose, shallowRef, useTemplateRef } from 'vue'
import { Icon, NuxtLink } from '#components'
import { useNuxtApp, useRoute } from '#imports'
import { useGlossaryLocale } from '../composables/use-glossary-locale'
import { useLibraryStore } from '../stores/library'
import CollapsePanel from './CollapsePanel.vue'
import GlobalSearch from './GlobalSearch.vue'
import LanguageToggle from './LanguageToggle.vue'
import PwaInstall from './PwaInstall.vue'
import PwaStatus from './PwaStatus.vue'
import TermNavigation from './TermNavigation.vue'
import ThemeToggle from './ThemeToggle.vue'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'
import { Button } from './ui/button'
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from './ui/navigation-menu'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet'
import { Sidebar, SidebarContent, SidebarFooter, SidebarProvider } from './ui/sidebar'

const { text, localePath } = useGlossaryLocale()

const isMenuOpen = shallowRef(false)
const library = useLibraryStore()
const route = useRoute()
// AI modified: template pages use the global navigation and a full-width content area.
const isTemplateRoute = () => /^\/(?:en\/)?templates(?:\/|$)/u.test(route.path)
const page = useTemplateRef<HTMLElement>('page')
const nuxt = useNuxtApp()
function pageIdentity(): string {
  return `${route.path.replace(/^\/en(?=\/|$)/u, '') || '/'}:${route.query.id ?? ''}`
}
let previousPage = pageIdentity()
let entrance: Animation | undefined
// AI modified: fade only new business pages; locale navigation preserves an uninterrupted reading surface.
const stopPageHook = nuxt.hook('page:finish', () => {
  const currentPage = pageIdentity()
  if (currentPage === previousPage)
    return
  previousPage = currentPage
  entrance?.cancel()
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    entrance = page.value?.animate([
      { opacity: 0.65 },
      { opacity: 1 },
    ], { duration: 140, easing: 'ease-out' })
  }
})
onScopeDispose(() => {
  stopPageHook()
  entrance?.cancel()
})
// AI modified: a failed local write must not silently lose the in-memory draft on navigation away.
useEventListener('beforeunload', (event) => {
  if (library.saveError) {
    event.preventDefault()
    event.returnValue = ''
  }
})
</script>

<template>
  <!-- AI modified: sidebar groups collapse independently; the navigation width stays fixed. -->
  <SidebarProvider :default-open="true" :keyboard-shortcut="false" class="block min-h-0">
    <a href="#main-content" class="skip-link">{{ text('跳到正文') }}</a>
    <header class="site-header">
      <div class="header-inner">
        <Sheet v-model:open="isMenuOpen">
          <SheetTrigger as-child>
            <Button variant="ghost" size="icon" class="mobile-menu" :aria-label="text('打开导航')">
              <Icon name="lucide:menu" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" class="overflow-y-auto">
            <SheetHeader>
              <SheetTitle>{{ text('前端词典') }}</SheetTitle>
              <SheetDescription>{{ text('找到你想表达的效果') }}</SheetDescription>
            </SheetHeader>
            <nav v-if="isTemplateRoute()" class="template-mobile-nav" :aria-label="text('主导航')">
              <NuxtLink v-for="link in [{ path: '/', title: '词典' }, { path: '/templates', title: 'Templates' }, { path: '/favorites', title: '我的收藏' }, { path: '/schemes', title: '我的方案' }]" :key="link.path" :to="localePath(link.path)" @click="isMenuOpen = false">{{ text(link.title) }}</NuxtLink>
            </nav>
            <TermNavigation v-else class="mobile-term-navigation" @navigate="isMenuOpen = false" />
          </SheetContent>
        </Sheet>
        <NuxtLink :to="localePath('/')" class="brand">
          <span class="brand-icon">
            <Icon name="lucide:book-open" :size="17" />
          </span>
          <strong>{{ text('前端词典') }}</strong>
        </NuxtLink>
        <NavigationMenu class="top-navigation" :aria-label="text('主导航')">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink as-child>
                <NuxtLink :to="localePath('/')">{{ text('词典') }}</NuxtLink>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink as-child>
                <NuxtLink :to="localePath('/templates')">Templates</NuxtLink>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink as-child>
                <NuxtLink :to="localePath('/favorites')">{{ text('我的收藏') }}</NuxtLink>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink as-child>
                <NuxtLink :to="localePath('/schemes')">{{ text('我的方案') }}</NuxtLink>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <div class="header-actions">
          <GlobalSearch />
          <LanguageToggle />
          <Button variant="ghost" size="icon" as-child>
            <a href="https://github.com/guoxk-me/frontend-glossary" target="_blank" rel="noopener noreferrer" :aria-label="text('GitHub 仓库')">
              <Icon name="lucide:github" />
            </a>
          </Button>
          <ThemeToggle />
          <div class="header-install">
            <PwaInstall />
          </div>
        </div>
      </div>
    </header>
    <div class="site-layout" :class="{ 'template-layout': isTemplateRoute() }">
      <aside v-if="!isTemplateRoute()" class="desktop-sidebar">
        <Sidebar collapsible="none" class="w-full">
          <SidebarContent>
            <TermNavigation />
          </SidebarContent><SidebarFooter class="p-0">
            <PwaStatus show-install />
          </SidebarFooter>
        </Sidebar>
      </aside>
      <main id="main-content" tabindex="-1">
        <CollapsePanel :open="!!(library.saveError || library.restoreError)">
          <Alert variant="destructive" class="mb-6">
            <AlertTitle>{{ text('本地保存需要处理') }}</AlertTitle>
            <AlertDescription>
              {{ text(library.saveError || library.restoreError) }} <NuxtLink :to="localePath('/schemes')">{{ text('前往备份与恢复') }}</NuxtLink>
            </AlertDescription>
          </Alert>
        </CollapsePanel>
        <div ref="page" class="page-content">
          <slot />
        </div>
        <div :class="isTemplateRoute() ? 'template-pwa' : 'mobile-pwa'">
          <PwaStatus :show-update="isTemplateRoute()" show-install />
        </div>
        <footer class="site-footer">
          <span>{{ text('把脑海里的效果，说清楚。') }}</span>
          <NuxtLink :to="localePath('/about')">{{ text('本地保存 · 无需登录') }}</NuxtLink>
        </footer>
      </main>
    </div>
  </SidebarProvider>
</template>

<style scoped>
.template-layout { grid-template-columns: minmax(0, 1fr); max-width: 1400px; }
.template-mobile-nav { display: flex; flex-direction: column; padding: 0 24px; }
.template-mobile-nav a { padding: 12px 0; }
.template-pwa { margin-top: 32px; }
</style>
