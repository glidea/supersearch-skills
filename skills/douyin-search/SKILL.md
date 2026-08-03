---
name: douyin-search
description: Search Douyin for popular videos, product feedback, tutorials, trends, hands-on tests, and Chinese short-video community reactions using the user's existing browser session. Prefer most-liked sorting and return original video links.
---

# Douyin Search

## Search workflow

1. Load and follow `$browser:control-in-app-browser`, selecting a browser for `https://www.douyin.com/`.
2. Reuse an existing Douyin tab when possible, otherwise open one. Do not read or export cookies, Local Storage, or other login credentials.
3. Search the user's question on Douyin. Add one or two natural Chinese queries when useful. Do not enumerate query variants in bulk.
4. Open filters and select most-liked sorting. If unavailable or unsuccessful, continue with comprehensive sorting and state the actual mode.
5. Extract the title, author, publication time, like count, duration, and actual original video URL. When opening a result is required to obtain the URL, open representative results individually and record the final URL.
6. Select three to five highly liked and relevant videos. Open video details for complete text when opinions or experience matter. Read comments only when they are necessary to answer the question.
7. By default, capture clear local covers for the one to three most relevant videos. Skip screenshots and cover generation when the user requests no covers or text-only results.
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
- `results`: representative videos containing `title`, `author`, `published_at`, `likes`, `duration`, `url`, `cover_path`, and `note`. Omit `cover_path` when covers are disabled.

Use absolute local paths for covers and link each image to its source video:

```markdown
[![Video title](/absolute/path/cover.jpg)](https://www.douyin.com/video/123)
```

Do not embed Douyin CDN image or video URLs directly.

Cite only Douyin links actually opened by the browser or present in search results. When search fails, set `search_executed` to `false`, state the reason, and do not generate links.
