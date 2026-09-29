import { useState } from 'react';
import { STUDY_FACTS, STUDY_UI, SOURCES } from './study-data.js';
import { SYSTEMS } from './airframe-data.js';

const KEY = 'm346_study_v1';
function readProgress() {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || '{}');
    return Object.fromEntries(STUDY_FACTS.map((f) => [f.id, value?.[f.id] === true]));
  } catch { return {}; }
}
export default function StudyPanel({ lang, onLocate }) {
  const ui = STUDY_UI[lang] || STUDY_UI.en;
  const L = (x) => x[lang] || x.en;
  const [mode, setMode] = useState('cards');
  const [system, setSystem] = useState('all');
  const [review, setReview] = useState(false);
  const [progress, setProgress] = useState(readProgress);
  const [cursor, setCursor] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const scope = STUDY_FACTS.filter((f) => system === 'all' || f.sys === system);
  const queue = scope.filter((f) => !review || !progress[f.id]);
  const card = queue[cursor % (queue.length || 1)];
  function save(next) {
    setProgress(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* private browsing */ }
  }
  function move(learned) {
    save({ ...progress, [card.id]: learned });
    // In review mode the learned card is removed; keep the cursor on its successor.
    if (!(review && learned)) setCursor((n) => n + 1);
    setRevealed(false);
  }
  function change(fn) { fn(); setCursor(0); setRevealed(false); }
  const source = (f) => <a href={SOURCES[f.source].url} target="_blank" rel="noreferrer" className="text-blue-700 underline underline-offset-2">{SOURCES[f.source].title}{f.page && ` · ${f.page}`}</a>;
  return <section className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4" aria-labelledby="study-title">
    <div className="flex flex-wrap gap-3 items-start justify-between">
      <div><h3 id="study-title" className="font-bold text-xl text-slate-900">{ui.title}</h3><p className="text-sm text-slate-600 mt-1">{ui.intro}</p></div>
      <p className="text-sm font-mono text-blue-700" aria-live="polite">{ui.progress} {scope.filter((f) => progress[f.id]).length}/{scope.length}</p>
    </div>
    <div className="flex flex-wrap gap-3 items-center">
      <div className="flex rounded-lg bg-slate-100 p-1" role="group" aria-label={ui.title}>{['cards', 'table'].map((id) => <button key={id} type="button" aria-pressed={mode === id} onClick={() => change(() => setMode(id))} className={`px-3 py-2 rounded-md text-sm ${mode === id ? 'bg-white shadow-sm text-blue-700' : 'text-slate-600'}`}>{ui[id]}</button>)}</div>
      <select aria-label={ui.all} value={system} onChange={(e) => change(() => setSystem(e.target.value))} className="border rounded-lg px-2 py-2 text-sm bg-white">
        <option value="all">{ui.all}</option>{[...new Set(STUDY_FACTS.map((f) => f.sys))].map((id) => <option key={id} value={id}>{L(SYSTEMS[id].name)}</option>)}
      </select>
      <label className="text-sm flex gap-2 items-center"><input type="checkbox" checked={review} onChange={(e) => change(() => setReview(e.target.checked))} />{ui.review}</label>
    </div>
    <p className="text-xs text-slate-500">{ui.conflict}</p>
    {mode === 'cards' && (card ? <div className="border-y border-slate-200 py-6 space-y-4">
      <p className="text-xs text-slate-500">{L(SYSTEMS[card.sys].name)} · {(cursor % queue.length) + 1}/{queue.length}</p>
      <h4 className="text-lg font-semibold text-slate-900">{L(card.question)}</h4>
      {revealed ? <div aria-live="polite" className="space-y-3">
        <p className="text-3xl font-semibold text-blue-800 break-words">{L(card.answer)}</p>
        <p className="text-sm text-slate-600">{ui.condition}: {L(card.condition)}</p>
        <p className="text-xs">{ui.source}: {source(card)}</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => move(false)} className="px-4 py-2 rounded-lg bg-slate-100 text-sm">{ui.again}</button>
          <button type="button" onClick={() => move(true)} className="px-4 py-2 rounded-lg bg-blue-700 text-white text-sm">{ui.known}</button>
          <button type="button" onClick={() => onLocate(card)} className="px-4 py-2 rounded-lg border text-sm">{ui.locate}</button>
        </div>
      </div> : <button type="button" onClick={() => setRevealed(true)} className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm">{ui.reveal}</button>}
    </div> : <p className="py-6 text-slate-600" role="status">{ui.empty}</p>)}
    {mode === 'table' && <div className="overflow-x-auto"><table className="w-full text-sm text-left"><thead><tr className="border-b"><th className="py-2 pr-3">{ui.question}</th><th className="pr-3">{ui.answer}</th><th>{ui.condition} / {ui.source}</th></tr></thead><tbody>{queue.map((f) => <tr key={f.id} className="border-b align-top"><td className="py-3 pr-3">{L(f.question)}<button type="button" className="block text-xs text-blue-700 mt-2 underline" onClick={() => onLocate(f)}>{ui.locate}</button></td><td className="py-3 pr-3 font-semibold whitespace-nowrap">{L(f.answer)}</td><td className="py-3 text-xs text-slate-600">{L(f.condition)}<div className="mt-1">{source(f)}</div></td></tr>)}</tbody></table>{!queue.length && <p className="py-4">{ui.empty}</p>}</div>}
    <div className="flex flex-wrap gap-3 justify-between text-xs text-slate-500"><p className="max-w-xl">{ui.note}</p><button type="button" onClick={() => change(() => save({ ...progress, ...Object.fromEntries(scope.map((f) => [f.id, false])) }))} className="underline">{ui.reset}</button></div>
  </section>;
}
