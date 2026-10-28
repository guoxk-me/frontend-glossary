# 首版实现边界与组件分工

依据已确认 PRD 与文档风格 v2，2026-10-27 开始实现。现已通过 Vercel 发布静态站点，不增加后端或在线 AI。

- AppShell / TermNavigation：全局导航、移动菜单和离线状态；ThemeToggle 使用 Nuxt Color Mode 管理三态主题。
- TermCatalog / TermCard：关键词及分类筛选、静态效果预览和收藏入口；输入词条数组，触发收藏。
- TermDetail / DemoStage / TermParameters：具体词条解释、独立交互演示与合法参数；参数向上更新，重播由页面触发。
- AddToSchemeDialog：选择或新建方案、指定对象并确认冲突，成功后导航到编辑页。
- SchemeEditor / SchemeSelection：具名选择列表、参数与作用对象、描述草稿、重新生成确认、保存和导出。
- Library store：收藏、方案、备份校验与持久化；保存失败保留内存输入，不自动覆盖手写正文。
- PwaStatus：缓存就绪、失败、安装说明与保存后更新。只在真实缓存完成后承诺离线。
- Markdown 内容是正文与词条元信息的唯一来源；演示组件和 TS 描述规则独立维护。

## 实际技术版本与兼容性

- Node 24.22.1、pnpm 10.28.0、Nuxt 4.6.3、Nuxt Content 3.16.2、Vue 3.5.44、shadcn-vue / shadcn-nuxt 2.8.2、Tailwind CSS 4.3.3。
- TypeScript 6.0.3：当前 vue-tsc 和 typescript-eslint 的兼容范围不包含 TypeScript 7，保留可通过检查的版本。
- ESLint 10.13.0 + Antfu 10：为 Markdown 显式声明 YAML frontmatter，避免内容元信息被当作 Markdown 节点导致 lint 崩溃。
- Workbox 7.4.0 + 构建期 Rollup 2.79.2：7.4.1 引入的预发布插件未通过 pnpm 信任降级检查，使用可验证的稳定依赖组合；未添加信任豁免。
- 旧 Babel 链路的 semver 6 请求覆盖到 7.8.5，保留版本比较能力并通过实际静态构建。
- 上游仍有 oxc-parser 与 unplugin 的 peer 提示；目前类型检查和构建通过，后续升级继续观察，不据此宣称所有组合兼容。

## Nuxt 生态模块接入（2026-10-28）

- `@nuxtjs/color-mode` 4.1.0 管理主题。沿用 `frontend-glossary:theme` 存储键，在主题初始化前将旧 `auto` 偏好迁移为 `system`，保留显式浅色和深色偏好；SSR 预留按钮以避免主题导致 hydration 不一致。
- `@nuxtjs/sitemap` 9.1.0 开启 `zeroRuntime`，`@nuxtjs/robots` 7.0.2 通过路由规则排除收藏、方案列表和编辑页。主地址固定为 `https://front.guoxk.me`，canonical 不带查询参数，保持无后端部署。
- `@nuxt/hints` 1.1.5 和 `@nuxt/a11y` 1.0.0-alpha.1 仅通过 `$development` 加载，开发时开启 DevTools；alpha 诊断不能替代人工无障碍验收。
- `@nuxt/test-utils` 4.3.4、`@vue/test-utils` 2.5.1、Happy DOM 21.0.4 与现有 Vitest 5 配合；unit 项目运行规则测试，nuxt 项目运行组件测试。Nuxt 类型配置覆盖 `test/nuxt/`。
- 新组件测试覆盖三态主题、参数修改后保留手写正文、取消/确认重新生成，以及本机保存失败时保留输入并显示提示。

## 本次模块接入验证（2026-10-28）

- Executed：`pnpm check` 通过 Lint、Type Check、14 项测试（11 项规则、3 项 Nuxt 组件）和静态生成。
- Executed：sitemap 包含 34 个公开 URL，全部使用正式域名；收藏、方案列表、方案编辑页的静态 HTML 包含 `noindex`，不进入 sitemap。robots.txt 提供 sitemap 地址并允许爬虫读取页面的 noindex 指令。
- Executed：真实浏览器在系统深色时将旧 `auto` 偏好迁移为 `system`，首次 DOM 就绪即为深色；原有 light/dark 偏好保留，三态按钮切换和刷新正常。
- Executed：生产预览缓存 144 个资源，断网可直接打开此前未访问的词条，主题和本地 SVG 图标正常；生产页面无开发诊断资源请求。
- Executed：开发页面正常加载 Hints、A11y 和 DevTools。开发日志仍有上游 MDC 预构建条目无法解析的提示，未影响本次页面启动、类型检查和静态构建；不通过屏蔽规则消除提示。

## 首版已执行的验证

- 冻结依赖安装、Lint、Type Check、11 项单元测试与静态构建通过。测试覆盖搜索、描述保留、重新生成、冲突判定、备份结构及版本校验。
- 桌面浏览器完成搜索、收藏、加入方案、手写描述、参数修改、取消和确认重新生成、刷新持久化。
- 同对象同类别替换后保留手写描述并标记待更新；JSON 导出再导入追加方案，非法版本拒绝且原有方案不变。
- 抽屉打开后的焦点、Escape 关闭和焦点返回已检查；390px 移动视口的导航和方案编辑页宽度均为 390px，无横向溢出。三态主题切换正常，减少动态效果偏好将演示动画缩短到 0.01ms。
- PWA 完整预缓存 143 个资源，含全部词条、页面 payload、SQL 内容和 WASM；内容就绪状态额外检查实际缓存。
- 关闭本地预览服务并模拟断网后，打开此前未访问的词条、执行搜索、编辑方案并刷新，均可使用且编辑保留。
- 单次版本更新后，实际按钮点击可完成刷新，143 项缓存完整且无待激活版本，手写描述保留。
- 注入本机存储写入失败后，“保存并更新”保留当前页面和输入；存储恢复后可更新，手写内容保留。

## 尚未覆盖与后续边界

- 已部署到 `https://front.guoxk.me`，GitHub main 推送触发自动部署；每次发布仍需核对目标提交与线上行为。
- 未在 iOS / Android 真机或桌面原生安装后验收；移动视口与浏览器离线测试不能替代这些检查。
- 词条内容是首版编辑草稿；外部来源、术语适用范围和表述需持续校对。
- 方案只存当前浏览器，未接账号、后端同步或在线 AI。浏览器清理站点数据会删除本机方案，使用 JSON 备份迁移。
- 演示边界提供运行失败后的重试入口；未人为破坏演示组件进行故障注入。
