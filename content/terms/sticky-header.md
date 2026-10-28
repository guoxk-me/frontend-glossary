---
title: "粘性表头"
description: "表格内容滚动时，让表头停留在滚动容器顶部。"
slug: "sticky-header"
english: "Sticky table header"
category: "layout"
aliases: ["吸顶表头", "固定表头"]
keywords: ["滚动列表", "表头不动", "标题留在顶部"]
demo: "sticky-header"
order: 6
naming: "常见叫法"
usage: "数据较多的表格，需要持续对照列含义。"
comparison: "sticky 受最近滚动祖先限制；fixed 通常相对视口定位，两者不是同一个行为。"
target: "数据表格"
phrase: "表格在容器内滚动，表头保持在顶部，便于持续对照各列。"
sources: [{"title": "相关规范与实现参考", "url": "https://developer.mozilla.org/en-US/docs/Web/CSS/position"}]
en: {"description": "Keep table headings visible as rows scroll underneath.", "usage": "Long tables with many rows.", "comparison": "A sticky table header belongs to the table, unlike a fixed site header.", "target": "Data table", "phrase": "Keep table headings sticky within the scrolling table container and aligned with their columns.", "naming": "Common term", "explanation": "Keep table headings visible as rows scroll underneath. This example illustrates an admin interface. Describe the target, trigger and final state when adapting it to your project."}
---

表格内容滚动时，让表头停留在滚动容器顶部。

本页示例以后台场景说明这一效果。实际需求应同时说清作用对象、触发方式与结束状态。
