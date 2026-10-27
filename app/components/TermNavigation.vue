<script setup lang="ts">
import { NuxtLink } from '#components'
import { useCatalog } from '../composables/use-catalog'
import { categories } from '../lib/glossary'

const emit = defineEmits<{ navigate: [] }>()
const { terms } = useCatalog()
</script>

<template>
  <nav aria-label="词条分类" class="term-navigation">
    <p class="nav-caption">
      开始使用
    </p>
    <NuxtLink to="/" @click="emit('navigate')">全部词条 <span>{{ terms.length }}</span>
    </NuxtLink>
    <NuxtLink to="/favorites" @click="emit('navigate')">我的收藏</NuxtLink>
    <NuxtLink to="/schemes" @click="emit('navigate')">我的方案</NuxtLink>
    <section v-for="category in categories" :key="category.id">
      <p class="nav-caption">
        {{ category.label }} <span>{{ category.short }}</span>
      </p>
      <NuxtLink v-for="term in terms.filter(term => term.category === category.id)" :key="term.slug" :to="`/terms/${term.slug}`" @click="emit('navigate')">{{ term.title }}</NuxtLink>
    </section>
    <NuxtLink to="/about" @click="emit('navigate')">使用说明</NuxtLink>
  </nav>
</template>
