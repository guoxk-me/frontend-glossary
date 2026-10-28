<script setup lang="ts">
import { shallowRef, watch } from 'vue'

const props = defineProps<{ open: boolean }>()
// AI modified: keep opened content mounted so CSS can reverse from its current height without resetting inputs.
const hasOpened = shallowRef(props.open)
watch(() => props.open, (open) => {
  if (open)
    hasOpened.value = true
}, { flush: 'sync' })
</script>

<template>
  <div class="collapse-panel" :class="{ 'is-open': open }" :aria-hidden="!open" :inert="!open || undefined">
    <div class="collapse-panel-inner">
      <slot v-if="hasOpened" />
    </div>
  </div>
</template>

<style scoped>
.collapse-panel { display: grid; grid-template-rows: 0fr; opacity: 0; visibility: hidden; transition: grid-template-rows var(--motion-expand) var(--motion-ease), opacity var(--motion-fast) ease-out, visibility 0s var(--motion-expand); }
.collapse-panel.is-open { grid-template-rows: 1fr; opacity: 1; visibility: visible; transition-delay: 0s; }
.collapse-panel-inner { min-height: 0; overflow: hidden; }
</style>
