---
name: super-search
description: Aggregate Web, Linux.do, V2EX, Xiaohongshu, WeChat Official Accounts, Douyin, Telegram, Reddit, and X. Search every source by default or only user-selected sources for research, fact-checking, product comparison, technology choices, troubleshooting, and trend tracking with primary-source links.
---

# Super Search

## Search workflow

1. Identify the core question, time range, and claims that need verification.
2. Use Chinese queries for Chinese communities and add natural English queries for Reddit and X. Do not merely translate word for word.
3. When the user does not specify sources, run `$linuxdo-search`, `$v2ex-search`, `$xiaohongshu-search`, `$wechat-search`, `$douyin-search`, `$telegram-search`, `$reddit-search`, `$x-search`, and built-in Web search in parallel without skipping sources. When the user specifies sources, call only those sources.
   Before marking any dedicated source unavailable, retry every failed search three times, including HTTP 4xx/5xx responses and connection errors.
   When Linux.do, V2EX, or Reddit returns no citation, immediately run built-in Web searches for `site:linux.do "core name"`, `site:v2ex.com/t "core name"`, or `site:reddit.com "core name"`. If dedicated and Web results conflict, prefer an accessible primary post.
4. For Web search, prefer official documentation, project repositories, papers, announcements, and primary statements. Use community search to find practical experience, disputes, failures, and user feedback.
5. For real-time topics, pass the user's `--from` and `--to` values to X. When no range is given, choose a reasonable range and state it.
6. Merge duplicate events and reposts. Trace claims to the earliest or most authoritative primary source instead of citing aggregators.
7. Compare sources. Distinguish confirmed facts, community opinions, and unverified information. Do not treat popularity as evidence.
8. By default, show local cover images for the most relevant Douyin and Xiaohongshu results, with no more than three images total. Link each image to its source post. When the user requests no covers or text-only results, tell those sources to skip covers and omit covers from the final answer.

## Citation rules

- Cite only pages actually returned by the Web tool.
- Prefer `citations` returned by Linux.do, V2EX, and Reddit. When built-in Web fallback runs, cite platform posts actually returned by Web. For Xiaohongshu, WeChat, and Douyin, cite only each result's `url`; when a WeChat original cannot be opened, use `sogou_url` from the same result. For Telegram, prefer original message links returned by `get_message_link`; otherwise provide the chat name, timestamp, and message ID.
- When X returns `citations`, cite only those links. When `search_executed` is `true` without citations, summarize `content` and state that the upstream service provided no citable source posts. Do not describe it as no discussion.
- When any community result returns `search_executed: false`, mark that source as not successfully searched and do not use generated links from it.
- Place links next to important claims. State when no reliable evidence was found.

## Output format

Answer directly first, then include as needed:

- **Confirmed facts**: conclusions supported by official or multiple independent sources.
- **Community observations**: representative experience and disagreements from Linux.do, V2EX, Xiaohongshu, WeChat, Douyin, Telegram, Reddit, and X.
- **Uncertainty**: conflicts, sampling bias, stale information, and search failures.

Stay concise. Do not dump results source by source or include irrelevant material merely to cover every source.

End every response with a `## References` section. Keep links next to supported claims and repeat every used link in this final section. Use one line per website, preserve the result title, deduplicate links, and separate multiple links with commas. Use the website or platform name as the label, not `Web`:

```markdown
## References

Linux DO: [result title](https://example.com), [result title](https://example.com)
OpenAI: [result title](https://example.com)
```

Include only websites with references actually used in the answer. For Telegram private messages without shareable links, use `Telegram: chat name / timestamp / message ID`. When no citable source exists, write `No citable sources.` below the heading.
