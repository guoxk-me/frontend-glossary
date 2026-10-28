<script setup lang="ts">
import { NuxtLink } from '#components'
import { useSeoMeta } from '#imports'
import { useGlossaryLocale } from '../composables/use-glossary-locale'

const { text, isEnglish, localePath } = useGlossaryLocale()

useSeoMeta({
  title: () => `${text('使用指南')} · ${text('前端词典')}`,
})
</script>

<template>
  <article class="about-page prose-section">
    <template v-if="isEnglish">
      <h1>Give your ideas a name.</h1>
      <p class="page-lead">
        An interactive visual glossary for the moments when you know the effect but not its name.
      </p>
      <h2>Start with an effect</h2>
      <ol><li>Search Chinese or English names, aliases and simple descriptions, or browse a category.</li><li>Open a term, try its demo and adjust its parameters.</li><li>Add effects to a named plan and specify their targets.</li><li>Copy or export Markdown to share with a colleague or an AI tool.</li></ol>
      <h2>Your edits stay yours</h2>
      <p>Changing the interface language requires confirmation but never rewrites a plan. New plans generate English descriptions by default. Existing plans keep their Chinese drafts. Output language is a separate setting: preview and confirm before replacing the whole draft. Custom names and targets are never translated automatically.</p>
      <p>After manual editing, parameter changes mark the draft as outdated. Your text remains unchanged until you confirm regeneration.</p>
      <h2>Stored in this browser</h2>
      <p>Favorites and plans stay on this device, without an account or upload. Clearing browser data can remove them. Export JSON backups from <NuxtLink :to="localePath('/schemes')">My plans</NuxtLink> regularly. Import merges favorites and appends plans without replacing existing plans.</p>
      <h2>Offline and installation</h2>
      <p>Wait until both languages are ready offline before disconnecting. Terms, demos, search and local plans then work offline; external references still require a connection. Install through your browser, or use Safari → Share → Add to Home Screen on iPhone and iPad. Updates require a successful save before reloading.</p>
      <h2>About the glossary</h2>
      <p>The first release contains 32 layout, motion, visual-style and interaction terms. Definitions are editorial drafts with references. Common or descriptive names are identified as such. Demos explain patterns and do not generate production code.</p>
      <p>Descriptions currently use local templates. No online AI service is connected.</p>
      <h2>Help improve the glossary</h2>
      <p>Suggest missing terms, corrections and demos in the <a href="https://github.com/guoxk-me/frontend-glossary" target="_blank" rel="noopener noreferrer">GitHub repository</a>.</p>
    </template>
    <template v-else>
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
      <p>收藏、方案和主题保存在本地，无需账号，不会上传。更换设备、清理浏览器数据或使用无痕模式可能丢失内容。请定期在<NuxtLink :to="localePath('/schemes')">{{ text('我的方案') }}</NuxtLink>导出 JSON 备份。导入会合并收藏并追加方案，同名编号不会覆盖已有方案。</p>
      <h2>离线和安装</h2>
      <p>首次联网打开后，等待“离线内容已就绪”，再离线使用全部首版词条与演示。离线状态下外部参考链接无法访问。支持安装的浏览器可点击安装；iPhone / iPad 请用 Safari 的“分享 → 添加到主屏幕”。发现新版本时先保存，再由你确认更新。</p>
      <h2>关于词库</h2>
      <p>首版收录 32 个布局、动效、视觉风格和交互模式。释义与描述是编辑草稿，附有原始参考资料；常用说法与描述性命名会明确标注。演示帮助理解效果，不直接生成生产代码。</p>
      <p>当前是本地规则生成描述，未接入在线 AI。后续会在保持内容与演示可独立维护的前提下扩展。</p>
      <h2>一起让词典更完整</h2>
      <p>可以在 <a href="https://github.com/guoxk-me/frontend-glossary" target="_blank" rel="noopener noreferrer">{{ text('GitHub 仓库') }}</a>提出缺词、释义修正和演示建议。</p>
    </template>
  </article>
</template>
