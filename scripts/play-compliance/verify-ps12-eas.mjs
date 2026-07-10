#!/usr/bin/env node
/** PS.12 + PS.13 — EAS signing config & production profile verification */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

function fail(msg) {
  console.error(`FAIL: ${msg}`);
  process.exit(1);
}

function ok(msg) {
  console.log(`OK: ${msg}`);
}

const easPath = path.join(root, 'eas.json');
if (!fs.existsSync(easPath)) {
  fail('Missing eas.json');
}

const eas = JSON.parse(fs.readFileSync(easPath, 'utf8'));
const production = eas?.build?.production;
if (!production) {
  fail('eas.json missing build.production profile');
}
ok('production profile exists');

if (production.android?.buildType !== 'app-bundle') {
  fail('production.android.buildType must be app-bundle for Play Store');
}
ok('production builds AAB (app-bundle)');

if (!eas.submit?.production) {
  fail('eas.json missing submit.production for Play upload');
}
ok('submit.production configured');

const appJson = JSON.parse(fs.readFileSync(path.join(root, 'app.json'), 'utf8'));
const projectId = appJson?.expo?.extra?.eas?.projectId;
if (!projectId) {
  fail('app.json missing expo.extra.eas.projectId');
}
ok(`EAS projectId = ${projectId}`);

console.log('\nPS.12/PS.13 verification passed.');
console.log('Note: Run `eas credentials` or first `eas build -p android --profile production` to create upload keystore (Play App Signing).');
