import type { LibraryBackup, Scheme, SchemeChoice, Term } from '../types/glossary'
import type { TemplateDecision, TemplateSelection } from '../types/template'
import { defineStore } from 'pinia'
import { ref, shallowRef } from 'vue'
import { readBackup, storageKey } from '../lib/backup'
import { findConflict, refreshDescription, regenerateDescription } from '../lib/schemes'
import { templateSelectionSchema } from '../lib/template-schema'
import { adoptTemplateSelection, describeTemplate, hasTemplateOverlap } from '../lib/templates'

export const useLibraryStore = defineStore('library', () => {
  const favorites = ref<string[]>([])
  const templateFavorites = ref<string[]>([])
  const schemes = ref<Scheme[]>([])
  const isReady = shallowRef(false)
  const saveError = shallowRef('')
  const restoreError = shallowRef('')
  const lastSaved = shallowRef('')
  const originalBackup = shallowRef('')

  function hydrate(terms: Term[]): void {
    if (isReady.value || !import.meta.client)
      return
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        originalBackup.value = stored
        const backup = readBackup(stored, terms)
        favorites.value = backup.favorites
        templateFavorites.value = backup.templateFavorites ?? []
        schemes.value = backup.schemes
      }
    }
    catch (error) {
      restoreError.value = error instanceof Error
        ? error.message
        : '无法读取本地存储。'
    }
    isReady.value = true
  }
  function exportBackup(): string {
    const backup: LibraryBackup = {
      version: 1,
      favorites: favorites.value,
      schemes: schemes.value,
      ...(templateFavorites.value.length
        ? { templateFavorites: templateFavorites.value }
        : {}),
    }
    return JSON.stringify(backup, null, 2)
  }
  function saveLibrary(): boolean {
    if (!import.meta.client || !isReady.value)
      return false
    // AI modified: corrupted storage is retained for recovery instead of overwritten by an empty library.
    if (restoreError.value) {
      saveError.value = '本地数据需要恢复，请先在“我的方案”导出原始备份。'
      return false
    }
    try {
      localStorage.setItem(storageKey, exportBackup())
      saveError.value = ''
      lastSaved.value = new Date().toISOString()
      return true
    }
    catch {
      saveError.value = '保存失败，输入仍保留在当前页面。请复制描述或导出备份后再试。'
      return false
    }
  }
  function toggleFavorite(slug: string): void {
    favorites.value = favorites.value.includes(slug)
      ? favorites.value.filter(favorite => favorite !== slug)
      : [...favorites.value, slug]
    saveLibrary()
  }
  // AI modified: templates have a separate favorite namespace and preserve term favorites.
  function toggleTemplateFavorite(slug: string): void {
    templateFavorites.value = templateFavorites.value.includes(slug)
      ? templateFavorites.value.filter(favorite => favorite !== slug)
      : [...templateFavorites.value, slug]
    saveLibrary()
  }
  function createScheme(title: string): Scheme {
    const scheme: Scheme = {
      outputLocale: 'en',
      id: crypto.randomUUID(),
      title: title.trim() || '未命名方案',
      choices: [],
      description: '',
      hasManualEdits: false,
      isStale: false,
      updatedAt: new Date().toISOString(),
    }
    schemes.value.push(scheme)
    saveLibrary()
    return schemes.value[schemes.value.length - 1]!
  }
  function addChoice(scheme: Scheme, choice: SchemeChoice, terms: Term[], hasConfirmed = false): boolean {
    const conflict = findConflict(scheme, choice)
    if (conflict && !hasConfirmed)
      return false
    if (!conflict && !scheme.choices.some(existing => existing.id === choice.id) && scheme.choices.length >= 100) {
      saveError.value = '一个方案最多包含 100 个效果。现有内容已保留，请先移除不需要的效果。'
      return false
    }
    if (conflict)
      scheme.choices = scheme.choices.filter(existing => existing.id !== conflict.id)
    const existing = scheme.choices.findIndex(existing => existing.id === choice.id)
    if (existing >= 0)
      scheme.choices.splice(existing, 1, choice)
    else scheme.choices.push(choice)
    refreshDescription(scheme, terms)
    saveLibrary()
    return true
  }
  function removeChoice(scheme: Scheme, choiceId: string, terms: Term[]): void {
    scheme.choices = scheme.choices.filter(choice => choice.id !== choiceId)
    refreshDescription(scheme, terms)
    saveLibrary()
  }
  function editDescription(scheme: Scheme, text: string): void {
    scheme.description = text
    scheme.hasManualEdits = true
    scheme.updatedAt = new Date().toISOString()
    saveLibrary()
  }
  function renameScheme(scheme: Scheme, title: string, terms: Term[]): void {
    scheme.title = title.trim() || '未命名方案'
    refreshDescription(scheme, terms)
    saveLibrary()
  }
  function regenerate(scheme: Scheme, terms: Term[], hasConfirmed = false): boolean {
    if (!regenerateDescription(scheme, terms, hasConfirmed))
      return false
    saveLibrary()
    return true
  }
  // AI modified: append new references without overwriting manual prose; edits mark it stale.
  function adoptTemplate(scheme: Scheme, selection: TemplateSelection, terms: Term[], decision?: TemplateDecision): boolean {
    if (!templateSelectionSchema.safeParse(selection).success) {
      saveError.value = '模板选择无效或超出备份限制，现有内容已保留。'
      return false
    }
    const isEditing = scheme.templateSelections?.some(saved => saved.id === selection.id) ?? false
    if (!isEditing && hasTemplateOverlap(scheme, selection) && !decision)
      return false
    if (!isEditing && (scheme.templateSelections?.length ?? 0) >= 100) {
      saveError.value = '一个方案最多包含 100 个模板参考。'
      return false
    }
    // AI modified: validate prospective text before mutation so the next reload can still read the backup.
    const candidate: Scheme = {
      ...scheme,
      templateSelections: [
        ...(scheme.templateSelections ?? []),
      ],
    }
    if (isEditing) {
      candidate.templateSelections = candidate.templateSelections?.map(saved => saved.id === selection.id
        ? selection
        : saved)
      refreshDescription(candidate, terms)
    }
    else {
      adoptTemplateSelection(candidate, selection, decision ?? 'keep')
      const adopted = candidate.templateSelections?.find(saved => saved.id === selection.id)
      if (!adopted && decision === 'keep')
        return true
      if (candidate.hasManualEdits && decision !== 'replace' && adopted) {
        candidate.description = [
          candidate.description,
          describeTemplate(adopted, candidate.outputLocale),
        ].filter(Boolean).join('\n\n')
        candidate.updatedAt = new Date().toISOString()
      }
      else {
        refreshDescription(candidate, terms)
      }
    }
    if (candidate.description.length > 100000) {
      saveError.value = '加入后描述超过 100000 字，现有内容已保留。请另建方案。'
      return false
    }
    Object.assign(scheme, candidate)
    saveLibrary()
    return true
  }
  function removeTemplate(scheme: Scheme, selectionId: string, terms: Term[]): void {
    scheme.templateSelections = scheme.templateSelections?.filter(selection => selection.id !== selectionId)
    refreshDescription(scheme, terms)
    saveLibrary()
  }
  function importBackup(text: string, terms: Term[]): number {
    const backup = readBackup(text, terms)
    if (schemes.value.length + backup.schemes.length > 100)
      throw new Error('导入后超过 100 个方案，请先备份并整理，现有内容未修改。')
    if (restoreError.value)
      throw new Error('请先恢复本地存储，再导入备份。')
    favorites.value = [
      ...new Set([
        ...favorites.value,
        ...backup.favorites,
      ]),
    ]
    templateFavorites.value = [
      ...new Set([
        ...templateFavorites.value,
        ...(backup.templateFavorites ?? []),
      ]),
    ]
    const ids = new Set(schemes.value.map(scheme => scheme.id))
    for (const scheme of backup.schemes) {
      if (ids.has(scheme.id)) {
        scheme.id = crypto.randomUUID()
        scheme.title = `${scheme.title.slice(0, 72)}（导入）`
      }
      schemes.value.push(scheme)
    }
    if (!saveLibrary())
      throw new Error(saveError.value)
    return backup.schemes.length
  }
  function restartStorage(): void {
    restoreError.value = ''
    saveLibrary()
  }
  return {
    favorites,
    templateFavorites,
    toggleTemplateFavorite,
    adoptTemplate,
    removeTemplate,
    schemes,
    isReady,
    saveError,
    restoreError,
    lastSaved,
    originalBackup,
    hydrate,
    saveLibrary,
    toggleFavorite,
    createScheme,
    addChoice,
    removeChoice,
    editDescription,
    renameScheme,
    regenerate,
    exportBackup,
    importBackup,
    restartStorage,
  }
})
