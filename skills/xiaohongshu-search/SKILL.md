---
name: xiaohongshu-search
description: Search Xiaohongshu for purchase decisions, life experience, product feedback, tutorials, trends, and firsthand Chinese community discussions using the user's existing browser session. Return source-post links.
---

# Xiaohongshu Search

## Search workflow

1. Load and follow `$browser:control-in-app-browser`, selecting a browser for `https://www.xiaohongshu.com/`.
2. Reuse an existing Xiaohongshu tab when possible, otherwise open one. Do not read or export cookies, Local Storage, or other login credentials.
3. Search the user's question on Xiaohongshu. Add one or two natural Chinese queries when useful. Do not enumerate query variants in bulk.
4. Open filters and select most-liked sorting. If unavailable or unsuccessful, continue with comprehensive sorting and state the actual mode.
5. Extract the title, author, publication time, engagement count, and actual source-post URL. Use only fields and links present in the current page DOM.
6. Select three to five highly liked, relevant, representative notes. Open the post when its position or experience matters. Read comments only when they are necessary to answer the question.
7. By default, save local covers for the one to three most relevant notes. If page covers cannot be saved reliably, capture the note's cover area. Skip cover generation when the user requests no covers or text-only results.
8. Merge duplicate content and distinguish personal experience, marketing, and verifiable facts. Do not treat like counts as evidence of correctness.
9. Close intermediate tabs when finished. If the login session has expired, ask the user to log in through the selected browser and continue.

## Interface constraints

- Do not call undocumented private search APIs or copy browser credentials into scripts or environment variables.
- Use the browser page's own login session and search capability.
- Follow the browser skill's confirmation flow for CAPTCHAs. Do not bypass them.

## Output format

Return:

- `search_executed`: whether a real search completed.
- `sort`: the sort mode actually used.
- `summary`: a concise conclusion based on search results.
- `results`: representative notes containing `title`, `author`, `published_at`, `engagement`, `url`, `cover_path`, and `note`. Omit `cover_path` when covers are disabled.

Use absolute local paths for covers and link each image to its source post:

```markdown
[![Note title](/absolute/path/cover.jpg)](https://www.xiaohongshu.com/explore/123)
```

Do not embed Xiaohongshu CDN image URLs directly.

Cite only Xiaohongshu links actually opened by the browser or present in search results. When search fails, set `search_executed` to `false`, state the reason, and do not generate links.
