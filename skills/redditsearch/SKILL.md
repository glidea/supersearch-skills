---
name: redditsearch
description: 搜索 Reddit。用于查找英文社区的真实经验、观点、评测、故障排查和用户反馈。仅搜索 reddit.com，并要求返回帖子引用链接。
---

# Reddit Search

运行：

```bash
node scripts/search.mjs "search query"
```

仅依据返回的 `citations` 提供引用。若 `search_executed` 为 `false`，明确说明上游未执行搜索，不要把模型生成的链接当作可靠引用。
