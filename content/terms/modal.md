---
title: "模态对话框"
description: "以覆盖页面的对话框承载一项需要集中处理的任务。"
slug: "modal"
english: "Modal dialog"
category: "interaction"
aliases: ["弹窗", "模态窗口"]
keywords: ["居中弹出", "必须先处理", "确认操作"]
demo: "modal"
order: 25
naming: "通用术语"
usage: "重要确认、短表单与需要明确完成或取消的操作。"
comparison: "模态会限制背景交互并管理焦点；普通浮层不一定阻止背景操作。"
target: "确认操作"
phrase: "在居中的模态对话框中聚焦当前操作，提供明确的取消与确认入口。"
sources: [{"title": "相关规范与实现参考", "url": "https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/"}]
en: {"description": "Focus attention on a short task in a dialog above the page.", "usage": "Confirmations and brief forms that require a decision.", "comparison": "A modal blocks the background; a nonmodal popover can coexist with the current task.", "target": "Confirmation dialog", "phrase": "Open a modal dialog with a clear title, explanation and cancel action. Trap focus while open and return it to the trigger on close.", "naming": "General term", "explanation": "Focus attention on a short task in a dialog above the page. This example illustrates an admin interface. Describe the target, trigger and final state when adapting it to your project."}
---

以覆盖页面的对话框承载一项需要集中处理的任务。

本页示例以后台场景说明这一效果。实际需求应同时说清作用对象、触发方式与结束状态。
