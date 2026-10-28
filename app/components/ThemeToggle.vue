<script setup lang="ts">
import { computed } from 'vue'
import { ColorScheme, Icon } from '#components'
import { useColorMode } from '#imports'
import { useGlossaryLocale } from '../composables/use-glossary-locale'
import { Button } from './ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'

const { text, isEnglish } = useGlossaryLocale()

const colorMode = useColorMode()
const themeLabel = computed(() => colorMode.preference === 'system'
  ? '跟随系统'
  : colorMode.preference === 'dark'
    ? '深色'
    : '浅色')
function cycleTheme(): void {
  colorMode.preference = colorMode.preference === 'system'
    ? 'light'
    : colorMode.preference === 'light'
      ? 'dark'
      : 'system'
}
</script>

<template>
  <!-- AI modified: reserve the button during SSR until the browser's theme preference is known. -->
  <ColorScheme>
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger as-child>
          <Button variant="ghost" size="icon" :aria-label="isEnglish ? `Change theme (current: ${text(themeLabel)})` : `切换主题（当前${themeLabel}）`" @click="cycleTheme">
            <Icon v-if="colorMode.preference === 'system'" name="lucide:monitor" />
            <Icon v-else-if="colorMode.preference === 'light'" name="lucide:sun" />
            <Icon v-else name="lucide:moon" />
          </Button>
        </TooltipTrigger><TooltipContent>{{ text(themeLabel) }}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
    <template #placeholder>
      <Button variant="ghost" size="icon" :aria-label="text('正在读取主题偏好')" disabled>
        <Icon name="lucide:monitor" />
      </Button>
    </template>
  </ColorScheme>
</template>
