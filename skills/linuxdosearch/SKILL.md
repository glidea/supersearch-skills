---
name: linuxdosearch
description: Search linux.do for Chinese community discussions about emerging AI tools, practical experience, promotions, and firsthand reports. Search only linux.do and return source-post links.
---

# Linux DO Search

Run:

```bash
node scripts/search.mjs "search query"
```

Use only returned `citations` as sources. When `search_executed` is `false`, state that the upstream search did not run and do not treat model-generated links as reliable citations.
