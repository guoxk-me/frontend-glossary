import type { VueWrapper } from '@vue/test-utils'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import TemplateDetail from '../../app/components/templates/TemplateDetail.vue'
import TemplateRegionEditor from '../../app/components/templates/TemplateRegionEditor.vue'
import { storageKey } from '../../app/lib/backup'
import { templateSchema } from '../../app/lib/template-schema'
import { selectTemplateRegions } from '../../app/lib/templates'
import { useLibraryStore } from '../../app/stores/library'
import authoredTemplate from '../../content/templates/customer-management.json'

// AI modified: isolate clipboard delivery while keeping selection and plan state real.
const { copyText } = vi.hoisted(() => ({
  copyText: vi.fn(),
}))
vi.mock('../../app/composables/use-delivery', () => ({
  useDelivery: () => ({ copyText, message: '' }),
}))

const template = templateSchema.parse(authoredTemplate)
const choices = template.pages[0]!.regions.map(region => ({
  regionId: region.id,
  isSelected: region.id !== 'toolbar',
  aspects: region.features.map(feature => feature.aspect),
  adjustments: '',
}))
let wrapper: VueWrapper | undefined
beforeEach(() => {
  copyText.mockClear()
  localStorage.removeItem(storageKey)
  useLibraryStore().$patch({
    schemes: [],
    favorites: [],
    templateFavorites: [],
    isReady: true,
    saveError: '',
    restoreError: '',
  })
})
afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  document.body.innerHTML = ''
})

// AI modified: exercise real editing controls and local persistence, including manual-text protection.
describe('模板区域与方案衔接', () => {
  it('直接复制所选需求，不新建方案；没有选择时禁止复制', async () => {
    wrapper = await mountSuspended(TemplateDetail, {
      props: { template },
      route: '/templates/customer-management',
    })
    await wrapper.get('textarea').setValue('强调色改为深绿色')
    const copyButton = wrapper.findAll('button').find(button => button.text() === '复制需求')!
    await copyButton.trigger('click')
    expect(copyText).toHaveBeenCalledOnce()
    expect(copyText.mock.calls[0]?.[0]).toContain('强调色改为深绿色')
    expect(copyText.mock.calls[0]?.[0]).toContain('Not adopted: Page toolbar')
    expect(useLibraryStore().schemes).toHaveLength(0)
    for (const checkbox of wrapper.findAll('input[type="checkbox"]'))
      await checkbox.setValue(false)
    expect(copyButton.attributes('disabled')).toBeDefined()
    expect(useLibraryStore().schemes).toHaveLength(0)
  })

  it('追加超长手写正文失败时不改变原方案，也不写出无法恢复的备份', () => {
    const library = useLibraryStore()
    const scheme = library.createScheme('Large draft')
    library.editDescription(scheme, 'x'.repeat(100000))
    const before = JSON.stringify(scheme)
    const selection = selectTemplateRegions(template, 'customers', choices, 'too-long')
    expect(library.adoptTemplate(scheme, selection, [])).toBe(false)
    expect(JSON.stringify(scheme)).toBe(before)
    expect(library.saveError).toContain('100000')
  })

  it('区域开关和调整文字通过显式事件提交，不修改原模板', async () => {
    const original = JSON.stringify(template)
    wrapper = await mountSuspended(TemplateRegionEditor, {
      props: { region: template.pages[0]!.regions[0]!, choice: choices[0]! },
    })
    expect(wrapper.get('details').attributes('open')).toBeUndefined()
    await wrapper.get('summary').trigger('click')
    await wrapper.get('#aspect-sidebar-palette').trigger('click')
    await flushPromises()
    const changed = wrapper.emitted('change')?.[0]?.[0]
    expect(changed).toMatchObject({ regionId: 'sidebar' })
    expect(changed).toHaveProperty('aspects', [
      'layout',
      'typography',
      'decoration',
      'states',
    ])
    await wrapper.get('textarea').setValue('深绿色强调')
    expect(wrapper.emitted('change')?.at(-1)?.[0]).toHaveProperty('adjustments', '深绿色强调')
    expect(JSON.stringify(template)).toBe(original)
  })
  it('新加入模板追加手写正文，后续修改选择只标记待更新', () => {
    const library = useLibraryStore()
    const scheme = library.createScheme('Customer workspace')
    library.editDescription(scheme, '保留我的手写内容。')
    const selection = selectTemplateRegions(template, 'customers', choices, 'reference')
    expect(library.adoptTemplate(scheme, selection, [])).toBe(true)
    expect(scheme.description.startsWith('保留我的手写内容。')).toBe(true)
    expect(scheme.description).toContain('Customer table')
    expect(scheme.templateSelections).toHaveLength(1)
    const original = scheme.description
    selection.regions[0]!.adjustments = '改成绿色'
    expect(library.adoptTemplate(scheme, selection, [])).toBe(true)
    expect(scheme.description).toBe(original)
    expect(scheme.isStale).toBe(true)
    expect(library.regenerate(scheme, [], false)).toBe(false)
    expect(library.regenerate(scheme, [], true)).toBe(true)
    expect(scheme.description).toContain('改成绿色')
    expect(JSON.parse(localStorage.getItem(storageKey)!).schemes[0].templateSelections[0].regions[0].adjustments).toBe('改成绿色')
  })
  it('重复加入需要明确决定，模板收藏独立持久化并可导入', () => {
    const library = useLibraryStore()
    const scheme = library.createScheme('Customer workspace')
    const first = selectTemplateRegions(template, 'customers', choices, 'first')
    library.adoptTemplate(scheme, first, [])
    const before = scheme.description
    expect(library.adoptTemplate(scheme, { ...first, id: 'second' }, [])).toBe(false)
    expect(scheme.description).toBe(before)
    expect(library.adoptTemplate(scheme, { ...first, id: 'second' }, [], 'replace')).toBe(true)
    expect(scheme.templateSelections).toHaveLength(1)
    library.toggleTemplateFavorite(template.slug)
    expect(library.favorites).toEqual([])
    const backup = library.exportBackup()
    library.$patch({ schemes: [], templateFavorites: [] })
    library.importBackup(backup, [])
    expect(library.templateFavorites).toEqual([template.slug])
    expect(library.schemes[0]?.templateSelections).toHaveLength(1)
  })
})
