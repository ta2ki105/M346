import { memo } from 'react';
import { MODULES } from './engine-data.js';

// Schematic half-section of the F124-GA-200, drawn in "radius" coordinates:
// every point is [x, r] where r is the distance from the engine centreline.
// The upper half is drawn once and mirrored for the lower half. Shafts and
// the accessory gearbox / FADEC are drawn un-mirrored because they explode
// downwards instead of apart.

export const VIEW_W = 1000;
export const VIEW_H = 510;
const AX = 220; // centreline y
const Y = (r) => AX - r;

const poly = (pts) =>
  pts.map(([x, r], i) => `${i ? 'L' : 'M'}${x},${Y(r)}`).join(' ') + 'Z';

// Rotor/stator aerofoil seen side-on: slightly tapered towards the tip.
const blade = (x, w, rIn, rOut) =>
  poly([[x, rIn], [x + w, rIn], [x + w - 2, rOut], [x + 2, rOut]]);

// ---------------------------------------------------------------------------
// Colours
// ---------------------------------------------------------------------------
export const MODULE_COLORS = {
  inlet: '#94a3b8',
  fan: '#38bdf8',
  bypass: '#64748b',
  hpc: '#2dd4bf',
  cfc: '#a3e635',
  combustor: '#fb923c',
  hpt: '#f43f5e',
  lpt: '#f59e0b',
  exhaust: '#a78bfa',
  lpShaft: '#60a5fa',
  hpShaft: '#f472b6',
  agb: '#facc15',
  fadec: '#34d399',
};

export const SPOOL_COLORS = {
  lp: '#38bdf8',
  hp: '#f43f5e',
  static: '#64748b',
  acc: '#facc15',
};

// Sequential "blackbody" ramp: cold = dim slate, hot = bright near-white.
const HEAT_STOPS = [
  [0, [59, 74, 99]],
  [0.35, [180, 83, 9]],
  [0.6, [249, 115, 22]],
  [0.82, [253, 224, 71]],
  [1, [255, 251, 235]],
];
export function heat(t) {
  for (let i = 1; i < HEAT_STOPS.length; i++) {
    const [t1, c1] = HEAT_STOPS[i];
    const [t0, c0] = HEAT_STOPS[i - 1];
    if (t <= t1) {
      const k = (t - t0) / (t1 - t0 || 1);
      const c = c0.map((v, j) => Math.round(v + (c1[j] - v) * k));
      return `rgb(${c.join(',')})`;
    }
  }
  return 'rgb(255,251,235)';
}
export const HEAT_GRADIENT = HEAT_STOPS.map(([t]) => heat(t));

const ROLE_OPACITY = { rotor: 1, stator: 0.72, case: 0.5 };

function makePalette(mode, id) {
  const m = MODULES[id];
  return (role) => {
    let fill;
    if (mode === 'spool') {
      const moving = role === 'rotor';
      fill = moving ? SPOOL_COLORS[m.spool] : m.spool === 'acc' ? SPOOL_COLORS.acc : SPOOL_COLORS.static;
    } else if (mode === 'temp') {
      fill = heat(m.temp);
    } else {
      fill = MODULE_COLORS[id];
    }
    return { fill, fillOpacity: ROLE_OPACITY[role] ?? 1 };
  };
}

const EDGE = { stroke: '#020617', strokeWidth: 0.8, strokeOpacity: 0.55 };
const S = ({ d, c }) => <path d={d} {...c} {...EDGE} />;

// ---------------------------------------------------------------------------
// Module geometry (upper half). Each returns SVG children.
// ---------------------------------------------------------------------------
const hpcHub = (x) => 44 + ((x - 256) * 14) / 144;
const hpcTip = (x) => 97 - ((x - 256) * 7) / 144;

const DRAW = {
  inlet: (c, { mode }) => (
    <>
      <path
        d={`M46,${Y(0)} Q58,${Y(26)} 100,${Y(33)} L132,${Y(36)} L132,${Y(0)} Z`}
        {...c('rotor')}
        {...EDGE}
      />
      <S d={poly([[36, 150], [58, 165], [112, 166], [112, 154], [60, 152], [42, 146]])} c={c('case')} />
      {mode !== 'temp' && (
        <path d={`M60,${Y(12)} Q80,${Y(24)} 104,${Y(28)}`} stroke="#fff" strokeOpacity="0.25" fill="none" />
      )}
    </>
  ),
  fan: (c) => (
    <>
      <S d={poly([[132, 10], [132, 36], [250, 42], [250, 10]])} c={c('rotor')} />
      <S d={blade(140, 18, 36, 152)} c={c('rotor')} />
      <S d={blade(162, 10, 37, 151)} c={c('stator')} />
      <S d={blade(182, 16, 38, 150)} c={c('rotor')} />
      <S d={blade(204, 10, 39, 149)} c={c('stator')} />
      <S d={blade(222, 14, 40, 148)} c={c('rotor')} />
      <S d={blade(240, 8, 41, 147)} c={c('stator')} />
    </>
  ),
  bypass: (c) => (
    <>
      <S d={poly([[112, 166], [250, 171], [700, 171], [700, 161], [250, 161], [112, 154]])} c={c('case')} />
      {/* bypass outlet guide vanes */}
      <S d={blade(262, 8, 112, 160)} c={c('stator')} />
    </>
  ),
  hpc: (c) => (
    <>
      {/* splitter nose + core case (inner wall of the bypass duct) */}
      <S d={poly([[250, 100], [300, 110], [400, 116], [400, 90], [300, 93], [256, 97]])} c={c('case')} />
      <S d={poly([[256, 19], [256, 44], [400, 58], [400, 19]])} c={c('rotor')} />
      {[0, 1, 2, 3].map((i) => {
        const rx = 264 + i * 34;
        const sx = rx + 18;
        return (
          <g key={i}>
            <S d={blade(rx, 13, hpcHub(rx), hpcTip(rx) - 1)} c={c('rotor')} />
            <S d={blade(sx, 9, hpcHub(sx) + 1, hpcTip(sx))} c={c('stator')} />
          </g>
        );
      })}
    </>
  ),
  cfc: (c) => (
    <>
      {/* outer skin (continues the bypass inner wall) */}
      <path
        d={`M400,${Y(116)} Q448,${Y(150)} 505,${Y(136)} L505,${Y(128)} Q450,${Y(140)} 400,${Y(108)} Z`}
        {...c('case')}
        {...EDGE}
      />
      {/* shroud wall over the impeller */}
      <path
        d={`M400,${Y(98)} Q434,${Y(100)} 446,${Y(120)} L452,${Y(120)} Q438,${Y(93)} 400,${Y(91)} Z`}
        {...c('case')}
        {...EDGE}
      />
      {/* impeller disk + back plate */}
      <path
        d={`M400,${Y(19)} L400,${Y(58)} Q442,${Y(62)} 462,${Y(114)} L476,${Y(114)} L476,${Y(19)} Z`}
        {...c('rotor')}
        {...EDGE}
      />
      {/* impeller blading (flow passage) */}
      <path
        d={`M400,${Y(58)} Q442,${Y(62)} 462,${Y(114)} L448,${Y(114)} Q434,${Y(90)} 400,${Y(90)} Z`}
        {...c('rotor')}
        fillOpacity={0.45}
        {...EDGE}
      />
      {[66, 74, 82].map((r0) => (
        <path
          key={r0}
          d={`M402,${Y(r0)} Q${430 + (r0 - 66) * 0.3},${Y(r0 + 2)} ${452 + (r0 - 66) * 0.3},${Y(112)}`}
          stroke="#020617"
          strokeOpacity="0.5"
          fill="none"
        />
      ))}
      {/* radial diffuser + deswirl pipe turning the flow rearward */}
      <path
        d={`M452,${Y(118)} Q458,${Y(136)} 482,${Y(134)} L505,${Y(124)} L505,${Y(116)} L482,${Y(124)} Q466,${Y(126)} 468,${Y(118)} Z`}
        {...c('stator')}
        {...EDGE}
      />
      {/* inner case under the diffuser */}
      <S d={poly([[476, 52], [500, 54], [500, 48], [476, 46]])} c={c('case')} />
    </>
  ),
  combustor: (c, { mode }) => (
    <>
      <S d={poly([[505, 136], [590, 130], [590, 122], [505, 128]])} c={c('case')} />
      <S d={poly([[500, 54], [592, 58], [592, 52], [500, 48]])} c={c('case')} />
      {/* flame zone */}
      <path
        d={`M522,${Y(88)} Q540,${Y(102)} 586,${Y(100)} L586,${Y(76)} Q540,${Y(74)} 522,${Y(88)} Z`}
        fill={mode === 'spool' ? '#64748b' : 'url(#flameGrad)'}
        fillOpacity={mode === 'spool' ? 0.35 : 0.9}
      />
      {/* liner: outer wall, dome, inner wall */}
      <path
        d={`M512,${Y(88)} Q512,${Y(112)} 530,${Y(112)} L588,${Y(106)} L588,${Y(102)} L532,${Y(107)} Q518,${Y(106)} 518,${Y(88)} Q518,${Y(70)} 532,${Y(69)} L588,${Y(74)} L588,${Y(70)} L530,${Y(64)} Q512,${Y(64)} 512,${Y(88)} Z`}
        {...c('stator')}
        {...EDGE}
      />
      {/* dilution holes */}
      {[548, 568].map((x) => (
        <g key={x}>
          <circle cx={x} cy={Y(107.5)} r="1.6" fill="#0b1220" />
          <circle cx={x} cy={Y(69.5)} r="1.6" fill="#0b1220" />
        </g>
      ))}
      {/* fuel nozzle + stem */}
      <S d={poly([[500, 90], [504, 90], [504, 132], [500, 132]])} c={c('stator')} />
      <S d={poly([[500, 86], [515, 86], [515, 91], [500, 91]])} c={c('rotor')} />
      {/* igniter */}
      <S d={poly([[540, 112], [544, 112], [544, 130], [540, 130]])} c={c('rotor')} />
    </>
  ),
  hpt: (c) => (
    <>
      <S d={poly([[590, 130], [636, 132], [636, 124], [590, 122]])} c={c('case')} />
      <S d={blade(594, 11, 62, 116)} c={c('stator')} />
      <S d={poly([[608, 19], [608, 54], [612, 60], [626, 60], [630, 54], [630, 19]])} c={c('rotor')} />
      <S d={blade(612, 14, 60, 118)} c={c('rotor')} />
    </>
  ),
  lpt: (c) => (
    <>
      <S d={poly([[636, 132], [700, 134], [700, 126], [636, 124]])} c={c('case')} />
      <S d={blade(642, 12, 58, 122)} c={c('stator')} />
      <S d={poly([[660, 9], [660, 50], [664, 56], [682, 56], [686, 50], [686, 9]])} c={c('rotor')} />
      <S d={blade(664, 18, 56, 124)} c={c('rotor')} />
    </>
  ),
  exhaust: (c) => (
    <>
      <S d={poly([[700, 171], [930, 131], [930, 123], [700, 161]])} c={c('case')} />
      {/* mixer: core outer wall ending in lobes */}
      <S d={poly([[700, 134], [772, 124], [772, 118], [700, 126]])} c={c('stator')} />
      <path
        d={`M772,${Y(124)} l6,-6 l6,10 l6,-10 l6,10`}
        stroke={c('stator').fill}
        strokeWidth="2"
        fill="none"
        strokeOpacity="0.8"
      />
      {/* tail cone */}
      <path
        d={`M700,${Y(56)} Q790,${Y(50)} 846,${Y(0)} L700,${Y(0)} Z`}
        {...c('stator')}
        {...EDGE}
      />
      {/* rear frame strut */}
      <S d={blade(704, 8, 56, 126)} c={c('case')} />
    </>
  ),
};

// Clickable areas, [x0, x1, rMin, rMax] - drawn on both halves.
const HIT = {
  inlet: [30, 132, 0, 168],
  fan: [132, 250, 10, 153],
  bypass: [112, 700, 153, 173],
  hpc: [250, 400, 19, 118],
  cfc: [400, 505, 19, 150],
  combustor: [505, 590, 19, 137],
  hpt: [590, 636, 19, 133],
  lpt: [636, 700, 9, 135],
  exhaust: [700, 935, 0, 173],
};

// Order along the axis, used for the horizontal explode.
const EXPLODE_IDX = { inlet: 0, fan: 1, hpc: 2, cfc: 3, combustor: 4, hpt: 5, lpt: 6, exhaust: 7 };
const CORE_ORDER = ['bypass', 'inlet', 'fan', 'hpc', 'cfc', 'combustor', 'hpt', 'lpt', 'exhaust'];

// Numbered callouts ([x, r]); negative r = lower half.
const CALLOUT = {
  inlet: [80, 104],
  fan: [194, 100],
  bypass: [560, 147],
  hpc: [330, 76],
  cfc: [438, 70],
  combustor: [552, 88],
  hpt: [619, 92],
  lpt: [673, 92],
  exhaust: [800, 92],
};

export const STATIONS = [
  { s: '2', x: 132 },
  { s: '2.5', x: 253 },
  { s: '3', x: 505 },
  { s: '4', x: 590 },
  { s: '4.5', x: 636 },
  { s: '5', x: 700 },
  { s: '9', x: 930 },
];

function Callout({ x, y, n, active }) {
  return (
    <g pointerEvents="none">
      <circle cx={x} cy={y} r="8.5" fill={active ? '#ffffff' : '#0b1220'} stroke="#e2e8f0" strokeWidth="1.2" />
      <text
        x={x}
        y={y + 3.2}
        textAnchor="middle"
        fontSize="9"
        fontWeight="700"
        fill={active ? '#0b1220' : '#e2e8f0'}
      >
        {n}
      </text>
    </g>
  );
}

// ---------------------------------------------------------------------------

function EngineDiagram({
  explode = 0,
  colorMode = 'module',
  showFlow = true,
  showStations = false,
  highlight = [],
  hovered = null,
  onHover,
  onPick,
  accLabels,
  shortNames = {},
}) {
  const e = explode;
  const s = 1 - 0.2 * e;
  const hasHi = highlight.length > 0;
  const flowOpacity = Math.max(0, 1 - e * 4);
  const lowerOpacity = 1 - 0.88 * e;

  const modOpacity = (id) => (!hasHi || highlight.includes(id) ? 1 : 0.16);
  const glow = (id) => (hasHi && highlight.includes(id) ? 'url(#glow)' : undefined);

  const bind = (id) => ({
    onClick: (ev) => {
      ev.stopPropagation();
      onPick?.(id);
    },
    onMouseEnter: () => onHover?.(id),
    onMouseLeave: () => onHover?.(null),
    style: { cursor: 'pointer' },
  });

  const moduleTransform = (id) => {
    if (id === 'bypass') return `translate(0 ${-34 * e})`;
    return `translate(${e * (EXPLODE_IDX[id] - 3.5) * 34} 0)`;
  };

  // One half (upper). The lower half re-uses it through a mirror transform.
  const half = (key) => (
    <g key={key}>
      {CORE_ORDER.map((id) => {
        const [x0, x1, r0, r1] = HIT[id];
        return (
          <g
            key={id}
            transform={moduleTransform(id)}
            opacity={modOpacity(id)}
            filter={glow(id)}
            {...bind(id)}
          >
            {DRAW[id](makePalette(colorMode, id), { mode: colorMode })}
            <rect x={x0} y={Y(r1)} width={x1 - x0} height={r1 - r0} fill="transparent" />
            {hovered === id && (
              <rect
                x={x0}
                y={Y(r1)}
                width={x1 - x0}
                height={r1 - r0}
                fill="#ffffff"
                fillOpacity="0.06"
                stroke="#ffffff"
                strokeOpacity="0.35"
                strokeDasharray="3 3"
              />
            )}
          </g>
        );
      })}
    </g>
  );

  const flowPaths = (
    <>
      <path
        className="eng-flow"
        d={`M20,${Y(128)} L140,${Y(130)} L250,${Y(132)} L420,${Y(132)} Q470,${Y(150)} 540,${Y(146)} L700,${Y(146)} L930,${Y(127)} L990,${Y(118)}`}
        stroke="#7dd3fc"
        strokeWidth="2.2"
        fill="none"
      />
      <path
        className="eng-flow eng-flow-core"
        d={`M20,${Y(64)} L140,${Y(72)} L256,${Y(72)} L400,${Y(74)} Q438,${Y(78)} 456,${Y(108)} Q464,${Y(128)} 482,${Y(128)} L505,${Y(120)} Q520,${Y(95)} 540,${Y(88)} L700,${Y(90)} L780,${Y(90)} L930,${Y(100)} L990,${Y(100)}`}
        stroke="url(#coreFlowGrad)"
        strokeWidth="2.6"
        fill="none"
      />
    </>
  );

  const lp = makePalette(colorMode, 'lpShaft')('rotor');
  const hp = makePalette(colorMode, 'hpShaft')('rotor');
  const agbC = makePalette(colorMode, 'agb');
  const fadecC = makePalette(colorMode, 'fadec');

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      className="w-full h-auto block select-none"
      role="img"
      aria-label="F124-GA-200 cutaway"
      onClick={() => onPick?.(null)}
    >
      <defs>
        <linearGradient id="flameGrad" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#fef9c3" />
          <stop offset="0.35" stopColor="#fde047" />
          <stop offset="0.7" stopColor="#f97316" />
          <stop offset="1" stopColor="#dc2626" />
        </linearGradient>
        <linearGradient id="coreFlowGrad" gradientUnits="userSpaceOnUse" x1="0" x2={VIEW_W} y1="0" y2="0">
          <stop offset="0" stopColor="#7dd3fc" />
          <stop offset="0.4" stopColor="#bef264" />
          <stop offset="0.52" stopColor="#fde047" />
          <stop offset="0.58" stopColor="#f97316" />
          <stop offset="0.66" stopColor="#ef4444" />
          <stop offset="1" stopColor="#fb923c" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#ffffff" floodOpacity="0.75" />
        </filter>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0 L0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.6" />
        </pattern>
        <style>{`
          .eng-flow { stroke-dasharray: 6 10; animation: engFlow 1.1s linear infinite; }
          .eng-flow-core { animation-duration: 0.8s; }
          @keyframes engFlow { to { stroke-dashoffset: -32; } }
          @media (prefers-reduced-motion: reduce) { .eng-flow { animation: none; } }
        `}</style>
      </defs>

      <rect x="0" y="0" width={VIEW_W} height={VIEW_H} fill="#0b1220" />
      <rect x="0" y="0" width={VIEW_W} height={VIEW_H} fill="url(#grid)" />

      <g transform={`translate(500 ${AX}) scale(${s}) translate(-500 ${-AX})`}>
        {/* centreline */}
        <line x1="10" x2="990" y1={AX} y2={AX} stroke="#94a3b8" strokeOpacity="0.35" strokeDasharray="14 4 3 4" />

        {/* lower (mirrored) half */}
        <g transform={`translate(0 ${2 * AX}) scale(1 -1)`} opacity={lowerOpacity}>
          {half('lower')}
          {showFlow && flowOpacity > 0 && <g opacity={flowOpacity}>{flowPaths}</g>}
        </g>

        {/* upper half */}
        {half('upper')}
        {showFlow && flowOpacity > 0 && <g opacity={flowOpacity} pointerEvents="none">{flowPaths}</g>}

        {/* shafts (full height, drop down when exploded) */}
        <g transform={`translate(0 ${e * 176})`}>
          <g opacity={modOpacity('hpShaft')} filter={glow('hpShaft')} {...bind('hpShaft')}>
            <rect x="256" y={AX - 19} width="356" height="38" rx="3" fill={hp.fill} {...EDGE} />
            <rect x="256" y={AX - 19} width="356" height="38" fill="transparent" />
            {[305, 598].map((x) => (
              <g key={x}>
                <circle cx={x} cy={AX - 21} r="3.5" fill="#e2e8f0" stroke="#020617" strokeWidth="0.8" />
                <circle cx={x} cy={AX + 21} r="3.5" fill="#e2e8f0" stroke="#020617" strokeWidth="0.8" />
              </g>
            ))}
            {hovered === 'hpShaft' && (
              <rect x="252" y={AX - 24} width="364" height="48" fill="none" stroke="#fff" strokeOpacity="0.4" strokeDasharray="3 3" />
            )}
          </g>
          <g opacity={modOpacity('lpShaft')} filter={glow('lpShaft')} {...bind('lpShaft')}>
            <rect x="132" y={AX - 9} width="554" height="18" rx="2" fill={lp.fill} {...EDGE} />
            <rect x="132" y={AX - 11} width="554" height="22" fill="transparent" />
            {[146, 692].map((x) => (
              <g key={x}>
                <circle cx={x} cy={AX - 11} r="3.2" fill="#e2e8f0" stroke="#020617" strokeWidth="0.8" />
                <circle cx={x} cy={AX + 11} r="3.2" fill="#e2e8f0" stroke="#020617" strokeWidth="0.8" />
              </g>
            ))}
            {hovered === 'lpShaft' && (
              <rect x="128" y={AX - 13} width="562" height="26" fill="none" stroke="#fff" strokeOpacity="0.4" strokeDasharray="3 3" />
            )}
          </g>
          <Callout x={220} y={AX} n={MODULES.lpShaft.no} active={highlight.includes('lpShaft')} />
          <Callout x={487} y={AX + 15} n={MODULES.hpShaft.no} active={highlight.includes('hpShaft')} />
        </g>

        {/* accessory gearbox + tower shaft */}
        <g
          transform={`translate(0 ${e * 58})`}
          opacity={modOpacity('agb')}
          filter={glow('agb')}
          {...bind('agb')}
        >
          <rect x="327" y={AX + 19} width="6" height="172" fill={agbC('stator').fill} fillOpacity="0.85" {...EDGE} />
          <rect x="268" y={AX + 188} width="206" height="36" rx="8" {...agbC('case')} fillOpacity="0.8" {...EDGE} />
          {[292, 330, 368, 406, 444].map((x, i) => (
            <circle
              key={x}
              cx={x}
              cy={AX + 206}
              r={i === 1 ? 12 : 9}
              fill="none"
              stroke={agbC('rotor').fill}
              strokeWidth="3"
              strokeDasharray="2.5 2"
            />
          ))}
          {accLabels.map((label, i) => (
            <g key={label}>
              <rect x={276 + i * 49} y={AX + 224} width="40" height="16" rx="2" fill={agbC('rotor').fill} fillOpacity="0.9" {...EDGE} />
              <text x={296 + i * 49} y={AX + 235} textAnchor="middle" fontSize="7.5" fontWeight="600" fill="#0b1220">
                {label}
              </text>
            </g>
          ))}
          <rect x="266" y={AX + 19} width="210" height="224" fill="transparent" />
          {hovered === 'agb' && (
            <rect x="264" y={AX + 184} width="214" height="60" fill="none" stroke="#fff" strokeOpacity="0.4" strokeDasharray="3 3" />
          )}
          <Callout x={482} y={AX + 200} n={MODULES.agb.no} active={highlight.includes('agb')} />
        </g>

        {/* FADEC */}
        <g
          transform={`translate(0 ${e * 58})`}
          opacity={modOpacity('fadec')}
          filter={glow('fadec')}
          {...bind('fadec')}
        >
          <g opacity={Math.max(0, 1 - e * 3)}>
          <path
            d={`M600,${AX + 190} L600,${AX + 150} L508,${AX + 110} L508,${AX + 92}`}
            fill="none"
            stroke={fadecC('rotor').fill}
            strokeWidth="1.3"
            strokeDasharray="4 3"
          />
          <path
            d={`M640,${AX + 190} L640,${AX + 158} L700,${AX + 140}`}
            fill="none"
            stroke={fadecC('rotor').fill}
            strokeWidth="1.3"
            strokeDasharray="4 3"
          />
          </g>
          <rect x="560" y={AX + 190} width="110" height="34" rx="4" fill={fadecC('rotor').fill} fillOpacity="0.9" {...EDGE} />
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <rect key={i} x={568 + i * 14} y={AX + 196} width="8" height="22" rx="1" fill="#0b1220" fillOpacity="0.35" />
          ))}
          <text x="615" y={AX + 236} textAnchor="middle" fontSize="8" fontWeight="700" fill={fadecC('rotor').fill}>
            FADEC
          </text>
          <rect x="556" y={AX + 90} width="150" height="150" fill="transparent" />
          {hovered === 'fadec' && (
            <rect x="556" y={AX + 186} width="118" height="54" fill="none" stroke="#fff" strokeOpacity="0.4" strokeDasharray="3 3" />
          )}
          <Callout x={680} y={AX + 207} n={MODULES.fadec.no} active={highlight.includes('fadec')} />
        </g>

        {/* callouts for the core modules (move with their module) */}
        {Object.entries(CALLOUT).map(([id, [x, r]]) => {
          const dx = id === 'bypass' ? 0 : e * (EXPLODE_IDX[id] - 3.5) * 34;
          const dy = id === 'bypass' ? -34 * e : 0;
          return <Callout key={id} x={x + dx} y={Y(r) + dy} n={MODULES[id].no} active={highlight.includes(id)} />;
        })}

        {/* module names under each exploded module */}
        {e > 0.3 && (
          <g pointerEvents="none" opacity={Math.min(1, (e - 0.3) / 0.4)}>
            {Object.keys(EXPLODE_IDX).map((id) => {
              const [x0, x1] = HIT[id];
              const cx = (x0 + Math.min(x1, 860)) / 2 + e * (EXPLODE_IDX[id] - 3.5) * 34;
              return (
                <text key={id} x={cx} y={AX + 16} textAnchor="middle" fontSize="11" fontWeight="600" fill="#e2e8f0">
                  {shortNames[id]}
                </text>
              );
            })}
            <text x={400} y={Y(186) - 34 * e} textAnchor="middle" fontSize="11" fontWeight="600" fill="#e2e8f0">
              {shortNames.bypass}
            </text>
          </g>
        )}

        {/* station numbers (assembled view only) */}
        {showStations && e < 0.05 && (
          <g pointerEvents="none">
            {STATIONS.map(({ s: st, x }) => (
              <g key={st}>
                <line x1={x} x2={x} y1={Y(186)} y2={Y(-176)} stroke="#e2e8f0" strokeOpacity="0.45" strokeDasharray="2 4" />
                <rect x={x - 13} y={Y(200)} width="26" height="14" rx="7" fill="#e2e8f0" />
                <text x={x} y={Y(190)} textAnchor="middle" fontSize="9" fontWeight="700" fill="#0b1220">
                  {st}
                </text>
              </g>
            ))}
          </g>
        )}
      </g>
    </svg>
  );
}

export default memo(EngineDiagram);
