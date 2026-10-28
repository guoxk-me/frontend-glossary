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


## v2 便捷性实现（2026-10-28）

本节覆盖本轮本地实现；上文首版上线记录不代表本轮已发布。

- `@nuxtjs/i18n` 10.6.0 使用 `prefix_except_default`：中文旧地址保留，英文 `/en/`。主动语言选择存本机；明确词条路径优先。
- `LanguageToggle` 只有一个 Lucide 图标，每次点击先确认；确认保留路径对应词条、query、hash 和方案 ID。取消/关闭不切换。界面切换不写入方案正文，也不改变输出语言与本次演示参数。
- `GlobalSearch` 提供全局入口、Cmd/Ctrl+K、中英文混搜、方向键/Enter、Escape 和焦点恢复。
- `TermNavigation` 保持固定侧栏宽度，各组独立折叠；首次展开、主动操作存本机，具体词条自动展开所属组。
- `TermCatalog` 以 query/category 为筛选来源；返回详情前保存滚动位置，列表页关闭默认滚动复位，避免 Nuxt 覆盖恢复值。
- 32 份 Markdown 均有 `en` 内容。中文在卡片、详情、导航、搜索和已选效果常显英文名；英文以英文名及完整英文解释为主。
- `Scheme.outputLocale` 独立于界面，新建默认英文；旧版备份缺字段时默认为中文。保留旧存储键和备份版本 1，不重写旧正文。
- `SchemeEditor` 切换输出语言先预览当前正文与候选，取消保持原语言与正文，确认才整体替换。方案名/作用对象/手写内容不自动翻译；中文混入英文输出时提示。
- 详情参数默认收起，手机目录可展开。`DrawerDemo` 对齐原型的订单列表和嵌入详情，可搜索订单、切换左右方向和时长、关闭并回到触发订单。
- 安装入口位于桌面顶栏，中等视口在侧栏、手机在离线区域；两种语言的 HTML、payload 和词库缓存完整后才报告就绪。

### 本轮验证

- Executed：`pnpm install --frozen-lockfile --offline` 成功；`pnpm check` 通过 Lint、Type Check、18 项测试和静态生成。之后的局部文案、样式和词条会话状态修改重新执行对应 Lint、Type Check 与 Build。
- Executed：静态生成 159 条路由（含页面、payload 和 sitemap）；Workbox 预缓存 222 项资源，含 32 词条的两种语言。
- Executed：浏览器验证中文搜索进入英文详情、搜索关闭恢复原按钮焦点；分类折叠刷新保留、详情自动展开分类。
- Executed：带分类的列表滚动至 450px，进入详情后返回，URL 与 450px 位置保留；刷新带参数地址仍保留筛选。
- Executed：隔离浏览器方案中手写“手机端抽屉全屏”，切换界面语言后方案 ID、正文与输出语言保持；输出语言取消保持原文，确认后替换为候选。组件测试覆盖参数变化、取消/确认重生成及保存失败。
- Executed：旧备份迁移和新语言字段往返由规则测试覆盖，原文与手写状态保留。
- Executed：缓存完成后断网打开此前未访问的英文新拟态词条，切回中文并搜索 drawer 进入详情，均可使用。
- Executed：1440px、1000px 和 390px 视口无页面横向溢出；手机英文页面、方案预览及语言确认弹窗可用；深色响应系统偏好。扫描全部 32 个英文词条，未发现非预期中文正文片段。
- Inspected：对照 v2 原型调整了文档布局、双语标题、折叠菜单、Lucide 控件、安装入口和抽屉演示；截图记录见 `docs/verification/`。真实词条数量、文案长度和响应式换行与静态样例不同，未声明逐像素等同。

实际截图：[中文桌面](verification/v2-desktop-zh.png)、[订单抽屉](verification/v2-drawer-zh.png)、[英文深色](verification/v2-desktop-en-dark.png)、[英文手机](verification/v2-mobile-en.png)、[界面切换提醒](verification/v2-mobile-language.png)、[输出替换预览](verification/v2-mobile-output-preview.png)。

本轮未提交、推送或发布至 Vercel。iOS/Android 真机安装、屏幕阅读器及词条专业审校仍是后续验收范围。

## 动效补齐实施与验收（2026-10-28，Q49–Q56）

- `CollapsePanel` 负责菜单、参数、手机目录、方案预览与提示的可反向高度过渡。首次展开后保留内容，收起即设置 inert / aria-hidden，避免动画中的隐藏输入获得焦点。
- `list-motion.ts` 配合 Vue TransitionGroup 固定离场项位置，让保留项平滑移动；离场内容立即不可交互。搜索结果使用词条 slug 作为稳定的无障碍 ID，连续输入不等待动画。
- 正文业务路由进入采用 140ms 淡入，顶栏与侧栏不退场；同一页面的语言或筛选变化不触发该动画。主题表面颜色 180ms 过渡，展开约 200ms；未增加依赖。
- 复制、导出按操作次数重新触发反馈；收藏有小幅图标反馈。错误、混合内容和描述待更新提示依业务状态持续存在，不使用定时消失。
- 入场演示首次进入视口播放一次，滚回不重播，重播按钮可再次播放。扫光仅在可见时持续运行；翻转、折叠、悬停等仍按对应操作触发。
- 抽屉面板与列表让位使用相同参数；标签、渐进披露、浮层和加载更多补齐过渡。关闭焦点立即返回，不等待动画。加载到末尾保留按钮及焦点，用 aria-disabled 表明完成。

### 已执行验证

- Executed：`pnpm check` 通过 Lint、Type Check、21 项测试与静态构建；后续导航定位修正重新执行对应 Lint、Type Check 和 Build。224 项资源纳入 PWA 缓存。
- Executed：浏览器逐帧测量到菜单高度由 476px 经多个中间值收至 0；连续五次反向操作后状态正确，关闭内容 inert，展开保留输入。
- Executed：分类筛选有离场透明度和列表位移；快速连续输入后仅保留最新关键词“卡片”的两条布局结果，动画类无残留。
- Executed：业务页面进入记录到一次 140ms 正文动画；确认切换界面语言后动画次数不增加。主题切换采样到连续的背景中间色。
- Executed：390px 视口下，淡入演示在视口外不播放，进入视口后透明度从 0 逐帧到 1，滚出再滚回仍只触发一次；手动重播再次运行。
- Executed：修复主题颜色过渡覆盖抽屉 transform 的冲突后，面板位移与列表 margin 均有连续中间值；关闭即返回触发订单。手机披露、浮层和标签页淡入均经过中间帧检查；浮层 Escape 返回按钮，加载到末尾不丢焦点。
- Executed：模拟 prefers-reduced-motion 后，折叠过渡为 0.01ms，视口外入场内容直接显示最终态，扫光动画停止；手机页面宽度为 390px，无横向溢出。
- Inspected：[实际动效录屏](verification/v2-motion.webm)记录折叠、筛选、抽屉与参数操作，供视觉节奏审阅。录屏和中间帧检查不代表所有设备帧率或真机安装验收。

本轮未提交、推送或部署到 Vercel。静态原型继续作为布局基准，动效触发与中断规则以 PRD 第 9 节为准。


## shadcn-vue 全局控件统一（2026-10-28）

本轮按原型先行顺序完成，以下为本地变更，不代表已经推送或上线。

| 范围 | 实现 |
| --- | --- |
| 5 处下拉 | 参数 2 处、词条输出、方案输出、保存位置 → Select |
| 3 处滑块和 1 处开关 | 宽度、时长、分栏比例 → Slider；默认收起 → Switch |
| 搜索 | 词条、订单 → InputGroup；全局搜索、命令演示 → Command |
| 导航和展开 | Sidebar、NavigationMenu；4 类业务展开 → Collapsible；渐进披露 → Accordion |
| 演示和反馈 | Tabs、Popover、RadioGroup、Tooltip、Table、Empty、Alert、FieldError |
| 确认和信息区 | 5 处确认 → AlertDialog；Card、Badge、Kbd；成功消息 → Sonner |

- CollapsePanel 作为可反向的高度动画层，嵌在 force-mount 的 Collapsible / Accordion 中。收起时立即 inert，已输入内容不会卸载。
- Command 的 shouldFilter=false 让词库继续提供别名和线索排序；选项及键盘导航仍由 Reka 管理。
- AlertDialog 默认聚焦取消，记录程序触发时的焦点；输出语言通过控件 ID 恢复，避免关闭后焦点落在 body。
- 新增运行依赖只有 vue-sonner 2.0.9，使用 catalog:frontend。生成器带入的 Lucide 包已移除。
- 隐藏文件输入、翻转专用按钮、演示画面及嵌入抽屉保留专用实现。

原型：docs/prototypes/frontend-glossary.pen；[控件状态板](prototypes/previews/Q4Rxh.png)、[交互状态板](prototypes/previews/Rtigh.png)。

### 本轮验收

- Executed：冻结锁文件离线安装通过；pnpm check 通过 Lint、Type Check、6 个测试文件共 22 项测试和静态生成。
- Executed：生成 159 条路由，PWA 预缓存 226 项资源。保留上游构建计时、Rollup 注释及依赖 peer 提示，无屏蔽规则。
- Executed：浏览器验证 Command 英文搜索及键盘跳转、空结果、Slider / Switch 联动、Select 选项、手机独立折叠菜单、输出预览取消保留正文并回到下拉框、Popover 单选及 Escape 返回焦点。
- Executed：390px 手机方案页无横向溢出；浅色桌面和深色手机确认框已截图。
- Inspected：普通业务控件已移至 shadcn；原生文件 input 与翻转按钮属于上述保留边界。未重新声明真机安装、全站屏幕阅读器或完整离线更新验收。

截图：[桌面下拉](verification/shadcn-desktop-select.png)、[手机确认](verification/shadcn-mobile-confirmation.png)。本轮未提交、推送或部署。
