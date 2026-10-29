import type { Locale, Scheme } from '../types/glossary'
import type { RegionChoice, StyleAspect, TemplateCopy, TemplateDecision, TemplateEntry, TemplateSelection } from '../types/template'

export const styleAspects: { id: StyleAspect, title: TemplateCopy }[] = [
  {
    id: 'layout',
    title: { zh: '布局', en: 'Layout' },
  },
  {
    id: 'palette',
    title: { zh: '配色', en: 'Palette' },
  },
  {
    id: 'typography',
    title: { zh: '字体', en: 'Typography' },
  },
  {
    id: 'decoration',
    title: { zh: '装饰', en: 'Decoration' },
  },
  {
    id: 'states',
    title: { zh: '状态与动效', en: 'States and motion' },
  },
]

export function searchTemplates(templates: TemplateEntry[], query: string, kind = 'all'): TemplateEntry[] {
  const words = query.trim().toLocaleLowerCase().split(/\s+/u).filter(Boolean)
  return templates.filter(template => (kind === 'all' || template.kind === kind) && words.every(word => [
    template.title,
    template.english,
    template.description.zh,
    template.description.en,
    ...template.keywords,
    ...template.pages.flatMap(page => page.regions.flatMap(region => [region.title.zh, region.title.en])),
  ].join(' ').toLocaleLowerCase().includes(word)))
}

export function selectTemplateRegions(template: TemplateEntry, pageId: string, choices: RegionChoice[], id: string): TemplateSelection {
  const page = template.pages.find(page => page.id === pageId)
  if (!page)
    throw new Error('模板页面不存在。')
  // AI modified: snapshot selected content so later catalog edits cannot silently change saved requirements.
  return {
    id,
    templateSlug: template.slug,
    pageId,
    title: { zh: template.title, en: template.english },
    pageTitle: { ...page.title },
    source: { ...template.source },
    regions: page.regions.flatMap((region) => {
      const choice = choices.find(choice => choice.regionId === region.id)
      return choice?.isSelected
        ? [
            {
              id: region.id,
              title: { ...region.title },
              relation: { ...region.relation },
              features: region.features.filter(feature => choice.aspects.includes(feature.aspect)).map(feature => ({
                aspect: feature.aspect,
                description: { ...feature.description },
              })),
              adjustments: choice.adjustments.trim(),
            },
          ]
        : []
    }),
    excludedRegions: page.regions.filter(region => !choices.some(choice => choice.regionId === region.id && choice.isSelected)).map(region => ({ ...region.title })),
  }
}

export function describeTemplate(selection: TemplateSelection, locale: Locale): string {
  const en = locale === 'en'
  return [
    `## ${selection.title[locale]} / ${selection.pageTitle[locale]}`,
    `${en ? 'Source' : '参考来源'}: ${selection.source.title} (${selection.source.url})`,
    ...selection.regions.map(region => [
      `### ${region.title[locale]}`,
      region.relation[locale],
      ...region.features.map(feature => `- ${feature.description[locale]}`),
      ...(region.adjustments
        ? [`${en ? 'Custom adjustments (original text)' : '我的调整要求'}: ${region.adjustments}`]
        : []),
    ].join('\n')),
    ...(selection.excludedRegions.length
      ? [`${en ? 'Not adopted' : '未采用'}: ${selection.excludedRegions.map(title => title[locale]).join(en ? ', ' : '、')}`]
      : []),
    en
      ? 'Sample names, numbers and copy are reference content only. Unselected visual features and unconfirmed motion are not requirements. Unselected regions describe context only.'
      : '示例名称、数字和文案不作为业务要求；未选择的视觉特征和未经确认的动效不纳入需求。未选区域仅作为位置上下文。',
  ].join('\n\n')
}

export function hasTemplateOverlap(scheme: Scheme, incoming: TemplateSelection): boolean {
  return scheme.templateSelections?.some(selection => selection.templateSlug === incoming.templateSlug
    && selection.pageId === incoming.pageId && selection.regions.some(region => incoming.regions.some(next => next.id === region.id))) ?? false
}

export function adoptTemplateSelection(scheme: Scheme, incoming: TemplateSelection, decision: TemplateDecision): void {
  const existing = scheme.templateSelections ?? []
  const overlaps = (selection: TemplateSelection) => selection.templateSlug === incoming.templateSlug && selection.pageId === incoming.pageId
  // AI modified: replacement affects matching regions only; unrelated references and choices survive.
  const regions = decision === 'keep'
    ? incoming.regions.filter(region => !existing.some(selection => overlaps(selection) && selection.regions.some(saved => saved.id === region.id)))
    : incoming.regions
  const retained = decision === 'replace'
    ? existing.map(selection => overlaps(selection)
        ? {
            ...selection,
            regions: selection.regions.filter(region => !incoming.regions.some(next => next.id === region.id)),
          }
        : selection).filter(selection => selection.regions.length)
    : existing
  scheme.templateSelections = regions.length
    ? [
        ...retained,
        { ...incoming, regions },
      ]
    : retained
}
