import { access } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

function versionAtLeast(version, minimum) {
  const current = version.split('.').map(Number);
  const required = minimum.split('.').map(Number);
  return current[0] > required[0] || current[0] === required[0] && current[1] >= required[1];
}

export function inspectEnvironment({ nodeVersion, pythonVersion, apiKey, browserPlugin }) {
  const missing = [];
  const actions = [];

  if (!nodeVersion || !versionAtLeast(nodeVersion, '18.0')) missing.push('Node.js 18+');
  if (!pythonVersion || !versionAtLeast(pythonVersion, '3.9')) missing.push('Python 3.9+');
  if (!apiKey) actions.push('Configure XAI_API_KEY for Linux.do, V2EX, Reddit, and X');
  if (!browserPlugin) actions.push('Install the Codex browser plugin and sign in for Xiaohongshu, Douyin, and WeChat fallback');

  return { ready: missing.length === 0, missing, actions };
}

function commandVersion(command, args) {
  const result = spawnSync(command, args, { encoding: 'utf8' });
  if (result.status !== 0) return null;
  return `${result.stdout}${result.stderr}`.match(/\d+\.\d+(?:\.\d+)?/)?.[0] || null;
}

async function hasBrowserPlugin(codexHome) {
  const candidates = [
    path.join(codexHome, 'plugins', 'cache', 'openai-bundled', 'browser'),
    path.join(codexHome, 'plugins', 'browser'),
  ];
  for (const candidate of candidates) {
    try {
      await access(candidate);
      return true;
    } catch {}
  }
  return false;
}

async function main() {
  const codexHome = process.env.CODEX_HOME || path.join(os.homedir(), '.codex');
  const report = inspectEnvironment({
    nodeVersion: process.versions.node,
    pythonVersion: commandVersion(process.platform === 'win32' ? 'py' : 'python3', process.platform === 'win32' ? ['-3', '--version'] : ['--version']),
    apiKey: process.env.XAI_API_KEY || '',
    browserPlugin: await hasBrowserPlugin(codexHome),
  });

  console.log(report.ready ? 'Core runtime: ready' : `Missing: ${report.missing.join(', ')}`);
  for (const action of report.actions) console.log(`Action: ${action}`);
  if (process.env.XAI_BASE_URL) console.log('XAI_BASE_URL: custom endpoint configured');
  else console.log('XAI_BASE_URL: official endpoint https://api.x.ai/v1');
  process.exitCode = report.ready ? 0 : 1;
}

if (import.meta.url === `file://${process.argv[1]}`) await main();
