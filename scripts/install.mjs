import { lstat, mkdir, readdir, realpath, rm, symlink } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPOSITORY = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export function linkType(platform) {
  return platform === 'win32' ? 'junction' : 'dir';
}

async function exists(target) {
  try {
    await lstat(target);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') return false;
    throw error;
  }
}

async function skillNames(repository) {
  const entries = await readdir(path.join(repository, 'skills'), { withFileTypes: true });
  return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
}

async function pointsTo(destination, source) {
  try {
    return await realpath(destination) === await realpath(source);
  } catch {
    return false;
  }
}

export async function install({ repository = REPOSITORY, codexHome = process.env.CODEX_HOME || path.join(os.homedir(), '.codex') } = {}) {
  const skillsDirectory = path.join(codexHome, 'skills');
  const names = await skillNames(repository);
  await mkdir(skillsDirectory, { recursive: true });

  for (const name of names) {
    const source = path.join(repository, 'skills', name);
    const destination = path.join(skillsDirectory, name);
    if (await exists(destination)) {
      if (await pointsTo(destination, source)) continue;
      throw new Error(`${destination} already exists`);
    }
    await symlink(source, destination, linkType(process.platform));
  }

  return { installed: names, codexHome };
}

export async function uninstall({ repository = REPOSITORY, codexHome = process.env.CODEX_HOME || path.join(os.homedir(), '.codex') } = {}) {
  const names = await skillNames(repository);
  const removed = [];

  for (const name of names) {
    const source = path.resolve(repository, 'skills', name);
    const destination = path.join(codexHome, 'skills', name);
    if (!(await exists(destination))) continue;
    if (!(await pointsTo(destination, source))) continue;
    await rm(destination, { force: true });
    removed.push(name);
  }

  return { removed };
}

async function main() {
  switch (process.argv[2]) {
    case 'uninstall': {
      const result = await uninstall();
      console.log(`Removed ${result.removed.length} skills: ${result.removed.join(', ')}`);
      break;
    }
    case 'install':
    case undefined: {
      const result = await install();
      console.log(`Installed ${result.installed.length} skills into ${result.codexHome}/skills`);
      console.log('Run: node scripts/doctor.mjs');
      break;
    }
    default:
      throw new Error('Usage: node scripts/install.mjs [install|uninstall]');
  }
}

if (import.meta.url === `file://${process.argv[1]}`) await main();
