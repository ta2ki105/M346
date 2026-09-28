# M-346 Explorer

Interactive, bilingual (EN / JA) learning site that takes the Leonardo M-346
apart system by system. Built with React + Vite + Tailwind; no backend.

## Sections

| Section | What it covers |
|---|---|
| 🌀 Engine | Honeywell/ITEC **F124-GA-200** turbofan: cutaway with animated airflow and station numbers, explode view, colour by module / spool / temperature, structure tree, gas-path walkthrough with P/T charts, "find the part" quiz, EN→JA vocabulary |

More sections (airframe structure, etc.) are planned — see "Adding a section".

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build to dist/
```

Deploys as a static Vite site (Vercel: import the repo, framework preset "Vite").

## Layout

```
src/
├── main.jsx                       React root
├── App.jsx                        header, language toggle, section nav
├── index.css                      Tailwind base
├── i18n/                          tiny self-rolled i18n (messages, context, hook)
└── sections/
    ├── index.js                   SECTIONS registry
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
Drawings are simplified learning schematics, not maintenance documents;
anything not from a published figure is labelled illustrative.
