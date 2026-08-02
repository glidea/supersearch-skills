---
name: redditsearch
description: Search Reddit for firsthand experience, opinions, reviews, troubleshooting, and user feedback from English-language communities. Search only reddit.com and return source-post links.
---

# Reddit Search

Run:

```bash
node scripts/search.mjs "search query"
```

Use only returned `citations` as sources. When `search_executed` is `false`, state that the upstream search did not run and do not treat model-generated links as reliable citations.
