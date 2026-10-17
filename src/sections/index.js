// Registry of explorer sections, in the order shown in the header.
// To add one (e.g. airframe, avionics): create src/sections/<id>/, export a
// panel component, add it here, and add `app.sections.<id>` to messages.js
// in both languages.
import { lazy } from 'react';
import EnginePanel from './engine/EnginePanel.jsx';

// three.js is large, so the 3D section is split into its own chunk.
const AirframePanel = lazy(() => import('./airframe/AirframePanel.jsx'));

// Private edition only (`npm run build:private`). In every other build
// `import.meta.env.MODE !== 'private'` is a compile-time false, so the
// private module is dropped from the bundle entirely.
const PrivatePanel =
  import.meta.env.MODE === 'private' ? lazy(() => import('./private/PrivatePanel.jsx')) : null;

export const SECTIONS = [
  { id: 'airframe', icon: '✈️', Component: AirframePanel },
  { id: 'engine', icon: '🌀', Component: EnginePanel },
  ...(PrivatePanel
    ? [{ id: 'private', icon: '🔒', label: { ja: 'TO照合', en: 'TO check' }, Component: PrivatePanel }]
    : []),
];
