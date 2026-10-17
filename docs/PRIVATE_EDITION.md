# Private edition (offline, passphrase-protected)

The public site (Cloudflare Worker `m346-explorer`) may contain **public-source
material only**. Notes derived from non-public documents (e.g. the Technical
Order) live in a separate **private edition**: one self-contained HTML file
that runs offline and keeps those notes AES-GCM encrypted until the reader
enters a passphrase.

## What goes where

| Item | Location | In git? |
|---|---|---|
| Private data (JSON, plain text) | `private/to-facts.json` | **No** (gitignored) |
| Private build output | `dist-private/m346-explorer-private.html` | **No** (gitignored) |
| Private UI code (no data) | `src/sections/private/PrivatePanel.jsx` | Yes |
| Build / guard scripts | `scripts/build-private.mjs`, `scripts/check-public.mjs` | Yes |

The private section is compiled in only with `vite build --mode private`.
`npm run build` (and therefore `npm run deploy`) runs `scripts/check-public.mjs`
afterwards and fails if any private marker or quote shows up in `dist/`.

## Build

```bash
npm ci
M346_PASSPHRASE='choose-a-long-passphrase' npm run build:private
# -> dist-private/m346-explorer-private.html
```

Without `M346_PASSPHRASE` a random passphrase is generated and printed.
Rebuild with a new passphrase whenever the group of readers changes.

## Data format (`private/to-facts.json`)

```json
{
  "meta": { "source": "...", "extracted": "...", "handling": { "ja": "...", "en": "..." } },
  "checks": [
    {
      "id": "A3", "sys": "airframe | engine",
      "part": { "ja": "...", "en": "..." },
      "claim": { "ja": "...", "en": "..." },
      "verdict": "confirmed | partial | contradicted | not_found",
      "site": "value on the public site", "to": "value in the source",
      "quote": "verbatim source text", "loc": "page / section",
      "note": { "ja": "...", "en": "..." }
    }
  ]
}
```

## Using and sharing the file

- Open the HTML file directly in a desktop browser (Chrome / Edge / Firefox /
  Safari). It makes no network requests (enforced by a Content-Security-Policy
  `connect-src 'none'`).
- Share it only through channels your organisation approves for this kind of
  material (e.g. hand-over on an approved USB drive / internal share). Give
  the passphrase separately, not in the same message as the file.
- Do **not** upload the file or the JSON to the internet, public repos,
  NotebookLM or other external cloud services, even though the notes are
  encrypted.
- The encryption protects a lost or forwarded file; it does not make the
  content public-releasable.
