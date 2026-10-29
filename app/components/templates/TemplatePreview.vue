<script setup lang="ts">
import { shallowRef, watch } from 'vue'
import { Icon } from '#components'
import { useGlossaryLocale } from '../../composables/use-glossary-locale'
import { Button } from '../ui/button'

const props = defineProps<{ src: string, title: string, display?: 'fit' | 'original' }>()
const { text } = useGlossaryLocale()
const hasFailed = shallowRef(false)
watch(() => props.src, () => {
  hasFailed.value = false
})
</script>

<template>
  <div class="template-preview" :class="display ? `preview-${display}` : undefined">
    <!-- AI modified: failed media must not block region selection or requirement editing. -->
    <div v-if="hasFailed" class="preview-failure" role="status">
      <Icon name="lucide:image-off" />
      <p>{{ text('预览暂时无法加载') }}</p>
      <Button variant="outline" @click="hasFailed = false">
        {{ text('重新加载预览') }}
      </Button>
    </div>
    <img v-else :src="src" :alt="title" width="1280" height="702" decoding="async" @error="hasFailed = true">
  </div>
</template>

<style scoped>
.template-preview { overflow: hidden; border: 1px solid var(--border); border-radius: 8px; background: #f8fafc; }
.template-preview img { display: block; width: 100%; height: auto; }
.preview-failure { min-height: 190px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 20px; background: var(--muted); color: var(--muted-foreground); }
/* AI modified: fullscreen can fit the complete image or preserve pixels for reading details. */
.preview-fit { width: 100%; height: 100%; border: 0; border-radius: 0; background: transparent; }
.preview-fit img { width: 100%; height: 100%; object-fit: contain; }
.preview-original { width: max-content; max-width: none; margin: auto; border: 0; border-radius: 0; }
.preview-original img { width: auto; max-width: none; height: auto; }
.preview-fit .preview-failure { height: 100%; }
.preview-original .preview-failure { width: min(320px, 80vw); }
</style>
