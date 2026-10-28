<script setup lang="ts">
import { shallowRef } from 'vue'
import { Icon, NuxtLink } from '#components'
import { navigateTo } from '#imports'
import { useLibraryStore } from '../stores/library'
import LibraryBackup from './LibraryBackup.vue'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from './ui/empty'
import { Field, FieldLabel } from './ui/field'
import { Input } from './ui/input'

const library = useLibraryStore()
const title = shallowRef('后台管理界面')
const isNewOpen = shallowRef(false)
const deleteId = shallowRef('')
function create(): void {
  if (!title.value.trim() || library.schemes.length >= 100)
    return
  const scheme = library.createScheme(title.value)
  void navigateTo({
    path: '/schemes/edit',
    query: { id: scheme.id },
  })
}
function remove(): void {
  library.schemes = library.schemes.filter(scheme => scheme.id !== deleteId.value)
  library.saveLibrary()
  deleteId.value = ''
}
</script>

<template>
  <div class="page-title-row">
    <div>
      <div class="eyebrow">
        YOUR WORKSPACE
      </div>
      <h1>我的方案</h1>
      <p class="page-lead">
        把找到的效果，组合成能直接沟通的需求。
      </p>
    </div>
    <Dialog v-model:open="isNewOpen">
      <DialogTrigger as-child>
        <Button :disabled="!library.isReady || library.schemes.length >= 100">
          <Icon name="lucide:plus" />新建方案
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新建方案</DialogTitle>
          <DialogDescription>先给它起个名字，再从词典加入需要的效果。</DialogDescription>
        </DialogHeader>
        <form @submit.prevent="create">
          <Field>
            <FieldLabel for="new-scheme-title">
              方案名称
            </FieldLabel>
            <Input id="new-scheme-title" v-model="title" maxlength="80" required />
          </Field>
          <DialogFooter class="mt-5">
            <Button type="button" variant="outline" @click="isNewOpen = false">
              取消
            </Button>
            <Button type="submit" :disabled="!title.trim()">
              创建方案
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
  <p v-if="!library.isReady" role="status">
    正在读取本地方案…
  </p>
  <div v-else-if="library.schemes.length" class="scheme-grid">
    <Card v-for="scheme in [...library.schemes].reverse()" :key="scheme.id">
      <CardHeader>
        <Icon name="lucide:layers" class="mb-4" :size="22" />
        <CardTitle>
          <NuxtLink :to="{ path: '/schemes/edit', query: { id: scheme.id } }">{{ scheme.title }}</NuxtLink>
        </CardTitle>
        <CardDescription>{{ scheme.choices.length }} 个效果 · {{ scheme.updatedAt.slice(0, 10) }} 更新</CardDescription>
      </CardHeader>
      <CardFooter class="justify-between gap-2">
        <Badge variant="secondary">
          {{ scheme.isStale ? '描述待更新' : scheme.hasManualEdits ? '已手动编辑' : '本地方案' }}
        </Badge>
        <div class="flex">
          <Button variant="ghost" size="icon" :aria-label="`删除${scheme.title}`" @click="deleteId = scheme.id">
            <Icon name="lucide:trash-2" />
          </Button>
          <Button as-child variant="ghost" size="icon">
            <NuxtLink :to="{ path: '/schemes/edit', query: { id: scheme.id } }" :aria-label="`编辑${scheme.title}`">
              <Icon name="lucide:arrow-up-right" />
            </NuxtLink>
          </Button>
        </div>
      </CardFooter>
    </Card>
  </div>
  <Empty v-else class="border min-h-72 mb-10">
    <EmptyHeader>
      <Icon name="lucide:layers" class="mx-auto text-muted-foreground" />
      <EmptyTitle>你的第一个想法，从这里开始</EmptyTitle>
      <EmptyDescription>例如：可折叠侧栏 ＋ 卡片列表 ＋ 右侧详情抽屉。</EmptyDescription>
    </EmptyHeader>
    <EmptyContent>
      <Button as-child variant="outline">
        <NuxtLink to="/">去词典找灵感 →</NuxtLink>
      </Button>
    </EmptyContent>
  </Empty>
  <Dialog :open="!!deleteId" @update:open="($event) => { if (!$event) deleteId = '' }">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>删除这个方案？</DialogTitle>
        <DialogDescription>删除后无法在当前浏览器恢复。需要保留时，请先导出 JSON 备份。</DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" @click="deleteId = ''">
          取消
        </Button>
        <Button variant="destructive" @click="remove">
          确认删除
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
  <LibraryBackup />
</template>
