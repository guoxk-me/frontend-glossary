import type { Scheme } from '../types/glossary'
import type { RegionChoice, TemplateSelection } from '../types/template'
import { describe, expect, it } from 'vitest'
import authoredTemplate from '../../content/templates/customer-management.json'
import { readBackup } from './backup'
import { changeOutputLocale, describeScheme } from './schemes'
import { templateSchema, templateSelectionSchema } from './template-schema'
import { adoptTemplateSelection, describeTemplate, hasTemplateOverlap, searchTemplates, selectTemplateRegions } from './templates'

const template = templateSchema.parse(authoredTemplate)
function exampleSelection(id = 'reference'): TemplateSelection {
  const choices: RegionChoice[] = template.pages[0]!.regions.map(region => ({
    regionId: region.id,
    isSelected: region.id !== 'toolbar',
    aspects: region.features.filter(feature => feature.aspect !== 'palette').map(feature => feature.aspect),
    adjustments: region.id === 'sidebar'
      ? '强调色改为深绿色'
      : '',
  }))
  return selectTemplateRegions(template, 'customers', choices, id)
}
function exampleScheme(): Scheme {
  return {
    id: 'plan',
    title: 'Customer workspace',
    outputLocale: 'en',
    choices: [],
    description: 'Handwritten requirements',
    hasManualEdits: true,
    isStale: false,
    updatedAt: '2026-10-28T00:00:00.000Z',
  }
}

// AI modified: verify authored scope, backup compatibility and explicit regional replacement.
describe('模板视觉需求', () => {
  it('只采用选定区域和视觉特征，自定义文字不自动翻译', () => {
    const selection = exampleSelection()
    const english = describeTemplate(selection, 'en')
    expect(selection.regions).toHaveLength(3)
    expect(selection.regions.some(region => region.id === 'toolbar')).toBe(false)
    expect(selection.regions.flatMap(region => region.features).some(feature => feature.aspect === 'palette')).toBe(false)
    expect(english).toContain('强调色改为深绿色')
    expect(english).toContain('Not adopted: Page toolbar')
    expect(english).toContain('above the customer table')
    expect(english).not.toContain('Keep the light surface, blue accent')
    expect(templateSelectionSchema.safeParse(selection).success).toBe(true)
  })
  it('词库后续修改不改变保存的视觉快照', () => {
    const changing = structuredClone(template)
    const selection = selectTemplateRegions(changing, 'customers', [
      {
        regionId: 'sidebar',
        isSelected: true,
        aspects: ['layout'],
        adjustments: '',
      },
    ], 'snapshot')
    changing.pages[0]!.regions[0]!.features[0]!.description.en = 'Changed later'
    expect(describeTemplate(selection, 'en')).not.toContain('Changed later')
  })
  it('跨语言、别名和类型筛选保持可解释的关键词匹配', () => {
    expect(searchTemplates([template], 'CUSTOMER sidebar')).toEqual([template])
    expect(searchTemplates([template], '侧栏')).toEqual([template])
    expect(searchTemplates([template], '', 'website')).toEqual([])
    expect(searchTemplates([template], 'no-such-template')).toEqual([])
  })
  it('重复加入被识别，替换只移除对应区域', () => {
    const scheme = exampleScheme()
    scheme.templateSelections = [
      exampleSelection('old'),
    ]
    const incoming = exampleSelection('new')
    incoming.regions = incoming.regions.filter(region => region.id === 'sidebar')
    incoming.regions[0]!.adjustments = '改用红色'
    expect(hasTemplateOverlap(scheme, incoming)).toBe(true)
    adoptTemplateSelection(scheme, incoming, 'replace')
    expect(scheme.templateSelections.flatMap(selection => selection.regions).map(region => region.id).sort()).toEqual(['customers', 'filters', 'sidebar'])
    expect(scheme.templateSelections.find(selection => selection.id === 'new')?.regions[0]?.adjustments).toBe('改用红色')
    expect(scheme.description).toBe('Handwritten requirements')
  })
  it('保留已有区域时不重复加入同一区域', () => {
    const scheme = exampleScheme()
    scheme.templateSelections = [
      exampleSelection('old'),
    ]
    adoptTemplateSelection(scheme, exampleSelection('new'), 'keep')
    expect(scheme.templateSelections).toHaveLength(1)
  })
  it('支持旧备份原样读取以及模板参考和收藏往返', () => {
    const legacy = {
      version: 1,
      favorites: [],
      schemes: [
        exampleScheme(),
      ],
    }
    expect(readBackup(JSON.stringify(legacy), [])).toEqual(legacy)
    const scheme = {
      ...exampleScheme(),
      templateSelections: [
        exampleSelection(),
      ],
    }
    const backup = {
      version: 1,
      favorites: [],
      templateFavorites: [template.slug],
      schemes: [scheme],
    }
    expect(readBackup(JSON.stringify(backup), [])).toEqual(backup)
    const invalid = structuredClone(backup)
    invalid.schemes[0]!.templateSelections[0]!.source.url = 'javascript:alert(1)'
    expect(() => readBackup(JSON.stringify(invalid), [])).toThrow()
  })
  it('切换输出语言先预览，取消保留手写，确认才替换', () => {
    const scheme = {
      ...exampleScheme(),
      templateSelections: [
        exampleSelection(),
      ],
    }
    expect(describeScheme(scheme, [], 'zh')).toContain('左侧导航')
    expect(scheme.description).toBe('Handwritten requirements')
    expect(changeOutputLocale(scheme, [], 'zh', false)).toBe(false)
    expect(scheme.description).toBe('Handwritten requirements')
    expect(changeOutputLocale(scheme, [], 'zh', true)).toBe(true)
    expect(scheme.description).toContain('强调色改为深绿色')
    expect(scheme.description).not.toContain('Handwritten requirements')
  })
})
