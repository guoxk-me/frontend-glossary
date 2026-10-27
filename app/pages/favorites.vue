<script setup lang="ts">
import { useSeoMeta } from '#imports'
import TermCatalog from '../components/TermCatalog.vue'

useSeoMeta({ title: '我的收藏 · 前端词典' })
</script>

<template>
  <TermCatalog favorites-only />
</template>
