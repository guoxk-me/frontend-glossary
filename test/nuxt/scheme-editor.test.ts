import type { VueWrapper } from '@vue/test-utils'
import type { Term } from '../../app/types/glossary'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { computed } from 'vue'
import SchemeEditor from '../../app/components/SchemeEditor.vue'
import { storageKey } from '../../app/lib/backup'
import { defaultParameters } from '../../app/lib/glossary'
import { useLibraryStore } from '../../app/stores/library'

const sidebar: Term = {
  slug: 'sidebar',
  title: '可折叠侧栏',
  description: '后台导航',
  english: 'Sidebar',
  category: 'layout',
  aliases: [],
  keywords: [],
  demo: 'sidebar',
  order: 0,
  naming: '常用说法',
  usage: '后台',
  comparison: '顶部导航',
  target: '页面整体',
  phrase: '采用可折叠侧栏。',
  sources: [],
}
// AI modified: isolate the content-loading boundary; keep editing, controls, dialogs and storage real.
vi.mock('../../app/composables/use-catalog', () => ({
  useCatalog: () => ({
    terms: computed(() => [sidebar]),
  }),
}))

let wrapper: VueWrapper | undefined
beforeEach(() => {
  localStorage.removeItem(storageKey)
  useLibraryStore().$patch({
    schemes: [],
    favorites: [],
    isReady: true,
    saveError: '',
    restoreError: '',
  })
})
afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  document.body.innerHTML = ''
})

async function clickButton(label: string): Promise<void> {
  const button = [
    ...document.querySelectorAll('button'),
  ].find(button => button.textContent?.trim() === label)
  expect(button, `Missing button: ${label}`).toBeDefined()
  button!.click()
  await flushPromises()
}

async function chooseChineseOutput(editor: VueWrapper): Promise<void> {
  await editor.get('#scheme-output-locale').trigger('keydown', { key: 'Enter' })
  await flushPromises()
  const option = [
    ...document.querySelectorAll<HTMLElement>('[role="option"]'),
  ].find(option => option.textContent?.trim() === '中文')
  expect(option).toBeDefined()
  option!.focus()
  option!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
  await flushPromises()
}

async function openEditor(): Promise<VueWrapper> {
  const library = useLibraryStore()
  const scheme = library.createScheme('订单工作台')
  library.addChoice(scheme, {
    id: 'sidebar-choice',
    termSlug: sidebar.slug,
    target: '页面整体',
    parameters: defaultParameters(),
  }, [sidebar])
  wrapper = await mountSuspended(SchemeEditor, {
    props: { scheme },
    attachTo: document.body,
  })
  return wrapper
}

describe('方案编辑的 Nuxt 集成', () => {
  it('同类效果可同时保存，重复同一效果必须确认，手写正文保留', () => {
    const library = useLibraryStore()
    const scheme = library.createScheme('组合布局')
    const grid: Term = { ...sidebar, slug: 'grid', title: '卡片网格' }
    const terms = [sidebar, grid]
    const choice = {
      id: 'sidebar',
      termSlug: 'sidebar',
      target: '页面',
      parameters: defaultParameters(),
    }
    expect(library.addChoice(scheme, choice, terms)).toBe(true)
    library.editDescription(scheme, '保留手写要求')
    expect(library.addChoice(scheme, { ...choice, id: 'grid', termSlug: 'grid' }, terms)).toBe(true)
    expect(scheme.choices).toHaveLength(2)
    const duplicate = {
      ...choice,
      id: 'new-sidebar',
      parameters: { ...choice.parameters, width: 280 },
    }
    expect(library.addChoice(scheme, duplicate, terms)).toBe(false)
    expect(library.addChoice(scheme, duplicate, terms, true)).toBe(true)
    expect(scheme.choices.map(choice => choice.termSlug)).toEqual(['grid', 'sidebar'])
    expect(scheme.description).toBe('保留手写要求')
    expect(scheme.isStale).toBe(true)
  })

  it('调整参数后保留手写描述，取消不替换，确认才生成并保存', async () => {
    const editor = await openEditor()
    await editor.get('textarea').setValue('手写要求：保留订单权限说明。')
    await clickButton('预览与调整参数')
    // AI modified: use the slider's public keyboard interaction instead of native input mutation.
    await editor.get('[role="slider"]').trigger('keydown', { key: 'End' })
    await editor.get('[role="slider"]').trigger('keydown', { key: 'ArrowLeft' })
    await editor.get('[role="slider"]').trigger('keydown', { key: 'ArrowLeft' })
    expect(editor.get('textarea').element.value).toBe('手写要求：保留订单权限说明。')
    expect(editor.text()).toContain('参数已变化，描述待更新')
    await clickButton('重新生成')
    expect(document.querySelector('[role="alertdialog"]')?.textContent).toContain('重新生成并替换手写内容')
    await clickButton('取消，保留原文')
    expect(editor.get('textarea').element.value).toBe('手写要求：保留订单权限说明。')
    expect(editor.text()).toContain('参数已变化，描述待更新')
    await clickButton('重新生成')
    await clickButton('确认替换描述')
    expect(editor.get('textarea').element.value).toContain('280')
    expect(editor.get('textarea').element.value).not.toContain('手写要求')
    expect(editor.get('.stale-alert').element.closest('[aria-hidden="true"]')).not.toBeNull()
    expect(localStorage.getItem(storageKey)).toContain('280')
  })

  it('本机保存失败时仍保留编辑文本并显示恢复提示', async () => {
    const editor = await openEditor()
    // AI modified: Happy DOM binds storage methods on access; replace the boundary to avoid leaking a spy.
    vi.stubGlobal('localStorage', {
      setItem: () => { throw new Error('Storage unavailable') },
    })
    await editor.get('textarea').setValue('保存失败也不能丢失的描述。')
    expect(editor.get('textarea').element.value).toBe('保存失败也不能丢失的描述。')
    expect(editor.text()).toContain('保存失败，输入仍保留')
  })
  it('新方案默认英文，切换输出先预览，取消保留正文，确认后持久化', async () => {
    const editor = await openEditor()
    const scheme = useLibraryStore().schemes[0]!
    expect(scheme.outputLocale).toBe('en')
    await editor.get('textarea').setValue('手机端抽屉需要全屏')
    await chooseChineseOutput(editor)
    expect(document.querySelector('[role="alertdialog"]')?.textContent).toContain('候选描述')
    expect(scheme.outputLocale).toBe('en')
    await clickButton('取消，保留原文')
    expect(scheme.description).toBe('手机端抽屉需要全屏')
    expect(editor.get('#scheme-output-locale').text()).toBe('English')
    expect(document.activeElement).toBe(editor.get('#scheme-output-locale').element)
    expect(scheme.outputLocale).toBe('en')
    await chooseChineseOutput(editor)
    await clickButton('确认替换描述')
    expect(scheme.outputLocale).toBe('zh')
    expect(scheme.description).toContain('默认展开')
    expect(JSON.parse(localStorage.getItem(storageKey)!).schemes[0].outputLocale).toBe('zh')
  })
})
