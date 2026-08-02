import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

async function sourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === '__pycache__') continue;
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await sourceFiles(target));
    if (entry.isFile() && /\.(json|md|mjs|py|yaml)$/.test(entry.name)) files.push(target);
  }
  return files;
}

test('repository source files contain ASCII English text only', async () => {
  const files = await sourceFiles('.');
  for (const file of files) {
    const content = await readFile(file);
    assert.equal(content.some((byte) => byte > 0x7f), false, file);
  }
});
