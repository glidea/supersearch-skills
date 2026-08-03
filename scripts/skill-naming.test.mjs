import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

const SKILLS = new Map([
  ['douyin-search', 'Douyin Search'],
  ['linuxdo-search', 'Linux.do Search'],
  ['reddit-search', 'Reddit Search'],
  ['super-search', 'Super Search'],
  ['super-search-fast', 'Super Search Fast'],
  ['telegram-search', 'Telegram Search'],
  ['v2ex-search', 'V2EX Search'],
  ['wechat-search', 'WeChat Search'],
  ['x-search', 'X Search'],
  ['xiaohongshu-search', 'Xiaohongshu Search'],
]);

test('uses platform-search names for every skill', async () => {
  const entries = await readdir('skills', { withFileTypes: true });
  const names = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();

  assert.deepEqual(names, [...SKILLS.keys()].sort());

  for (const [name, displayName] of SKILLS) {
    const skill = await readFile(path.join('skills', name, 'SKILL.md'), 'utf8');
    const agent = await readFile(path.join('skills', name, 'agents', 'openai.yaml'), 'utf8');
    assert.match(skill, new RegExp(`^name: ${name}$`, 'm'));
    assert.match(agent, new RegExp(`^  display_name: "${displayName.replace('.', '\\.')}"$`, 'm'));
    assert.match(agent, new RegExp(`\\$${name}(?:\\s|$)`));
  }
});
