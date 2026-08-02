import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('tgsearch searches all content visible to the configured account', async () => {
  const skill = await readFile('skills/tgsearch/SKILL.md', 'utf8');

  assert.match(skill, /search_global/);
  assert.match(skill, /search_messages/);
  assert.match(skill, /private chats, groups, channels/);
});

test('tgsearch allows public subscriptions only', async () => {
  const skill = await readFile('skills/tgsearch/SKILL.md', 'utf8');

  assert.match(skill, /subscribe_public_channel/);
  assert.doesNotMatch(skill, /join_chat_by_link/);
});

test('tgsearch discovers public chats without joining them by default', async () => {
  const skill = await readFile('skills/tgsearch/SKILL.md', 'utf8');

  assert.match(skill, /By default.*search_public_chats/);
  assert.match(skill, /Do not join candidates by default/);
});

test('tgsearch expands into public chats only when explicitly requested', async () => {
  const skill = await readFile('skills/tgsearch/SKILL.md', 'utf8');

  assert.match(skill, /expanded search/);
  assert.match(skill, /subscribe_public_channel/);
  assert.match(skill, /subscribe_public_channel.*search_messages/);
});

test('supersearch includes tgsearch by default', async () => {
  const skill = await readFile('skills/supersearch/SKILL.md', 'utf8');

  assert.match(skill, /\$tgsearch/);
});

test('supersearch-fast excludes tgsearch', async () => {
  const skill = await readFile('skills/supersearch-fast/SKILL.md', 'utf8');

  assert.doesNotMatch(skill, /\$tgsearch/);
});
