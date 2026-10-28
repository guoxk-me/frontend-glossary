---
title: "骨架屏扫光"
description: "在占位块上移动一条高亮带，提示内容正在加载。"
slug: "shimmer"
english: "Skeleton shimmer"
category: "motion"
aliases: ["加载扫光", "占位动画"]
keywords: ["灰色骨架", "流动光带", "加载中"]
demo: "shimmer"
order: 15
naming: "常见叫法"
usage: "确实存在加载等待且结构可以预知的区域。"
comparison: "骨架只是加载反馈，不能代替失败或空内容状态；减少动态效果时显示静态占位。"
target: "加载区域"
phrase: "加载期间显示接近内容结构的骨架，使用轻柔扫光提示等待。"
sources: [{"title": "相关规范与实现参考", "url": "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_animations/Using_CSS_animations"}]
en: {"description": "Move a subtle highlight across placeholder shapes while content loads.", "usage": "Loading cards, profile rows and article placeholders.", "comparison": "A skeleton resembles the expected content; a spinner only signals activity.", "target": "Loading placeholder", "phrase": "Show skeleton placeholders shaped like the final content, with a subtle moving highlight until loading completes.", "naming": "Common term", "explanation": "Move a subtle highlight across placeholder shapes while content loads. This example illustrates an admin interface. Describe the target, trigger and final state when adapting it to your project."}
---

在占位块上移动一条高亮带，提示内容正在加载。

本页示例以后台场景说明这一效果。实际需求应同时说清作用对象、触发方式与结束状态。
