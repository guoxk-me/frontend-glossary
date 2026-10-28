---
title: "主从视图"
description: "同屏保留记录列表和当前记录的详情。"
slug: "master-detail"
english: "Master-detail view"
category: "layout"
aliases: ["列表详情布局"]
keywords: ["左边列表", "右边内容", "选中即查看"]
demo: "master-detail"
order: 7
naming: "常见叫法"
usage: "邮件、工单、订单与联系人浏览。"
comparison: "主从视图常驻两个区域；抽屉通常是按需出现的侧面板。"
target: "工作区"
phrase: "同屏呈现列表与详情，选择列表记录时更新旁边的详情区域。"
sources: [{"title": "相关规范与实现参考", "url": "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout"}]
en: {"description": "Keep a collection visible while showing details of the selected record.", "usage": "Email, order management and file browsers.", "comparison": "A split pane describes geometry; master-detail describes the relationship between selection and details.", "target": "Record workspace", "phrase": "Keep the record list beside the detail pane. Selecting a record updates its details without losing list context.", "naming": "Common term", "explanation": "Keep a collection visible while showing details of the selected record. This example illustrates an admin interface. Describe the target, trigger and final state when adapting it to your project."}
---

同屏保留记录列表和当前记录的详情。

本页示例以后台场景说明这一效果。实际需求应同时说清作用对象、触发方式与结束状态。
