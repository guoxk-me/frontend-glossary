import type { Scheme, Term } from '../types/glossary'
import { describe, expect, it } from 'vitest'
import { readBackup } from './backup'
import { defaultParameters, searchTerms } from './glossary'
import { changeOutputLocale, describeScheme, findConflict, refreshDescription, regenerateDescription } from './schemes'

const sidebar: Term = {
  slug: 'sidebar',
  title: '可折叠侧栏',
  description: '后台导航',
  english: 'Sidebar',
  category: 'layout',
  aliases: ['侧边菜单'],
  keywords: ['左边菜单不动', '右边滚动'],
  demo: 'sidebar',
  order: 0,
  naming: '常用说法',
  usage: '多模块后台',
  comparison: '顶部导航',
  target: '页面整体',
  phrase: '采用可折叠侧栏。',
  sources: [],
}
const drawer: Term = {
  ...sidebar,
  slug: 'drawer',
  title: '详情抽屉',
  category: 'interaction',
  demo: 'drawer',
  english: 'Drawer',
  aliases: ['侧边详情'],
  order: 1,
}
const grid: Term = {
  ...sidebar,
  slug: 'grid',
  title: '卡片网格',
  demo: 'grid',
  english: 'Grid',
  aliases: [],
  order: 2,
}
const terms = [sidebar, drawer, grid]
function exampleScheme(): Scheme {
  return {
    outputLocale: 'zh',
    id: 'scheme-1',
    title: '订单后台',
    choices: [
      {
        id: 'choice-1',
        termSlug: 'sidebar',
        target: '页面整体',
        parameters: defaultParameters(),
      },
    ],
    description: '',
    hasManualEdits: false,
    isStale: false,
    updatedAt: '2026-10-27T00:00:00.000Z',
  }
}

describe('需求描述保护', () => {
  it('未编辑时参数变化会进入生成描述', () => {
    const scheme = exampleScheme()
    scheme.choices[0]!.parameters.width = 280
    refreshDescription(scheme, terms)
    expect(scheme.description).toContain('280px')
    expect(scheme.isStale).toBe(false)
  })
  it('手写后更改参数、取消重生成、再确认替换', () => {
    const scheme = exampleScheme()
    scheme.description = '保留我的业务要求：订单金额只对管理员显示。'
    scheme.hasManualEdits = true
    scheme.choices[0]!.parameters.collapsed = true
    refreshDescription(scheme, terms)
    expect(scheme.isStale).toBe(true)
    const original = scheme.description
    expect(regenerateDescription(scheme, terms, false)).toBe(false)
    expect(scheme.description).toBe(original)
    expect(scheme.isStale).toBe(true)
    expect(regenerateDescription(scheme, terms, true)).toBe(true)
    expect(scheme.description).toContain('默认收起')
    expect(scheme.description).not.toContain('订单金额')
    expect(scheme.hasManualEdits).toBe(false)
    expect(scheme.isStale).toBe(false)
  })
  it('同对象的不同效果可共存，只有相同效果需要确认更新', () => {
    const scheme = exampleScheme()
    const choice = {
      id: 'choice-2',
      termSlug: 'grid',
      target: '页面整体',
      parameters: defaultParameters(),
    }
    expect(findConflict(scheme, choice)).toBeUndefined()
    expect(findConflict(scheme, { ...choice, termSlug: 'sidebar' })?.id).toBe('choice-1')
    expect(findConflict(scheme, { ...choice, termSlug: 'sidebar', target: '订单列表' })).toBeUndefined()
    expect(findConflict(scheme, { ...choice, termSlug: 'drawer' })).toBeUndefined()
    expect(findConflict(scheme, { ...choice, id: 'choice-1', termSlug: 'sidebar' })).toBeUndefined()
  })
})

describe('本地备份边界', () => {
  it('完整保留手写状态与参数，支持往返', () => {
    const scheme = exampleScheme()
    scheme.description = '用户手写内容'
    scheme.hasManualEdits = true
    scheme.isStale = true
    const backup = {
      version: 1,
      favorites: ['sidebar'],
      schemes: [scheme],
    }
    expect(readBackup(JSON.stringify(backup), terms)).toEqual(backup)
  })
  it.each([
    '{broken',
    JSON.stringify({ version: 2, favorites: [], schemes: [] }),
    JSON.stringify({
      version: 1,
      favorites: ['missing'],
      schemes: [],
    }),
    JSON.stringify({
      version: 1,
      favorites: [],
      schemes: [
        {
          ...exampleScheme(),
          choices: [
            {
              id: 'x',
              termSlug: 'sidebar',
              target: '页面',
              parameters: {
                ...defaultParameters(),
                duration: 5000,
              },
            },
          ],
        },
      ],
    }),
    JSON.stringify({
      version: 1,
      favorites: [],
      schemes: [
        exampleScheme(),
        exampleScheme(),
      ],
    }),
  ])('拒绝无效备份 %s', (text) => {
    expect(() => readBackup(text, terms)).toThrow()
  })
})

describe('可解释的关键词搜索', () => {
  it('支持别名、英文大小写、多个描述词及分类组合', () => {
    expect(searchTerms(terms, 'SIDEBAR')[0]?.slug).toBe('sidebar')
    expect(searchTerms(terms, '侧边菜单')[0]?.slug).toBe('sidebar')
    expect(searchTerms(terms, '左边菜单不动 右边滚动', 'layout')[0]?.slug).toBe('sidebar')
    expect(searchTerms(terms, 'SIDEBAR', 'motion')).toEqual([])
    expect(searchTerms(terms, '不存在的效果')).toEqual([])
  })
  it('输出包括明确的作用对象', () => {
    expect(describeScheme(exampleScheme(), terms)).toContain('## 页面整体')
  })
})

// AI modified: migration and language changes must preserve authored text until explicit acceptance.
describe('输出语言与旧备份兼容', () => {
  it('旧备份按中文读取，正文和手写状态不变', () => {
    const { outputLocale: _locale, ...legacy } = exampleScheme()
    legacy.description = '业务补充：保留审批记录'
    legacy.hasManualEdits = true
    const restored = readBackup(JSON.stringify({
      version: 1,
      favorites: ['sidebar'],
      schemes: [legacy],
    }), terms)
    expect(restored.schemes[0]).toEqual({ ...legacy, outputLocale: 'zh' })
  })
  it('取消语言替换不改正文、语言和待更新状态；确认后才替换', () => {
    const scheme = exampleScheme()
    scheme.description = '手写业务内容'
    scheme.hasManualEdits = true
    scheme.isStale = true
    const before = structuredClone(scheme)
    expect(describeScheme(scheme, terms, 'en')).toContain('240px')
    expect(scheme).toEqual(before)
    expect(changeOutputLocale(scheme, terms, 'en', false)).toBe(false)
    expect(scheme).toEqual(before)
    expect(changeOutputLocale(scheme, terms, 'en', true)).toBe(true)
    expect(scheme.outputLocale).toBe('en')
    expect(scheme.description).toContain('# 订单后台')
    expect(scheme.description).toContain('## 页面整体')
    expect(scheme.description).toContain('expanded by default')
    expect(scheme.description).not.toContain('手写业务内容')
    expect(scheme.hasManualEdits).toBe(false)
    expect(scheme.isStale).toBe(false)
    expect(readBackup(JSON.stringify({
      version: 1,
      favorites: [],
      schemes: [scheme],
    }), terms).schemes[0]).toEqual(scheme)
  })
})
