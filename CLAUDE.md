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
- `localStorage` only for per-viewer conveniences (`m346_engine_lang`,
  `m346_section`); every access is wrapped in try/catch

## Structure

- `src/App.jsx` — header, language toggle, section nav (auto-shown with ≥2 sections)
- `src/sections/index.js` — `SECTIONS` registry
- `src/sections/<id>/` — one folder per topic (panel + data + drawings)
- `src/components/ui.jsx` — shared StructureTree / PartDetail / GroupDetail / QuizBar / Glossary / controls (strings under `ui.*`). New sections should reuse these; the engine section still has its own inline copies (older code)
- `src/i18n/messages.js` — UI strings; `app.*` for the shell, `ui.*` shared, `engine.*` / `airframe.*` per section

## Conventions

- Every UI string in **both** `en` and `ja`. Section content data uses
  `{ en, ja }` objects next to the section.
- Accuracy: state only public-source figures as fact; label anything else
  "illustrative". Drawings are simplified schematics, and the page says so.
  Do not add restricted / non-public technical data.
- Engine geometry (`sections/engine/EngineDiagram.jsx`) uses `[x, r]`
  radius-from-centreline coordinates; the upper half is mirrored for the
  lower half; shafts, gearbox and FADEC are drawn un-mirrored.
- Airframe drawings (`sections/airframe/AirframeDiagram.jsx`) are in metres
  (plan: x aft from nose, y to the right wing; side: x aft, z up from the
  ground) so the outline matches 11.49 m × 9.72 m × 4.76 m. The M-346 has a
  SINGLE fin (not twin tails).
- Charts: never put two measures on one y-axis (use small multiples).
- Run `npm run build` before committing.
