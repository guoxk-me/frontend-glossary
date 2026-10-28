<script setup lang="ts">
import { useEventListener } from '@vueuse/core'
import { shallowRef } from 'vue'
import { Icon, NuxtLink } from '#components'
import { useLibraryStore } from '../stores/library'
import PwaStatus from './PwaStatus.vue'
import TermNavigation from './TermNavigation.vue'
import ThemeToggle from './ThemeToggle.vue'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'
import { Button } from './ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet'

const isMenuOpen = shallowRef(false)
const library = useLibraryStore()
// AI modified: a failed local write must not silently lose the in-memory draft on navigation away.
useEventListener('beforeunload', (event) => {
  if (library.saveError) {
    event.preventDefault()
    event.returnValue = ''
  }
})
</script>

<template>
  <a href="#main-content" class="skip-link">跳到正文</a>
  <header class="site-header">
    <div class="header-inner">
      <Sheet v-model:open="isMenuOpen">
        <SheetTrigger as-child>
          <Button variant="ghost" size="icon" class="mobile-menu" aria-label="打开导航">
            <Icon name="lucide:menu" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" class="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>前端词典</SheetTitle>
            <SheetDescription>找到你想表达的效果</SheetDescription>
          </SheetHeader>
          <TermNavigation @navigate="isMenuOpen = false" />
        </SheetContent>
      </Sheet>
      <NuxtLink to="/" class="brand">
        <span class="brand-icon">
          <Icon name="lucide:book-open" :size="17" />
        </span>
        <strong>前端词典</strong>
      </NuxtLink>
      <nav class="top-navigation" aria-label="主导航">
        <NuxtLink to="/">词典</NuxtLink>
        <NuxtLink to="/schemes">我的方案</NuxtLink>
        <NuxtLink to="/about">使用指南</NuxtLink>
      </nav>
      <div class="header-actions">
        <span class="version-label">v0.1 · 预览版</span>
        <Button variant="ghost" size="icon" as-child>
          <a href="https://github.com/guoxk-me/frontend-glossary" target="_blank" rel="noopener noreferrer" aria-label="GitHub 仓库">
            <Icon name="lucide:git-fork" />
          </a>
        </Button>
        <ThemeToggle />
      </div>
    </div>
  </header>
  <div class="site-layout">
    <aside class="desktop-sidebar">
      <TermNavigation />
      <PwaStatus />
    </aside>
    <main id="main-content" tabindex="-1">
      <Alert v-if="library.saveError || library.restoreError" variant="destructive" class="mb-6">
        <AlertTitle>本地保存需要处理</AlertTitle>
        <AlertDescription>
          {{ library.saveError || library.restoreError }} <NuxtLink to="/schemes">前往备份与恢复</NuxtLink>
        </AlertDescription>
      </Alert>
      <slot />
      <div class="mobile-pwa">
        <PwaStatus :show-update="false" />
      </div>
      <footer class="site-footer">
        <span>把脑海里的效果，说清楚。</span>
        <NuxtLink to="/about">本地保存 · 无需登录</NuxtLink>
      </footer>
    </main>
  </div>
</template>
