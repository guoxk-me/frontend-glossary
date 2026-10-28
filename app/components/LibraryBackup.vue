<script setup lang="ts">
import { shallowRef, useTemplateRef } from 'vue'
import { Icon } from '#components'
import { useCatalog } from '../composables/use-catalog'
import { useDelivery } from '../composables/use-delivery'
import { useGlossaryLocale } from '../composables/use-glossary-locale'
import { useLibraryStore } from '../stores/library'
import CollapsePanel from './CollapsePanel.vue'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog'

const { text, isEnglish } = useGlossaryLocale()

const library = useLibraryStore()
const { terms } = useCatalog()
const { downloadText, message, deliveryCount } = useDelivery()
const fileInput = useTemplateRef<HTMLInputElement>('fileInput')
const importMessage = shallowRef('')
const isRecoveryOpen = shallowRef(false)
async function importFile(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file)
    return
  try {
    if (file.size > 5_000_000)
      throw new Error('文件超过 5MB，无法导入。')
    const count = library.importBackup(await file.text(), terms.value)
    importMessage.value = isEnglish.value
      ? `Favorites merged and ${count} plans imported. Existing plans were preserved.`
      : `已合并收藏并导入 ${count} 个方案，原有方案未被覆盖。`
  }
  catch (error) {
    importMessage.value = error instanceof Error
      ? error.message
      : '导入失败，请检查文件。'
  }
  input.value = ''
}
</script>

<template>
  <section class="backup-panel">
    <div>
      <h2>{{ text('备份与迁移') }}</h2>
      <p>{{ text('内容仅保存在当前浏览器。导入会合并收藏、追加方案，编号相同的方案会另存一份。') }}</p>
    </div>
    <div class="flex flex-wrap gap-2">
      <Button variant="outline" :disabled="!library.isReady" @click="downloadText(library.exportBackup(), '前端词典备份.json', 'application/json')">
        <Icon name="lucide:download" />{{ text('导出 JSON') }}
      </Button>
      <Button variant="outline" :disabled="!library.isReady || !!library.restoreError" @click="fileInput?.click()">
        <Icon name="lucide:upload" />{{ text('导入 JSON') }}
      </Button>
      <input ref="fileInput" type="file" accept=".json,application/json" class="hidden" :aria-label="text('导入方案备份')" @change="importFile">
    </div>
    <p role="status" class="delivery-status">
      <Transition name="feedback">
        <span :key="`${deliveryCount}:${importMessage}`" class="inline-block">{{ text(importMessage || message) }}</span>
      </Transition>
    </p>
    <CollapsePanel :open="!!library.restoreError">
      <Alert variant="destructive">
        <AlertTitle>{{ text('检测到无法读取的本地数据') }}</AlertTitle>
        <AlertDescription>
          <p>{{ text('原始内容仍然保留。先下载原始备份，再选择是否用当前内容重新建立存储。') }}</p>
          <div class="flex flex-wrap gap-2 mt-3">
            <Button v-if="library.originalBackup" variant="outline" @click="downloadText(library.originalBackup, '前端词典原始数据.txt')">
              {{ text('下载原始数据') }}
            </Button>
            <Button variant="outline" @click="isRecoveryOpen = true">
              {{ text('重新建立存储') }}
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </CollapsePanel>
    <Dialog v-model:open="isRecoveryOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{{ text('替换无法读取的存储？') }}</DialogTitle>
          <DialogDescription>{{ text('这会用当前页面中的收藏和方案替换原始本地数据。请先下载原始数据，以便之后人工恢复。') }}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" @click="isRecoveryOpen = false">
            {{ text('取消') }}
          </Button>
          <Button @click="library.restartStorage(); isRecoveryOpen = false">
            {{ text('确认替换存储') }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </section>
</template>
