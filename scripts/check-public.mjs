#!/usr/bin/env node
// Guard for the PUBLIC build: fails if anything from the private edition
// leaked into dist/. Runs automatically after `npm run build`.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(new URL('..', import.meta.url).pathname);
const dist = join(root, 'dist');
const markers = ['__M346_PRIVATE__', 'TO照合', 'TO cross-check', 'private/to-facts'];

// When the private data file is present locally, also look for its quotes.
const dataPath = join(root, 'private', 'to-facts.json');
if (existsSync(dataPath)) {
  const data = JSON.parse(readFileSync(dataPath, 'utf8'));
  for (const c of data.checks || []) if (c.quote && c.quote.length >= 24) markers.push(c.quote.slice(0, 40));
}

const walk = (dir) =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });

const hits = [];
for (const file of walk(dist)) {
  const text = readFileSync(file, 'utf8');
  for (const m of markers) if (text.includes(m)) hits.push(`${file}: ${m.slice(0, 40)}`);
}
if (hits.length) {
  console.error('✖ Private material found in the public build:\n' + hits.join('\n'));
  process.exit(1);
}
console.log(`✔ public build clean (${markers.length} markers checked)`);
