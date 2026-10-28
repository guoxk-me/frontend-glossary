---
title: "右侧详情抽屉"
description: "在当前页面侧边展开详情，保留列表上下文。"
slug: "drawer"
english: "Detail drawer"
category: "interaction"
aliases: ["侧边详情面板", "详情抽屉"]
keywords: ["点击订单", "右边滑出来", "不跳转", "看详情"]
demo: "drawer"
order: -3
naming: "常见叫法"
usage: "订单详情、客户资料与辅助设置。"
comparison: "抽屉从边缘展开；居中弹窗更适合聚焦确认或短操作。抽屉是否阻止背景操作需单独说明。"
target: "订单详情"
phrase: "点击订单后，从页面侧边展开详情抽屉，保留列表及滚动位置；关闭后把焦点还给触发按钮。"
sources: [{"title": "相关规范与实现参考", "url": "https://shadcn-vue.com/docs/components/sheet"}]
en: {"description": "Reveal details from an edge while preserving the current page context.", "usage": "Order details, profiles and contextual settings.", "comparison": "A drawer enters from an edge; a centered dialog focuses attention on a short decision. State explicitly whether the background remains interactive.", "target": "Order details", "phrase": "Open a detail drawer from the right while keeping the list and its scroll position.", "naming": "Common term", "explanation": "Reveal details from an edge while preserving the current page context. This example illustrates an admin interface. Describe the target, trigger and final state when adapting it to your project."}
---

在当前页面侧边展开详情，保留列表上下文。

本页示例以后台场景说明这一效果。实际需求应同时说清作用对象、触发方式与结束状态。
