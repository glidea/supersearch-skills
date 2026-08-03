import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('telegram-search searches all content visible to the configured account', async () => {
  const skill = await readFile('skills/telegram-search/SKILL.md', 'utf8');

  assert.match(skill, /search_global/);
  assert.match(skill, /search_messages/);
  assert.match(skill, /private chats, groups, channels/);
});

test('telegram-search allows public subscriptions only', async () => {
  const skill = await readFile('skills/telegram-search/SKILL.md', 'utf8');

  assert.match(skill, /subscribe_public_channel/);
  assert.doesNotMatch(skill, /join_chat_by_link/);
});

test('telegram-search discovers public chats without joining them by default', async () => {
  const skill = await readFile('skills/telegram-search/SKILL.md', 'utf8');

  assert.match(skill, /By default.*search_public_chats/);
  assert.match(skill, /Do not join candidates by default/);
});

test('telegram-search expands into public chats only when explicitly requested', async () => {
  const skill = await readFile('skills/telegram-search/SKILL.md', 'utf8');

  assert.match(skill, /expanded search/);
  assert.match(skill, /subscribe_public_channel/);
  assert.match(skill, /subscribe_public_channel.*search_messages/);
});

test('super-search includes telegram-search by default', async () => {
  const skill = await readFile('skills/super-search/SKILL.md', 'utf8');

  assert.match(skill, /\$telegram-search/);
});

test('super-search-fast excludes telegram-search', async () => {
  const skill = await readFile('skills/super-search-fast/SKILL.md', 'utf8');

  assert.doesNotMatch(skill, /\$telegram-search/);
});
