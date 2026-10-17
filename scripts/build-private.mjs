#!/usr/bin/env node
// Builds the PRIVATE edition: a single, self-contained HTML file that works
// offline (file://) and contains the TO-derived notes encrypted with a
// passphrase (PBKDF2-SHA256 -> AES-256-GCM, decrypted in the browser).
//
//   M346_PASSPHRASE='...' npm run build:private [-- path/to/data.json]
//
// Input  : private/to-facts.json (gitignored – never commit it)
// Output : dist-private/m346-explorer-private.html (gitignored)
// If M346_PASSPHRASE is not set, a random passphrase is generated and printed.
import { readFileSync, writeFileSync, readdirSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { webcrypto, randomBytes } from 'node:crypto';

const root = resolve(new URL('..', import.meta.url).pathname);
const dataPath = resolve(process.argv[2] || join(root, 'private', 'to-facts.json'));
const outDir = join(root, 'dist-private');
const ITER = 600_000;

const words = () => {
  const alphabet = 'abcdefghjkmnpqrstuvwxyz23456789';
  const bytes = randomBytes(20);
  const chars = [...bytes].map((b) => alphabet[b % alphabet.length]).join('');
  return chars.match(/.{5}/g).join('-');
};

const passphrase = process.env.M346_PASSPHRASE || words();
const plain = readFileSync(dataPath, 'utf8');
JSON.parse(plain); // fail early on broken JSON

// ---- encrypt
const { subtle } = webcrypto;
const salt = randomBytes(16);
const iv = randomBytes(12);
const baseKey = await subtle.importKey('raw', new TextEncoder().encode(passphrase), 'PBKDF2', false, ['deriveKey']);
const key = await subtle.deriveKey(
  { name: 'PBKDF2', salt, iterations: ITER, hash: 'SHA-256' },
  baseKey,
  { name: 'AES-GCM', length: 256 },
  false,
  ['encrypt']
);
const ct = new Uint8Array(await subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(plain)));
const b64 = (u8) => Buffer.from(u8).toString('base64');
const payload = { v: 1, iter: ITER, salt: b64(salt), iv: b64(iv), ct: b64(ct) };

// ---- build the app in private mode
execFileSync(join(root, 'node_modules', '.bin', 'vite'), ['build', '--mode', 'private'], { cwd: root, stdio: 'inherit' });

// ---- inline everything into one HTML file
const assets = join(outDir, 'assets');
const files = readdirSync(assets);
const js = files.filter((f) => f.endsWith('.js'));
const css = files.filter((f) => f.endsWith('.css'));
if (js.length !== 1) throw new Error(`expected exactly one JS bundle, got ${js.length}`);
const jsCode = readFileSync(join(assets, js[0]), 'utf8').replace(/<\/script/gi, '<\\/script');
const cssCode = css.map((f) => readFileSync(join(assets, f), 'utf8')).join('\n');

const html = `<!doctype html>
<html lang="ja">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="robots" content="noindex, nofollow" />
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; connect-src 'none'; worker-src blob:" />
<title>M-346 Explorer (private)</title>
<style>${cssCode}</style>
</head>
<body>
<div id="root"></div>
<script>window.__M346_PRIVATE__ = ${JSON.stringify(payload)};</script>
<script type="module">${jsCode}</script>
</body>
</html>
`;
rmSync(assets, { recursive: true, force: true });
rmSync(join(outDir, 'index.html'), { force: true });
const outFile = join(outDir, 'm346-explorer-private.html');
writeFileSync(outFile, html);

console.log(`\n✔ ${outFile} (${(html.length / 1024).toFixed(0)} kB)`);
if (!process.env.M346_PASSPHRASE) console.log(`  passphrase (generated): ${passphrase}`);
console.log('  Do not upload this file to the internet or commit it.');
