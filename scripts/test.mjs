import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

async function testFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await testFiles(target));
    if (entry.isFile() && entry.name.endsWith('.test.mjs')) files.push(target);
  }
  return files;
}

function run(command, args) {
  return spawnSync(command, args, { stdio: 'inherit' }).status === 0;
}

const files = await testFiles('.');
if (!run(process.execPath, ['--test', ...files])) process.exit(1);

const pythonCommands = process.platform === 'win32'
  ? [['py', ['-3']], ['python', []]]
  : [['python3', []], ['python', []]];
const python = pythonCommands.find(([command, args]) => run(command, [...args, '--version']));
if (!python) throw new Error('Python 3.9+ is required');
if (!run(python[0], [...python[1], '-m', 'unittest', 'discover', '-s', 'skills/wechatsearch/scripts', '-p', '*_test.py'])) process.exit(1);
