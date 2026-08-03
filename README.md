# Supersearch Skills

Cross-source search skills for AI agents. The first release supports Codex and keeps each source as an independent skill.

## Install with an agent

Copy this prompt to Codex:

```text
Install https://github.com/glidea/supersearch-skills for Codex. Follow AGENT_INSTALL.md, install safe missing dependencies, and guide me through credentials or browser login that require my action.
```

The agent installs the repository at `~/.codex/repos/supersearch-skills` and links the skills into `~/.codex/skills`.

## Included skills

| Skill | Source | Requirement |
| --- | --- | --- |
| `super-search` | All sources | Codex built-in Web search; optional requirements below |
| `super-search-fast` | Web, Linux.do, X, Reddit, V2EX | Codex built-in Web search and xAI API key for specialized search |
| `linuxdo-search` | Linux.do | Node.js 18+, `XAI_API_KEY` |
| `v2ex-search` | V2EX | Node.js 18+, `XAI_API_KEY` |
| `reddit-search` | Reddit | Node.js 18+, `XAI_API_KEY` |
| `x-search` | X | Node.js 18+, `XAI_API_KEY` |
| `wechat-search` | WeChat via Sogou | Python 3.9+; Browser plugin for fallback |
| `xiaohongshu-search` | Xiaohongshu | Codex Browser plugin and user login |
| `douyin-search` | Douyin | Codex Browser plugin and user login |
| `telegram-search` | Telegram | Telegram MCP and Telegram account session |

The Browser plugin is optional. Without it, Web, Linux.do, V2EX, Reddit, X, and direct Sogou WeChat search remain available.

## Configuration

Create an xAI API key, then add it to your shell environment. Do not put secrets in this repository.

macOS and Linux:

```sh
export XAI_API_KEY="your-key"
```

Windows PowerShell:

```powershell
[Environment]::SetEnvironmentVariable("XAI_API_KEY", "your-key", "User")
```

Scripts use the official `https://api.x.ai/v1` endpoint by default. A compatible proxy can override it with `XAI_BASE_URL`. `XAI_MODEL` optionally overrides the default model.

Run the environment check after configuration:

```sh
node scripts/doctor.mjs
```

## Manual install

```sh
git clone https://github.com/glidea/supersearch-skills ~/.codex/repos/supersearch-skills
cd ~/.codex/repos/supersearch-skills
node scripts/install.mjs install
npm run validate
npm test
```

Windows PowerShell:

```powershell
git clone https://github.com/glidea/supersearch-skills "$env:USERPROFILE\.codex\repos\supersearch-skills"
Set-Location "$env:USERPROFILE\.codex\repos\supersearch-skills"
node scripts/install.mjs install
npm run validate
npm test
```

Restart Codex after installation so it discovers the skills.

## Uninstall

```sh
node scripts/install.mjs uninstall
```

This removes only links owned by this repository. It does not remove the repository, credentials, browser data, or unrelated skills.

## License

[MIT](LICENSE)
