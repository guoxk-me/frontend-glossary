import { useClipboard } from '@vueuse/core'
import { shallowRef } from 'vue'

export function useDelivery() {
  const { copy } = useClipboard({ legacy: true })
  const message = shallowRef('')
  async function copyText(text: string): Promise<void> {
    try {
      await copy(text)
      message.value = '已复制到剪贴板'
    }
    catch { message.value = '复制失败，请选中文字手动复制。' }
  }
  function downloadText(text: string, filename: string, type = 'text/plain'): void {
    const href = URL.createObjectURL(new Blob([text], { type: `${type};charset=utf-8` }))
    const link = document.createElement('a')
    link.href = href
    link.download = filename.replace(/[/\\:*?"<>|]/gu, '-')
    link.click()
    setTimeout(() => URL.revokeObjectURL(href), 1000)
    message.value = '已开始下载'
  }
  return { message, copyText, downloadText }
}
