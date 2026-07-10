#!/usr/bin/env node
/** PS.11 — Production Android package name verification */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const appJson = JSON.parse(fs.readFileSync(path.join(root, 'app.json'), 'utf8'));

const pkg = appJson?.expo?.android?.package ?? '';
const bundle = appJson?.expo?.ios?.bundleIdentifier ?? '';
const forbidden = ['anonymous', 'example', 'test'];

function fail(msg) {
  console.error(`FAIL: ${msg}`);
  process.exit(1);
}

function ok(msg) {
  console.log(`OK: ${msg}`);
}

const pattern = /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/;

if (!pattern.test(pkg)) {
  fail(`Invalid android.package format: ${pkg}`);
}
ok(`android.package = ${pkg}`);

if (pkg !== bundle) {
  fail(`android.package and ios.bundleIdentifier must match (${pkg} vs ${bundle})`);
}
ok('android.package matches ios.bundleIdentifier');

for (const word of forbidden) {
  if (pkg.includes(word)) {
    fail(`Package must not contain placeholder segment "${word}"`);
  }
}
ok('No placeholder segments (anonymous/example/test)');

const devScript = fs.readFileSync(
  path.join(root, 'scripts/android/run-android-dev.ps1'),
  'utf8',
);
if (!devScript.includes(pkg)) {
  fail(`run-android-dev.ps1 does not reference ${pkg}`);
}
ok('Dev launch script references new package');

console.log('\nPS.11 verification passed.');
