# 前端词典

看见效果，找到名字。一本面向前端界面表达的中英文视觉词典：从布局、动效、视觉风格和交互模式中找到想要的效果，再组合成清楚的需求描述。

## 当前功能

- 32 个词条的完整中英文内容，支持中文、英文、别名与通俗关键词搜索、分类筛选和收藏。
- 全局搜索支持 Cmd/Ctrl+K；关键词和分类随 URL 保存，返回列表恢复滚动位置；侧栏各分类独立折叠并记住偏好。
- 中文路径保持不变，英文使用 `/en/`；语言图标先弹窗提醒，确认后只切换界面。中文模式常显英文术语。
- 每个词条有独立页面、可操作演示、适用场景、相近概念和来源；部分效果可调整参数。
- 多个具名方案，按作用对象组合效果；同对象同类别冲突需要确认替换。
- 新方案默认英文输出，旧方案保留中文输出及原文；输出语言独立于界面。切换输出语言先比较候选描述，确认后替换整份正文。
- 描述可手写；参数变化只标记待更新，确认后才替换手写正文。自定义中文不自动翻译，英文输出含中文时显示提示。
- 本地自动保存、Markdown 复制与下载、带校验的 JSON 备份导入导出。
- 浅色、深色、跟随系统；移动端导航；完整双语词库的 PWA 离线缓存与保存后更新。

首版不需要后端、账号或在线 AI。收藏与方案只在当前浏览器，请定期导出备份。词条释义目前为编辑草稿，需要持续校对。

## Templates

新增 Templates 入口，首个案例为“简洁浅色客户管理”。支持按区域选择视觉特征、补充调整要求、预览双语描述，以及创建或加入已有方案。模板收藏与词条收藏分开；全局搜索同时检索两者。

模板内容通过 `content/templates/*.json` 维护，原始预览不随文字调整变化。新增案例与本地备份规则见 [Templates 使用与维护](docs/templates.md)。当前提供样式参考与可交互全屏演示，不包含业务接口、源码下载或可视化搭建。

## 本地启动

使用 Node 24.22.1、pnpm 10.28.0（版本已固定）。

```bash
pnpm install --frozen-lockfile
pnpm dev
```

开发地址由终端显示。PWA 在开发模式关闭；离线验收要使用生产构建：

```bash
pnpm build
pnpm preview
```

默认预览为 `http://127.0.0.1:4173`，也可用 `PORT=4273 pnpm preview` 指定端口。首次联网打开后，等待“离线内容已就绪”，再关闭网络访问未打开过的词条。外部参考资料仍需联网。

## 技术栈与检查

Nuxt 4.6.3、Nuxt Content 3.16.2、Vue 3.5、shadcn-vue、Tailwind CSS 4、Pinia、VueUse、Zod。Nuxt Content 使用 Node 原生 SQLite 处理构建期内容，部署产物是静态文件。

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:unit
pnpm test:nuxt
pnpm check
pnpm deps:check
```

国际化路由由 `@nuxtjs/i18n` 10.6.0 管理；界面词句位于 `app/lib/interface-text.ts`，词条英文解释和描述模板位于 Markdown 的 `en` 字段。

主题由 `@nuxtjs/color-mode` 管理，沿用原有本机偏好；`@nuxtjs/sitemap` 与 `@nuxtjs/robots` 在构建时生成 SEO 文件，词典和词条允许收录，收藏与方案页不收录。canonical 统一使用 `https://front.guoxk.me`。

开发时启用 Nuxt DevTools、`@nuxt/hints` 和 `@nuxt/a11y`，后者目前为 alpha，仅作为开发辅助。生产静态站点不加载这两个诊断模块。`@nuxt/test-utils`、`@vue/test-utils` 和 Happy DOM 用于真实 Nuxt 组件交互测试，`pnpm test` 同时执行核心规则与组件测试。

直接依赖使用 `pnpm-workspace.yaml` 的命名 catalog；提交 `pnpm-lock.yaml`。Taze 的检查与更新分开，`pnpm deps:update` 会改版本，之后必须重新执行检查。Husky 提交前检查暂存文件，commitlint 校验 Conventional Commits，支持中文描述。

兼容性约束：TypeScript 固定在 Vue 类型检查与 ESLint 支持的 6.0.3；Workbox 固定 7.4.0，构建期 Rollup 与旧 semver 有显式覆盖，保留 pnpm 信任降级检查。具体原因与验证记录见 [实现说明](docs/implementation.md)。

## 目录

| 位置 | 内容 |
| --- | --- |
| `content/terms/` | Markdown 正文与词条元信息 |
| `content.config.ts` | Nuxt Content 集合字段校验 |
| `app/components/demos/` | 四类独立演示 |
| `app/components/ui/` | 项目维护的 shadcn-vue 组件源码 |
| `app/lib/` | 搜索、描述、冲突与备份规则，以及核心测试 |
| `test/nuxt/` | Nuxt 组件交互与存储失败测试 |
| `app/stores/library.ts` | 收藏、方案和本地持久化 |
| `docs/prd.md` | 已确认需求与范围 |
| `docs/prototypes/frontend-glossary.pen` | 专属 Pen 原型：19 个 v2 页面/状态，含双语、分组折叠与文本保护；保留基础设计系统与共享组件 |

新增词条时同步补齐集合字段、演示分支和生成描述规则，并验证静态构建、搜索及离线访问。列表只展示静态预览，真实动画在详情中运行，并遵循减少动态效果偏好。

## 图标管理

界面图标统一使用 [Nuxt Icon](https://nuxt.com/modules/icon) 的 `<Icon name="lucide:book-open" />`，从 `#components` 显式导入 `Icon`。不再直接使用 `@lucide/vue`。

`@iconify-json/lucide` 提供本地图标数据，`nuxt.config.ts` 启用源码扫描和 SVG 模式，并通过 `provider: 'none'` 禁止运行时图标请求。新增动态拼接的图标名时，将完整名称补入 `icon.clientBundle.icons`，确保静态部署和 PWA 离线可用。shadcn-vue 新生成的组件也需沿用此约定。

## Vercel 部署

已提供 `vercel.json`：构建命令 `pnpm build`，输出 `.output/public`，启用 clean URLs。GitHub 的 `main` 分支已连接 Vercel 自动部署，正式地址为 [front.guoxk.me](https://front.guoxk.me)。没有运行时业务 API 或 Functions。

iOS 主屏幕安装、各桌面浏览器的原生安装流程需在对应设备验收，移动端视口测试不等同于真机安装测试。
