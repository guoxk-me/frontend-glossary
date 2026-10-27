export type Category = 'layout' | 'motion' | 'visual' | 'interaction'
export type Direction = 'left' | 'right'
export type Easing = 'ease-out' | 'ease-in-out' | 'linear'
export interface Term {
  slug: string
  title: string
  description: string
  english: string
  category: Category
  aliases: string[]
  keywords: string[]
  demo: string
  order: number
  naming: string
  usage: string
  comparison: string
  target: string
  phrase: string
  sources: { title: string, url: string }[]
}
export interface DemoParameters {
  duration: number
  direction: Direction
  easing: Easing
  width: number
  collapsed: boolean
}
export interface SchemeChoice {
  id: string
  termSlug: string
  target: string
  parameters: DemoParameters
}
export interface Scheme {
  id: string
  title: string
  choices: SchemeChoice[]
  description: string
  hasManualEdits: boolean
  isStale: boolean
  updatedAt: string
}
export interface LibraryBackup {
  version: 1
  favorites: string[]
  schemes: Scheme[]
}
export type ParameterProfile = 'sidebar' | 'motion' | 'drawer' | 'none'
