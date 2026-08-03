---
name: v2ex-search
description: Search V2EX for firsthand community discussions about technology, software development, careers, products, and digital life. Search only v2ex.com and return source-post links.
---

# V2EX Search

Run:

```bash
node scripts/search.mjs "search query"
```

Use only returned `citations` as sources. When `search_executed` is `false`, state that the upstream search did not run and do not treat model-generated links as reliable citations.

End every response with a `## References` section. Keep links next to supported claims and repeat the used links here, deduplicated and comma-separated on one website line:

```markdown
## References

V2EX: [result title](https://example.com), [result title](https://example.com)
```

List only links actually used in the answer. When none exist, write `No citable sources.` below the heading.
