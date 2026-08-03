---
name: x-search
description: Search X for real-time updates, reactions, trending discussions, posts from specified accounts, and social sentiment. Return source-post links.
---

# X Search

Run:

```bash
node scripts/search.mjs "search query"
node scripts/search.mjs "search query" --from 2026-07-01 --to 2026-08-01
```

Use `YYYY-MM-DD` for `--from` and `--to`. Either option may be used independently.

When `citations` are present, cite only those links. When `search_executed` is `true` but no citations are returned, summarize `content` while stating that the upstream service provided no citable source posts. Do not misreport this as no discussion. When `search_executed` is `false`, state that the upstream search did not run.

End every response with a `## References` section. Keep links next to supported claims and repeat the used links here, deduplicated and comma-separated on one website line:

```markdown
## References

X: [result title](https://example.com), [result title](https://example.com)
```

List only links actually used in the answer. When none exist, write `No citable sources.` below the heading.
