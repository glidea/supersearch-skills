---
name: linuxdosearch
description: 搜索 linux.do。用于查找国内前沿 AI 工具、实践经验、优惠信息和社区一手讨论。仅搜索 linux.do，并要求返回原帖引用链接。
---

# Linux DO Search

运行：

```bash
node scripts/search.mjs "搜索内容"
```

仅依据返回的 `citations` 提供引用。若 `search_executed` 为 `false`，明确说明上游未执行搜索，不要把模型生成的链接当作可靠引用。
