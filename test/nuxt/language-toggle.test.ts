import type { VueWrapper } from '@vue/test-utils'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useNuxtApp } from '#imports'
import LanguageToggle from '../../app/components/LanguageToggle.vue'
import { useLibraryStore } from '../../app/stores/library'

// mountSuspended uses a test route name; exercise the real router with a stable localized destination.
mockNuxtImport('useSwitchLocalePath', () => () => (locale: string) => locale === 'en'
  ? '/en/schemes/edit'
  : '/schemes/edit')

let wrapper: VueWrapper | undefined
afterEach(() => {
  wrapper?.unmount()
  document.body.innerHTML = ''
  localStorage.removeItem('frontend-glossary:locale')
})

async function click(label: string): Promise<void> {
  const button = [
    ...document.querySelectorAll('button'),
  ].find(button => button.textContent?.trim() === label || button.getAttribute('aria-label') === label)
  expect(button).toBeDefined()
  button!.click()
  await flushPromises()
}

// AI modified: validate the latest requirement without coupling interface locale to plan text.
describe('界面语言切换提醒', () => {
  it('取消保留当前页面和草稿，确认后切换同一地址并保留查询参数', async () => {
    const library = useLibraryStore()
    library.$patch({
      schemes: [],
      favorites: ['sidebar'],
      isReady: true,
      saveError: '',
      restoreError: '',
    })
    const scheme = library.createScheme('保留中文方案名')
    library.editDescription(scheme, '手机端抽屉需要全屏')
    const before = JSON.stringify(library.schemes)
    wrapper = await mountSuspended(LanguageToggle, { route: '/schemes/edit?id=language-test', attachTo: document.body })
    await click('切换为 English')
    expect(document.querySelector('[role="dialog"]')?.textContent).toContain('方案正文和手写内容保持不变')
    await click('取消')
    expect(useNuxtApp().$router.currentRoute.value.fullPath).toBe('/schemes/edit?id=language-test')
    expect(JSON.stringify(library.schemes)).toBe(before)
    await click('切换为 English')
    await click('确认切换')
    await vi.waitFor(() => {
      expect(useNuxtApp().$router.currentRoute.value.fullPath).toBe('/en/schemes/edit?id=language-test')
    })
    expect(localStorage.getItem('frontend-glossary:locale')).toBe('en')
    expect(JSON.stringify(library.schemes)).toBe(before)
    expect(library.favorites).toEqual(['sidebar'])
  })
})
