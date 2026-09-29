// Registry of explorer sections, in the order shown in the header.
// To add one (e.g. airframe, avionics): create src/sections/<id>/, export a
// panel component, add it here, and add `app.sections.<id>` to messages.js
// in both languages.
import { lazy } from 'react';
import EnginePanel from './engine/EnginePanel.jsx';

// three.js is large, so the 3D section is split into its own chunk.
const AirframePanel = lazy(() => import('./airframe/AirframePanel.jsx'));

export const SECTIONS = [
  { id: 'airframe', icon: '✈️', Component: AirframePanel },
  { id: 'engine', icon: '🌀', Component: EnginePanel },
];
