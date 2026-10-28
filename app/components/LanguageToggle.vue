<script setup lang="ts">
import { computed, nextTick, shallowRef, useTemplateRef } from 'vue'
import { Icon } from '#components'
import { navigateTo, useRoute, useSwitchLocalePath } from '#imports'
import { useGlossaryLocale } from '../composables/use-glossary-locale'
import CollapsePanel from './CollapsePanel.vue'
import { Alert, AlertDescription } from './ui/alert'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'

const { text, isEnglish } = useGlossaryLocale()

const route = useRoute()
const switchLocalePath = useSwitchLocalePath()
const isOpen = shallowRef(false)
const isSwitching = shallowRef(false)
const error = shallowRef('')
const trigger = useTemplateRef<HTMLSpanElement>('trigger')
const target = computed(() => isEnglish.value ? 'zh' : 'en')
const label = computed(() => isEnglish.value ? 'Switch to 简体中文' : '切换为 English')
async function confirmSwitch(): Promise<void> {
  if (isSwitching.value)
    return
  isSwitching.value = true
  error.value = ''
  try {
    // AI modified: navigation changes only the interface; the scheme's draft and output locale are untouched.
    const destination = switchLocalePath(target.value)
    if (!destination)
      throw new Error('Missing localized route')
    const chosen = target.value
    await navigateTo({ path: destination.split(/[?#]/u)[0], query: route.query, hash: route.hash })
    try {
      localStorage.setItem('frontend-glossary:locale', chosen)
    }
    catch { /* Navigation still works without storage. */ }
    isOpen.value = false
    await nextTick()
    trigger.value?.querySelector('button')?.focus()
  }
  catch { error.value = text('切换失败，请重试。') }
  finally { isSwitching.value = false }
}
</script>

<template>
  <Dialog v-model:open="isOpen" @update:open="error = ''">
    <span ref="trigger" class="language-trigger">
      <TooltipProvider><Tooltip><TooltipTrigger as-child><DialogTrigger as-child>
        <Button variant="ghost" size="icon" :aria-label="label">
          <Icon name="lucide:languages" />
        </Button>
      </DialogTrigger></TooltipTrigger><TooltipContent>{{ label }}</TooltipContent></Tooltip></TooltipProvider>
    </span>
    <DialogContent class="sm:max-w-lg" @interact-outside="($event) => { if (isSwitching) $event.preventDefault() }">
      <DialogHeader>
        <DialogTitle>{{ text('切换界面语言为 English？') }}</DialogTitle>
        <DialogDescription>{{ text('只切换界面语言，方案正文和手写内容保持不变。') }}</DialogDescription>
      </DialogHeader>
      <CollapsePanel :open="!!error">
        <Alert variant="destructive">
          <AlertDescription>
            {{ error }}
          </AlertDescription>
        </Alert>
      </CollapsePanel>
      <DialogFooter>
        <Button variant="outline" :disabled="isSwitching" @click="isOpen = false">
          {{ text('取消') }}
        </Button>
        <Button :disabled="isSwitching" @click="confirmSwitch">
          {{ text('确认切换') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
