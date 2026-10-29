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
describe('界面语言直接切换', () => {
  it('一次点击切换同一地址，保留查询参数、手写正文和收藏', async () => {
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
    expect(document.querySelector('[role="dialog"]')).toBeNull()
    await vi.waitFor(() => {
      expect(useNuxtApp().$router.currentRoute.value.fullPath).toBe('/en/schemes/edit?id=language-test')
    })
    expect(localStorage.getItem('frontend-glossary:locale')).toBe('en')
    expect(JSON.stringify(library.schemes)).toBe(before)
    expect(library.favorites).toEqual(['sidebar'])
  })
})
