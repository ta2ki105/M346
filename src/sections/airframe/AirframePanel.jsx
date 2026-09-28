import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useI18n } from '../../i18n/useI18n.js';
import {
  AIRFRAME_SPECS,
  PARTS,
  STRUCTURE_TREE,
  LOAD_PATH,
  STRUCT_ELEMENTS,
  MATERIALS,
} from './airframe-data.js';
import AirframeDiagram, { PART_COLORS, MOVE_COLORS } from './AirframeDiagram.jsx';
import {
  indexTree,
  newQuiz,
  tween,
  Segmented,
  Toggle,
  Swatch,
  StructureTree,
  PartDetail,
  GroupDetail,
  QuizBar,
  Glossary,
} from '../../components/ui.jsx';

const TREE_OPEN = ['root', 'g_fus', 'g_cockpit', 'g_wing', 'g_tail', 'g_gear'];

export default function AirframePanel() {
  const { t, lang } = useI18n();
  const L = useCallback((obj) => (obj ? obj[lang] ?? obj.en : ''), [lang]);
  const treeIndex = useMemo(() => indexTree(STRUCTURE_TREE), []);

  const [view, setView] = useState('top');
  const [explode, setExplode] = useState(0);
  const [colorMode, setColorMode] = useState('module');
  const [showStructure, setShowStructure] = useState(false);
  const [showCallouts, setShowCallouts] = useState(true);
  const [mode, setMode] = useState('explore');
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [loadStep, setLoadStep] = useState(null);

  const poolFor = (v) => Object.keys(PARTS).filter((id) => PARTS[id].view.includes(v));
  const [quiz, setQuiz] = useState(() => newQuiz(poolFor('top')));

  const rafRef = useRef(0);
  const explodeRef = useRef(0);
  explodeRef.current = explode;
  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);
  const animateExplode = (to) => tween(explodeRef.current, to, 750, setExplode, rafRef);

  const selectedEntry = selected ? treeIndex[selected] : null;
  const selectedPart = selected && PARTS[selected] ? selected : null;

  // If the chosen part is not drawn in this view, offer to switch.
  const idsInView = (ids) => ids.filter((id) => PARTS[id].view.includes(view));

  const quizTarget = quiz.qs[quiz.i];
  let highlight = [];
  if (mode === 'quiz') {
    if (quiz.answered) highlight = [quizTarget];
  } else if (loadStep != null) {
    highlight = LOAD_PATH[loadStep].ids;
  } else if (selectedEntry) {
    highlight = selectedEntry.ids;
  }

  const handlePick = useCallback(
    (id) => {
      if (mode === 'quiz') {
        if (!id) return;
        setQuiz((q) => {
          if (q.answered || q.i >= q.qs.length) return q;
          const ok = id === q.qs[q.i];
          return { ...q, correct: q.correct + (ok ? 1 : 0), answered: { picked: id, ok } };
        });
        return;
      }
      setLoadStep(null);
      setSelected((cur) => (cur === id ? null : id));
    },
    [mode]
  );

  const selectNode = (id) => {
    if (mode === 'quiz') setMode('explore');
    setLoadStep(null);
    setSelected((cur) => (cur === id ? null : id));
  };

  const switchMode = (m) => {
    setMode(m);
    setSelected(null);
    setLoadStep(null);
    if (m === 'quiz') setQuiz(newQuiz(poolFor(view)));
  };

  const switchView = (v) => {
    setView(v);
    if (mode === 'quiz') setQuiz(newQuiz(poolFor(v)));
  };

  const hoverName = hovered ? `${PARTS[hovered].no}. ${L(PARTS[hovered].name)}` : null;
  const dimLabels = {
    length: t('airframe.dim_length'),
    span: t('airframe.dim_span'),
    height: t('airframe.dim_height'),
    right: t('airframe.right_wing'),
    left: t('airframe.left_wing'),
  };

  const legend = () => {
    if (colorMode === 'movable')
      return (
        <>
          <Swatch color={MOVE_COLORS.movable} label={t('airframe.legend_movable')} />
          <Swatch color={MOVE_COLORS.fixed} label={t('airframe.legend_fixed')} />
        </>
      );
    if (colorMode === 'material')
      return (
        <>
          {Object.values(MATERIALS).map((m) => (
            <Swatch key={m.name.en} color={m.color} label={L(m.name)} />
          ))}
        </>
      );
    return <span className="text-[11px] text-slate-400">{t('airframe.legend_module')}</span>;
  };

  const missingInView = selectedEntry && mode === 'explore' ? selectedEntry.ids.length > 0 && idsInView(selectedEntry.ids).length === 0 : false;

  return (
    <div className="space-y-5 fade-in">
      {/* ---------------------------------------------------------------- hero */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <p className="text-xs font-semibold tracking-widest text-blue-600 uppercase">{t('airframe.kicker')}</p>
        <h2 className="text-xl font-bold text-slate-900 leading-tight">{t('airframe.title')}</h2>
        <p className="text-sm text-slate-500">{t('airframe.subtitle')}</p>
        <p className="mt-3 text-sm text-slate-700 leading-relaxed">{t('airframe.intro')}</p>
        <dl className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {AIRFRAME_SPECS.map((s) => (
            <div key={s.k.en} className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2">
              <dt className="text-[10px] uppercase tracking-wide text-slate-500">{L(s.k)}</dt>
              <dd className="text-sm font-semibold text-slate-900 leading-snug tabular-nums">{L(s.v)}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-[11px] text-slate-400 leading-relaxed">{t('airframe.source_note')}</p>
      </div>

      {/* -------------------------------------------------------------- viewer */}
      <div className="bg-slate-900 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-4 pt-4 pb-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          <h3 className="text-white font-semibold text-sm mr-auto">🛩️ {t('airframe.viewer_title')}</h3>
          <Segmented
            dark
            value={view}
            onChange={switchView}
            options={[
              { id: 'top', label: t('airframe.view_top') },
              { id: 'side', label: t('airframe.view_side') },
            ]}
          />
          <Segmented
            dark
            value={mode}
            onChange={switchMode}
            options={[
              { id: 'explore', label: t('ui.mode_explore') },
              { id: 'quiz', label: t('ui.mode_quiz') },
            ]}
          />
        </div>
        <div className="px-4 pb-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          <Segmented
            dark
            value={colorMode}
            onChange={setColorMode}
            options={[
              { id: 'module', label: t('airframe.color_module') },
              { id: 'movable', label: t('airframe.color_movable') },
              { id: 'material', label: t('airframe.color_material') },
            ]}
          />
          <Toggle checked={showStructure} onChange={setShowStructure} label={t('airframe.structure')} />
          <Toggle checked={showCallouts} onChange={setShowCallouts} label={t('airframe.numbers')} />
        </div>
        <div className="px-4 pb-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => animateExplode(explode > 0.5 ? 0 : 1)}
            className="flex-none px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition-colors"
          >
            {explode > 0.5 ? `🧩 ${t('ui.assemble')}` : `💥 ${t('ui.explode')}`}
          </button>
          <input
            id="airframe-explode"
            type="range"
            min="0"
            max="100"
            value={Math.round(explode * 100)}
            onChange={(e) => {
              cancelAnimationFrame(rafRef.current);
              setExplode(Number(e.target.value) / 100);
            }}
            className="flex-1 accent-sky-400"
            aria-label={t('ui.explode_label')}
          />
          <span className="text-[11px] text-slate-400 w-10 text-right font-mono">{Math.round(explode * 100)}%</span>
        </div>

        {mode === 'quiz' && (
          <QuizBar
            quiz={quiz}
            parts={PARTS}
            L={L}
            t={t}
            onNext={() => setQuiz((q) => ({ ...q, i: q.i + 1, answered: null }))}
            onRestart={() => setQuiz(newQuiz(poolFor(view)))}
          />
        )}

        {missingInView && (
          <div className="mx-4 mb-3 rounded-xl bg-amber-500/10 border border-amber-400/40 px-4 py-2 flex flex-wrap items-center gap-3">
            <span className="text-xs text-amber-200 flex-1">{t('airframe.not_in_view')}</span>
            <button
              type="button"
              onClick={() => setView(view === 'top' ? 'side' : 'top')}
              className="px-3 py-1 rounded-lg bg-amber-300 text-slate-900 text-xs font-bold"
            >
              {view === 'top' ? t('airframe.view_side') : t('airframe.view_top')} →
            </button>
          </div>
        )}

        <AirframeDiagram
          view={view}
          explode={explode}
          colorMode={colorMode}
          showStructure={showStructure}
          showCallouts={showCallouts}
          highlight={highlight}
          hovered={mode === 'quiz' ? null : hovered}
          onHover={setHovered}
          onPick={handlePick}
          dimLabels={dimLabels}
        />

        <div className="px-4 py-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-800">
          {legend()}
          {showStructure &&
            STRUCT_ELEMENTS.map((s) => <Swatch key={s.id} line={s.id !== 'fuel'} color={s.color} label={L(s.name)} />)}
          <span className="ml-auto text-[11px] text-slate-400 min-h-[1rem]">
            {mode === 'quiz' ? t('ui.quiz_hint') : hoverName || t('ui.hover_hint')}
          </span>
        </div>
        {colorMode === 'material' && (
          <p className="px-4 pb-3 -mt-1 text-[11px] text-slate-500">{t('airframe.material_note')}</p>
        )}
      </div>

      {/* ------------------------------------------------------------- detail */}
      {mode === 'explore' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          {!selectedEntry ? (
            <p className="text-sm text-slate-500">👆 {t('ui.detail_empty')}</p>
          ) : (
            <>
              <p className="text-[11px] text-slate-400 mb-1">
                {[...selectedEntry.path, selectedEntry.node]
                  .map((n) => (n.label ? L(n.label) : L(PARTS[n.id].short)))
                  .join('  ›  ')}
              </p>
              {selectedPart ? (
                <PartDetail
                  id={selectedPart}
                  parts={PARTS}
                  colors={PART_COLORS}
                  L={L}
                  t={t}
                  extra={
                    PARTS[selectedPart].movable && (
                      <span className="ml-1 text-[10px] font-semibold uppercase tracking-wide rounded-full bg-orange-100 text-orange-700 px-2 py-0.5">
                        {t('airframe.badge_movable')}
                      </span>
                    )
                  }
                />
              ) : (
                <GroupDetail entry={selectedEntry} parts={PARTS} colors={PART_COLORS} L={L} t={t} onPick={selectNode} />
              )}
            </>
          )}
        </div>
      )}

      {/* --------------------------------------------------------------- tree */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <h3 className="font-semibold text-slate-900">🌳 {t('ui.tree_title')}</h3>
        <p className="text-xs text-slate-500 mb-3">{t('airframe.tree_hint')}</p>
        <StructureTree
          tree={STRUCTURE_TREE}
          parts={PARTS}
          colors={PART_COLORS}
          selected={selected}
          onSelect={selectNode}
          L={L}
          initiallyOpen={TREE_OPEN}
        />
      </div>

      {/* ------------------------------------------------------ structure 101 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <h3 className="font-semibold text-slate-900">🦴 {t('airframe.basics_title')}</h3>
        <p className="text-xs text-slate-500 mb-3">{t('airframe.basics_intro')}</p>
        <div className="grid sm:grid-cols-2 gap-3 mb-3">
          {STRUCT_ELEMENTS.map((s) => (
            <div key={s.id} className="flex gap-3 rounded-xl border border-slate-200 p-3">
              <span
                className={s.id === 'fuel' ? 'flex-none w-4 h-4 rounded mt-0.5' : 'flex-none w-4 h-1.5 rounded-full mt-2'}
                style={{ background: s.color }}
              />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">{L(s.name)}</p>
                <p className="text-xs text-slate-600">{L(s.text)}</p>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            setShowStructure(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="text-xs font-semibold text-blue-700 hover:underline"
        >
          ↑ {t('airframe.basics_show')}
        </button>
      </div>

      {/* ---------------------------------------------------------- load path */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <h3 className="font-semibold text-slate-900">🧭 {t('airframe.load_title')}</h3>
        <p className="text-xs text-slate-500 mb-3">{t('airframe.load_intro')}</p>
        <ol className="space-y-2">
          {LOAD_PATH.map((s, i) => {
            const on = loadStep === i;
            return (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => {
                    if (mode === 'quiz') setMode('explore');
                    setSelected(null);
                    setLoadStep(on ? null : i);
                    if (!on) {
                      const wantSide = s.ids.every((id) => !PARTS[id].view.includes('top'));
                      if (wantSide) setView('side');
                    }
                  }}
                  className={`w-full text-left flex gap-3 rounded-xl border p-3 transition-colors ${
                    on ? 'bg-blue-50 border-blue-300' : 'border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <span
                    className={`flex-none w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                      on ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-slate-900">{L(s.title)}</span>
                    <span className="block text-sm text-slate-600 leading-relaxed">{L(s.text)}</span>
                    {on && <span className="block text-[11px] text-blue-700 mt-1">↑ {t('airframe.load_hint')}</span>}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      {/* ----------------------------------------------------------- glossary */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <Glossary
          parts={PARTS}
          colors={PART_COLORS}
          L={L}
          t={t}
          onPick={(id) => {
            selectNode(id);
            if (!PARTS[id].view.includes(view)) setView(PARTS[id].view[0]);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      </div>
    </div>
  );
}
