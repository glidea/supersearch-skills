---
name: super-search-fast
description: Quickly aggregate built-in Web, Linux.do, X, Reddit, and V2EX search results. Search all five sources by default or only user-selected sources for research, fact-checking, technology choices, troubleshooting, product feedback, and real-time sentiment. Exclude Xiaohongshu, WeChat, Douyin, and Telegram.
---

# Super Search Fast

## Search workflow

1. Identify the core question, time range, and claims that need verification.
2. Use Chinese queries for Chinese communities and add natural English queries for Reddit and X.
3. When the user does not specify sources, run `$linuxdo-search`, `$v2ex-search`, `$reddit-search`, `$x-search`, and built-in Web search in parallel. Do not call Xiaohongshu, WeChat, Douyin, or Telegram. When the user specifies sources, call only those sources.
4. For Web search, prefer official documentation, project repositories, papers, announcements, and primary statements.
5. Retry each dedicated search script three times on error. If it still fails, immediately fall back to built-in Web search using `site:linux.do "core name"`, `site:v2ex.com/t "core name"`, `site:reddit.com "core name"`, or `site:x.com "core name"`. Also run the matching Web fallback when a dedicated search returns no citation. Never describe a failed search or missing citations as no discussion on that platform.
6. For real-time topics, pass the user's `--from` and `--to` values to X. When no range is given, choose a reasonable range and state it.
7. Merge duplicate events and reposts, prefer accessible primary pages, and distinguish confirmed facts, community opinions, and unverified information.

## Citation rules

- Cite only pages actually returned by the Web tool.
- When a dedicated search returns `citations`, cite only those links.
- When X returns `search_executed: true` without `citations`, summarize `content` and state that the upstream service provided no citable source posts.
- When any dedicated search returns `search_executed: false`, mark that source as not successfully searched.
- When a dedicated search ultimately fails, report the source, HTTP status or error type, the upstream error message, and that Web fallback was used.
- Place links next to important claims. State when no reliable evidence was found.

## Output format

Answer directly first, then concisely summarize facts, community consensus, disagreements, and uncertainty. Do not mechanically list results source by source.
