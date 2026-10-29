import type { VueWrapper } from '@vue/test-utils'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { computed } from 'vue'
import { useNuxtApp } from '#imports'
import PwaStatus from '../../app/components/PwaStatus.vue'
import authoredTemplate from '../../content/templates/customer-management.json'

vi.mock('../../app/composables/use-catalog', () => ({
  useCatalog: () => ({
    terms: computed(() => []),
  }),
}))
vi.mock('../../app/composables/use-templates', () => ({
  useTemplates: () => ({
    templates: computed(() => [authoredTemplate]),
  }),
}))
let wrapper: VueWrapper | undefined
let originalFlags: { swActivated: boolean, offlineReady: boolean } | undefined
beforeEach(() => {
  const pwa = useNuxtApp().$pwa
  if (!pwa)
    throw new Error('PWA integration is unavailable')
  originalFlags = { swActivated: pwa.swActivated, offlineReady: pwa.offlineReady }
  pwa.swActivated = true
  pwa.offlineReady = true
})
afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  if (originalFlags)
    Object.assign(useNuxtApp().$pwa!, originalFlags)
  vi.unstubAllGlobals()
})

// AI modified: a ready dictionary cache cannot mask missing template previews or metadata.
it('模板缩略图缺失时不报告离线已就绪，并检查中英文模板路由', async () => {
  const match = vi.fn(async (path: string) => path === '/templates/customer-management.png'
    ? undefined
    : new Response('cached'))
  vi.stubGlobal('caches', { match })
  wrapper = await mountSuspended(PwaStatus)
  await flushPromises()
  expect(wrapper.text()).toContain('离线内容尚未就绪')
  expect(wrapper.text()).not.toContain('离线内容已就绪')
  for (const path of [
    '/templates',
    '/en/templates',
    '/templates/customer-management',
    '/en/templates/customer-management',
    '/__nuxt_content/templates/sql_dump.txt',
  ])
    expect(match).toHaveBeenCalledWith(path, { ignoreSearch: true })
})
