#!/usr/bin/env node
/** PS.14 — Android manifest Play compliance after prebuild */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const manifestPath = path.join(root, 'android/app/src/main/AndroidManifest.xml');
const gradlePath = path.join(root, 'android/app/build.gradle');

function fail(msg) {
  console.error(`FAIL: ${msg}`);
  process.exit(1);
}

function ok(msg) {
  console.log(`OK: ${msg}`);
}

if (!fs.existsSync(manifestPath)) {
  fail(`Missing ${manifestPath} — run: npx expo prebuild --platform android --clean`);
}

const manifest = fs.readFileSync(manifestPath, 'utf8');
const gradle = fs.existsSync(gradlePath) ? fs.readFileSync(gradlePath, 'utf8') : '';
const manifestLines = manifest.split('\n');

function isActivePermissionLine(line, permission) {
  if (!line.includes('uses-permission') || !line.includes(permission)) return false;
  if (line.includes('tools:node="remove"')) return false;
  return true;
}

if (!/allowBackup\s*=\s*"false"/.test(manifest)) {
  fail('AndroidManifest must set android:allowBackup="false"');
}
ok('allowBackup=false');

const blocked = [
  'android.permission.RECORD_AUDIO',
  'android.permission.ACCESS_BACKGROUND_LOCATION',
  'android.permission.READ_EXTERNAL_STORAGE',
  'android.permission.WRITE_EXTERNAL_STORAGE',
];

for (const perm of blocked) {
  const active = manifestLines.some(line => isActivePermissionLine(line, perm));
  if (active) {
    fail(`Manifest must not actively declare ${perm}`);
  }
}
ok('Blocked permissions absent from manifest');

const required = [
  'android.permission.ACCESS_FINE_LOCATION',
  'android.permission.CAMERA',
  'android.permission.INTERNET',
];

for (const perm of required) {
  if (!manifest.includes(perm)) {
    fail(`Manifest missing required permission ${perm}`);
  }
}
ok('Required permissions present');

if (!gradle.includes('com.skps00.earthonline')) {
  fail('android/app/build.gradle missing applicationId com.skps00.earthonline');
}
ok('applicationId com.skps00.earthonline in build.gradle');

console.log('\nPS.14 verification passed.');
