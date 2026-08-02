import assert from 'node:assert/strict';
import test from 'node:test';

import { inspectEnvironment } from './doctor.mjs';

test('reports missing required runtimes', () => {
  const report = inspectEnvironment({ nodeVersion: '16.20.0', pythonVersion: null, apiKey: '', browserPlugin: false });

  assert.equal(report.ready, false);
  assert.deepEqual(report.missing, ['Node.js 18+', 'Python 3.9+']);
});

test('treats API key and browser plugin as optional configuration', () => {
  const report = inspectEnvironment({ nodeVersion: '22.0.0', pythonVersion: '3.12.0', apiKey: '', browserPlugin: false });

  assert.equal(report.ready, true);
  assert.deepEqual(report.actions, ['Configure XAI_API_KEY for Linux.do, V2EX, Reddit, and X', 'Install the Codex browser plugin and sign in for Xiaohongshu, Douyin, and WeChat fallback']);
});
