import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

const SKILLS = new Map([
  ['douyin-search', 'Douyin'],
  ['linuxdo-search', 'Linux DO'],
  ['reddit-search', 'Reddit'],
  ['telegram-search', 'Telegram'],
  ['v2ex-search', 'V2EX'],
  ['wechat-search', 'WeChat'],
  ['x-search', 'X'],
  ['xiaohongshu-search', 'Xiaohongshu'],
]);

test('source skills end responses with standardized references', async () => {
  for (const [name, source] of SKILLS) {
    const skill = await readFile(path.join('skills', name, 'SKILL.md'), 'utf8');
    assert.match(skill, /End every response with a `## References` section\./);
    assert.match(skill, new RegExp(`${source}: \\[result title\\]\\(https:\\/\\/example\\.com\\)`));
  }
});

test('aggregate skills group references by website', async () => {
  for (const name of ['super-search', 'super-search-fast']) {
    const skill = await readFile(path.join('skills', name, 'SKILL.md'), 'utf8');
    assert.match(skill, /End every response with a `## References` section\./);
    assert.match(skill, /Use one line per website/);
    assert.match(skill, /Linux DO: \[result title\]\(https:\/\/example\.com\)/);
  }
});
