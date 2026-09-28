// Shared building blocks for explorer sections (structure tree, part detail,
// quiz bar, glossary, small controls). Strings come from `ui.*` in
// i18n/messages.js; content objects are { en, ja } and resolved with L().
import { useState } from 'react';

export function collectLeaves(node) {
  if (!node.children || node.children.length === 0) return node.ids || [node.id];
  return node.children.flatMap(collectLeaves);
}

// id -> { node, ids, path: [ancestor nodes...] }
export function indexTree(root) {
  const map = {};
  const walk = (node, path) => {
    const isLeaf = !node.children;
    const ids = [...new Set(node.ids || (isLeaf ? [node.id] : collectLeaves(node)))];
    if (!map[node.id]) map[node.id] = { node, ids, path };
    (node.children || []).forEach((ch) => walk(ch, [...path, node]));
  };
  walk(root, []);
  return map;
}

export function shuffle(arr) {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function Segmented({ value, onChange, options, dark }) {
  return (
    <div className={`inline-flex rounded-lg p-0.5 text-xs font-semibold ${dark ? 'bg-slate-800' : 'bg-slate-100'}`}>
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          aria-pressed={value === o.id}
          className={`px-2.5 py-1 rounded-md transition-colors ${
            value === o.id
              ? dark
                ? 'bg-slate-100 text-slate-900'
                : 'bg-white text-blue-700 shadow-sm'
              : dark
                ? 'text-slate-300 hover:text-white'
                : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Toggle({ checked, onChange, label }) {
  return (
    <label className="inline-flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer select-none">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="accent-sky-400" />
      {label}
    </label>
  );
}

export function Swatch({ color, label, line }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-300">
      <span
        className={line ? 'inline-block w-4 h-1 rounded-full' : 'inline-block w-3 h-3 rounded-sm'}
        style={{ background: color }}
      />
      {label}
    </span>
  );
}

// ---------------------------------------------------------------- tree --
export function StructureTree({ tree, parts, colors, selected, onSelect, L, initiallyOpen }) {
  const [open, setOpen] = useState(() => new Set(initiallyOpen));
  const toggle = (id) =>
    setOpen((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const render = (node, depth) => {
    const isLeaf = !node.children;
    const hasKids = !isLeaf && node.children.length > 0;
    const label = node.label ? L(node.label) : L(parts[node.id].name);
    const isOpen = open.has(node.id);
    return (
      <li key={`${node.id}-${depth}`}>
        <div
          className={`flex items-center gap-1.5 rounded-lg pr-2 py-1 text-sm transition-colors ${
            selected === node.id ? 'bg-blue-50 ring-1 ring-blue-300' : 'hover:bg-slate-50'
          }`}
          style={{ paddingLeft: 4 + depth * 16 }}
        >
          {hasKids ? (
            <button
              type="button"
              onClick={() => toggle(node.id)}
              className="w-5 h-5 flex-none text-slate-400 hover:text-slate-700 text-xs"
              aria-label={isOpen ? 'collapse' : 'expand'}
            >
              {isOpen ? '▾' : '▸'}
            </button>
          ) : (
            <span className="w-5 flex-none flex justify-center">
              <span
                className={`inline-block w-2.5 h-2.5 ${isLeaf ? 'rounded-full' : 'rounded-sm'}`}
                style={{ background: isLeaf ? colors[node.id] : '#fb923c' }}
              />
            </span>
          )}
          <button type="button" onClick={() => onSelect(node.id)} className="text-left flex-1 min-w-0">
            <span className={isLeaf ? 'text-slate-700' : 'font-semibold text-slate-900'}>
              {isLeaf && <span className="font-mono text-[11px] text-slate-400 mr-1">{parts[node.id].no}</span>}
              {label}
            </span>
            {node.note && <span className="ml-2 text-xs text-slate-400">{L(node.note)}</span>}
          </button>
        </div>
        {hasKids && isOpen && <ul>{node.children.map((ch) => render(ch, depth + 1))}</ul>}
      </li>
    );
  };
  return <ul className="space-y-0.5">{render(tree, 0)}</ul>;
}

// -------------------------------------------------------------- detail --
export function PartDetail({ id, parts, colors, L, t, extra }) {
  const m = parts[id];
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span
          className="flex-none w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-slate-900"
          style={{ background: colors[id] }}
        >
          {m.no}
        </span>
        <h3 className="text-lg font-bold text-slate-900 leading-tight">{L(m.name)}</h3>
        {extra}
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="min-w-0">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">{t('ui.detail_role')}</h4>
          <p className="text-sm text-slate-700 leading-relaxed">{L(m.role)}</p>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mt-3 mb-1">{t('ui.detail_how')}</h4>
          <p className="text-sm text-slate-700 leading-relaxed">{L(m.how)}</p>
        </div>
        <div className="min-w-0">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">{t('ui.detail_facts')}</h4>
          <ul className="text-sm text-slate-700 space-y-1 list-disc pl-5">
            {m.facts.map((f) => (
              <li key={f.en}>{L(f)}</li>
            ))}
          </ul>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mt-3 mb-1">{t('ui.detail_vocab')}</h4>
          <div className="flex flex-wrap gap-1.5">
            {m.vocab.map((v) => (
              <span key={v.en} className="text-xs rounded-lg bg-slate-100 border border-slate-200 px-2 py-1">
                <span className="font-semibold text-slate-800">{v.en}</span>
                <span className="text-slate-500"> · {v.ja}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function GroupDetail({ entry, parts, colors, L, t, onPick }) {
  const { node, ids } = entry;
  return (
    <div>
      <h3 className="text-lg font-bold text-slate-900 leading-tight">{L(node.label)}</h3>
      {node.note && <p className="text-sm text-slate-500 mb-3">{L(node.note)}</p>}
      <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">{t('ui.detail_contains')}</h4>
      <div className="grid sm:grid-cols-2 gap-2">
        {ids.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => onPick(id)}
            className="text-left rounded-xl border border-slate-200 hover:border-blue-300 p-3 transition-colors"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: colors[id] }} />
              <span className="text-sm font-semibold text-slate-900">
                {parts[id].no}. {L(parts[id].name)}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">{L(parts[id].role)}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- quiz --
export const QUIZ_LEN = 10;
export const newQuiz = (pool) => ({ qs: shuffle(pool).slice(0, QUIZ_LEN), i: 0, correct: 0, answered: null });

export function QuizBar({ quiz, parts, L, t, onNext, onRestart }) {
  const done = quiz.i >= quiz.qs.length;
  const target = quiz.qs[quiz.i];
  return (
    <div className="mx-4 mb-3 rounded-xl bg-slate-800 border border-slate-700 px-4 py-3">
      {!done ? (
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[11px] font-mono text-slate-400">
            {quiz.i + 1}/{quiz.qs.length} · {t('ui.quiz_score', { correct: quiz.correct })}
          </span>
          <span className="text-sm text-white flex-1 min-w-[12rem]">
            {t('ui.quiz_prompt')} <strong className="text-sky-300">{L(parts[target].name)}</strong>
          </span>
          {quiz.answered && (
            <>
              <span className={`text-sm font-semibold ${quiz.answered.ok ? 'text-emerald-400' : 'text-rose-400'}`}>
                {quiz.answered.ok
                  ? t('ui.quiz_correct')
                  : t('ui.quiz_wrong', { picked: L(parts[quiz.answered.picked].name) })}
              </span>
              <button type="button" onClick={onNext} className="px-3 py-1.5 rounded-lg bg-white text-slate-900 text-xs font-bold">
                {t('common.next')}
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-white flex-1">
            🏁 {t('ui.quiz_done', { correct: quiz.correct, total: quiz.qs.length })}
          </span>
          <button type="button" onClick={onRestart} className="px-3 py-1.5 rounded-lg bg-white text-slate-900 text-xs font-bold">
            {t('ui.quiz_restart')}
          </button>
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------ glossary --
export function Glossary({ parts, colors, L, t, onPick }) {
  const [q, setQ] = useState('');
  const query = q.trim().toLowerCase();
  const groups = Object.entries(parts)
    .map(([id, m]) => ({
      id,
      m,
      terms: m.vocab.filter((v) => !query || v.en.toLowerCase().includes(query) || v.ja.includes(q.trim())),
    }))
    .filter((g) => g.terms.length > 0);
  return (
    <>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <h3 className="font-semibold text-slate-900 mr-auto">📘 {t('ui.glossary_title')}</h3>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t('ui.glossary_filter')}
          className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 w-full sm:w-56"
        />
      </div>
      <p className="text-xs text-slate-500 mb-3">{t('ui.glossary_hint')}</p>
      <div className="grid sm:grid-cols-2 gap-3">
        {groups.map(({ id, m, terms }) => (
          <div key={id} className="rounded-xl border border-slate-200 p-3 min-w-0">
            <button
              type="button"
              onClick={() => onPick(id)}
              className="text-xs font-semibold text-slate-900 mb-1.5 flex items-center gap-1.5 hover:text-blue-700"
            >
              <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: colors[id] }} />
              {m.no}. {L(m.name)}
            </button>
            <dl className="space-y-0.5">
              {terms.map((v) => (
                <div key={v.en} className="flex flex-wrap gap-x-2 text-sm">
                  <dt className="font-medium text-slate-800">{v.en}</dt>
                  <dd className="text-slate-500">— {v.ja}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
        {groups.length === 0 && <p className="text-sm text-slate-400">{t('ui.glossary_empty')}</p>}
      </div>
    </>
  );
}

// Explode tween shared by sections.
export function tween(from, to, dur, onFrame, rafRef) {
  cancelAnimationFrame(rafRef.current);
  const start = performance.now();
  const step = (now) => {
    const k = Math.min(1, (now - start) / dur);
    const eased = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
    onFrame(from + (to - from) * eased);
    if (k < 1) rafRef.current = requestAnimationFrame(step);
  };
  rafRef.current = requestAnimationFrame(step);
}
