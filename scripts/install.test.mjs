import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readlink, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { install, linkType, uninstall } from './install.mjs';

test('installs every repository skill into Codex', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'supersearch-install-'));
  const repository = path.join(root, 'repository');
  const codexHome = path.join(root, 'codex');
  await mkdir(path.join(repository, 'skills', 'alpha'), { recursive: true });
  await mkdir(path.join(repository, 'skills', 'beta'), { recursive: true });

  try {
    const result = await install({ repository, codexHome });

    assert.deepEqual(result.installed, ['alpha', 'beta']);
    assert.equal(await readlink(path.join(codexHome, 'skills', 'alpha')), path.join(repository, 'skills', 'alpha'));
    assert.equal(await readlink(path.join(codexHome, 'skills', 'beta')), path.join(repository, 'skills', 'beta'));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('refuses to overwrite an existing skill directory', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'supersearch-conflict-'));
  const repository = path.join(root, 'repository');
  const codexHome = path.join(root, 'codex');
  await mkdir(path.join(repository, 'skills', 'alpha'), { recursive: true });
  await mkdir(path.join(codexHome, 'skills', 'alpha'), { recursive: true });
  await writeFile(path.join(codexHome, 'skills', 'alpha', 'keep.txt'), 'keep');

  try {
    await assert.rejects(install({ repository, codexHome }), /already exists/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('accepts skills already linked to this repository', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'supersearch-idempotent-'));
  const repository = path.join(root, 'repository');
  const codexHome = path.join(root, 'codex');
  await mkdir(path.join(repository, 'skills', 'alpha'), { recursive: true });

  try {
    await install({ repository, codexHome });
    const result = await install({ repository, codexHome });

    assert.deepEqual(result.installed, ['alpha']);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('uninstall removes only links owned by this repository', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'supersearch-uninstall-'));
  const repository = path.join(root, 'repository');
  const codexHome = path.join(root, 'codex');
  await mkdir(path.join(repository, 'skills', 'alpha'), { recursive: true });
  await mkdir(path.join(codexHome, 'skills', 'unrelated'), { recursive: true });

  try {
    await install({ repository, codexHome });
    const result = await uninstall({ repository, codexHome });

    assert.deepEqual(result.removed, ['alpha']);
    await assert.rejects(readlink(path.join(codexHome, 'skills', 'alpha')));
    await writeFile(path.join(codexHome, 'skills', 'unrelated', 'keep.txt'), 'keep');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('uses directory junctions on Windows', () => {
  assert.equal(linkType('win32'), 'junction');
  assert.equal(linkType('darwin'), 'dir');
  assert.equal(linkType('linux'), 'dir');
});
