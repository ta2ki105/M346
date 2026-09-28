// Registry of explorer sections, in the order shown in the header.
// To add one (e.g. flight controls, landing gear): create src/sections/<id>/,
// export a panel component, add it here, and add `app.sections.<id>` to
// messages.js in both languages. Shared UI lives in src/components/ui.jsx.
import AirframePanel from './airframe/AirframePanel.jsx';
import EnginePanel from './engine/EnginePanel.jsx';

export const SECTIONS = [
  { id: 'airframe', icon: '🛩️', Component: AirframePanel },
  { id: 'engine', icon: '🌀', Component: EnginePanel },
];
