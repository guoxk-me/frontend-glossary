<script setup lang="ts">
import { NuxtLink } from '#components'
import { useSeoMeta } from '#imports'

useSeoMeta({ title: '使用指南 · 前端词典' })
</script>

<template>
  <article class="about-page prose-section">
    <div class="eyebrow">
      GETTING STARTED
    </div>
    <h1>让想法有名字。</h1>
    <p class="page-lead">
      前端词典是一本可以动手试的视觉词典。为“不知道该怎么描述”的时刻准备。
    </p>
    <h2>从一个画面开始</h2>
    <ol>
      <li>用中文、英文、别名或简短描述搜索；也可以直接看分类里的效果。</li>
      <li>打开词条，操作演示、调整参数，了解适用场景和相近概念。</li>
      <li>把词条加入方案，写明作用对象，组合成清楚的需求。</li>
      <li>复制或导出 Markdown，交给同事或你选择的 AI 工具。</li>
    </ol>
    <h2>你的手写内容，会留在原处</h2>
    <p>方案描述可直接编辑。手写后再修改参数，页面只会提示“参数已变化，描述待更新”。只有确认“重新生成并替换”后，原文才会被替换；取消会保留原文。</p>
    <h2>数据只在当前浏览器</h2>
    <p>收藏、方案和主题保存在本地，无需账号，不会上传。更换设备、清理浏览器数据或使用无痕模式可能丢失内容。请定期在<NuxtLink to="/schemes">我的方案</NuxtLink>导出 JSON 备份。导入会合并收藏并追加方案，同名编号不会覆盖已有方案。</p>
    <h2>离线和安装</h2>
    <p>首次联网打开后，等待“离线内容已就绪”，再离线使用全部首版词条与演示。离线状态下外部参考链接无法访问。支持安装的浏览器可点击安装；iPhone / iPad 请用 Safari 的“分享 → 添加到主屏幕”。发现新版本时先保存，再由你确认更新。</p>
    <h2>关于词库</h2>
    <p>首版收录 32 个布局、动效、视觉风格和交互模式。释义与描述是编辑草稿，附有原始参考资料；常用说法与描述性命名会明确标注。演示帮助理解效果，不直接生成生产代码。</p>
    <p>当前是本地规则生成描述，未接入在线 AI。后续会在保持内容与演示可独立维护的前提下扩展。</p>
    <h2>一起让词典更完整</h2>
    <p>可以在 <a href="https://github.com/guoxk-me/frontend-glossary" target="_blank" rel="noopener noreferrer">GitHub 仓库</a>提出缺词、释义修正和演示建议。</p>
  </article>
</template>
