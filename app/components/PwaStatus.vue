<script setup lang="ts">
import { useOnline } from '@vueuse/core'
import { computed, onMounted, onUnmounted, shallowRef, watch } from 'vue'
import { Icon } from '#components'
import { useNuxtApp } from '#imports'
import { useCatalog } from '../composables/use-catalog'
import { useGlossaryLocale } from '../composables/use-glossary-locale'
import { useTemplates } from '../composables/use-templates'
import { useLibraryStore } from '../stores/library'
import PwaInstall from './PwaInstall.vue'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'
import { Button } from './ui/button'

const props = withDefaults(defineProps<{ showUpdate?: boolean, showInstall?: boolean }>(), { showUpdate: true, showInstall: false })

const { text } = useGlossaryLocale()

const { $pwa } = useNuxtApp()
const { terms } = useCatalog()
const { templates } = useTemplates()
const library = useLibraryStore()
const isOnline = useOnline()
const isCacheReady = shallowRef(false)
const cacheError = shallowRef('')
const isUpdateDismissed = shallowRef(false)
const isBusy = shallowRef(false)
const isDevelopment = import.meta.dev
let timeout: ReturnType<typeof setTimeout> | undefined
const status = computed(() => isDevelopment
  ? '开发预览 · 未启用离线'
  : cacheError.value || $pwa?.registrationError
    ? '离线内容尚未就绪'
    : isCacheReady.value ? '离线内容已就绪' : '正在准备离线内容…')
async function verifyCache(): Promise<void> {
  if (!($pwa?.swActivated || $pwa?.offlineReady) || !('caches' in window))
    return
  try {
    // AI modified: activation alone is not enough if browser storage was evicted; verify every term page.
    const pagePaths = [
      '/',
      '/about',
      '/favorites',
      '/schemes',
      '/schemes/edit',
      '/templates',
      ...templates.value.map(template => `/templates/${template.slug}`),
      ...terms.value.map(term => `/terms/${term.slug}`),
    ]
    // AI modified: both complete locale trees must be cached before declaring offline readiness.
    const paths = [
      '/__nuxt_content/terms/sql_dump.txt',
      // AI modified: template text and previews must be cached before reporting offline readiness.
      '/__nuxt_content/templates/sql_dump.txt',
      ...templates.value.flatMap(template => template.pages.map(page => page.thumbnail)),
      ...pagePaths.flatMap(path => [
        path,
        path === '/'
          ? '/en'
          : `/en${path}`,
      ]).flatMap(path => [path, `${path === '/'
        ? ''
        : path}/_payload.json`]),
    ]
    const cached = await Promise.all(paths.map(path => caches.match(path, { ignoreSearch: true })))
    isCacheReady.value = cached.every(Boolean)
    cacheError.value = isCacheReady.value ? '' : '缓存不完整，请联网后重新准备。'
  }
  catch { cacheError.value = '浏览器无法读取离线缓存。' }
}
onMounted(() => {
  if (isDevelopment)
    return
  void verifyCache()
  timeout = setTimeout(() => {
    if (!isCacheReady.value)
      cacheError.value = '缓存尚未完成。请保持联网，稍后重试。'
  }, 30000)
})
onUnmounted(() => clearTimeout(timeout))
watch(() => [$pwa?.swActivated, $pwa?.offlineReady], () => {
  void verifyCache()
})
async function update(): Promise<void> {
  if (!library.saveLibrary())
    return
  isBusy.value = true
  try {
    await $pwa?.updateServiceWorker(true)
  }
  catch { cacheError.value = '更新失败，内容已保存在本机，请重试。' }
  finally { isBusy.value = false }
}
async function retry(): Promise<void> {
  if (!isOnline.value || !library.saveLibrary())
    return
  isBusy.value = true
  try {
    const registration = await navigator.serviceWorker.getRegistration('/')
    await registration?.unregister()
    window.location.reload()
  }
  catch {
    cacheError.value = '重新准备失败，请检查浏览器存储权限。'
    isBusy.value = false
  }
}
</script>

<template>
  <div class="pwa-status">
    <strong>
      <Icon v-if="isCacheReady" name="lucide:check" :size="12" />
      <Icon v-else-if="!isOnline" name="lucide:wifi-off" :size="12" />
      <Icon v-else name="lucide:refresh-cw" :size="12" />{{ text(status) }}</strong>
    <p>{{ isOnline ? text('收藏与方案保存在此设备') : text('当前离线 · 外部资料需联网') }}</p>
    <Button v-if="cacheError || $pwa?.registrationError" variant="outline" size="xs" :disabled="!isOnline || isBusy" @click="retry">
      {{ text('重新准备离线内容') }}
    </Button>
    <div v-if="showInstall" class="pwa-install-inline">
      <PwaInstall />
    </div>
  </div>
  <!-- AI modified: render one update prompt outside sticky sidebars so it remains clickable. -->
  <Teleport to="body">
    <Transition name="feedback">
      <Alert v-if="props.showUpdate && $pwa?.needRefresh && !isUpdateDismissed" class="pwa-notice" role="status">
        <AlertTitle>{{ text('有新版本可以使用') }}</AlertTitle>
        <AlertDescription>{{ text('先保存当前方案，再刷新更新。保存失败时会保留当前页面。') }}</AlertDescription>
        <div class="flex gap-2">
          <Button :disabled="isBusy" @click="update">
            {{ text('保存并更新') }}
          </Button>
          <Button variant="outline" @click="isUpdateDismissed = true">
            {{ text('稍后') }}
          </Button>
        </div>
      </Alert>
    </Transition>
  </Teleport>
</template>
