---
name: v2exsearch
description: 搜索 V2EX。用于查找技术、开发、职场、产品和数字生活相关的真实社区讨论。仅搜索 v2ex.com，并要求返回原帖引用链接。
---

# V2EX Search

运行：

```bash
node scripts/search.mjs "搜索内容"
```

仅依据返回的 `citations` 提供引用。若 `search_executed` 为 `false`，明确说明上游未执行搜索，不要把模型生成的链接当作可靠引用。
