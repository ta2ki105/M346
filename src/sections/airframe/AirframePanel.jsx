import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useI18n } from '../../i18n/useI18n.js';
import { AIRFRAME_SPECS, SYSTEMS, SYSTEM_ORDER, partText, partName } from './airframe-data.js';
import { createAtlas } from './atlas-scene.js';
import StudyPanel from './StudyPanel.jsx';

const REDUCE_MOTION = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// ---------------------------------------------------------------------------
// Small UI pieces (dark viewer card)
// ---------------------------------------------------------------------------
function Segmented({ value, onChange, options, label }) {
  return (
    <div className="inline-flex flex-wrap rounded-lg p-0.5 text-xs font-semibold bg-slate-800" role="group" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          aria-pressed={value === o.id}
          className={`px-2.5 py-1 rounded-md transition-colors ${
            value === o.id ? 'bg-slate-100 text-slate-900' : 'text-slate-300 hover:text-white'
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
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="accent-sky-400" />
      {label}
    </label>
  );
}

function Slider({ id, label, value, onChange, min = 0, max = 100, display, disabled }) {
  return (
    <div className={disabled ? 'opacity-50' : ''}>
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-xs text-slate-300">{label}</label>
        <span className="text-[11px] text-slate-400 font-mono tabular-nums">{display ?? value}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-sky-400"
      />
    </div>
  );
}

function DarkButton({ onClick, pressed, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={pressed}
      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
        pressed ? 'bg-sky-400 text-slate-950' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
      }`}
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
export default function AirframePanel() {
  const { t, lang } = useI18n();
  const L = useCallback((obj) => (obj ? obj[lang] ?? obj.en : ''), [lang]);

  const stageRef = useRef(null);
  const atlasRef = useRef(null);
  const labelRef = useRef(null);
  const pendingLocateRef = useRef(null);
  labelRef.current = (id) => partName(id, lang);

  const [partsMeta, setPartsMeta] = useState([]);
  const [vis, setVis] = useState(() => Object.fromEntries(SYSTEM_ORDER.map((k) => [k, true])));
  const [focus, setFocus] = useState(null);
  const [selected, setSelected] = useState(null);
  const [viewName, setViewName] = useState('iso');
  const [skin, setSkin] = useState(100);
  const [explode, setExplode] = useState(0);
  const [layers, setLayers] = useState(0);
  const [flow, setFlow] = useState(false);
  const [edges, setEdges] = useState(false);
  const [gearDown, setGearDown] = useState(true);
  const [airbrake, setAirbrake] = useState(false);
  const [demo, setDemo] = useState(false);
  const [flap, setFlap] = useState(0);
  const [inputs, setInputs] = useState({ pitch: 0, roll: 0, yaw: 0 });
  const [loadout, setLoadout] = useState('clean');

  const viewLabels = lang === 'ja'
    ? { exterior: '外観', inside: '内部透視', exploded: '分解', study: '諸元を学ぶ', structure: '構造フレーム（概略）' }
    : { exterior: 'Exterior', inside: 'See inside', exploded: 'Exploded', study: 'Study specifications', structure: 'Structural frames (illustrative)' };
  const [structure, setStructure] = useState(false);

  // create / dispose the scene
  useEffect(() => {
    const atlas = createAtlas(stageRef.current, {
      reduceMotion: REDUCE_MOTION,
      labelFor: (id) => labelRef.current(id),
      onPick: (id) => setSelected(id),
    });
    atlasRef.current = atlas;
    setPartsMeta(atlas.parts);
    return () => {
      atlas.dispose();
      atlasRef.current = null;
    };
  }, []);

  // push React state into the scene
  const A = atlasRef.current;
  useEffect(() => { A?.setSkin(skin / 100); }, [A, skin]);
  useEffect(() => { A?.setExplode(explode / 100); }, [A, explode]);
  useEffect(() => { A?.setLayers(layers / 100); }, [A, layers]);
  useEffect(() => { A?.setFlow(flow); }, [A, flow]);
  useEffect(() => { A?.setEdges(edges); }, [A, edges]);
  useEffect(() => { A?.setStructure(structure); }, [A, structure]);
  useEffect(() => { A?.setGearDown(gearDown); }, [A, gearDown]);
  useEffect(() => { A?.setAirbrake(airbrake); }, [A, airbrake]);
  useEffect(() => { A?.setFlap(flap / 100); }, [A, flap]);
  useEffect(() => { A?.setDemo(demo); }, [A, demo]);
  useEffect(() => {
    if (!demo) A?.setInputs({ pitch: inputs.pitch / 100, roll: inputs.roll / 100, yaw: inputs.yaw / 100 });
  }, [A, inputs, demo]);
  useEffect(() => { A?.setLoadout(loadout); }, [A, loadout]);
  useEffect(() => { A?.setFocus(focus); }, [A, focus]);
  useEffect(() => { SYSTEM_ORDER.forEach((k) => A?.setVisible(k, vis[k])); }, [A, vis]);

  const partShown = useCallback((p) => vis[p.sys] && (!p.lo || p.lo.includes(loadout)), [vis, loadout]);
  const selMeta = partsMeta.find((p) => p.id === selected) || null;
  const selectedVisible = selMeta ? partShown(selMeta) : false;
  useEffect(() => { A?.select(selectedVisible ? selected : null); }, [A, selected, selectedVisible]);

  const goView = (name) => {
    setViewName(name);
    A?.view(name);
  };
  // re-fit the preset view when the model grows or shrinks
  useEffect(() => {
    // Locating a study fact deliberately overrides the preset fit. Keep that
    // focus when the preceding exploded/layered view is being reset.
    if (pendingLocateRef.current) {
      const id = pendingLocateRef.current;
      pendingLocateRef.current = null;
      A?.zoomTo(id);
      return;
    }
    A?.view(viewName);
  }, [A, explode > 50, layers > 50]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleFocus = (k) => {
    setFocus((f) => (f === k ? null : k));
    setSelected(null);
    if (!vis[k]) setVis((v) => ({ ...v, [k]: true }));
  };
  const pickFromList = (id) => {
    setSelected(id);
    A?.zoomTo(id);
  };
  const locateFact = (fact) => {
    const meta = partsMeta.find((p) => p.id === fact.part);
    if (!meta) return;
    setVis((v) => ({ ...v, [meta.sys]: true }));
    if (meta.lo && !meta.lo.includes(loadout)) setLoadout(meta.lo[0]);
    setSkin(fact.sys === 'airframe' ? 100 : 18);
    setFocus(fact.sys);
    setLayers(0);
    setExplode(0);
    setSelected(fact.part);
    pendingLocateRef.current = fact.part;
    stageRef.current?.scrollIntoView({ block: 'center', behavior: REDUCE_MOTION ? 'auto' : 'smooth' });
    // Reset scene transforms synchronously before computing the focus bounds.
    A?.setLayers(0);
    A?.setExplode(0);
    A?.zoomTo(fact.part);
  };

  const counts = useMemo(() => {
    const c = {};
    partsMeta.forEach((p) => (c[p.sys] = (c[p.sys] || 0) + 1));
    return c;
  }, [partsMeta]);

  const viewOptions = ['iso', 'front', 'side', 'top', 'bottom', 'rear'].map((id) => ({ id, label: t(`airframe.views.${id}`) }));
  const flapDisplay = flap === 0 ? t('airframe.flap_up') : flap === 100 ? t('airframe.flap_full') : `${flap}%`;

  // ------------------------------------------------------------ detail card
  const renderDetail = () => {
    if (selMeta && selectedVisible) {
      const txt = partText(selMeta.id);
      const s = SYSTEMS[selMeta.sys];
      return (
        <div className="fade-in">
          <p className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: s.color }} />
            {L(s.name)}
          </p>
          <h4 className="mt-1 text-lg font-bold text-slate-900 leading-snug">{partName(selMeta.id, lang)}</h4>
          {lang === 'ja' && <p className="text-xs text-slate-400 font-mono">{partName(selMeta.id, 'en')}</p>}
          <p className="mt-2 text-sm text-slate-700 leading-relaxed">{L(txt.desc)}</p>
          {selMeta.approx && <p className="mt-2 text-[11px] text-slate-400">{t('airframe.approx')}</p>}
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={() => A?.zoomTo(selMeta.id)} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-700">
              {t('airframe.zoom')}
            </button>
            <button type="button" onClick={() => toggleFocus(selMeta.sys)} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200">
              {focus === selMeta.sys ? t('airframe.show_all') : t('airframe.focus_system', { name: L(s.name) })}
            </button>
          </div>
        </div>
      );
    }
    if (focus) {
      const s = SYSTEMS[focus];
      const list = partsMeta.filter((p) => p.sys === focus);
      return (
        <div className="fade-in">
          <p className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: s.color }} />
            {t('airframe.detail_system')}
          </p>
          <h4 className="mt-1 text-lg font-bold text-slate-900 leading-snug">{L(s.name)}</h4>
          <p className="mt-2 text-sm text-slate-700 leading-relaxed">{L(s.desc)}</p>
          <ul className="mt-3 divide-y divide-slate-100 border-y border-slate-100">
            {list.map((p) => {
              const on = partShown(p);
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    disabled={!on}
                    onClick={() => pickFromList(p.id)}
                    className="w-full flex items-center justify-between gap-2 px-1 py-1.5 text-left text-sm text-slate-700 hover:bg-slate-50 disabled:text-slate-300 disabled:hover:bg-transparent"
                  >
                    <span>{partName(p.id, lang)}</span>
                    <span className="text-[11px] text-slate-400">{on ? (p.approx ? t('airframe.approx_short') : '') : t('airframe.hidden_in_loadout')}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      );
    }
    return <p className="text-sm text-slate-500 leading-relaxed">{t('airframe.detail_empty')}</p>;
  };

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
              <dd className="text-sm font-semibold text-slate-900 leading-snug">{L(s.v)}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-[11px] text-slate-400 leading-relaxed">{t('airframe.source_note')}</p>
        <a href="#study-title" className="inline-block mt-3 text-sm font-semibold text-blue-700 underline">{viewLabels.study}</a>
      </div>

      {/* -------------------------------------------------------------- viewer */}
      <div className="bg-slate-900 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-4 pt-4 pb-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          <h3 className="text-white font-semibold text-sm mr-auto">{t('airframe.viewer_title')}</h3>
          <Segmented value={viewName} onChange={goView} options={viewOptions} label={t('airframe.views_label')} />
        </div>
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {['exterior', 'inside', 'exploded'].map((id) => <DarkButton key={id} onClick={() => {
            setFocus(null); setSelected(null); setLayers(0); setExplode(id === 'exploded' ? 100 : 0);
            setSkin(id === 'exterior' ? 100 : 22); setEdges(id !== 'exterior'); setStructure(id === 'exploded');
            setFlow(id !== 'exterior' && !REDUCE_MOTION);
            setVis(Object.fromEntries(SYSTEM_ORDER.map((k) => [k, true])));
            goView('iso');
          }}>{viewLabels[id]}</DarkButton>)}
        </div>
        <div ref={stageRef} className="relative h-[58vh] min-h-[340px] max-h-[620px] bg-slate-900">
          <p className="absolute left-3 top-2 text-[11px] text-slate-500 pointer-events-none hidden sm:block">{t('airframe.hint')}</p>
        </div>

        <div className="p-4 grid gap-5 sm:grid-cols-2 border-t border-slate-800">
          <div className="space-y-3">
            <h4 className="text-[11px] font-semibold tracking-widest text-slate-400 uppercase">{t('airframe.display_title')}</h4>
            <Slider id="af-skin" label={t('airframe.skin')} value={skin} onChange={setSkin} display={`${skin}%`} />
            <Slider id="af-explode" label={t('airframe.explode')} value={explode} onChange={setExplode} display={`${explode}%`} />
            <Slider id="af-layers" label={t('airframe.layers')} value={layers} onChange={setLayers} display={`${layers}%`} />
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <Toggle checked={flow} onChange={setFlow} label={t('airframe.flow')} />
              <Toggle checked={edges} onChange={setEdges} label={t('airframe.edges')} />
              <Toggle checked={structure} onChange={setStructure} label={viewLabels.structure} />
            </div>
            <div className="flex flex-wrap gap-2">
              <DarkButton onClick={() => { setExplode(100); setSkin(45); }}>{t('airframe.explode_all')}</DarkButton>
              <DarkButton onClick={() => { setExplode(0); setLayers(0); }}>{t('airframe.assemble')}</DarkButton>
            </div>
            <div>
              <h4 className="text-[11px] font-semibold tracking-widest text-slate-400 uppercase mb-1.5">{t('airframe.loadout_title')}</h4>
              <Segmented
                value={loadout}
                onChange={setLoadout}
                label={t('airframe.loadout_title')}
                options={['clean', 'ferry', 'attack'].map((id) => ({ id, label: t(`airframe.lo.${id}`) }))}
              />
              <p className="mt-1 text-[11px] text-slate-500">{t('airframe.lo_note')}</p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-[11px] font-semibold tracking-widest text-slate-400 uppercase">{t('airframe.operate_title')}</h4>
            <div className="flex flex-wrap gap-2">
              <DarkButton onClick={() => setGearDown((g) => !g)} pressed={!gearDown}>
                {gearDown ? t('airframe.gear_up') : t('airframe.gear_down')}
              </DarkButton>
              <DarkButton onClick={() => setAirbrake((a) => !a)} pressed={airbrake}>{t('airframe.airbrake')}</DarkButton>
              <DarkButton onClick={() => setDemo((d) => !d)} pressed={demo}>{t('airframe.demo')}</DarkButton>
            </div>
            <Slider id="af-flap" label={t('airframe.flap')} value={flap} onChange={setFlap} display={flapDisplay} />
            {['pitch', 'roll', 'yaw'].map((k) => (
              <Slider
                key={k}
                id={`af-${k}`}
                label={t(`airframe.${k}`)}
                min={-100}
                value={inputs[k]}
                disabled={demo}
                onChange={(v) => setInputs((s) => ({ ...s, [k]: v }))}
              />
            ))}
            <DarkButton onClick={() => { setDemo(false); setInputs({ pitch: 0, roll: 0, yaw: 0 }); }}>{t('airframe.center')}</DarkButton>
            <p className="text-[11px] text-slate-500">{t('airframe.operate_note')}</p>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------- systems + detail */}
      <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <h3 className="font-semibold text-slate-900 text-sm">{t('airframe.systems_title')}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{t('airframe.systems_hint')}</p>
          <ul className="mt-3 space-y-0.5">
            {SYSTEM_ORDER.map((k) => {
              const s = SYSTEMS[k];
              return (
                <li
                  key={k}
                  className={`flex items-center gap-2 rounded-lg px-2 py-1 ${focus === k ? 'bg-blue-50 ring-1 ring-blue-300' : 'hover:bg-slate-50'}`}
                >
                  <input
                    type="checkbox"
                    checked={vis[k]}
                    onChange={(e) => setVis((v) => ({ ...v, [k]: e.target.checked }))}
                    aria-label={t('airframe.show_system', { name: L(s.name) })}
                    className="accent-blue-600"
                  />
                  <span className="inline-block w-3 h-3 rounded-sm flex-none" style={{ background: s.color }} />
                  <button type="button" onClick={() => toggleFocus(k)} className="flex-1 min-w-0 text-left text-sm py-0.5">
                    <span className="text-slate-800">{L(s.name)}</span>
                    {lang === 'ja' && <span className="ml-2 text-[11px] text-slate-400">{s.name.en}</span>}
                  </button>
                  <span className="text-[11px] text-slate-400 font-mono tabular-nums">{counts[k] || 0}</span>
                </li>
              );
            })}
          </ul>
          {focus && (
            <button type="button" onClick={() => setFocus(null)} className="mt-3 text-xs font-semibold text-blue-700 hover:underline">
              {t('airframe.show_all')}
            </button>
          )}
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 min-w-0">{renderDetail()}</div>
      </div>
      <StudyPanel lang={lang} onLocate={locateFact} />
    </div>
  );
}
