import { memo } from 'react';
import { PARTS, MATERIALS } from './airframe-data.js';

// Simplified planform (top) and profile (side) drawings of the M-346.
// Coordinates are in METRES and converted to SVG units per view, so the
// outline follows the published dimensions (11.49 m long, 9.72 m span,
// 4.76 m high). Internal structure and tank layout are illustrative.

export const VIEW_W = 1000;
export const VIEW_H = 600;

// ---------------------------------------------------------------- colours --
export const PART_COLORS = {
  radome: '#cbd5e1',
  fwdFuselage: '#94a3b8',
  cockpit: '#7dd3fc',
  seats: '#fb7185',
  ctrFuselage: '#64748b',
  intakes: '#a78bfa',
  lerx: '#2dd4bf',
  wing: '#38bdf8',
  leFlaps: '#fbbf24',
  teFlaps: '#f59e0b',
  ailerons: '#f97316',
  hardpoints: '#a3e635',
  rearFuselage: '#7c8aa5',
  airbrake: '#ef4444',
  fin: '#818cf8',
  rudder: '#f472b6',
  stabilator: '#c084fc',
  noseGear: '#facc15',
  mainGear: '#eab308',
  probe: '#34d399',
};
export const MOVE_COLORS = { movable: '#fb923c', fixed: '#475569' };
const STRUCT = { spar: '#fbbf24', rib: '#38bdf8', frame: '#a78bfa', longeron: '#34d399', fuel: '#0ea5e9' };

function fillFor(mode, id) {
  if (mode === 'movable') return PARTS[id].movable ? MOVE_COLORS.movable : MOVE_COLORS.fixed;
  if (mode === 'material') return MATERIALS[PARTS[id].material].color;
  return PART_COLORS[id];
}

const EDGE = { stroke: '#020617', strokeWidth: 0.9, strokeOpacity: 0.6, strokeLinejoin: 'round' };

// ------------------------------------------------------------- top view --
const T = { S: 50, OX: 210, OY: 300 };
const tx = (x) => T.OX + x * T.S;
const ty = (y) => T.OY - y * T.S;
// polygon in plan view; s = +1 right wing (top of screen), -1 left
const tp = (pts, s = 1) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${tx(x)},${ty(s * y)}`).join(' ') + 'Z';
const tpm = (pts) => tp([...pts, ...pts.slice().reverse().map(([x, y]) => [x, -y])]);

const LE = (y) => (y <= 1.15 ? 6.3 : 6.3 + (y - 1.15) * 0.601);
const TE = (y) => 9.1 + ((y - 0.62) * 0.35) / 4.24;
const FLAP = 0.62;

// Parts drawn once per wing side (s = +1 / -1)
const SYM_TOP = new Set(['wing', 'leFlaps', 'teFlaps', 'ailerons', 'lerx', 'intakes', 'stabilator', 'hardpoints']);

const TOP = {
  radome: (f) => <path d={tpm([[0, 0], [0.35, 0.17], [0.8, 0.29], [1.4, 0.38]])} fill={f} {...EDGE} />,
  fwdFuselage: (f) => <path d={tpm([[1.4, 0.38], [2.2, 0.47], [3.2, 0.53], [4.0, 0.58]])} fill={f} {...EDGE} />,
  ctrFuselage: (f) => <path d={tpm([[4.0, 0.58], [8.0, 0.62]])} fill={f} {...EDGE} />,
  rearFuselage: (f) => (
    <>
      <path d={tpm([[8.0, 0.62], [10.3, 0.6], [10.95, 0.52]])} fill={f} {...EDGE} />
      {[0.28, -0.28].map((y) => (
        <rect key={y} x={tx(10.95)} y={ty(y) - 9} width={0.22 * T.S} height={18} rx="3" fill="#1e293b" {...EDGE} />
      ))}
    </>
  ),
  cockpit: (f) => (
    <path
      d={tpm([[1.95, 0], [2.3, 0.24], [3.0, 0.33], [4.2, 0.33], [4.9, 0.23], [5.2, 0]])}
      fill={f}
      fillOpacity="0.55"
      {...EDGE}
    />
  ),
  seats: (f) => (
    <>
      {[2.6, 3.85].map((x) => (
        <rect key={x} x={tx(x)} y={ty(0.19)} width={0.5 * T.S} height={0.38 * T.S} rx="4" fill={f} {...EDGE} />
      ))}
    </>
  ),
  airbrake: (f) => (
    <rect x={tx(5.6)} y={ty(0.32)} width={1.3 * T.S} height={0.64 * T.S} rx="3" fill={f} {...EDGE} />
  ),
  fin: (f) => <path d={tp([[8.0, 0.07], [11.3, 0.07], [11.3, -0.07], [8.0, -0.07]])} fill={f} {...EDGE} />,
  probe: (f) => (
    <>
      <path d={tp([[0.2, 0.42], [2.3, 0.45], [2.3, 0.51], [0.2, 0.46]])} fill={f} {...EDGE} />
      <rect x={tx(0.1)} y={ty(0.56)} width={0.7 * T.S} height={0.24 * T.S} fill="transparent" />
    </>
  ),
  // symmetric parts: (fill, s)
  wing: (f, s) => (
    <path
      d={tp(
        [
          [6.3, 0.62], [6.3, 1.15], [6.6, 1.15], [8.83, 4.86], [9.45, 4.86],
          [TE(4.6), 4.6], [TE(4.6) - FLAP, 4.6], [TE(3.3) - FLAP, 3.3], [TE(3.3), 3.3],
          [TE(3.2), 3.2], [TE(3.2) - FLAP, 3.2], [TE(1.2) - FLAP, 1.2], [TE(1.2), 1.2], [9.1, 0.62],
        ],
        s
      )}
      fill={f}
      {...EDGE}
    />
  ),
  leFlaps: (f, s) => <path d={tp([[6.3, 1.15], [8.53, 4.86], [8.83, 4.86], [6.6, 1.15]], s)} fill={f} {...EDGE} />,
  teFlaps: (f, s) => (
    <path d={tp([[TE(1.2) - FLAP, 1.2], [TE(3.2) - FLAP, 3.2], [TE(3.2), 3.2], [TE(1.2), 1.2]], s)} fill={f} {...EDGE} />
  ),
  ailerons: (f, s) => (
    <path d={tp([[TE(3.3) - FLAP, 3.3], [TE(4.6) - FLAP, 4.6], [TE(4.6), 4.6], [TE(3.3), 3.3]], s)} fill={f} {...EDGE} />
  ),
  lerx: (f, s) => <path d={tp([[3.9, 0.58], [6.3, 1.15], [6.8, 0.62]], s)} fill={f} {...EDGE} />,
  intakes: (f, s) => (
    <path d={tp([[4.0, 0.58], [4.0, 1.0], [4.35, 1.06], [6.4, 1.0], [6.8, 0.62]], s)} fill={f} {...EDGE} />
  ),
  stabilator: (f, s) => (
    <>
      <path d={tp([[10.0, 0.62], [10.95, 2.3], [11.49, 2.3], [11.35, 0.62]], s)} fill={f} {...EDGE} />
      <circle cx={tx(10.95)} cy={ty(s * 0.8)} r="3" fill="#0b1220" />
    </>
  ),
  hardpoints: (f, s, { e = 0 } = {}) => (
    <>
      {/* wingtip rail */}
      <path d={tp([[8.2, 4.86], [9.7, 4.86], [9.7, 4.96], [8.2, 4.96]], s)} fill={f} {...EDGE} />
      {/* under-wing pylons (hidden below the wing, dashed) */}
      {[1.9, 2.8, 3.7].map((y) => (
        <path
          key={y}
          d={tp([[LE(y) + 0.25, y - 0.07], [LE(y) + 1.15, y - 0.07], [LE(y) + 1.15, y + 0.07], [LE(y) + 0.25, y + 0.07]], s)}
          fill={f}
          fillOpacity="0.35"
          stroke={f}
          strokeDasharray="3 2"
        />
      ))}
      {/* centreline pylon: undo the outward explode so it stays under the fuselage */}
      {s === 1 && (
        <path
          transform={`translate(0 ${TOP_EXPLODE.hardpoints.dyOut * e})`}
          d={tp([[6.1, 0.07], [7.3, 0.07], [7.3, -0.07], [6.1, -0.07]])}
          fill={f}
          fillOpacity="0.35"
          stroke={f}
          strokeDasharray="3 2"
        />
      )}
    </>
  ),
};

// internal structure overlay (top view), drawn inside the part's group
const TOP_STRUCT = {
  wing: (s) => {
    const spar = (k) => {
      const y0 = 0.62;
      const y1 = 4.8;
      const at = (y) => LE(y) + k * (TE(y) - LE(y));
      return `M${tx(at(y0))},${ty(s * y0)} L${tx(at(y1))},${ty(s * y1)}`;
    };
    const ribs = [1.0, 1.6, 2.2, 2.8, 3.4, 4.0, 4.6];
    return (
      <>
        <path
          d={tp([[LE(1.2) + 0.45, 1.2], [LE(3.3) + 0.45, 3.3], [TE(3.3) - 0.9, 3.3], [TE(1.2) - 0.9, 1.2]], s)}
          fill={STRUCT.fuel}
          fillOpacity="0.28"
        />
        {ribs.map((y) => (
          <line key={y} x1={tx(LE(y) + 0.05)} x2={tx(TE(y) - 0.05)} y1={ty(s * y)} y2={ty(s * y)} stroke={STRUCT.rib} strokeWidth="1.3" />
        ))}
        <path d={spar(0.22)} stroke={STRUCT.spar} strokeWidth="2.6" />
        <path d={spar(0.62)} stroke={STRUCT.spar} strokeWidth="2.6" />
      </>
    );
  },
  stabilator: (s) => (
    <line x1={tx(10.95)} y1={ty(s * 0.62)} x2={tx(11.25)} y2={ty(s * 2.25)} stroke={STRUCT.spar} strokeWidth="2" />
  ),
};
const fuselageStructTop = (x0, x1) => (
  <>
    {Array.from({ length: Math.floor((x1 - x0) / 0.6) }, (_, i) => x0 + 0.3 + i * 0.6).map((x) => (
      <line key={x} x1={tx(x)} x2={tx(x)} y1={ty(0.5)} y2={ty(-0.5)} stroke={STRUCT.frame} strokeWidth="1.2" />
    ))}
    {[0.42, -0.42].map((y) => (
      <line key={y} x1={tx(x0 + 0.05)} x2={tx(x1 - 0.05)} y1={ty(y)} y2={ty(y)} stroke={STRUCT.longeron} strokeWidth="1.6" />
    ))}
  </>
);
TOP_STRUCT.fwdFuselage = () => fuselageStructTop(1.6, 4.0);
TOP_STRUCT.ctrFuselage = () => (
  <>
    <rect x={tx(4.6)} y={ty(0.45)} width={3.3 * T.S} height={0.9 * T.S} fill={STRUCT.fuel} fillOpacity="0.28" />
    {fuselageStructTop(4.0, 8.0)}
    {/* wing attach frames, heavier */}
    {[6.75, 8.4].map((x) => (
      <line key={x} x1={tx(x - 0.3)} x2={tx(x - 0.3)} y1={ty(0.6)} y2={ty(-0.6)} stroke={STRUCT.frame} strokeWidth="3" />
    ))}
  </>
);
TOP_STRUCT.rearFuselage = () => fuselageStructTop(8.0, 10.9);

// Explode offsets in SVG units at explode = 1. dyOut is applied outward for
// symmetric parts (up for the right wing, down for the left).
const TOP_EXPLODE = {
  radome: { dx: -62 },
  probe: { dx: -62, dy: -26 },
  fwdFuselage: { dx: -32 },
  cockpit: { dx: -32 },
  seats: { dx: -32 },
  ctrFuselage: {},
  airbrake: { dx: 0 },
  intakes: { dyOut: 16 },
  lerx: { dx: -8, dyOut: 8 },
  wing: { dyOut: 38 },
  leFlaps: { dx: -16, dyOut: 44 },
  teFlaps: { dx: 18, dyOut: 44 },
  ailerons: { dx: 18, dyOut: 48 },
  hardpoints: { dyOut: 38 },
  rearFuselage: { dx: 34 },
  fin: { dx: 62 },
  stabilator: { dx: 62, dyOut: 22 },
};

const TOP_ORDER = [
  'hardpoints', 'wing', 'leFlaps', 'teFlaps', 'ailerons', 'intakes', 'lerx', 'stabilator',
  'radome', 'fwdFuselage', 'ctrFuselage', 'rearFuselage', 'airbrake', 'seats', 'cockpit', 'fin', 'probe',
];

// numbered callouts [x, y] in metres (plan view)
const TOP_CALLOUT = {
  radome: [0.7, 0],
  fwdFuselage: [1.75, 0],
  cockpit: [3.4, -0.62],
  seats: [3.25, 0],
  ctrFuselage: [7.4, 0],
  intakes: [4.55, -0.86],
  lerx: [5.4, 0.8],
  wing: [7.7, 2.3],
  leFlaps: [7.35, 3.5],
  teFlaps: [9.0, 1.9],
  ailerons: [9.25, 4.1],
  hardpoints: [10.0, 4.75],
  rearFuselage: [9.3, 0.3],
  airbrake: [6.25, 0],
  fin: [10.2, 0],
  stabilator: [11.05, 1.6],
  probe: [0.8, 0.72],
};

// ------------------------------------------------------------ side view --
const SD = { S: 62, OX: 130, GY: 500 };
const sx = (x) => SD.OX + x * SD.S;
const sz = (z) => SD.GY - z * SD.S;
const sp = (pts) => pts.map(([x, z], i) => `${i ? 'L' : 'M'}${sx(x)},${sz(z)}`).join(' ') + 'Z';

const SIDE = {
  probe: (f) => (
    <>
      <path d={sp([[0.25, 2.1], [2.3, 2.34], [2.3, 2.41], [0.25, 2.17]])} fill={f} fillOpacity="0.6" {...EDGE} strokeDasharray="3 2" />
      <rect x={sx(0.1)} y={sz(2.6)} width={2.3 * SD.S} height={0.5 * SD.S} fill="transparent" />
    </>
  ),
  fin: (f) => <path d={sp([[7.9, 2.6], [10.3, 4.76], [10.8, 4.76], [10.72, 2.5]])} fill={f} {...EDGE} />,
  rudder: (f) => <path d={sp([[10.78, 4.62], [11.28, 4.58], [11.4, 2.42], [10.72, 2.45]])} fill={f} {...EDGE} />,
  radome: (f) => (
    <path d={sp([[0, 1.75], [0.5, 1.98], [1.0, 2.13], [1.4, 2.2], [1.4, 1.3], [1.0, 1.37], [0.5, 1.55]])} fill={f} {...EDGE} />
  ),
  fwdFuselage: (f) => (
    <>
      <path d={sp([[1.4, 2.2], [1.9, 2.3], [4.2, 2.45], [4.2, 1.05], [3.0, 1.12], [1.4, 1.3]])} fill={f} {...EDGE} />
      {/* nose gear bay door line */}
      <path d={sp([[2.2, 1.2], [3.1, 1.12], [3.1, 1.16], [2.2, 1.24]])} fill="#0b1220" fillOpacity="0.5" />
    </>
  ),
  ctrFuselage: (f) => (
    <path d={sp([[4.2, 2.45], [5.3, 2.6], [8.0, 2.64], [8.0, 1.05], [4.2, 1.05]])} fill={f} {...EDGE} />
  ),
  rearFuselage: (f) => (
    <>
      <path d={sp([[8.0, 2.64], [10.9, 2.36], [11.0, 2.2], [11.0, 1.45], [10.9, 1.4], [8.0, 1.05]])} fill={f} {...EDGE} />
      <path d={sp([[10.98, 2.15], [11.22, 2.1], [11.22, 1.55], [10.98, 1.5]])} fill="#1e293b" {...EDGE} />
    </>
  ),
  intakes: (f) => (
    <>
      <path d={sp([[4.0, 1.24], [4.0, 1.96], [4.35, 1.99], [6.7, 1.84], [6.7, 1.34], [4.35, 1.2]])} fill={f} {...EDGE} />
      <ellipse cx={sx(4.04)} cy={sz(1.6)} rx="4" ry={0.34 * SD.S} fill="#0b1220" />
    </>
  ),
  lerx: (f) => (
    <>
      <path d={sp([[3.9, 2.03], [6.4, 1.99], [6.4, 1.91], [4.0, 1.97]])} fill={f} {...EDGE} />
      <rect x={sx(3.9)} y={sz(2.2)} width={2.5 * SD.S} height={0.4 * SD.S} fill="transparent" />
    </>
  ),
  airbrake: (f, { e }) => {
    const hx = sx(5.7);
    const hz = sz(2.63);
    return (
      <g transform={`rotate(${-e * 38} ${hx} ${hz})`}>
        <path d={sp([[5.7, 2.6], [6.95, 2.63], [6.95, 2.72], [5.7, 2.68]])} fill={f} {...EDGE} />
        <rect x={hx - 2} y={hz - 14} width={1.3 * SD.S} height={20} fill="transparent" />
      </g>
    );
  },
  stabilator: (f) => (
    <>
      <path d={sp([[10.05, 2.0], [11.49, 1.96], [11.49, 1.9], [10.05, 1.93]])} fill={f} {...EDGE} />
      <circle cx={sx(10.95)} cy={sz(1.95)} r="3" fill="#0b1220" />
      <rect x={sx(10.0)} y={sz(2.15)} width={1.55 * SD.S} height={0.4 * SD.S} fill="transparent" />
    </>
  ),
  wing: (f) => (
    <>
      <path d={sp([[6.3, 1.7], [8.5, 1.72], [9.45, 1.68], [9.45, 1.6], [6.3, 1.62]])} fill={f} {...EDGE} />
      <rect x={sx(6.3)} y={sz(1.85)} width={3.2 * SD.S} height={0.4 * SD.S} fill="transparent" />
    </>
  ),
  hardpoints: (f) => (
    <>
      {[7.0, 7.6, 8.2].map((x) => (
        <path key={x} d={sp([[x, 1.62], [x + 0.55, 1.62], [x + 0.5, 1.42], [x + 0.05, 1.42]])} fill={f} {...EDGE} />
      ))}
      <path d={sp([[6.1, 1.05], [7.3, 1.05], [7.25, 0.88], [6.15, 0.88]])} fill={f} {...EDGE} />
    </>
  ),
  seats: (f) => (
    <>
      {[
        [2.85, 2.08],
        [4.1, 2.3],
      ].map(([x, z]) => (
        <path
          key={x}
          d={sp([[x, z], [x + 0.55, z], [x + 0.55, z + 0.12], [x + 0.18, z + 0.12], [x + 0.04, z + 0.62], [x - 0.1, z + 0.62]])}
          fill={f}
          {...EDGE}
        />
      ))}
    </>
  ),
  cockpit: (f) => (
    <>
      <path
        d={sp([[1.9, 2.3], [2.6, 2.72], [3.3, 2.84], [3.8, 2.96], [4.5, 3.02], [5.1, 2.8], [5.35, 2.6]])}
        fill={f}
        fillOpacity="0.45"
        {...EDGE}
      />
      <line x1={sx(3.55)} y1={sz(2.9)} x2={sx(3.55)} y2={sz(2.38)} stroke="#0b1220" strokeWidth="2" />
    </>
  ),
  noseGear: (f) => (
    <>
      <rect x={sx(2.56)} y={sz(1.2)} width={0.12 * SD.S} height={0.9 * SD.S} fill={f} {...EDGE} />
      <path d={sp([[2.45, 0.72], [2.62, 0.95], [2.66, 0.9], [2.52, 0.66]])} fill={f} {...EDGE} />
      <circle cx={sx(2.62)} cy={sz(0.28)} r={0.28 * SD.S} fill="#1e293b" stroke={f} strokeWidth="3" />
      <circle cx={sx(2.62)} cy={sz(0.28)} r="3" fill={f} />
    </>
  ),
  mainGear: (f) => (
    <>
      <circle cx={sx(7.42)} cy={sz(0.34)} r={0.34 * SD.S} fill="#0f172a" stroke={f} strokeOpacity="0.5" strokeWidth="3" />
      <rect x={sx(7.18)} y={sz(1.1)} width={0.14 * SD.S} height={0.78 * SD.S} fill={f} {...EDGE} />
      <path d={sp([[7.25, 1.05], [7.95, 1.1], [7.95, 1.02], [7.3, 0.95]])} fill={f} {...EDGE} />
      <circle cx={sx(7.25)} cy={sz(0.34)} r={0.34 * SD.S} fill="#1e293b" stroke={f} strokeWidth="3" />
      <circle cx={sx(7.25)} cy={sz(0.34)} r="3" fill={f} />
    </>
  ),
};

const sideFrames = (x0, x1, zTop, zBot) =>
  Array.from({ length: Math.floor((x1 - x0) / 0.6) }, (_, i) => x0 + 0.3 + i * 0.6).map((x) => (
    <line key={x} x1={sx(x)} x2={sx(x)} y1={sz(zTop(x))} y2={sz(zBot(x))} stroke={STRUCT.frame} strokeWidth="1.2" />
  ));
const lerp = (x, a, b, za, zb) => za + ((x - a) * (zb - za)) / (b - a);

const SIDE_STRUCT = {
  fwdFuselage: () => (
    <>
      {sideFrames(1.5, 4.2, (x) => lerp(x, 1.4, 4.2, 2.2, 2.43) - 0.05, (x) => lerp(x, 1.4, 4.2, 1.3, 1.05) + 0.05)}
      {[1.35, 2.1].map((z) => (
        <line key={z} x1={sx(1.5)} x2={sx(4.15)} y1={sz(z)} y2={sz(z)} stroke={STRUCT.longeron} strokeWidth="1.6" />
      ))}
    </>
  ),
  ctrFuselage: () => (
    <>
      <rect x={sx(4.6)} y={sz(2.35)} width={3.3 * SD.S} height={1.1 * SD.S} fill={STRUCT.fuel} fillOpacity="0.28" />
      {sideFrames(4.2, 8.0, () => 2.55, () => 1.1)}
      {[6.45, 8.1].map((x) => (
        <line key={x} x1={sx(x)} x2={sx(x)} y1={sz(2.58)} y2={sz(1.08)} stroke={STRUCT.frame} strokeWidth="3" />
      ))}
      {[1.35, 2.3].map((z) => (
        <line key={z} x1={sx(4.25)} x2={sx(7.95)} y1={sz(z)} y2={sz(z)} stroke={STRUCT.longeron} strokeWidth="1.6" />
      ))}
    </>
  ),
  rearFuselage: () => (
    <>
      {sideFrames(8.0, 10.9, (x) => lerp(x, 8, 10.9, 2.6, 2.33), (x) => lerp(x, 8, 10.9, 1.08, 1.43))}
      {[1.5, 2.2].map((z) => (
        <line key={z} x1={sx(8.05)} x2={sx(10.85)} y1={sz(z)} y2={sz(z)} stroke={STRUCT.longeron} strokeWidth="1.6" />
      ))}
    </>
  ),
  fin: () => (
    <>
      <line x1={sx(8.5)} y1={sz(2.62)} x2={sx(10.45)} y2={sz(4.7)} stroke={STRUCT.spar} strokeWidth="2.4" />
      <line x1={sx(10.6)} y1={sz(2.62)} x2={sx(10.75)} y2={sz(4.7)} stroke={STRUCT.spar} strokeWidth="2.4" />
      {[3.1, 3.6, 4.1].map((z) => (
        <line key={z} x1={sx(lerp(z, 2.6, 4.76, 7.95, 10.3))} x2={sx(10.72)} y1={sz(z)} y2={sz(z)} stroke={STRUCT.rib} strokeWidth="1.3" />
      ))}
    </>
  ),
};

const SIDE_EXPLODE = {
  radome: { dx: -62 },
  probe: { dx: -62, dy: -30 },
  fwdFuselage: { dx: -32 },
  cockpit: { dx: -32, dy: -52 },
  seats: { dx: -32, dy: -24 },
  noseGear: { dx: -32, dy: 40 },
  ctrFuselage: {},
  intakes: { dx: -10, dy: 28 },
  lerx: { dy: -18 },
  airbrake: { dy: -22 },
  wing: { dy: 48 },
  hardpoints: { dy: 70 },
  mainGear: { dy: 40 },
  rearFuselage: { dx: 34 },
  fin: { dx: 50, dy: -34 },
  rudder: { dx: 74, dy: -34 },
  stabilator: { dx: 64, dy: 12 },
};

const SIDE_ORDER = [
  'probe', 'fin', 'rudder', 'radome', 'fwdFuselage', 'ctrFuselage', 'rearFuselage', 'intakes', 'lerx',
  'airbrake', 'stabilator', 'wing', 'hardpoints', 'seats', 'cockpit', 'noseGear', 'mainGear',
];

const SIDE_CALLOUT = {
  radome: [0.75, 1.75],
  fwdFuselage: [2.0, 1.75],
  cockpit: [4.6, 3.3],
  seats: [3.05, 2.6],
  ctrFuselage: [7.2, 2.2],
  intakes: [5.3, 1.55],
  lerx: [5.9, 2.25],
  wing: [8.8, 1.9],
  hardpoints: [7.3, 1.15],
  rearFuselage: [9.5, 1.85],
  airbrake: [6.4, 3.0],
  fin: [9.4, 3.6],
  rudder: [11.55, 3.7],
  stabilator: [11.7, 2.05],
  noseGear: [2.2, 0.55],
  mainGear: [7.9, 0.55],
  probe: [0.9, 2.6],
};

// ---------------------------------------------------------------------------
function Callout({ x, y, n, active }) {
  return (
    <g pointerEvents="none">
      <circle cx={x} cy={y} r="9" fill={active ? '#ffffff' : '#0b1220'} stroke="#e2e8f0" strokeWidth="1.2" />
      <text x={x} y={y + 3.3} textAnchor="middle" fontSize="9.5" fontWeight="700" fill={active ? '#0b1220' : '#e2e8f0'}>
        {n}
      </text>
    </g>
  );
}

function AirframeDiagram({
  view = 'top',
  explode = 0,
  colorMode = 'module',
  showStructure = false,
  showCallouts = true,
  highlight = [],
  hovered = null,
  onHover,
  onPick,
  dimLabels,
}) {
  const e = explode;
  const hasHi = highlight.length > 0;
  const partOpacity = (id) => (!hasHi || highlight.includes(id) ? 1 : 0.14);
  const glow = (id) => (hasHi && highlight.includes(id) ? 'url(#afGlow)' : hovered === id ? 'url(#afHover)' : undefined);
  const skinOpacity = showStructure ? 0.3 : 1;

  const bind = (id) => ({
    onClick: (ev) => {
      ev.stopPropagation();
      onPick?.(id);
    },
    onMouseEnter: () => onHover?.(id),
    onMouseLeave: () => onHover?.(null),
    style: { cursor: 'pointer' },
  });

  const isTop = view === 'top';
  const order = isTop ? TOP_ORDER : SIDE_ORDER;

  const renderTop = (id) => {
    const ex = TOP_EXPLODE[id] || {};
    const f = fillFor(colorMode, id);
    const struct = showStructure && TOP_STRUCT[id];
    if (SYM_TOP.has(id)) {
      return [1, -1].map((s) => (
        <g
          key={`${id}${s}`}
          transform={`translate(${(ex.dx || 0) * e} ${-(ex.dyOut || 0) * e * s})`}
          opacity={partOpacity(id)}
          filter={glow(id)}
          {...bind(id)}
        >
          <g fillOpacity={skinOpacity}>{TOP[id](f, s, { e })}</g>
          {struct && <g pointerEvents="none">{TOP_STRUCT[id](s)}</g>}
        </g>
      ));
    }
    return (
      <g
        key={id}
        transform={`translate(${(ex.dx || 0) * e} ${(ex.dy || 0) * e})`}
        opacity={partOpacity(id)}
        filter={glow(id)}
        {...bind(id)}
      >
        <g fillOpacity={id === 'cockpit' ? undefined : skinOpacity}>{TOP[id](f)}</g>
        {struct && <g pointerEvents="none">{TOP_STRUCT[id]()}</g>}
      </g>
    );
  };

  const renderSide = (id) => {
    const ex = SIDE_EXPLODE[id] || {};
    const f = fillFor(colorMode, id);
    const struct = showStructure && SIDE_STRUCT[id];
    return (
      <g
        key={id}
        transform={`translate(${(ex.dx || 0) * e} ${(ex.dy || 0) * e})`}
        opacity={partOpacity(id)}
        filter={glow(id)}
        {...bind(id)}
      >
        <g fillOpacity={id === 'cockpit' ? undefined : skinOpacity}>{SIDE[id](f, { e })}</g>
        {struct && <g pointerEvents="none">{SIDE_STRUCT[id]()}</g>}
      </g>
    );
  };

  const callouts = () =>
    Object.entries(isTop ? TOP_CALLOUT : SIDE_CALLOUT).map(([id, [a, b]]) => {
      if (isTop) {
        const ex = TOP_EXPLODE[id] || {};
        const s = b >= 0 ? 1 : -1;
        const dy = SYM_TOP.has(id) ? -(ex.dyOut || 0) * e * s : (ex.dy || 0) * e;
        return (
          <Callout key={id} x={tx(a) + (ex.dx || 0) * e} y={ty(b) + dy} n={PARTS[id].no} active={highlight.includes(id)} />
        );
      }
      const ex = SIDE_EXPLODE[id] || {};
      return (
        <Callout key={id} x={sx(a) + (ex.dx || 0) * e} y={sz(b) + (ex.dy || 0) * e} n={PARTS[id].no} active={highlight.includes(id)} />
      );
    });

  // dimension lines (assembled only)
  const dims = () => {
    if (e > 0.05) return null;
    const dim = { stroke: '#94a3b8', strokeWidth: 1, markerStart: 'url(#afArrow)', markerEnd: 'url(#afArrow)' };
    const lbl = { fontSize: 11, fill: '#cbd5e1', textAnchor: 'middle', fontFamily: 'ui-monospace, monospace' };
    if (isTop) {
      return (
        <g pointerEvents="none">
          <line x1={tx(0)} x2={tx(11.49)} y1={ty(-5.45)} y2={ty(-5.45)} {...dim} />
          <text x={tx(5.75)} y={ty(-5.45) + 16} {...lbl}>{dimLabels.length} 11.49 m</text>
          <line x1={tx(12.05)} x2={tx(12.05)} y1={ty(4.96)} y2={ty(-4.96)} {...dim} />
          <text x={tx(12.05) + 10} y={ty(0)} {...lbl} textAnchor="start">{dimLabels.span}</text>
          <text x={tx(12.05) + 10} y={ty(0) + 14} {...lbl} textAnchor="start">9.72 m</text>
        </g>
      );
    }
    return (
      <g pointerEvents="none">
        <line x1={sx(0)} x2={sx(11.49)} y1={sz(-0.45)} y2={sz(-0.45)} {...dim} />
        <text x={sx(5.75)} y={sz(-0.45) + 16} {...lbl}>{dimLabels.length} 11.49 m</text>
        <line x1={sx(12.25)} x2={sx(12.25)} y1={sz(0)} y2={sz(4.76)} {...dim} />
        <text x={sx(12.25) + 10} y={sz(2.4)} {...lbl} textAnchor="start">{dimLabels.height}</text>
        <text x={sx(12.25) + 10} y={sz(2.4) + 14} {...lbl} textAnchor="start">4.76 m</text>
      </g>
    );
  };

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      className="w-full h-auto block select-none"
      role="img"
      aria-label={isTop ? 'M-346 plan view' : 'M-346 side view'}
      onClick={() => onPick?.(null)}
    >
      <defs>
        <filter id="afGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#ffffff" floodOpacity="0.8" />
        </filter>
        <filter id="afHover" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="1.6" floodColor="#e2e8f0" floodOpacity="0.55" />
        </filter>
        <marker id="afArrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="#94a3b8" />
        </marker>
        <pattern id="afGrid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0 L0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.6" />
        </pattern>
      </defs>
      <rect x="0" y="0" width={VIEW_W} height={VIEW_H} fill="#0b1220" />
      <rect x="0" y="0" width={VIEW_W} height={VIEW_H} fill="url(#afGrid)" />

      {isTop ? (
        <line x1="20" x2="980" y1={T.OY} y2={T.OY} stroke="#94a3b8" strokeOpacity="0.3" strokeDasharray="14 4 3 4" />
      ) : (
        <line x1="20" x2="980" y1={SD.GY} y2={SD.GY} stroke="#64748b" strokeOpacity={1 - e * 0.7} strokeWidth="1.5" />
      )}

      {order.map((id) => (isTop ? renderTop(id) : renderSide(id)))}
      {showCallouts && callouts()}
      {dims()}

      {isTop && (
        <g pointerEvents="none" fontSize="10" fill="#64748b" fontWeight="600">
          <text x="16" y="22">▲ {dimLabels.right}</text>
          <text x="16" y={VIEW_H - 12}>▼ {dimLabels.left}</text>
        </g>
      )}
    </svg>
  );
}

export default memo(AirframeDiagram);
