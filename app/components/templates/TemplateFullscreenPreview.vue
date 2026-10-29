<script setup lang="ts">
import type { TemplateEntry } from '../../types/template'
import { shallowRef } from 'vue'
import { Icon } from '#components'
import { useGlossaryLocale } from '../../composables/use-glossary-locale'
import { Button } from '../ui/button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '../ui/dialog'
import CustomerManagementDemo from './CustomerManagementDemo.vue'
import TemplatePreview from './TemplatePreview.vue'

defineProps<{ src: string, title: string, demo?: TemplateEntry['pages'][number]['demo'], disabled?: boolean }>()
const { text } = useGlossaryLocale()
const demoSession = shallowRef(0)
const isOpen = shallowRef(false)
const isOriginalSize = shallowRef(false)
function changeOpen(open: boolean): void {
  isOpen.value = open
  // AI modified: each viewing session starts with the entire reference visible.
  if (open)
    isOriginalSize.value = false
}
</script>

<template>
  <Dialog :open="isOpen" @update:open="changeOpen">
    <DialogTrigger as-child>
      <Button variant="outline" :disabled="disabled">
        <Icon name="lucide:maximize" />{{ text(demo ? '全屏预览' : '查看图片') }}
      </Button>
    </DialogTrigger>
    <DialogContent class="template-fullscreen translate-x-0 translate-y-0" :show-close-button="false">
      <header class="fullscreen-toolbar">
        <div class="fullscreen-heading">
          <DialogTitle class="truncate">
            {{ title }}
          </DialogTitle>
          <p v-if="demo" class="fullscreen-hint">
            {{ text('可交互演示 · 关闭后恢复初始数据') }}
          </p>
          <DialogDescription class="sr-only">
            {{ text('原始参考不会随样式调整改变。') }} {{ text('按 Esc 或点击关闭按钮退出，焦点将回到触发按钮。') }}
          </DialogDescription>
        </div>
        <div class="fullscreen-actions">
          <Button v-if="demo" variant="outline" @click="demoSession++">
            {{ text('重置演示') }}
          </Button>
          <Button v-else variant="outline" :aria-pressed="isOriginalSize" @click="isOriginalSize = !isOriginalSize">
            {{ text(isOriginalSize ? '适应窗口' : '原始尺寸') }}
          </Button>
          <DialogClose as-child>
            <Button variant="outline">
              <Icon name="lucide:x" />{{ text('关闭') }}
            </Button>
          </DialogClose>
        </div>
      </header>
      <div :key="isOriginalSize ? 'original' : 'fit'" class="fullscreen-canvas" :class="{ 'canvas-original': isOriginalSize, 'canvas-interactive': !!demo }" tabindex="0" :aria-label="text('模板预览区域')">
        <CustomerManagementDemo v-if="demo === 'customer-management' && isOpen" :key="demoSession" />
        <TemplatePreview v-else :src="src" :title="title" :display="isOriginalSize ? 'original' : 'fit'" />
      </div>
    </DialogContent>
  </Dialog>
</template>

<style scoped>
/* AI modified: fill the viewport while keeping close and sizing controls outside image scrolling. */
:global(.template-fullscreen[data-slot="dialog-content"]) { inset: 0; translate: none; transform: none; width: 100vw; max-width: none; height: 100dvh; max-height: none; padding: 0; gap: 0; border-radius: 0; display: flex; flex-direction: column; overflow: hidden; animation: none; }
.fullscreen-toolbar { flex: none; display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: max(12px, env(safe-area-inset-top)) max(16px, env(safe-area-inset-right)) 12px max(16px, env(safe-area-inset-left)); border-bottom: 1px solid var(--border); }
.fullscreen-heading { min-width: 0; }
.fullscreen-actions { display: flex; flex: none; gap: 8px; }
.fullscreen-canvas { flex: 1; min-height: 0; min-width: 0; padding: 16px; padding-bottom: max(16px, env(safe-area-inset-bottom)); background: var(--muted); overflow: hidden; }
.fullscreen-hint { margin-top: 5px; font-size: 12px; color: var(--muted-foreground); }
.fullscreen-canvas.canvas-interactive { padding: 0; }
.canvas-original { overflow: auto; overscroll-behavior: contain; }
@media (max-width: 640px) {
  .fullscreen-toolbar { flex-wrap: wrap; gap: 12px; }
  .fullscreen-heading { width: 100%; }
  .fullscreen-actions { width: 100%; justify-content: space-between; }
  .fullscreen-canvas { padding: 8px; padding-bottom: max(8px, env(safe-area-inset-bottom)); }
}
</style>
