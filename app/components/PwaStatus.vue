<script setup lang="ts">
import { Check, Download, RefreshCw, WifiOff } from '@lucide/vue'
import { useOnline } from '@vueuse/core'
import { computed, onMounted, onUnmounted, shallowRef, watch } from 'vue'
import { useNuxtApp } from '#imports'
import { useCatalog } from '../composables/use-catalog'
import { useLibraryStore } from '../stores/library'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'

const props = withDefaults(defineProps<{ showUpdate?: boolean }>(), { showUpdate: true })
const { $pwa } = useNuxtApp()
const { terms } = useCatalog()
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
    const paths = [
      '/',
      '/schemes',
      '/schemes/edit',
      '/_payload.json',
      '/__nuxt_content/terms/sql_dump.txt',
      ...terms.value.flatMap(term => [`/terms/${term.slug}`, `/terms/${term.slug}/_payload.json`]),
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
      <Check v-if="isCacheReady" :size="12" />
      <WifiOff v-else-if="!isOnline" :size="12" />
      <RefreshCw v-else :size="12" />{{ status }}</strong>
    <p>{{ isOnline ? '收藏与方案保存在此设备' : '当前离线 · 外部资料需联网' }}</p>
    <Button v-if="cacheError || $pwa?.registrationError" variant="outline" size="xs" :disabled="!isOnline || isBusy" @click="retry">
      重新准备离线内容
    </Button>
    <Button v-if="$pwa?.showInstallPrompt" variant="outline" size="xs" @click="$pwa?.install()">
      <Download />安装应用
    </Button>
    <span v-else-if="$pwa?.isPWAInstalled">已安装到设备</span>
    <Dialog v-else>
      <DialogTrigger as-child>
        <Button variant="ghost" size="xs">
          <Download />安装说明
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>把前端词典装在身边</DialogTitle>
          <DialogDescription>先等待离线内容就绪，再添加到主屏幕或桌面。</DialogDescription>
        </DialogHeader>
        <p class="text-sm leading-7">
          Chrome / Edge：使用地址栏的安装图标。<br>iPhone / iPad：Safari → 分享 → 添加到主屏幕。<br>不支持安装的浏览器也可以正常使用网站。
        </p>
      </DialogContent>
    </Dialog>
  </div>
  <!-- AI modified: render one update prompt outside sticky sidebars so it remains clickable. -->
  <Teleport to="body">
    <div v-if="props.showUpdate && $pwa?.needRefresh && !isUpdateDismissed" class="pwa-notice" role="status">
      <strong>有新版本可以使用</strong>
      <p>先保存当前方案，再刷新更新。保存失败时会保留当前页面。</p>
      <div class="flex gap-2">
        <Button :disabled="isBusy" @click="update">
          保存并更新
        </Button>
        <Button variant="outline" @click="isUpdateDismissed = true">
          稍后
        </Button>
      </div>
    </div>
  </Teleport>
</template>
