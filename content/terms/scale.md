---
title: "缩放入场"
description: "元素从较小尺寸放大到正常尺寸，强调出现位置。"
slug: "scale"
english: "Scale entrance"
category: "motion"
aliases: ["放大出现", "缩放过渡"]
keywords: ["由小变大", "弹出", "放大显示"]
demo: "scale"
order: 10
naming: "通用术语"
usage: "小面板、菜单或需要视觉聚焦的提示。"
comparison: "缩放过渡不等于弹簧动画；真实弹簧通常包含不同的速度与回弹模型。"
target: "提示内容"
phrase: "内容从较小比例放大到正常大小，并伴随透明度变化。"
sources: [{"title": "相关规范与实现参考", "url": "https://developer.mozilla.org/en-US/docs/Web/CSS/transform"}]
en: {"description": "Bring an element into view by increasing its scale.", "usage": "Small overlays, confirmation feedback and newly added elements.", "comparison": "Scaling changes size; sliding changes position. Avoid large zoom movements.", "target": "New element", "phrase": "Reveal the element by scaling it from slightly smaller to its normal size without shifting surrounding layout.", "naming": "General term", "explanation": "Bring an element into view by increasing its scale. This example illustrates an admin interface. Describe the target, trigger and final state when adapting it to your project."}
---

元素从较小尺寸放大到正常尺寸，强调出现位置。

本页示例以后台场景说明这一效果。实际需求应同时说清作用对象、触发方式与结束状态。
