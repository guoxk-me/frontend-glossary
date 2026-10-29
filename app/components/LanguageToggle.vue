<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { toast } from 'vue-sonner'
import { Icon } from '#components'
import { navigateTo, useRoute, useSwitchLocalePath } from '#imports'
import { useGlossaryLocale } from '../composables/use-glossary-locale'
import { Button } from './ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'

const { text, isEnglish } = useGlossaryLocale()

const route = useRoute()
const switchLocalePath = useSwitchLocalePath()
const isSwitching = shallowRef(false)
const target = computed(() => isEnglish.value ? 'zh' : 'en')
const label = computed(() => isEnglish.value ? 'Switch to 简体中文' : '切换为 English')
async function switchLanguage(): Promise<void> {
  if (isSwitching.value)
    return
  isSwitching.value = true
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
  }
  catch { toast.error(text('切换失败，请重试。')) }
  finally { isSwitching.value = false }
}
</script>

<template>
  <!-- AI modified: reversible interface changes do not need a confirmation dialog. -->
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger as-child>
        <Button variant="ghost" size="icon" :aria-label="label" :disabled="isSwitching" @click="switchLanguage">
          <Icon name="lucide:languages" />
        </Button>
      </TooltipTrigger><TooltipContent>{{ label }}</TooltipContent>
    </Tooltip>
  </TooltipProvider>
</template>
