---
name: reddit-search
description: Search Reddit for firsthand experience, opinions, reviews, troubleshooting, and user feedback from English-language communities. Search only reddit.com and return source-post links.
---

# Reddit Search

Run:

```bash
node scripts/search.mjs "search query"
```

Use only returned `citations` as sources. When `search_executed` is `false`, state that the upstream search did not run and do not treat model-generated links as reliable citations.

End every response with a `## References` section. Keep links next to supported claims and repeat the used links here, deduplicated and comma-separated on one website line:

```markdown
## References

Reddit: [result title](https://example.com), [result title](https://example.com)
```

List only links actually used in the answer. When none exist, write `No citable sources.` below the heading.
