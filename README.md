# M-346 Explorer

Interactive, bilingual (EN / JA) learning site that takes the Leonardo M-346
apart system by system. Built with React + Vite + Tailwind (+ three.js for the 3D section); no backend.

Live: https://m346-explorer.ifts-words-app.workers.dev

## Sections

| Section | What it covers |
|---|---|
| ✈️ Airframe & systems | Whole-aircraft 3D model (three.js): fade the skin, explode the structure, split fuel / electrical / flight-control / hydraulic / bleed-air / propulsion / gear / stores / cockpit systems into layers, animated flow along pipes and wiring, working gear / flaps / airbrake / control surfaces, three loadouts, click any part for an EN/JA description |
| 🌀 Engine | Honeywell/ITEC **F124-GA-200** turbofan: cutaway with animated airflow and station numbers, explode view, colour by module / spool / temperature, structure tree, gas-path walkthrough with P/T charts, "find the part" quiz, EN→JA vocabulary |

More sections are planned — see "Adding a section".

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build to dist/
```

Deploys to Cloudflare Workers as static assets (`wrangler.jsonc`):

```bash
npm run deploy   # vite build + wrangler deploy
```

Requires `npx wrangler login` once on the machine.

## Layout

```
src/
├── main.jsx                       React root
├── App.jsx                        header, language toggle, section nav
├── index.css                      Tailwind base
├── i18n/                          tiny self-rolled i18n (messages, context, hook)
└── sections/
    ├── index.js                   SECTIONS registry
    ├── airframe/
    │   ├── airframe-data.js       systems + part text ({ en, ja }), specs
    │   ├── atlas-scene.js         three.js scene (geometry, animation, picking)
    │   └── AirframePanel.jsx      controls, system list, part detail (lazy-loaded)
    └── engine/
        ├── engine-data.js         all engine content ({ en, ja })
        ├── EngineDiagram.jsx      SVG cutaway, explode / colour modes
        └── EnginePanel.jsx        detail, tree, gas path, quiz, glossary
```

## Adding a section

1. Create `src/sections/<id>/` with a panel component (and its content data).
2. Register it in `src/sections/index.js`.
3. Add `app.sections.<id>` plus any UI strings to `src/i18n/messages.js`
   in **both** `en` and `ja`.

The section nav in the header appears automatically once there are two or
more sections.

## Accuracy

Only public-source figures are stated as fact. Engine: 3-stage fan, HP
compressor with 4 axial + 1 centrifugal stages, annular combustor,
single-stage HP and LP turbines, bypass ratio ≈ 0.47, fan pressure ratio
≈ 2.5, overall pressure ratio ≈ 19.4, max thrust ≈ 27.8 kN (6,250 lbf).
Airframe: public references give 11.49 m length, 9.72 m span, and height
values of 4.76 m or 4.98 m depending on the stated configuration and source.
Equipment positions and pipe / wire routes in the 3D model are illustrative
and flagged "position approximate" in the UI.
Drawings are simplified learning schematics, not maintenance documents;
anything not from a published figure is labelled illustrative.
