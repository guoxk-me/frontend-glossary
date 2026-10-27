import type { Category, DemoParameters, ParameterProfile, Term } from '../types/glossary'

export const categories: { id: Category, label: string, short: string }[] = [
  { id: 'layout', label: '布局', short: '组织空间' },
  { id: 'motion', label: '动效', short: '表达变化' },
  { id: 'visual', label: '视觉风格', short: '建立层级' },
  { id: 'interaction', label: '交互模式', short: '完成任务' },
]
export function defaultParameters(): DemoParameters {
  return {
    duration: 240,
    direction: 'right',
    easing: 'ease-out',
    width: 240,
    collapsed: false,
  }
}
export function parameterProfile(term: Term): ParameterProfile {
  if (term.demo === 'sidebar')
    return 'sidebar'
  if (term.demo === 'drawer')
    return 'drawer'
  if (term.category === 'motion')
    return 'motion'
  return 'none'
}
export function describeTerm(term: Term, parameters: DemoParameters): string {
  const profile = parameterProfile(term)
  if (profile === 'sidebar')
    return `${term.phrase}侧栏宽度为 ${parameters.width}px，默认${parameters.collapsed ? '收起' : '展开'}。`
  if (profile === 'drawer') {
    return `点击订单后，从页面${parameters.direction === 'right'
      ? '右'
      : '左'}侧滑入详情抽屉，保留当前列表及滚动位置。进入动画为 ${parameters.duration}ms，使用 ${parameters.easing} 缓动；关闭后焦点返回触发按钮。`
  }
  if (profile === 'motion') {
    const direction = term.demo === 'slide'
      ? `从${parameters.direction === 'right'
        ? '右'
        : '左'}侧进入。`
      : ''
    return `${term.phrase}${direction}单次过渡时长为 ${parameters.duration}ms，使用 ${parameters.easing} 缓动；减少动态效果时直接呈现结束状态。`
  }
  return term.phrase
}
// AI modified: rank curated phrases locally rather than promising arbitrary semantic search.
export function searchTerms(terms: Term[], query: string, category = 'all'): Term[] {
  const words = query.trim().toLocaleLowerCase().split(/\s+/u).filter(Boolean)
  return terms.filter(term => category === 'all' || term.category === category)
    .map((term) => {
      const names = [term.title, term.english, ...term.aliases].join(' ').toLocaleLowerCase()
      const clues = [term.description, ...term.keywords].join(' ').toLocaleLowerCase()
      const scores = words.map(word => names.includes(word)
        ? 5
        : clues.includes(word)
          ? 2
          : 0)
      return {
        term,
        score: scores.every(score => score > 0)
          ? scores.reduce<number>((sum, score) => sum + score, 0)
          : -1,
      }
    })
    .filter(match => match.score >= 0)
    .sort((a, b) => b.score - a.score || a.term.order - b.term.order)
    .map(match => match.term)
}
