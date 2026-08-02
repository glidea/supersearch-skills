---
name: wechatsearch
description: 搜索微信公众号文章。用于查找公众号发布的中文资讯、行业观点、教程、产品分析和机构原文，通过搜狗微信搜索发现文章，并返回公众号名称、发布时间、摘要和微信原文链接。
---

# WeChat Search

运行：

```bash
python3 scripts/search.py "搜索内容"
```

默认返回 5 条结果。仅依据 `results` 中实际返回的字段回答和引用：

- 搜索入口提供“最多点赞”时优先选择。搜狗微信不提供点赞排序或互动量时使用相关性排序，并明确标记实际排序方式。
- 优先引用 `url` 指向的微信原文。
- `url` 无法打开时使用同一结果的 `sogou_url`。
- 需要判断文章完整观点时，打开 `url` 阅读正文，不要只依据摘要推断。
- 合并同稿转载，区分公众号观点与可验证事实。

若返回 `search_executed: false` 和 `fallback: browser`，加载并遵循 `$browser:control-in-app-browser`，在 `https://weixin.sogou.com/` 搜索。遇到验证码时让用户完成验证，不绕过验证码。
