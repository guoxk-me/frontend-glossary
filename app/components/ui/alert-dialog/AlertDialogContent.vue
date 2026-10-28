<script setup lang="ts">
import type { AlertDialogContentEmits, AlertDialogContentProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { reactiveOmit } from '@vueuse/core'
import { cn } from 'cn'
import {
  AlertDialogContent,
  AlertDialogOverlay,
  AlertDialogPortal,
  useForwardPropsEmits,
} from 'reka-ui'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(
  defineProps<AlertDialogContentProps & {
    class?: HTMLAttributes['class']
    size?: 'default' | 'sm'
    restoreFocusTo?: string
  }>(),
  {
    size: 'default',
  },
)
const emits = defineEmits<AlertDialogContentEmits>()

const delegatedProps = reactiveOmit(props, 'class', 'size', 'restoreFocusTo')

const forwarded = useForwardPropsEmits(delegatedProps, emits)
// AI modified: programmatically opened confirmations also return focus to their initiating control.
let previousFocus: HTMLElement | null = null
function rememberFocus(): void {
  previousFocus = document.activeElement instanceof HTMLElement
    ? document.activeElement
    : null
}
function restoreFocus(event: Event): void {
  const destination = props.restoreFocusTo
    ? document.getElementById(props.restoreFocusTo)
    : previousFocus
  if (!event.defaultPrevented && destination?.isConnected) {
    event.preventDefault()
    destination.focus()
  }
}
</script>

<template>
  <AlertDialogPortal>
    <AlertDialogOverlay
      data-slot="alert-dialog-overlay"
      class="data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs fixed inset-0 z-50"
    />
    <AlertDialogContent
      data-slot="alert-dialog-content"
      :data-size="size"
      v-bind="{ ...$attrs, ...forwarded }"
      :class="
        cn(
          'data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 bg-popover text-popover-foreground ring-foreground/10 gap-4 rounded-xl p-4 ring-1 duration-100 data-[size=default]:max-w-xs data-[size=sm]:max-w-xs data-[size=default]:sm:max-w-sm group/alert-dialog-content fixed top-1/2 left-1/2 z-50 grid w-full -translate-x-1/2 -translate-y-1/2 outline-none',
          props.class,
        )
      "
      @open-auto-focus="rememberFocus"
      @close-auto-focus="restoreFocus"
    >
      <slot />
    </AlertDialogContent>
  </AlertDialogPortal>
</template>
