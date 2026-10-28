<script setup lang="ts">
import { Icon } from '#components'
import { useNuxtApp } from '#imports'
import { useGlossaryLocale } from '../composables/use-glossary-locale'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'

// AI modified: share the install entry between the desktop header and mobile offline section.
const { $pwa } = useNuxtApp()
const { text } = useGlossaryLocale()
</script>

<template>
  <Button v-if="$pwa?.showInstallPrompt" variant="outline" size="sm" @click="$pwa?.install()">
    <Icon name="lucide:download" />{{ text('安装应用') }}
  </Button>
  <span v-else-if="$pwa?.isPWAInstalled">{{ text('已安装到设备') }}</span>
  <Dialog v-else>
    <DialogTrigger as-child>
      <Button variant="outline" size="sm">
        <Icon name="lucide:download" />{{ text('安装应用') }}
      </Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{{ text('把前端词典装在身边') }}</DialogTitle>
        <DialogDescription>{{ text('先等待离线内容就绪，再添加到主屏幕或桌面。') }}</DialogDescription>
      </DialogHeader>
      <p class="text-sm leading-7">
        {{ text('Chrome / Edge：使用地址栏的安装图标。') }}<br>{{ text('iPhone / iPad：Safari → 分享 → 添加到主屏幕。') }}<br>{{ text('不支持安装的浏览器也可以正常使用网站。') }}
      </p>
    </DialogContent>
  </Dialog>
</template>
