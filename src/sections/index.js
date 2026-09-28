// Registry of explorer sections, in the order shown in the header.
// To add one (e.g. airframe, avionics): create src/sections/<id>/, export a
// panel component, add it here, and add `app.sections.<id>` to messages.js
// in both languages.
import EnginePanel from './engine/EnginePanel.jsx';

export const SECTIONS = [
  { id: 'engine', icon: '🌀', Component: EnginePanel },
];
