<script setup lang="ts">
import { computed } from 'vue'
import { NuxtLink } from '#components'
import { useRoute, useSeoMeta } from '#imports'
import SchemeEditor from '../../components/SchemeEditor.vue'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '../../components/ui/empty'
import { useLibraryStore } from '../../stores/library'

const route = useRoute()
const library = useLibraryStore()
const scheme = computed(() => library.schemes.find(scheme => scheme.id === route.query.id))
useSeoMeta({
  title: () => `${scheme.value?.title ?? '编辑方案'} · 前端词典`,
  robots: 'noindex',
})
</script>

<template>
  <p v-if="!library.isReady" role="status">
    正在读取本地方案…
  </p>
  <SchemeEditor v-else-if="scheme" :scheme="scheme" />
  <Empty v-else>
    <EmptyHeader>
      <EmptyTitle>当前浏览器没有这个方案</EmptyTitle>
      <EmptyDescription>方案只保存在本机，跨设备使用需要导入备份。</EmptyDescription>
    </EmptyHeader>
    <NuxtLink to="/schemes">返回我的方案 →</NuxtLink>
  </Empty>
</template>
