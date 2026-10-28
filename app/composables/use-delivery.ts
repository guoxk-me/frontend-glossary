import { useClipboard } from '@vueuse/core'
import { shallowRef } from 'vue'
import { toast } from 'vue-sonner'
import { useGlossaryLocale } from './use-glossary-locale'

export function useDelivery() {
  const { text: translate } = useGlossaryLocale()
  const { copy } = useClipboard({ legacy: true })
  const message = shallowRef('')
  const deliveryCount = shallowRef(0)
  async function copyText(text: string): Promise<void> {
    try {
      await copy(text)
      message.value = '已复制到剪贴板'
      // AI modified: success is transient; errors remain available inline.
      toast.success(translate(message.value))
    }
    catch { message.value = '复制失败，请选中文字手动复制。' }
    deliveryCount.value++
  }
  function downloadText(text: string, filename: string, type = 'text/plain'): void {
    const href = URL.createObjectURL(new Blob([text], { type: `${type};charset=utf-8` }))
    const link = document.createElement('a')
    link.href = href
    link.download = filename.replace(/[/\\:*?"<>|]/gu, '-')
    link.click()
    setTimeout(() => URL.revokeObjectURL(href), 1000)
    message.value = '已开始下载'
    toast.success(translate(message.value))
    deliveryCount.value++
  }
  return {
    message,
    deliveryCount,
    copyText,
    downloadText,
  }
}
