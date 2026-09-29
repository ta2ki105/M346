# CLAUDE.md

Context for Claude Code sessions working on this repository.

## What this is

**M-346 Explorer** — a bilingual (EN / JA) interactive learning site that
breaks the Leonardo M-346 advanced/lead-in fighter trainer down into its
systems and structure. Split out of the JFLT Training app
(`ta2ki105/jflt-app`) on purpose: the two sites must stay independent —
never add M-346 material to jflt-app.

## Tech stack

- React 18 + Vite 5, Tailwind CSS 3 (utility classes only), no backend
- three.js (pinned 0.160.0) for the 3D airframe section, lazy-loaded via `React.lazy`
- Hosting: Cloudflare Workers static assets (`wrangler.jsonc`, worker `m346-explorer`);
  deploy with `npm run deploy`
- `localStorage` only for per-viewer conveniences (`m346_engine_lang`,
  `m346_section`); every access is wrapped in try/catch

## Structure

- `src/App.jsx` — header, language toggle, section nav (auto-shown with ≥2 sections)
- `src/sections/index.js` — `SECTIONS` registry
- `src/sections/<id>/` — one folder per topic (panel + data + drawings)
- `src/sections/airframe/atlas-scene.js` — framework-free three.js scene; axes +x forward,
  +y up, +z starboard, metres. It only knows part / system ids; all text is in
  `airframe-data.js`. Parts placed by estimate are registered with `approx: true`.
- `src/i18n/messages.js` — UI strings; `app.*` for the shell, `engine.*` etc. per section

## Conventions

- Every UI string in **both** `en` and `ja`. Section content data uses
  `{ en, ja }` objects next to the section.
- Accuracy: state only public-source figures as fact; label anything else
  "illustrative". Drawings are simplified schematics, and the page says so.
  Do not add restricted / non-public technical data.
- Engine geometry (`sections/engine/EngineDiagram.jsx`) uses `[x, r]`
  radius-from-centreline coordinates; the upper half is mirrored for the
  lower half; shafts, gearbox and FADEC are drawn un-mirrored.
- Charts: never put two measures on one y-axis (use small multiples).
- Run `npm run build` before committing.
