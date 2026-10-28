---
title: "加载更多"
description: "通过明确按钮逐批追加列表记录，让用户掌握加载节奏。"
slug: "load-more"
english: "Load more"
category: "interaction"
aliases: ["增量加载", "更多记录"]
keywords: ["先显示几条", "点击更多", "追加列表"]
demo: "load-more"
order: 31
naming: "通用术语"
usage: "长列表、活动记录与内容浏览。"
comparison: "与无限滚动不同，加载更多由用户主动触发；加载失败要保留已有记录。"
target: "内容列表"
phrase: "先展示一批记录，点击“加载更多”后追加下一批，并反馈已全部加载的状态。"
sources: [{"title": "相关规范与实现参考", "url": "https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-live"}]
en: {"description": "Append another group of entries when the user requests it.", "usage": "Long feeds and collections where users control loading.", "comparison": "Unlike infinite scrolling, load more requires an explicit action.", "target": "Content list", "phrase": "Provide a load-more button below the list, append new entries without moving existing content and announce completion.", "naming": "General term", "explanation": "Append another group of entries when the user requests it. This example illustrates an admin interface. Describe the target, trigger and final state when adapting it to your project."}
---

通过明确按钮逐批追加列表记录，让用户掌握加载节奏。

本页示例以后台场景说明这一效果。实际需求应同时说清作用对象、触发方式与结束状态。
