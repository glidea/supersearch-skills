import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const entries = await readdir('skills', { withFileTypes: true });
for (const entry of entries) {
  if (!entry.isDirectory()) continue;
  const file = path.join('skills', entry.name, 'SKILL.md');
  const source = await readFile(file, 'utf8');
  const frontmatter = source.match(/^---\r?\n([\s\S]+?)\r?\n---/);
  assert(frontmatter, `${file}: missing YAML frontmatter`);
  const name = frontmatter[1].match(/^name:\s*(.+)$/m)?.[1]?.trim();
  const description = frontmatter[1].match(/^description:\s*(.+)$/m)?.[1]?.trim();
  assert.equal(name, entry.name, `${file}: name must match directory`);
  assert(description, `${file}: description is required`);
  assert(/^[a-z0-9-]+$/.test(name), `${file}: invalid name`);
  assert(name.length <= 64, `${file}: name is too long`);
  console.log(`${entry.name}: valid`);
}
