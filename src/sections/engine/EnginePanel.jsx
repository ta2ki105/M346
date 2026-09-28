import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useI18n } from '../../i18n/useI18n.js';
import {
  ENGINE_SPECS,
  MODULES,
  STRUCTURE_TREE,
  GAS_PATH,
  QUIZ_POOL,
} from './engine-data.js';
import EngineDiagram, {
  MODULE_COLORS,
  SPOOL_COLORS,
  HEAT_GRADIENT,
} from './EngineDiagram.jsx';

// ---------------------------------------------------------------------------
// Tree helpers
// ---------------------------------------------------------------------------
function collectLeaves(node) {
  if (!node.children) return [node.id];
  return node.children.flatMap(collectLeaves);
}

// id -> { node, ids, path: [ancestor nodes...] }
function indexTree(root) {
  const map = {};
  const walk = (node, path) => {
    const ids = node.ids || (node.children ? collectLeaves(node) : [node.id]);
    // Leaf ids may appear in more than one branch (e.g. lpShaft under both
    // spools); keep the first occurrence so breadcrumbs stay stable.
    if (!map[node.id]) map[node.id] = { node, ids, path };
    (node.children || []).forEach((ch) => walk(ch, [...path, node]));
  };
  walk(root, []);
  return map;
}

function shuffle(arr) {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const QUIZ_LEN = 10;
const newQuiz = () => ({ qs: shuffle(QUIZ_POOL).slice(0, QUIZ_LEN), i: 0, correct: 0, answered: null });

// ---------------------------------------------------------------------------
// Small UI pieces
// ---------------------------------------------------------------------------
function Segmented({ value, onChange, options, dark }) {
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

function Toggle({ checked, onChange, label }) {
  return (
    <label className="inline-flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-sky-400"
      />
      {label}
    </label>
  );
}

function Swatch({ color, label }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-300">
      <span className="inline-block w-3 h-3 rounded-sm" style={{ background: color }} />
      {label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Gas-path chart: two small multiples (pressure, temperature) on a shared
// station axis. Two different measures never share a y-scale.
// ---------------------------------------------------------------------------
function GasPathChart({ steps, active, onSelect, L, t }) {
  const [hover, setHover] = useState(null);
  const W = 640;
  const H = 120;
  const PAD_L = 44;
  const PAD_R = 16;
  const xs = steps.map((_, i) => PAD_L + (i * (W - PAD_L - PAD_R)) / (steps.length - 1));

  const panel = (key, title, valueOf, max, color, fmt, xLabels) => {
    const top = 18;
    const bottom = H - 8;
    const h = xLabels ? H + 16 : H;
    const yOf = (v) => bottom - (v / max) * (bottom - top);
    const d = steps.map((s, i) => `${i ? 'L' : 'M'}${xs[i]},${yOf(valueOf(s))}`).join(' ');
    return (
      <svg key={key} viewBox={`0 0 ${W} ${h}`} className="w-full h-auto block">
        <text x={PAD_L} y="11" fontSize="11" fontWeight="600" fill="#334155">
          {title}
        </text>
        {[0, 0.5, 1].map((k) => (
          <line key={k} x1={PAD_L} x2={W - PAD_R} y1={yOf(max * k)} y2={yOf(max * k)} stroke="#e2e8f0" />
        ))}
        {fmt && (
          <>
            <text x={PAD_L - 6} y={yOf(max) + 3} fontSize="9" textAnchor="end" fill="#94a3b8">
              {fmt(max)}
            </text>
            <text x={PAD_L - 6} y={yOf(0) + 3} fontSize="9" textAnchor="end" fill="#94a3b8">
              0
            </text>
          </>
        )}
        {active != null && steps.findIndex((s) => s._i === active) >= 0 && (
          <line
            x1={xs[steps.findIndex((s) => s._i === active)]}
            x2={xs[steps.findIndex((s) => s._i === active)]}
            y1={top - 4}
            y2={bottom}
            stroke="#94a3b8"
            strokeDasharray="3 3"
          />
        )}
        <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
        {steps.map((s, i) => {
          const on = s._i === active;
          return (
            <g key={i}>
              <circle
                cx={xs[i]}
                cy={yOf(valueOf(s))}
                r={on ? 5.5 : 4}
                fill={on ? color : '#ffffff'}
                stroke={color}
                strokeWidth="2"
              />
              {key === 'p' && s.published && (
                <text x={xs[i]} y={yOf(valueOf(s)) - 9} fontSize="10" fontWeight="700" textAnchor="middle" fill="#0f172a">
                  {s.p}×
                </text>
              )}
            </g>
          );
        })}
        {xLabels &&
          steps.map((s, i) => (
            <text key={`xl${i}`} x={xs[i]} y={H + 10} fontSize="10" textAnchor="middle" fill="#64748b" fontFamily="monospace">
              {s.station}
            </text>
          ))}
        {/* generous hit targets */}
        {steps.map((s, i) => (
          <rect
            key={`hit${i}`}
            x={xs[i] - 22}
            y={0}
            width={44}
            height={h}
            fill="transparent"
            style={{ cursor: 'pointer' }}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            onClick={() => onSelect(s._i)}
          />
        ))}
      </svg>
    );
  };

  const h = hover != null ? steps[hover] : null;
  return (
    <div className="relative">
      {panel('p', t('engine.gas_pressure'), (s) => s.p, 20, '#2563eb', (v) => `${v}×`)}
      {panel('t', t('engine.gas_temp'), (s) => s.t, 1, '#ea580c', null, true)}
      {h && (
        <div
          className="absolute top-1 right-1 bg-slate-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg pointer-events-none max-w-[60%]"
          role="status"
        >
          <div className="font-semibold">{L(h.title)}</div>
          <div className="text-slate-300 font-mono">
            {t('engine.gas_station', { s: h.station })} · P ≈ {h.p}× {h.published ? `(${t('engine.gas_published')})` : ''}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// M-346 top-view installation sketch
// ---------------------------------------------------------------------------
function InstallationSketch() {
  return (
    <svg viewBox="0 0 300 360" className="w-full max-w-[260px] h-auto mx-auto block" aria-hidden="true">
      <rect width="300" height="360" rx="16" fill="#0b1220" />
      {/* wings */}
      <path d="M150 120 L40 222 L40 238 L150 214 L260 238 L260 222 Z" fill="#334155" />
      {/* tailplanes */}
      <path d="M150 272 L92 316 L92 326 L150 312 L208 326 L208 316 Z" fill="#334155" />
      {/* fuselage */}
      <path
        d="M150 22 C160 40 166 70 168 110 L176 150 L178 300 L170 330 L130 330 L122 300 L124 150 L132 110 C134 70 140 40 150 22 Z"
        fill="#475569"
      />
      {/* canopy */}
      <path d="M150 58 C157 70 158 90 156 104 L144 104 C142 90 143 70 150 58 Z" fill="#7dd3fc" fillOpacity="0.7" />
      {/* intakes */}
      <rect x="120" y="140" width="8" height="26" rx="3" fill="#94a3b8" />
      <rect x="172" y="140" width="8" height="26" rx="3" fill="#94a3b8" />
      {/* engines */}
      <rect x="130" y="228" width="17" height="92" rx="7" fill="#f59e0b" fillOpacity="0.9" />
      <rect x="153" y="228" width="17" height="92" rx="7" fill="#f59e0b" fillOpacity="0.9" />
      <path d="M131 322 L146 322 L143 340 L134 340 Z" fill="#fb923c" fillOpacity="0.8" />
      <path d="M154 322 L169 322 L166 340 L157 340 Z" fill="#fb923c" fillOpacity="0.8" />
      <text x="150" y="215" fontSize="11" textAnchor="middle" fill="#fde68a" fontWeight="700">
        2 × F124-GA-200
      </text>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Main panel
// ---------------------------------------------------------------------------
export default function EnginePanel() {
  const { t, lang } = useI18n();
  const L = useCallback((obj) => (obj ? obj[lang] ?? obj.en : ''), [lang]);

  const treeIndex = useMemo(() => indexTree(STRUCTURE_TREE), []);

  const [explode, setExplode] = useState(0);
  const [colorMode, setColorMode] = useState('module');
  const [showFlow, setShowFlow] = useState(true);
  const [showStations, setShowStations] = useState(false);
  const [mode, setMode] = useState('explore');
  const [selected, setSelected] = useState(null); // module id or tree group id
  const [hovered, setHovered] = useState(null);
  const [gasStep, setGasStep] = useState(null);
  const [quiz, setQuiz] = useState(newQuiz);
  const [openTree, setOpenTree] = useState(() => new Set(['root', 'g_cold', 'g_hot', 'g_exh', 'g_rot', 'g_sys', 'g_hpc', 'g_lp', 'g_hp']));
  const [glossQuery, setGlossQuery] = useState('');

  // --- explode tween -------------------------------------------------------
  const rafRef = useRef(0);
  const explodeRef = useRef(0);
  explodeRef.current = explode;
  const animateExplode = useCallback((target) => {
    cancelAnimationFrame(rafRef.current);
    const from = explodeRef.current;
    const start = performance.now();
    const dur = 750;
    const step = (now) => {
      const k = Math.min(1, (now - start) / dur);
      const eased = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      setExplode(from + (target - from) * eased);
      if (k < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
  }, []);
  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  // --- selection -------------------------------------------------------------
  const selectedEntry = selected ? treeIndex[selected] : null;
  const selectedModule = selected && MODULES[selected] ? selected : null;

  const quizTarget = quiz.qs[quiz.i];
  let highlight = [];
  if (mode === 'quiz') {
    if (quiz.answered) highlight = [quizTarget];
  } else if (gasStep != null) {
    highlight = GAS_PATH[gasStep].ids;
  } else if (selectedEntry) {
    highlight = selectedEntry.ids;
  }

  const handlePick = useCallback(
    (id) => {
      if (mode === 'quiz') {
        if (!id) return;
        setQuiz((q) => {
          if (q.answered) return q;
          const ok = id === q.qs[q.i];
          return { ...q, correct: q.correct + (ok ? 1 : 0), answered: { picked: id, ok } };
        });
        return;
      }
      setGasStep(null);
      setSelected((cur) => (cur === id ? null : id));
    },
    [mode]
  );

  const selectNode = (id) => {
    setGasStep(null);
    setSelected((cur) => (cur === id ? null : id));
  };

  const switchMode = (m) => {
    setMode(m);
    setSelected(null);
    setGasStep(null);
    if (m === 'quiz') setQuiz(newQuiz());
  };

  const nextQuiz = () => setQuiz((q) => ({ ...q, i: q.i + 1, answered: null }));
  const quizDone = quiz.i >= quiz.qs.length;

  const shortNames = useMemo(
    () => Object.fromEntries(Object.entries(MODULES).map(([id, m]) => [id, L(m.short)])),
    [L]
  );
  const accLabels = [t('engine.acc_fuel'), t('engine.acc_oil'), t('engine.acc_gen'), t('engine.acc_start')];

  // --- gas path chart data (core flow only; the bypass step has its own row)
  const coreSteps = useMemo(
    () => GAS_PATH.map((s, i) => ({ ...s, _i: i })).filter((s) => !s.bypass),
    []
  );

  // --- glossary ------------------------------------------------------------
  const glossary = useMemo(() => {
    const q = glossQuery.trim().toLowerCase();
    return Object.entries(MODULES)
      .map(([id, m]) => ({
        id,
        m,
        terms: m.vocab.filter((v) => !q || v.en.toLowerCase().includes(q) || v.ja.includes(glossQuery.trim())),
      }))
      .filter((g) => g.terms.length > 0);
  }, [glossQuery]);

  // --- render helpers --------------------------------------------------------
  const renderTree = (node, depth = 0) => {
    const isLeaf = !node.children;
    const label = node.label ? L(node.label) : L(MODULES[node.id].name);
    const note = node.note ? L(node.note) : null;
    const open = openTree.has(node.id);
    const isSel = selected === node.id;
    const leafColor = isLeaf ? MODULE_COLORS[node.id] : null;
    return (
      <li key={`${node.id}-${depth}`}>
        <div
          className={`flex items-center gap-1.5 rounded-lg pr-2 py-1 text-sm transition-colors ${
            isSel ? 'bg-blue-50 ring-1 ring-blue-300' : 'hover:bg-slate-50'
          }`}
          style={{ paddingLeft: 4 + depth * 16 }}
        >
          {!isLeaf ? (
            <button
              type="button"
              onClick={() =>
                setOpenTree((s) => {
                  const n = new Set(s);
                  if (n.has(node.id)) n.delete(node.id);
                  else n.add(node.id);
                  return n;
                })
              }
              className="w-5 h-5 flex-none text-slate-400 hover:text-slate-700 text-xs"
              aria-label={open ? 'collapse' : 'expand'}
            >
              {open ? '▾' : '▸'}
            </button>
          ) : (
            <span className="w-5 flex-none flex justify-center">
              <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: leafColor }} />
            </span>
          )}
          <button
            type="button"
            onClick={() => {
              if (mode === 'quiz') switchMode('explore');
              selectNode(node.id);
            }}
            className="text-left flex-1 min-w-0"
          >
            <span className={`${isLeaf ? 'text-slate-700' : 'font-semibold text-slate-900'}`}>
              {isLeaf && <span className="font-mono text-[11px] text-slate-400 mr-1">{MODULES[node.id].no}</span>}
              {label}
            </span>
            {note && <span className="ml-2 text-xs text-slate-400">{note}</span>}
          </button>
        </div>
        {!isLeaf && open && <ul>{node.children.map((ch) => renderTree(ch, depth + 1))}</ul>}
      </li>
    );
  };

  const legend = () => {
    if (colorMode === 'spool')
      return (
        <>
          <Swatch color={SPOOL_COLORS.lp} label={t('engine.legend_lp')} />
          <Swatch color={SPOOL_COLORS.hp} label={t('engine.legend_hp')} />
          <Swatch color={SPOOL_COLORS.static} label={t('engine.legend_static')} />
          <Swatch color={SPOOL_COLORS.acc} label={t('engine.legend_acc')} />
        </>
      );
    if (colorMode === 'temp')
      return (
        <span className="inline-flex items-center gap-2 text-[11px] text-slate-300">
          {t('engine.legend_cold')}
          <span
            className="inline-block w-32 h-2.5 rounded-full"
            style={{ background: `linear-gradient(90deg, ${HEAT_GRADIENT.join(',')})` }}
          />
          {t('engine.legend_hot')}
          <span className="text-slate-500">({t('engine.gas_illustrative')})</span>
        </span>
      );
    return (
      <span className="text-[11px] text-slate-400">{t('engine.legend_module')}</span>
    );
  };

  const hoverName = hovered ? `${MODULES[hovered].no}. ${L(MODULES[hovered].name)}` : null;

  return (
    <div className="space-y-5 fade-in">
      {/* ---------------------------------------------------------------- hero */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-widest text-blue-600 uppercase">{t('engine.kicker')}</p>
            <h2 className="text-xl font-bold text-slate-900 leading-tight">{t('engine.title')}</h2>
            <p className="text-sm text-slate-500">{t('engine.subtitle')}</p>
          </div>
        </div>
        <p className="mt-3 text-sm text-slate-700 leading-relaxed">{t('engine.intro')}</p>
        <dl className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {ENGINE_SPECS.map((s) => (
            <div key={s.k.en} className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2">
              <dt className="text-[10px] uppercase tracking-wide text-slate-500">{L(s.k)}</dt>
              <dd className="text-sm font-semibold text-slate-900 leading-snug">{L(s.v)}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-[11px] text-slate-400 leading-relaxed">{t('engine.source_note')}</p>
      </div>

      {/* -------------------------------------------------------------- viewer */}
      <div className="bg-slate-900 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-4 pt-4 pb-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          <h3 className="text-white font-semibold text-sm mr-auto">🔧 {t('engine.viewer_title')}</h3>
          <Segmented
            dark
            value={mode}
            onChange={switchMode}
            options={[
              { id: 'explore', label: t('engine.mode_explore') },
              { id: 'quiz', label: t('engine.mode_quiz') },
            ]}
          />
        </div>
        <div className="px-4 pb-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          <Segmented
            dark
            value={colorMode}
            onChange={setColorMode}
            options={[
              { id: 'module', label: t('engine.color_module') },
              { id: 'spool', label: t('engine.color_spool') },
              { id: 'temp', label: t('engine.color_temp') },
            ]}
          />
          <Toggle checked={showFlow} onChange={setShowFlow} label={t('engine.airflow')} />
          <Toggle checked={showStations} onChange={setShowStations} label={t('engine.stations')} />
        </div>
        <div className="px-4 pb-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => animateExplode(explode > 0.5 ? 0 : 1)}
            className="flex-none px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition-colors"
          >
            {explode > 0.5 ? `🧩 ${t('engine.assemble')}` : `💥 ${t('engine.explode')}`}
          </button>
          <input
            type="range"
            min="0"
            max="100"
            value={Math.round(explode * 100)}
            onChange={(e) => {
              cancelAnimationFrame(rafRef.current);
              setExplode(Number(e.target.value) / 100);
            }}
            className="flex-1 accent-sky-400"
            aria-label={t('engine.explode_label')}
          />
          <span className="text-[11px] text-slate-400 w-10 text-right font-mono">{Math.round(explode * 100)}%</span>
        </div>

        {/* quiz prompt bar */}
        {mode === 'quiz' && (
          <div className="mx-4 mb-3 rounded-xl bg-slate-800 border border-slate-700 px-4 py-3">
            {!quizDone ? (
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-[11px] font-mono text-slate-400">
                  {quiz.i + 1}/{quiz.qs.length} · {t('engine.quiz_score', { correct: quiz.correct })}
                </span>
                <span className="text-sm text-white flex-1 min-w-[12rem]">
                  {t('engine.quiz_prompt')}{' '}
                  <strong className="text-sky-300">{L(MODULES[quizTarget].name)}</strong>
                </span>
                {quiz.answered && (
                  <>
                    <span className={`text-sm font-semibold ${quiz.answered.ok ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {quiz.answered.ok
                        ? t('engine.quiz_correct')
                        : t('engine.quiz_wrong', { picked: L(MODULES[quiz.answered.picked].name) })}
                    </span>
                    <button
                      type="button"
                      onClick={nextQuiz}
                      className="px-3 py-1.5 rounded-lg bg-white text-slate-900 text-xs font-bold"
                    >
                      {t('common.next')}
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm text-white flex-1">
                  🏁 {t('engine.quiz_done', { correct: quiz.correct, total: quiz.qs.length })}
                </span>
                <button
                  type="button"
                  onClick={() => setQuiz(newQuiz())}
                  className="px-3 py-1.5 rounded-lg bg-white text-slate-900 text-xs font-bold"
                >
                  {t('engine.quiz_restart')}
                </button>
              </div>
            )}
          </div>
        )}

        <EngineDiagram
          explode={explode}
          colorMode={colorMode}
          showFlow={showFlow}
          showStations={showStations}
          highlight={highlight}
          hovered={mode === 'quiz' ? null : hovered}
          onHover={setHovered}
          onPick={handlePick}
          accLabels={accLabels}
          shortNames={shortNames}
        />

        <div className="px-4 py-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-800">
          {legend()}
          {showFlow && explode < 0.25 && (
            <>
              <Swatch color="#7dd3fc" label={t('engine.legend_bypass_flow')} />
              <Swatch color="linear-gradient(90deg,#7dd3fc,#fde047,#ef4444)" label={t('engine.legend_core_flow')} />
            </>
          )}
          <span className="ml-auto text-[11px] text-slate-400 min-h-[1rem]">
            {mode === 'quiz' ? t('engine.quiz_hint') : hoverName || t('engine.hover_hint')}
          </span>
        </div>
      </div>

      {/* ------------------------------------------------------------- detail */}
      {mode === 'explore' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          {!selectedEntry ? (
            <p className="text-sm text-slate-500">👆 {t('engine.detail_empty')}</p>
          ) : (
            <>
              {/* breadcrumbs */}
              <p className="text-[11px] text-slate-400 mb-1">
                {[...selectedEntry.path, selectedEntry.node]
                  .map((n) => (n.label ? L(n.label) : L(MODULES[n.id].short)))
                  .join('  ›  ')}
              </p>
              {selectedModule ? (
                <ModuleDetail id={selectedModule} L={L} t={t} />
              ) : (
                <GroupDetail entry={selectedEntry} L={L} t={t} onPick={selectNode} />
              )}
            </>
          )}
        </div>
      )}

      {/* --------------------------------------------------------------- tree */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <h3 className="font-semibold text-slate-900">🌳 {t('engine.tree_title')}</h3>
        <p className="text-xs text-slate-500 mb-3">{t('engine.tree_hint')}</p>
        <ul className="space-y-0.5">{renderTree(STRUCTURE_TREE)}</ul>
      </div>

      {/* ----------------------------------------------------------- gas path */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <h3 className="font-semibold text-slate-900">🌬️ {t('engine.gas_title')}</h3>
        <p className="text-xs text-slate-500 mb-3">{t('engine.gas_intro')}</p>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {GAS_PATH.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                if (mode === 'quiz') switchMode('explore');
                setSelected(null);
                setGasStep(gasStep === i ? null : i);
              }}
              className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${
                gasStep === i
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'
              }`}
            >
              {i + 1}. {L(s.title)}
            </button>
          ))}
        </div>

        {gasStep != null && (
          <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 mb-4">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[11px] font-mono text-blue-700">
                {t('engine.gas_step', { n: gasStep + 1, total: GAS_PATH.length })} ·{' '}
                {t('engine.gas_station', { s: GAS_PATH[gasStep].station })}
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  disabled={gasStep === 0}
                  onClick={() => setGasStep(gasStep - 1)}
                  className="px-2 py-0.5 rounded-md text-xs bg-white border border-blue-200 disabled:opacity-40"
                >
                  ←
                </button>
                <button
                  type="button"
                  disabled={gasStep === GAS_PATH.length - 1}
                  onClick={() => setGasStep(gasStep + 1)}
                  className="px-2 py-0.5 rounded-md text-xs bg-white border border-blue-200 disabled:opacity-40"
                >
                  →
                </button>
              </div>
            </div>
            <p className="font-semibold text-slate-900">{L(GAS_PATH[gasStep].title)}</p>
            <p className="text-sm text-slate-700 leading-relaxed">{L(GAS_PATH[gasStep].text)}</p>
            <p className="text-[11px] text-blue-700 mt-1">↑ {t('engine.gas_scroll_hint')}</p>
          </div>
        )}

        <GasPathChart
          steps={coreSteps}
          active={gasStep}
          onSelect={(i) => {
            if (mode === 'quiz') switchMode('explore');
            setSelected(null);
            setGasStep(i);
          }}
          L={L}
          t={t}
        />
        <p className="text-[11px] text-slate-400 mt-2">{t('engine.gas_note')}</p>
      </div>

      {/* ------------------------------------------------------- installation */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 grid sm:grid-cols-[260px_1fr] gap-5 items-center">
        <InstallationSketch />
        <div>
          <h3 className="font-semibold text-slate-900 mb-2">✈️ {t('engine.install_title')}</h3>
          <ul className="text-sm text-slate-700 space-y-1.5 list-disc pl-5">
            {(Array.isArray(t('engine.install_points')) ? t('engine.install_points') : []).map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* ----------------------------------------------------------- glossary */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <h3 className="font-semibold text-slate-900 mr-auto">📘 {t('engine.glossary_title')}</h3>
          <input
            type="search"
            value={glossQuery}
            onChange={(e) => setGlossQuery(e.target.value)}
            placeholder={t('engine.glossary_filter')}
            className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 w-full sm:w-56"
          />
        </div>
        <p className="text-xs text-slate-500 mb-3">{t('engine.glossary_hint')}</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {glossary.map(({ id, m, terms }) => (
            <div key={id} className="rounded-xl border border-slate-200 p-3">
              <button
                type="button"
                onClick={() => {
                  if (mode === 'quiz') switchMode('explore');
                  selectNode(id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-xs font-semibold text-slate-900 mb-1.5 flex items-center gap-1.5 hover:text-blue-700"
              >
                <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: MODULE_COLORS[id] }} />
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
          {glossary.length === 0 && <p className="text-sm text-slate-400">{t('engine.glossary_empty')}</p>}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
function ModuleDetail({ id, L, t }) {
  const m = MODULES[id];
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span
          className="flex-none w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-slate-900"
          style={{ background: MODULE_COLORS[id] }}
        >
          {m.no}
        </span>
        <h3 className="text-lg font-bold text-slate-900 leading-tight">{L(m.name)}</h3>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">{t('engine.detail_role')}</h4>
          <p className="text-sm text-slate-700 leading-relaxed">{L(m.role)}</p>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mt-3 mb-1">{t('engine.detail_how')}</h4>
          <p className="text-sm text-slate-700 leading-relaxed">{L(m.how)}</p>
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">{t('engine.detail_facts')}</h4>
          <ul className="text-sm text-slate-700 space-y-1 list-disc pl-5">
            {m.facts.map((f) => (
              <li key={f.en}>{L(f)}</li>
            ))}
          </ul>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mt-3 mb-1">{t('engine.detail_vocab')}</h4>
          <div className="flex flex-wrap gap-1.5">
            {m.vocab.map((v) => (
              <span key={v.en} className="text-xs rounded-lg bg-slate-100 border border-slate-200 px-2 py-1" title={v.ja}>
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

function GroupDetail({ entry, L, t, onPick }) {
  const { node, ids } = entry;
  return (
    <div>
      <h3 className="text-lg font-bold text-slate-900 leading-tight">{L(node.label)}</h3>
      {node.note && <p className="text-sm text-slate-500 mb-3">{L(node.note)}</p>}
      <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">{t('engine.detail_contains')}</h4>
      <div className="grid sm:grid-cols-2 gap-2">
        {ids.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => onPick(id)}
            className="text-left rounded-xl border border-slate-200 hover:border-blue-300 p-3 transition-colors"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: MODULE_COLORS[id] }} />
              <span className="text-sm font-semibold text-slate-900">
                {MODULES[id].no}. {L(MODULES[id].name)}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">{L(MODULES[id].role)}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
