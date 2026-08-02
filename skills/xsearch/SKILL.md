---
name: xsearch
description: 搜索 X。用于查找实时动态、事件反应、热点讨论、指定账号发言和社交舆情，并要求返回帖子引用链接。
---

# X Search

运行：

```bash
node scripts/search.mjs "search query"
node scripts/search.mjs "search query" --from 2026-07-01 --to 2026-08-01
```

`--from` 和 `--to` 使用 `YYYY-MM-DD`，可单独使用。

有 `citations` 时仅引用其中链接。没有 `citations` 但 `search_executed` 为 `true` 时可以归纳 `content`，必须说明上游未提供可引用原帖，不得误判为没有讨论。若 `search_executed` 为 `false`，明确说明上游未执行搜索。
