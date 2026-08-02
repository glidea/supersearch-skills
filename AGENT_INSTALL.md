# Agent installation contract

Install this repository for Codex on macOS, Linux, or Windows.

1. Check Git, Node.js 18+, Python 3.9+, and Codex. Install missing Git, Node.js, and Python with the operating system's standard package manager. Do not install Codex or browser plugins without asking the user.
2. Clone or update this repository at `~/.codex/repos/supersearch-skills`. On Windows use `%USERPROFILE%\.codex\repos\supersearch-skills`.
3. Run `node scripts/install.mjs install`, then `node scripts/doctor.mjs`.
4. If `XAI_API_KEY` is missing, explain that Linux.do, V2EX, Reddit, and X need an xAI API key. Ask the user to configure it in their shell environment. Never request the key in chat, print it, write it into this repository, or change `XAI_BASE_URL` unless the user explicitly uses a compatible proxy.
5. Explain that Xiaohongshu and Douyin require Codex's Browser plugin and a signed-in browser session. WeChat uses direct Sogou search first and needs the Browser plugin only for fallback. Guide the user to install or enable the plugin in Codex and sign in manually when they first search.
6. Run `npm run validate` and `npm test`. Report installed skills, optional capabilities still needing configuration, and any failed checks.

Do not overwrite unrelated directories in `~/.codex/skills`.
