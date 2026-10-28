import type { VueWrapper } from '@vue/test-utils'
import type { Term } from '../../app/types/glossary'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { afterEach, expect, it, vi } from 'vitest'
import { computed } from 'vue'
import GlobalSearch from '../../app/components/GlobalSearch.vue'

const term: Term = {
  slug: 'sidebar',
  title: '可折叠侧栏',
  english: 'Sidebar',
  description: '后台导航',
  category: 'layout',
  aliases: ['侧边菜单'],
  keywords: ['左边菜单不动'],
  demo: 'sidebar',
  order: 0,
  naming: '常用说法',
  usage: '后台',
  comparison: '顶部导航',
  target: '页面整体',
  phrase: '采用可折叠侧栏。',
  sources: [],
}
vi.mock('../../app/composables/use-catalog', () => ({
  useCatalog: () => ({
    terms: computed(() => [term]),
  }),
}))
let wrapper: VueWrapper | undefined
afterEach(() => {
  wrapper?.unmount()
  document.body.innerHTML = ''
})

// AI modified: domain aliases must survive the Command migration and empty searches must recover.
it('command 支持别名搜索、空结果恢复和 Escape 焦点返回', async () => {
  wrapper = await mountSuspended(GlobalSearch, { attachTo: document.body })
  const trigger = wrapper.get<HTMLButtonElement>('button')
  trigger.element.focus()
  await trigger.trigger('click')
  await flushPromises()
  const input = document.querySelector<HTMLInputElement>('[data-slot=command-input]')!
  async function search(query: string): Promise<void> {
    input.value = query
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await flushPromises()
  }
  await search('左边菜单不动')
  expect(document.querySelector('[role=option]')?.textContent).toContain('Sidebar')
  await search('no-such-term')
  expect(document.querySelector('[role=option]')).toBeNull()
  expect(document.querySelector('[data-slot=command-empty]')?.textContent).toContain('没有找到匹配的词条')
  await search('侧边菜单')
  expect(document.querySelector('[role=option]')?.textContent).toContain('Sidebar')
  input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
  await flushPromises()
  expect(document.querySelector('[role=dialog]')).toBeNull()
  expect(document.activeElement).toBe(trigger.element)
})
