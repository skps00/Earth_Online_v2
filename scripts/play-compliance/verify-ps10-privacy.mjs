#!/usr/bin/env node
/**
 * PS.10 — Privacy policy hosting verification.
 * Local checks always run; live HTTPS check is optional (warns if not deployed yet).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const appJsonPath = path.join(root, 'app.json');
const htmlPath = path.join(root, 'docs', 'privacy-policy.html');

function fail(msg) {
  console.error(`FAIL: ${msg}`);
  process.exit(1);
}

function ok(msg) {
  console.log(`OK: ${msg}`);
}

const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
const url = appJson?.expo?.extra?.PRIVACY_POLICY_URL ?? '';

if (!url.startsWith('https://')) {
  fail(`PRIVACY_POLICY_URL must be HTTPS, got "${url}"`);
}
ok(`PRIVACY_POLICY_URL = ${url}`);

if (!fs.existsSync(htmlPath)) {
  fail(`Missing ${htmlPath}`);
}

const html = fs.readFileSync(htmlPath, 'utf8');
const required = ['隱私權政策', 'Privacy Policy', '清除所有資料', 'Clear All Data'];
for (const phrase of required) {
  if (!html.includes(phrase)) {
    fail(`privacy-policy.html missing phrase: ${phrase}`);
  }
}
ok('privacy-policy.html contains required sections');

const expectedSuffix = '/privacy-policy.html';
if (!url.endsWith(expectedSuffix)) {
  fail(`URL should end with ${expectedSuffix}`);
}
ok('URL path matches deployed file name');

try {
  const res = await fetch(url, { method: 'GET', redirect: 'follow' });
  if (res.ok) {
    const body = await res.text();
    if (!body.includes('Privacy Policy')) {
      fail('Live URL returned 200 but body missing Privacy Policy');
    }
    ok(`Live HTTPS URL reachable (HTTP ${res.status})`);
  } else {
    console.warn(`WARN: Live URL returned HTTP ${res.status} — push to GitHub and enable Pages (Settings → Pages → GitHub Actions)`);
    process.exit(0);
  }
} catch (error) {
  console.warn(`WARN: Could not fetch live URL (${String(error)}) — local checks passed; deploy Pages after git push`);
  process.exit(0);
}

console.log('\nPS.10 verification passed.');
