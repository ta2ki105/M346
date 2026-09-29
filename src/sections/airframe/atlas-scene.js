// Three.js scene for the airframe & systems viewer. Framework-free: the panel
// creates it once with createAtlas(container, opts) and drives it through the
// returned API. All text lives in airframe-data.js; the scene only knows part
// ids ("wing-R", "fcc", ...) and system ids.
//
// Axes: +x forward, +y up, +z to the right (starboard). Units are metres,
// fuselage centreline at y = 0, ground at y = -1.76. Shapes, positions and
// routings are simplified; parts registered with { approx: true } are
// positioned by estimate.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { SYSTEMS, SYSTEM_ORDER } from './airframe-data.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const lerp = (a, b, t) => a + (b - a) * t;
const D2R = Math.PI / 180;

const THEME = { bg: '#0f172a', gridMain: '#334155', grid: '#1e293b', edge: '#94a3b8' };

export const VIEWS = { iso: [10.5, 6.2, 11], front: [15, 1.2, 0], side: [0, 1, 17], top: [0.01, 19, 0], bottom: [0.01, -17, 0], rear: [-13, 4.5, -6] };

// ---------------------------------------------------------------- geometry helpers
function superLoft(st, { seg = 44, exp = 2.5, caps = [true, true] } = {}) {
  const pos = [], idx = [], n = seg;
  st.forEach(([x, hw, hh, yc, zc = 0]) => {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
      pos.push(x, yc + hh * Math.sign(c) * Math.pow(Math.abs(c), 2 / exp), zc + hw * Math.sign(s) * Math.pow(Math.abs(s), 2 / exp));
    }
  });
  for (let j = 0; j < st.length - 1; j++)
    for (let i = 0; i < n; i++) {
      const a = j * n + i, b = j * n + ((i + 1) % n), c = (j + 1) * n + i, d = (j + 1) * n + ((i + 1) % n);
      idx.push(a, c, b, b, c, d);
    }
  [0, st.length - 1].forEach((j, k) => {
    if (!caps[k]) return;
    const [x, , , yc, zc = 0] = st[j];
    const ci = pos.length / 3;
    pos.push(x, yc, zc);
    for (let i = 0; i < n; i++) idx.push(ci, j * n + i, j * n + ((i + 1) % n));
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}
function ring(x, hw, hh, yc, zc = 0, n = 48, exp = 2.5) {
  const p = [];
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
    p.push(V(x, yc + hh * Math.sign(c) * Math.pow(Math.abs(c), 2 / exp), zc + hw * Math.sign(s) * Math.pow(Math.abs(s), 2 / exp)));
  }
  return new THREE.BufferGeometry().setFromPoints(p);
}
const naca = (t, tc) => 5 * tc * (0.2969 * Math.sqrt(t) - 0.126 * t - 0.3516 * t * t + 0.2843 * t ** 3 - 0.1036 * t ** 4);
// Lofts a chord-wise slice [c0, c1] of a symmetric aerofoil between sections.
// axis 'y': span along z, thickness along y (wings); 'z': span along y (fin).
function foilLoft(secs, c0, c1, { n = 16, axis = 'y', ts = 1 } = {}) {
  const tsA = [];
  for (let i = 0; i <= n; i++) tsA.push(c0 + (c1 - c0) * (0.5 - 0.5 * Math.cos((Math.PI * i) / n)));
  const rg = [];
  tsA.forEach((t) => rg.push([t, 1]));
  for (let i = n; i >= 0; i--) rg.push([tsA[i], -1]);
  const m = rg.length, pos = [], idx = [];
  secs.forEach((s) =>
    rg.forEach(([t, sd]) => {
      const X = s.x - t * s.chord, th = sd * naca(t, s.tc) * s.chord * ts;
      if (axis === 'y') pos.push(X, s.h + th, s.s);
      else pos.push(X, s.s, s.h + th);
    })
  );
  for (let j = 0; j < secs.length - 1; j++)
    for (let i = 0; i < m; i++) {
      const i2 = (i + 1) % m, a = j * m + i, b = j * m + i2, c = (j + 1) * m + i, d = (j + 1) * m + i2;
      idx.push(a, c, b, b, c, d);
    }
  [0, secs.length - 1].forEach((j) => {
    let cx = 0, cy = 0, cz = 0;
    for (let i = 0; i < m; i++) {
      cx += pos[(j * m + i) * 3];
      cy += pos[(j * m + i) * 3 + 1];
      cz += pos[(j * m + i) * 3 + 2];
    }
    const ci = pos.length / 3;
    pos.push(cx / m, cy / m, cz / m);
    for (let i = 0; i < m; i++) idx.push(ci, j * m + i, j * m + ((i + 1) % m));
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}
// Body of revolution along -x from the nose: profile [[radius, distance]].
function lathe(profile, seg = 28) {
  const g = new THREE.LatheGeometry(profile.map(([r, d]) => new THREE.Vector2(r, d)), seg);
  g.rotateZ(Math.PI / 2);
  return g;
}
function cylX(r, len, seg = 16) {
  const g = new THREE.CylinderGeometry(r, r, len, seg);
  g.rotateZ(Math.PI / 2);
  return g;
}
function box(w, h, d, r = 0.02) {
  return new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 2.1, h / 2.1, d / 2.1));
}

// Fuselage stations: [x, half-width, half-height, centre y]
const FUS = [[5.78,0.01,0.01,-0.04],[5.68,0.1,0.1,-0.04],[5.5,0.17,0.17,-0.03],[5.2,0.25,0.26,-0.01],[4.8,0.34,0.36,0.01],
  [4.3,0.44,0.47,0.04],[3.7,0.53,0.56,0.08],[3.0,0.58,0.62,0.12],[2.0,0.62,0.68,0.16],[1.0,0.68,0.68,0.14],[0,0.76,0.64,0.1],
  [-1,0.82,0.6,0.05],[-2,0.84,0.56,0],[-3,0.84,0.53,0],[-4,0.8,0.49,0],[-5,0.74,0.44,0],[-5.7,0.7,0.4,0]];
function fusAt(x) {
  for (let i = 0; i < FUS.length - 1; i++) {
    const a = FUS[i], b = FUS[i + 1];
    if (x <= a[0] && x >= b[0]) {
      const t = (a[0] - x) / (a[0] - b[0]);
      return [x, lerp(a[1], b[1], t), lerp(a[2], b[2], t), lerp(a[3], b[3], t)];
    }
  }
  return (x > FUS[0][0] ? FUS[0] : FUS[FUS.length - 1]).slice();
}
function fusSeg(x0, x1, step = 0.12) {
  const n = Math.max(2, Math.ceil((x0 - x1) / step)), st = [];
  for (let i = 0; i <= n; i++) st.push(fusAt(lerp(x0, x1, i / n)));
  return st;
}
function wingSec(z, sg) {
  const f = (z - 0.8) / 3.8;
  return { x: -0.1 - 2.1 * f, chord: 3.1 - 1.9 * f, h: 0.18 - 0.035 * (z - 0.8), s: sg * z, tc: 0.1 - 0.03 * f };
}
function wingPt(z, frac, sg, dy = 0) {
  const s = wingSec(z, sg);
  return V(s.x - frac * s.chord, s.h + dy, s.s);
}
function wingLow(z) {
  const s = wingSec(z, 1);
  return s.h - naca(0.3, s.tc) * s.chord;
}

// ============================================================================
export function createAtlas(container, { onPick, labelFor, reduceMotion = false } = {}) {
  const state = {
    vis: Object.fromEntries(SYSTEM_ORDER.map((k) => [k, true])),
    focus: null, skin: 1, explode: 0, layers: 0, flow: false, edges: false, lo: 'clean',
    gear: 1, gearT: 1, flap: 0, ab: 0, abT: 0, pitch: 0, roll: 0, yaw: 0, demo: false, structure: false,
  };

  // ---------------------------------------------------------------- renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:none';
  container.prepend(renderer.domElement);
  const tip = document.createElement('div');
  tip.style.cssText = 'position:absolute;pointer-events:none;display:none;background:#f8fafc;color:#0f172a;border-radius:6px;padding:3px 8px;font-size:12px;white-space:nowrap;transform:translate(12px,12px);box-shadow:0 1px 4px rgba(0,0,0,.3)';
  container.appendChild(tip);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(THEME.bg);
  const camera = new THREE.PerspectiveCamera(36, 1, 0.05, 300);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.minDistance = 2;
  controls.maxDistance = 60;

  scene.add(new THREE.HemisphereLight(0xffffff, 0x4a5561, 1.4));
  const sun = new THREE.DirectionalLight(0xffffff, 1.9);
  sun.position.set(6, 10, 8);
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0xffffff, 0.6);
  fill.position.set(-8, -3, -7);
  scene.add(fill);
  const grid = new THREE.GridHelper(40, 40, THEME.gridMain, THEME.grid);
  grid.position.y = -1.76;
  grid.material.transparent = true;
  scene.add(grid);

  // ---------------------------------------------------------------- materials
  const matRecs = [];
  const M = (sys, color, o = {}) => {
    const m = new THREE.MeshStandardMaterial({
      color, metalness: o.metal ?? 0.15, roughness: o.rough ?? 0.55, side: THREE.DoubleSide, transparent: true,
      opacity: o.opacity ?? 1, emissive: o.emissive ?? 0x000000, emissiveIntensity: o.ei ?? 1,
    });
    matRecs.push({ m, sys, base: o.opacity ?? 1, skin: !!o.skin, color });
    return m;
  };
  const B = (sys, color) => {
    const m = new THREE.MeshBasicMaterial({ color, transparent: true });
    matRecs.push({ m, sys, base: 1, skin: false });
    return m;
  };
  const edgeMats = {};
  const edgeMat = (sys) => {
    if (!edgeMats[sys]) {
      const m = new THREE.LineBasicMaterial({ color: THEME.edge, transparent: true, depthWrite: false });
      matRecs.push({ m, sys, base: sys === 'airframe' ? 0.5 : 0.4, skin: true, line: true });
      edgeMats[sys] = m;
    }
    return edgeMats[sys];
  };
  let sel = null;
  function applyMaterials() {
    for (const r of matRecs) {
      let o = r.base;
      if (r.skin) o *= r.line ? 0.3 + 0.7 * state.skin : state.skin;
      if (state.focus && state.focus !== r.sys) o *= 0.07;
      if (r.line && !state.edges) o = 0;
      r.m.opacity = o;
      r.m.transparent = o < 0.995;
      r.m.depthWrite = r.line ? false : o > 0.6;
      r.m.visible = o > 0.004;
      if (r.sys === 'fctl' && r.skin && !r.line) r.m.color.set(state.skin > 0.85 && !state.focus ? '#a4adb5' : r.color);
    }
    if (sel) refreshSelMats();
  }

  function mesh(geo, mat, parent, pos, { edges = false, sys = 'airframe' } = {}) {
    const m = new THREE.Mesh(geo, mat);
    if (pos) m.position.copy(pos);
    if (edges) m.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo, 28), edgeMat(sys)));
    parent.add(m);
    return m;
  }

  // ---------------------------------------------------------------- registries
  const G = {};
  SYSTEM_ORDER.forEach((k) => {
    G[k] = new THREE.Group();
    scene.add(G[k]);
  });
  const parts = [];
  const partById = {};
  const internalIds = new Set(['intake-ducts','agb','apu','tank-fwd','tank-feed','tank-wing','fuel-lines','drop-lines','gen','battery','pdu','harness','ports','hx','ecs','obogs','bleed-ducts','pumps','resv','hlines','fcc','acts','fbw','avbay']);
  function part(sys, id, objs, extra = {}) {
    const p = { sys, id, objs: [].concat(objs), ...extra };
    p.objs.forEach((o) => o.traverse((c) => { if (c.isMesh && !c.userData.nopick) c.userData.part = p; }));
    parts.push(p);
    partById[id] = p;
    return p;
  }
  const explodables = [];
  const explodable = (obj, dir) => explodables.push({ obj, base: obj.position.clone(), dir });
  function hinged(parent, geo, mat, A, Bp, ref) {
    const pivot = new THREE.Group();
    pivot.position.copy(A);
    geo.translate(-A.x, -A.y, -A.z);
    mesh(geo, mat, pivot, null, { edges: true, sys: 'fctl' });
    parent.add(pivot);
    const axis = Bp.clone().sub(A).normalize();
    if (axis.dot(ref) < 0) axis.negate();
    return { pivot, set: (a) => pivot.quaternion.setFromAxisAngle(axis, a) };
  }

  // flow lines: pipes / wiring with moving tracer dots
  const flows = [];
  const dotGeo = new THREE.SphereGeometry(1, 8, 6);
  const dotMats = {}, pipeMats = {};
  const dotMat = (sys) => dotMats[sys] || (dotMats[sys] = B(sys, new THREE.Color(SYSTEMS[sys].color).lerp(new THREE.Color(0xffffff), 0.45)));
  const pipeMat = (sys) => pipeMats[sys] || (pipeMats[sys] = M(sys, SYSTEMS[sys].color, { rough: 0.45, metal: 0.3 }));
  function pipe(sys, pts, r, { speed = 1, dots = true, mat } = {}) {
    const curve = new THREE.CatmullRomCurve3(pts.map((p) => V(...p)), false, 'catmullrom', 0.25);
    const len = curve.getLength();
    const m = mesh(new THREE.TubeGeometry(curve, Math.max(24, Math.round(len * 18)), r, 8, false), mat || pipeMat(sys), G[sys]);
    if (dots) {
      const cnt = Math.max(2, Math.round(len * 2.2));
      const inst = new THREE.InstancedMesh(dotGeo, dotMat(sys), cnt);
      inst.userData.nopick = true;
      inst.frustumCulled = false;
      m.add(inst);
      flows.push({ curve, inst, cnt, v: speed / len, off: Math.random(), r: r * 1.9 });
    }
    return m;
  }

  // ================================================================ airframe
  const skinMat = M('airframe', SYSTEMS.airframe.color, { skin: true, metal: 0.25, rough: 0.5 });
  const darkMat = M('airframe', '#2a3139', { skin: true, rough: 0.9 });
  const glassMat = M('airframe', '#b8d4e6', { skin: true, opacity: 0.55, metal: 0.4, rough: 0.1 });
  const surfMat = M('fctl', '#7fb99b', { skin: true, metal: 0.2, rough: 0.5 });
  const frameMat = edgeMat('airframe');
  const structures = [];
  const structureMat = M('airframe', '#71838d', { metal: 0.65, rough: 0.5 });
  // Separate schematic load-bearing members from the exterior skin.
  // Their spacing is illustrative, not an actual manufacturing layout.
  function member(points, radius, parent) {
    const curve = new THREE.CatmullRomCurve3(points, false, 'centripetal');
    const m = mesh(new THREE.TubeGeometry(curve, Math.max(12, points.length * 3), radius, 6, false), structureMat, parent);
    m.userData.nopick = true;
    m.visible = false;
    structures.push(m);
    return m;
  }

  function fuselageSection(x0, x1) {
    const g = new THREE.Group();
    G.airframe.add(g);
    mesh(superLoft(fusSeg(x0, x1)), skinMat, g, null, { edges: true });
    for (let x = Math.floor(x0 / 0.6) * 0.6; x > x1; x -= 0.6) {
      if (x > 5.6) continue;
      const s = fusAt(x);
      const points = [];
      for (let i = 0; i <= 48; i++) {
        const a = i / 48 * Math.PI * 2;
        points.push(V(s[0], s[3] + s[2] * 0.95 * Math.sign(Math.cos(a)) * Math.abs(Math.cos(a)) ** 0.8,
          s[1] * 0.95 * Math.sign(Math.sin(a)) * Math.abs(Math.sin(a)) ** 0.8));
      }
      member(points, 0.018, g);
    }
    for (const angle of [Math.PI * 0.25, Math.PI * 0.75, Math.PI * 1.25, Math.PI * 1.75]) {
      member(fusSeg(x0, x1, 0.3).map(([x, w, h, y]) => V(x, y + h * 0.93 * Math.cos(angle), w * 0.93 * Math.sin(angle))), 0.014, g);
    }
    return g;
  }
  const fwd = fuselageSection(5.78, 0.8);
  const ctr = fuselageSection(0.8, -1.9);
  const aft = fuselageSection(-1.9, -5.7);
  explodable(fwd, V(2.2, 0, 0));
  explodable(aft, V(-2.1, 0, 0));
  [-1, 1].forEach((s) => mesh(new THREE.CircleGeometry(0.29, 24).rotateY(-Math.PI / 2), darkMat, aft, V(-5.705, 0, s * 0.42)));
  part('airframe', 'fus-fwd', fwd);
  part('airframe', 'fus-ctr', ctr);
  part('airframe', 'fus-aft', aft);

  const canopy = new THREE.Group();
  G.airframe.add(canopy);
  // Tapered tandem canopy: transverse arches, a fixed windscreen hoop and rim.
  // Exterior profile remains an illustrative model pending scaled source drawings.
  const canopyStations = [[3.88,0.10,0.035,0.58],[3.52,0.31,0.25,0.62],[3.0,0.43,0.49,0.68],
    [2.35,0.48,0.55,0.74],[1.65,0.47,0.53,0.79],[1.0,0.40,0.39,0.8],[0.5,0.22,0.17,0.79],[0.25,0.035,0.01,0.78]];
  const cpos = [], cidx = [], arc = (s, a) => V(s[0], s[3] + s[2] * Math.sin(a), s[1] * Math.cos(a));
  canopyStations.forEach((s) => { for (let i = 0; i <= 32; i++) cpos.push(...arc(s, i / 32 * Math.PI).toArray()); });
  for (let j = 0; j < canopyStations.length - 1; j++) for (let i = 0; i < 32; i++) {
    const a = j * 33 + i; cidx.push(a, a + 33, a + 1, a + 1, a + 33, a + 34);
  }
  const cg = new THREE.BufferGeometry();
  cg.setAttribute('position', new THREE.Float32BufferAttribute(cpos, 3)); cg.setIndex(cidx); cg.computeVertexNormals();
  mesh(cg, glassMat, canopy);
  const canopyRim = M('airframe', '#56616c', { skin: true, metal: 0.45, rough: 0.45 });
  const rim = (points) => mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 64, 0.016, 8, false), canopyRim, canopy);
  [0, Math.PI].forEach((a) => rim(canopyStations.map((s) => arc(s, a))));
  rim(Array.from({ length: 33 }, (_, i) => arc(canopyStations[2], i / 32 * Math.PI)));
  explodable(canopy, V(0.6, 1.7, 0));
  part('airframe', 'canopy', canopy);

  const surf = { slat: {}, flap: {}, ail: {}, stab: {}, rudder: null, airbrake: null };
  [-1, 1].forEach((sg) => {
    const side = sg > 0 ? 'R' : 'L';
    const wg = new THREE.Group();
    G.airframe.add(wg);
    const W = (a, b, c0, c1) => foilLoft([wingSec(a, sg), wingSec(b, sg)], c0, c1);
    const wingMeshes = [W(0.8, 4.6, 0.12, 0.75), W(0.8, 1.45, 0, 0.12), W(4.5, 4.6, 0, 0.12), W(0.8, 0.9, 0.75, 1), W(2.8, 2.85, 0.75, 1), W(4.4, 4.6, 0.75, 1)]
      .map((g) => mesh(g, skinMat, wg, null, { edges: true }));
    part('airframe', 'wing-' + side, wingMeshes);
    [0.25, 0.65].forEach((frac) => member([0.85,1.6,2.5,3.5,4.5].map((z) => wingPt(z, frac, sg)), 0.027, wg));
    [1.1,1.6,2.1,2.6,3.1,3.6,4.1].forEach((z) => member([0.16,0.4,0.72].map((f) => wingPt(z, f, sg)), 0.015, wg));

    const ref = V(0, 0, 1);
    const slat = hinged(wg, W(1.45, 4.5, 0, 0.12), surfMat, wingPt(1.45, 0.12, sg), wingPt(4.5, 0.12, sg), ref);
    const flap = hinged(wg, W(0.9, 2.8, 0.75, 1), surfMat, wingPt(0.9, 0.75, sg), wingPt(2.8, 0.75, sg), ref);
    const ail = hinged(wg, W(2.85, 4.4, 0.75, 1), surfMat, wingPt(2.85, 0.75, sg), wingPt(4.4, 0.75, sg), ref);
    surf.slat[side] = slat;
    surf.flap[side] = flap;
    surf.ail[side] = ail;
    explodable(slat.pivot, V(0.45, 0, 0));
    explodable(flap.pivot, V(-0.5, 0, 0));
    explodable(ail.pivot, V(-0.5, 0, 0));
    part('fctl', 'slat-' + side, slat.pivot);
    part('fctl', 'flap-' + side, flap.pivot);
    part('fctl', 'ail-' + side, ail.pivot);

    // LEX + intake
    const li = new THREE.Group();
    G.airframe.add(li);
    const sh = new THREE.Shape();
    [[2.3, 0.55], [1.3, 0.8], [0.4, 1.1], [-0.43, 1.42], [-1.2, 1.0], [-1.2, 0.6]].forEach(([x, z], i) => (i ? sh.lineTo(x, sg * z) : sh.moveTo(x, sg * z)));
    const lg = new THREE.ExtrudeGeometry(sh, { depth: 0.05, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.03, bevelSegments: 2 });
    lg.rotateX(Math.PI / 2);
    lg.translate(0, 0.235, 0);
    const lex = mesh(lg, skinMat, li, null, { edges: true });
    const it = mesh(superLoft([[1.35,0.22,0.3,-0.14,sg*0.88],[0.6,0.23,0.32,-0.15,sg*0.9],[-0.6,0.22,0.3,-0.15,sg*0.94],[-1.6,0.14,0.24,-0.12,sg*0.92],[-2.4,0.03,0.12,-0.08,sg*0.86]], { caps: [false, true], exp: 3 }), skinMat, li, null, { edges: true });
    mesh(superLoft([[1.3,0.2,0.28,-0.14,sg*0.88],[1.28,0.2,0.28,-0.14,sg*0.88]], { exp: 3 }), darkMat, it);
    explodable(li, V(0.2, 0, sg * 0.9));
    part('airframe', 'lex-' + side, lex);
    part('airframe', 'intake-' + side, it);

    explodable(wg, V(0, 0.25, sg * 2.5));

    // stabilator
    const sgp = new THREE.Group();
    G.airframe.add(sgp);
    const stSec = (z) => {
      const f = (z - 0.72) / 1.63;
      return { x: -3.7 - 1.25 * f, chord: 1.7 - 1.0 * f, h: -0.02 - 0.03 * (z - 0.72), s: sg * z, tc: 0.06 };
    };
    const stab = hinged(sgp, foilLoft([stSec(0.72), stSec(2.35)], 0, 1), surfMat, V(-4.25, -0.02, 0), V(-4.25, -0.02, 1), ref);
    surf.stab[side] = stab;
    explodable(sgp, V(-2.3, 0, sg * 1.3));
    part('fctl', 'stab-' + side, stab.pivot);
  });

  // fin + rudder
  const finG = new THREE.Group();
  G.airframe.add(finG);
  const finSec = (y) => {
    const f = (y - 0.45) / 2.55;
    return { x: -2.35 - 2.2 * f, chord: 2.6 - 1.65 * f, h: 0, s: y, tc: 0.07 };
  };
  const F = (a, b, c0, c1) => foilLoft([finSec(a), finSec(b)], c0, c1, { axis: 'z' });
  const finMeshes = [F(0.45, 3.0, 0, 0.7), F(0.45, 0.62, 0.7, 1), F(2.75, 3.0, 0.7, 1)].map((g) => mesh(g, skinMat, finG, null, { edges: true }));
  const fp = (y, fr) => {
    const s = finSec(y);
    return V(s.x - fr * s.chord, y, 0);
  };
  surf.rudder = hinged(finG, F(0.62, 2.75, 0.7, 1), surfMat, fp(0.62, 0.7), fp(2.75, 0.7), V(0, 1, 0));
  explodable(surf.rudder.pivot, V(-0.45, 0, 0));
  explodable(finG, V(-1.9, 1.7, 0));
  part('airframe', 'fin', finMeshes);
  part('fctl', 'rudder', surf.rudder.pivot);

  surf.airbrake = hinged(ctr, box(1.1, 0.035, 0.62, 0.015).translate(0, 0.748, 0), surfMat, V(0.55, 0.748, 0), V(0.55, 0.748, -1), V(0, 0, -1));
  explodable(surf.airbrake.pivot, V(0, 0.7, 0));
  part('fctl', 'airbrake', surf.airbrake.pivot);

  // ================================================================ propulsion
  const engSteel = M('engine', SYSTEMS.engine.color, { metal: 0.6, rough: 0.35 });
  const engHot = M('engine', '#6d6358', { metal: 0.55, rough: 0.4 });
  const engDark = M('engine', '#2c3238', { metal: 0.4, rough: 0.6 });
  const ductMat = M('engine', '#a4b0bb', { opacity: 0.55, rough: 0.4 });
  const fans = [], engMeshes = [], ductMeshes = [], gbMeshes = [];
  [-1, 1].forEach((sg) => {
    const z = sg * 0.42, x0 = -2.15;
    const cold = mesh(lathe([[0.0,0],[0.27,0.01],[0.3,0.12],[0.3,0.55],[0.28,1.0],[0.3,1.3],[0.3,1.42]]), engSteel, G.engine, V(x0, -0.05, z));
    const hot = mesh(lathe([[0.3,1.4],[0.3,1.9],[0.28,2.4],[0.26,2.9],[0.25,3.35],[0.24,3.4]]), engHot, G.engine, V(x0, -0.05, z));
    mesh(new THREE.CircleGeometry(0.23, 24).rotateY(-Math.PI / 2), engDark, G.engine, V(x0 - 3.41, -0.05, z));
    const fan = new THREE.Group();
    fan.position.set(x0 - 0.02, -0.05, z);
    mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.06, 16).rotateZ(Math.PI / 2), engDark, fan);
    for (let i = 0; i < 18; i++) {
      const b = mesh(new THREE.BoxGeometry(0.015, 0.2, 0.05), engDark, fan);
      b.rotation.x = (i / 18) * Math.PI * 2;
      b.translateY(0.17);
      b.rotation.y = 0.5;
    }
    G.engine.add(fan);
    fans.push(fan);
    engMeshes.push(cold, hot, fan);
    ductMeshes.push(pipe('engine', [[1.3,-0.14,sg*0.88],[0.3,-0.13,sg*0.84],[-0.9,-0.09,sg*0.64],[-2.12,-0.05,z]], 0.19, { dots: false, mat: ductMat }));
    gbMeshes.push(mesh(box(0.55, 0.16, 0.3, 0.03), engDark, G.engine, V(-2.85, -0.4, z)));
  });
  part('engine', 'f124', engMeshes);
  part('engine', 'intake-ducts', ductMeshes);
  part('engine', 'agb', gbMeshes, { approx: true });
  const apu = mesh(cylX(0.12, 0.5), engSteel, G.engine, V(-3.45, -0.3, 0));
  mesh(cylX(0.05, 0.25), engDark, apu, V(-0.35, 0, 0));
  part('engine', 'apu', apu, { approx: true });

  // ================================================================ fuel
  const fuelMat = M('fuel', SYSTEMS.fuel.color, { opacity: 0.8, rough: 0.6 });
  const fuelSolid = M('fuel', SYSTEMS.fuel.color, { rough: 0.5 });
  part('fuel', 'tank-fwd', mesh(box(1.25, 0.42, 1.05, 0.08), fuelMat, G.fuel, V(0.15, 0.2, 0)), { approx: true });
  part('fuel', 'tank-feed', mesh(box(1.35, 0.34, 1.15, 0.08), fuelMat, G.fuel, V(-1.3, 0.34, 0)), { approx: true });
  part('fuel', 'tank-wing', [-1, 1].map((sg) => mesh(foilLoft([wingSec(1.1, sg), wingSec(3.9, sg)], 0.17, 0.68, { ts: 0.72 }), fuelMat, G.fuel)), { approx: true });
  const probe = pipe('fuel', [[5.3,0.42,0.36],[4.6,0.4,0.46],[3.8,0.34,0.56],[3.2,0.3,0.6]], 0.045, { speed: 0.6 });
  mesh(new THREE.CylinderGeometry(0.035, 0.07, 0.14, 12).rotateZ(Math.PI / 2), fuelSolid, probe, V(5.33, 0.42, 0.355));
  part('fuel', 'probe', probe, { approx: true });
  const fuelLines = [
    pipe('fuel', [[3.2,0.3,0.6],[2.0,0.22,0.52],[0.9,0.2,0.4],[0.4,0.25,0.25]], 0.035, { speed: 0.7 }),
    pipe('fuel', [[0.15,0.05,0],[-0.3,0.08,0],[-0.75,0.2,0]], 0.04, { speed: 0.6 }),
    pipe('fuel', [[-1.9,0.2,0],[-2.6,0.0,0],[-3.2,-0.25,0]], 0.028, { speed: 0.6 }),
  ];
  [-1, 1].forEach((sg) => {
    fuelLines.push(pipe('fuel', [[-1.6,0.12,sg*2.6],[-1.3,0.14,sg*1.6],[-1.25,0.2,sg*0.9],[-1.3,0.28,sg*0.55]], 0.035, { speed: 0.6 }));
    fuelLines.push(pipe('fuel', [[-1.9,0.2,sg*0.3],[-2.3,-0.1,sg*0.3],[-2.7,-0.3,sg*0.42],[-2.95,-0.35,sg*0.42]], 0.035, { speed: 0.9 }));
  });
  part('fuel', 'fuel-lines', fuelLines, { approx: true });

  // ================================================================ stores
  const wpMat = M('weapons', SYSTEMS.weapons.color, { rough: 0.5 });
  const wpDark = M('weapons', '#6e5561', { rough: 0.6 });
  const pylonMat = M('weapons', '#b98a9b', { rough: 0.6 });
  const TANK = [[0,0],[0.12,0.15],[0.22,0.45],[0.28,0.9],[0.28,2.0],[0.22,2.6],[0.1,2.95],[0,3.0]];
  const PYL = [1.85, 2.75, 3.55];
  const pylonAt = (z) => {
    const s = wingSec(z, 1);
    return { x: s.x - 0.42 * s.chord, y: wingLow(z) };
  };
  const pylons = { i: [], m: [], o: [] };
  const cp = mesh(box(1.0, 0.2, 0.08, 0.03), pylonMat, G.weapons, V(-0.9, -0.62, 0));
  [-1, 1].forEach((sg) =>
    PYL.forEach((z, i) => {
      const { x, y } = pylonAt(z);
      pylons[['i', 'm', 'o'][i]].push(mesh(box(0.9, 0.22, 0.07, 0.03), pylonMat, G.weapons, V(x, y - 0.1, sg * z)));
    })
  );
  part('weapons', 'pyl-c', cp, { lo: ['ferry', 'attack'] });
  part('weapons', 'pyl-i', pylons.i, { lo: ['ferry', 'attack'] });
  part('weapons', 'pyl-m', pylons.m, { lo: ['attack'] });
  part('weapons', 'pyl-o', pylons.o, { lo: ['attack'] });
  part('weapons', 'rails', [-1, 1].map((sg) => {
    const s = wingSec(4.6, sg);
    return mesh(box(1.5, 0.06, 0.05, 0.02), pylonMat, G.weapons, V(s.x - 0.55, s.h - 0.02, sg * 4.66));
  }));

  function store(profile, noseX, y, z, mat, parent, extra) {
    const g = new THREE.Group();
    g.position.set(noseX, y, z);
    mesh(lathe(profile), mat, g);
    if (extra) extra(g);
    parent.add(g);
    return g;
  }
  const finSet = (at, span, chord, mat) => (g) => {
    for (let i = 0; i < 4; i++) {
      const f = mesh(new THREE.BoxGeometry(chord, span, 0.01), mat, g, V(-at, 0, 0));
      f.rotation.x = (i * Math.PI) / 2 + Math.PI / 4;
      f.translateY(span / 2);
    }
  };
  part('fuel', 'drop-wing', [-1, 1].map((sg) => {
    const { x, y } = pylonAt(PYL[0]);
    return store(TANK, x + 1.5, y - 0.52, sg * PYL[0], fuelSolid, G.fuel);
  }), { lo: ['ferry', 'attack'] });
  part('fuel', 'drop-c', store(TANK, 0.6, -1.02, 0, fuelSolid, G.fuel), { lo: ['ferry'] });
  part('fuel', 'drop-lines', [-1, 1].map((sg) => {
    const { x, y } = pylonAt(PYL[0]);
    return pipe('fuel', [[x, y - 0.3, sg * PYL[0]], [x, y + 0.05, sg * PYL[0]], [-1.5, 0.12, sg * 2.3]], 0.03, { speed: 0.5 });
  }), { lo: ['ferry', 'attack'], approx: true });
  part('weapons', 'aam', [-1, 1].map((sg) => {
    const s = wingSec(4.6, sg);
    return store([[0,0],[0.03,0.05],[0.064,0.2],[0.064,2.85],[0,2.86]], s.x + 0.9, s.h - 0.12, sg * 4.66, wpMat, G.weapons, (g) => {
      finSet(0.35, 0.1, 0.12, wpDark)(g);
      finSet(2.65, 0.14, 0.22, wpDark)(g);
    });
  }), { lo: ['attack'] });
  part('weapons', 'bomb', [-1, 1].map((sg) => {
    const { x, y } = pylonAt(PYL[1]);
    return store([[0,0],[0.07,0.08],[0.12,0.3],[0.137,0.7],[0.137,1.5],[0.1,1.9],[0.06,2.2],[0,2.2]], x + 1.1, y - 0.37, sg * PYL[1], wpMat, G.weapons, finSet(2.0, 0.16, 0.3, wpDark));
  }), { lo: ['attack'] });
  part('weapons', 'rocket', [-1, 1].map((sg) => {
    const { x, y } = pylonAt(PYL[2]);
    return store([[0,0],[0.12,0.05],[0.19,0.2],[0.2,0.4],[0.2,1.6],[0,1.6]], x + 0.8, y - 0.43, sg * PYL[2], wpMat, G.weapons);
  }), { lo: ['attack'] });
  part('weapons', 'gunpod', store([[0,0],[0.05,0.04],[0.12,0.2],[0.19,0.6],[0.19,1.7],[0.12,2.0],[0,2.0]], 0.1, -0.93, 0, wpMat, G.weapons,
    (g) => mesh(cylX(0.025, 0.35), wpDark, g, V(0.1, -0.05, 0))), { lo: ['attack'] });

  // ================================================================ electrical
  const elMat = M('elec', SYSTEMS.elec.color, { rough: 0.45 });
  part('elec', 'gen', [-1, 1].map((sg) => mesh(cylX(0.09, 0.26), elMat, G.elec, V(-2.65, -0.42, sg * 0.66))), { approx: true });
  part('elec', 'battery', mesh(box(0.3, 0.2, 0.22, 0.03), elMat, G.elec, V(4.15, -0.18, -0.2)), { approx: true });
  part('elec', 'pdu', mesh(box(0.5, 0.18, 0.4, 0.03), elMat, G.elec, V(1.9, -0.42, 0)), { approx: true });
  const navs = [-1, 1].map((sg) => {
    const s = wingSec(4.6, sg);
    return mesh(new THREE.SphereGeometry(0.05, 12, 8), B('elec', sg > 0 ? '#34c759' : '#ff3b30'), G.elec, V(s.x - 0.25, s.h + 0.05, sg * 4.6));
  });
  navs.push(mesh(new THREE.SphereGeometry(0.05, 12, 8), B('elec', '#ffffff'), G.elec, V(-4.8, 2.95, 0)));
  part('elec', 'nav', navs);
  const wires = [
    pipe('elec', [[2.1,-0.4,0],[3.2,-0.3,-0.15],[4.0,-0.18,-0.2]], 0.02, { speed: 2 }),
    pipe('elec', [[1.9,-0.35,0.05],[2.4,0.05,0.25],[3.1,0.3,0.3]], 0.016, { speed: 2.2 }),
    pipe('elec', [[1.9,-0.35,-0.05],[1.95,0.2,-0.25],[2.0,0.45,-0.2]], 0.016, { speed: 2.2 }),
    pipe('elec', [[1.7,-0.4,0],[0.5,0.3,0],[0.45,0.45,0.05]], 0.016, { speed: 2.2 }),
    pipe('elec', [[0.45,0.45,0],[-1.5,0.45,0],[-3.2,0.8,0],[-4.2,2.2,0],[-4.75,2.9,0]], 0.016, { speed: 2.2 }),
  ];
  [-1, 1].forEach((sg) => {
    wires.push(pipe('elec', [[-2.65,-0.42,sg*0.66],[-1.5,-0.42,sg*0.5],[0.4,-0.45,sg*0.35],[1.7,-0.42,sg*0.1]], 0.02, { speed: 2.2 }));
    wires.push(pipe('elec', [[1.7,-0.4,sg*0.1],[0.2,-0.2,sg*0.6],[-1.3,0.08,sg*1.2],[-2.3,0.1,sg*3.4],[-2.5,0.08,sg*4.55]], 0.016, { speed: 2.4 }));
  });
  part('elec', 'harness', wires, { approx: true });

  // ================================================================ bleed air / ECS
  const blMat = M('bleed', SYSTEMS.bleed.color, { rough: 0.5 });
  part('bleed', 'ports', [-1, 1].map((sg) => mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.18, 12), blMat, G.bleed, V(-2.9, 0.3, sg * 0.42))), { approx: true });
  part('bleed', 'hx', [mesh(box(0.45, 0.2, 0.36, 0.04), blMat, G.bleed, V(-2.15, 0.5, 0)), mesh(box(0.35, 0.1, 0.16, 0.03), blMat, G.bleed, V(-2.05, 0.66, 0))], { approx: true });
  part('bleed', 'ecs', mesh(box(0.6, 0.22, 0.42, 0.05), blMat, G.bleed, V(-0.9, 0.56, 0)), { approx: true });
  part('bleed', 'obogs', mesh(box(0.28, 0.24, 0.2, 0.03), blMat, G.bleed, V(0.95, 0.3, -0.45)), { approx: true });
  const ducts = [
    pipe('bleed', [[-1.95,0.5,0],[-1.5,0.55,0],[-1.2,0.56,0]], 0.05, { speed: 1.4 }),
    pipe('bleed', [[-0.6,0.56,0.1],[0.3,0.55,0.35],[1.2,0.35,0.42],[2.4,0.2,0.44],[3.0,0.2,0.38]], 0.04, { speed: 1.5 }),
    pipe('bleed', [[-0.6,0.56,-0.1],[0.3,0.48,-0.35],[0.85,0.35,-0.45]], 0.035, { speed: 1.3 }),
    pipe('bleed', [[1.1,0.3,-0.45],[1.5,0.15,-0.3],[2.6,0.0,-0.3]], 0.025, { speed: 1.2 }),
    pipe('bleed', [[1.2,0.35,0.42],[2.4,-0.1,0.38],[3.6,-0.15,0.3],[4.4,-0.05,0.15]], 0.03, { speed: 1.4 }),
  ];
  [-1, 1].forEach((sg) => ducts.push(pipe('bleed', [[-2.9,0.38,sg*0.42],[-2.6,0.45,sg*0.2],[-2.35,0.5,0]], 0.045, { speed: 1.4 })));
  part('bleed', 'bleed-ducts', ducts, { approx: true });

  // ================================================================ hydraulics
  const hyMat = M('hyd', SYSTEMS.hyd.color, { rough: 0.45, metal: 0.3 });
  part('hyd', 'pumps', [-1, 1].map((sg) => mesh(cylX(0.07, 0.22), hyMat, G.hyd, V(-3.0, -0.42, sg * 0.2))), { approx: true });
  part('hyd', 'resv', [-1, 1].map((sg) => mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.28, 16), hyMat, G.hyd, V(-2.0, -0.3, sg * 0.3))), { approx: true });
  const hlines = [
    pipe('hyd', [[-2.0,-0.2,0.3],[-2.4,0.3,0.1],[-3.1,0.62,0]], 0.018),
    pipe('hyd', [[-2.0,-0.2,-0.3],[-1.0,0.3,-0.1],[0.25,0.6,0]], 0.016),
    pipe('hyd', [[-2.0,-0.35,-0.3],[0.5,-0.5,0],[3.5,-0.45,0]], 0.018),
  ];
  [-1, 1].forEach((sg) => {
    const fa = wingPt(1.8, 0.66, sg), aa = wingPt(3.6, 0.66, sg), la = wingPt(2.5, 0.18, sg);
    hlines.push(pipe('hyd', [[-3.0,-0.42,sg*0.2],[-2.4,-0.35,sg*0.25],[-2.0,-0.2,sg*0.3]], 0.022));
    hlines.push(pipe('hyd', [[-2.0,-0.3,sg*0.3],[-3.2,-0.15,sg*0.52],[-4.05,-0.08,sg*0.62]], 0.02));
    hlines.push(pipe('hyd', [[-2.0,-0.25,sg*0.35],[-1.9,0.02,sg*0.85],[fa.x, fa.y - 0.03, fa.z],[aa.x, aa.y - 0.03, aa.z]], 0.018));
    hlines.push(pipe('hyd', [[-1.9,0.0,sg*0.9],[-0.9,0.08,sg*1.4],[la.x, la.y - 0.02, la.z]], 0.016));
    hlines.push(pipe('hyd', [[-2.0,-0.35,sg*0.3],[-1.3,-0.5,sg*0.7],[-0.95,-0.5,sg*0.95]], 0.018));
  });
  part('hyd', 'hlines', hlines, { approx: true });

  // ================================================================ FCC, actuators, sticks
  const fcMat = M('fctl', SYSTEMS.fctl.color, { rough: 0.45 });
  part('fctl', 'fcc', [-0.3, -0.1, 0.1, 0.3].map((z) => mesh(box(0.2, 0.12, 0.15, 0.02), fcMat, G.fctl, V(0.45, 0.52, z))), { approx: true });
  const acts = [];
  const actGeo = () => cylX(0.045, 0.3, 12);
  [-1, 1].forEach((sg) => {
    acts.push(mesh(actGeo(), fcMat, G.fctl, V(-4.0, -0.06, sg * 0.62)));
    [wingPt(1.8, 0.66, sg), wingPt(3.6, 0.66, sg), wingPt(2.5, 0.2, sg)].forEach((p) => acts.push(mesh(actGeo(), fcMat, G.fctl, p)));
  });
  acts.push(mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.3, 12), fcMat, G.fctl, V(-3.15, 0.65, 0)));
  const aba = mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.26, 12), fcMat, G.fctl, V(0.25, 0.62, 0));
  aba.rotation.z = 0.9;
  acts.push(aba);
  part('fctl', 'acts', acts, { approx: true });
  const sticks = [[2.95, -0.3], [1.72, -0.12]].map(([x, y]) => {
    const g = new THREE.Group();
    g.position.set(x, y, 0);
    mesh(new THREE.CylinderGeometry(0.018, 0.025, 0.42, 10).translate(0, 0.21, 0), fcMat, g);
    mesh(box(0.06, 0.1, 0.05, 0.02), fcMat, g, V(0, 0.46, 0));
    G.fctl.add(g);
    return g;
  });
  part('fctl', 'sticks', sticks);
  const fbw = [
    pipe('fctl', [[2.95,-0.28,0.05],[2.2,-0.25,0.1],[1.2,0.2,0.1],[0.55,0.46,0.1]], 0.012, { speed: 3 }),
    pipe('fctl', [[1.72,-0.1,-0.05],[1.1,0.15,-0.1],[0.55,0.46,-0.1]], 0.012, { speed: 3 }),
    pipe('fctl', [[0.35,0.52,0],[-1.5,0.6,0],[-3.0,0.65,0]], 0.012, { speed: 3 }),
  ];
  [-1, 1].forEach((sg) => {
    const fa = wingPt(1.8, 0.66, sg), aa = wingPt(3.6, 0.66, sg), la = wingPt(2.5, 0.2, sg);
    fbw.push(pipe('fctl', [[0.35,0.5,sg*0.3],[-1.5,0.4,sg*0.35],[-3.4,0.1,sg*0.55],[-3.85,-0.06,sg*0.62]], 0.012, { speed: 3 }));
    fbw.push(pipe('fctl', [[0.35,0.5,sg*0.3],[-1.0,0.3,sg*0.8],[fa.x, fa.y + 0.03, fa.z],[aa.x, aa.y + 0.03, aa.z]], 0.012, { speed: 3 }));
    fbw.push(pipe('fctl', [[0.35,0.5,sg*0.3],[-0.6,0.3,sg*1.2],[la.x, la.y + 0.03, la.z]], 0.012, { speed: 3 }));
  });
  part('fctl', 'fbw', fbw, { approx: true });

  // ================================================================ landing gear
  const grMat = M('gear', SYSTEMS.gear.color, { metal: 0.5, rough: 0.35 });
  const tyre = M('gear', '#2b2e33', { rough: 0.9 });
  const wheel = (r, w) => {
    const g = new THREE.Group();
    mesh(new THREE.CylinderGeometry(r, r, w, 24).rotateX(Math.PI / 2), tyre, g);
    mesh(new THREE.CylinderGeometry(r * 0.55, r * 0.55, w * 1.05, 16).rotateX(Math.PI / 2), grMat, g);
    return g;
  };
  const noseGear = new THREE.Group();
  noseGear.position.set(3.55, -0.42, 0);
  G.gear.add(noseGear);
  mesh(new THREE.CylinderGeometry(0.045, 0.05, 1.05, 12).translate(0, -0.52, 0), grMat, noseGear);
  mesh(box(0.28, 0.06, 0.06, 0.02), grMat, noseGear, V(0.12, -0.8, 0)).rotation.z = -0.6;
  const nw = wheel(0.22, 0.14);
  nw.position.set(0, -1.11, 0);
  noseGear.add(nw);
  const mains = [-1, 1].map((sg) => {
    const g = new THREE.Group();
    g.position.set(-0.95, -0.42, sg * 0.95);
    G.gear.add(g);
    const len = 1.05;
    mesh(new THREE.CylinderGeometry(0.06, 0.065, len, 12).translate(0, -len / 2, 0), grMat, g).rotation.x = -sg * Math.atan2(0.25, len);
    mesh(box(0.08, 0.5, 0.05, 0.02), grMat, g, V(0.2, -0.35, sg * 0.1)).rotation.z = 0.45;
    const w = wheel(0.3, 0.18);
    w.position.set(0, -1.03, sg * 0.3);
    g.add(w);
    g.userData.axis = V(sg * 0.35, 0, 1).normalize();
    return g;
  });
  part('gear', 'ngear', noseGear);
  part('gear', 'mgear', mains);

  // ================================================================ cockpit / avionics
  const ckMat = M('cockpit', SYSTEMS.cockpit.color, { rough: 0.5 });
  const seatMat = M('cockpit', '#3b4757', { rough: 0.8 });
  const scrMat = M('cockpit', '#0d1b2e', { emissive: SYSTEMS.cockpit.color, ei: 0.45, rough: 0.3 });
  const handleMat = M('cockpit', '#e2c23c', { rough: 0.5 });
  const hudMat = M('cockpit', '#9fd0ff', { opacity: 0.35, rough: 0.05 });
  part('cockpit', 'seats', [[2.55, -0.32], [1.3, -0.15]].map(([x, y]) => {
    const g = new THREE.Group();
    g.position.set(x, y, 0);
    g.rotation.z = 0.22;
    mesh(box(0.5, 0.14, 0.5, 0.04), seatMat, g, V(0, 0.07, 0));
    mesh(box(0.14, 0.85, 0.5, 0.04), seatMat, g, V(-0.25, 0.5, 0));
    mesh(box(0.22, 0.28, 0.44, 0.05), ckMat, g, V(-0.22, 0.98, 0));
    mesh(new THREE.TorusGeometry(0.05, 0.012, 6, 16).rotateY(Math.PI / 2), handleMat, g, V(0.22, 0.2, 0));
    G.cockpit.add(g);
    return g;
  }));
  part('cockpit', 'mfd', [[3.2, 0.3], [2.02, 0.48]].map(([x, y]) => {
    const g = new THREE.Group();
    g.position.set(x, y, 0);
    mesh(box(0.12, 0.34, 0.8, 0.03), seatMat, g);
    [-0.26, 0, 0.26].forEach((z) => mesh(new THREE.PlaneGeometry(0.2, 0.2).rotateY(-Math.PI / 2), scrMat, g, V(-0.065, 0, z)));
    G.cockpit.add(g);
    return g;
  }));
  const hud = mesh(new THREE.PlaneGeometry(0.2, 0.18).rotateY(-Math.PI / 2).rotateZ(-0.35), hudMat, G.cockpit, V(3.22, 0.6, 0));
  mesh(box(0.14, 0.06, 0.18, 0.02), seatMat, hud, V(0.03, -0.1, 0));
  part('cockpit', 'hud', hud);
  part('cockpit', 'avbay', [
    mesh(box(0.35, 0.22, 0.25), ckMat, G.cockpit, V(4.55, 0.06, 0.16)),
    mesh(box(0.35, 0.22, 0.25), ckMat, G.cockpit, V(4.55, 0.06, -0.16)),
    mesh(box(0.3, 0.18, 0.3), ckMat, G.cockpit, V(4.95, 0.02, 0)),
  ], { approx: true });

  // ================================================================ state appliers
  const partShown = (p) => state.vis[p.sys] && (!p.lo || p.lo.includes(state.lo)) &&
    !(internalIds.has(p.id) && state.skin > 0.95 && !state.focus && !state.explode && !state.layers && !state.structure);
  function applyVisibility() {
    for (const p of parts) p.objs.forEach((o) => (o.visible = partShown(p)));
    structures.forEach((m) => { m.visible = state.structure && state.vis.airframe; });
    if (sel && !partShown(sel.p)) clearSel();
  }
  function applyExplode() {
    for (const e of explodables) e.obj.position.copy(e.base).addScaledVector(e.dir, state.explode);
  }
  function applyLayers() {
    SYSTEM_ORDER.forEach((k) => (G[k].position.y = SYSTEMS[k].layer * 1.7 * state.layers));
    grid.material.opacity = Math.max(0, 1 - state.layers * 3);
    grid.visible = grid.material.opacity > 0.01;
  }

  // ---------------------------------------------------------------- selection
  function refreshSelMats() {
    for (const [, o, c] of sel.swaps) {
      c.opacity = Math.max(o.opacity, 0.92);
      c.transparent = c.opacity < 0.995;
      c.depthWrite = true;
      c.visible = true;
    }
  }
  function clearSel() {
    if (!sel) return;
    for (const [m, o, c] of sel.swaps) {
      m.material = o;
      c.dispose();
    }
    sel = null;
  }
  function select(id) {
    clearSel();
    const p = partById[id];
    if (!p) return;
    const swaps = [];
    p.objs.forEach((o) =>
      o.traverse((c) => {
        if (c.isMesh && !c.userData.nopick) {
          const orig = c.material, cl = orig.clone();
          cl.emissive = new THREE.Color(0xffffff);
          cl.emissiveIntensity = 0.28;
          c.material = cl;
          swaps.push([c, orig, cl]);
        }
      })
    );
    sel = { p, swaps };
    refreshSelMats();
  }

  // ---------------------------------------------------------------- picking
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  const shown = (o) => {
    for (; o; o = o.parent) if (!o.visible) return false;
    return true;
  };
  function pick(cx, cy) {
    const r = renderer.domElement.getBoundingClientRect();
    ndc.set(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hits = ray.intersectObjects(scene.children, true).filter(
      (h) => h.object.isMesh && h.object.userData.part && shown(h.object) && h.object.material.visible && h.object.material.opacity > 0.05
    );
    return (hits.find((h) => h.object.material.opacity >= 0.5) || hits[0])?.object.userData.part || null;
  }
  let down = null, hoverEv = null;
  const el = renderer.domElement;
  const onDown = (e) => (down = [e.clientX, e.clientY]);
  const onUp = (e) => {
    if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 5) return;
    const p = pick(e.clientX, e.clientY);
    onPick?.(p ? p.id : null);
  };
  const onMove = (e) => { if (e.pointerType === 'mouse') hoverEv = e; };
  const onLeave = () => {
    hoverEv = null;
    tip.style.display = 'none';
  };
  el.addEventListener('pointerdown', onDown);
  el.addEventListener('pointerup', onUp);
  el.addEventListener('pointermove', onMove);
  el.addEventListener('pointerleave', onLeave);
  function doHover() {
    if (!hoverEv) return;
    const e = hoverEv;
    hoverEv = null;
    const p = pick(e.clientX, e.clientY);
    if (!p) {
      tip.style.display = 'none';
      el.style.cursor = '';
      return;
    }
    const r = container.getBoundingClientRect();
    tip.textContent = labelFor ? labelFor(p.id) : p.id;
    tip.style.left = e.clientX - r.left + 'px';
    tip.style.top = e.clientY - r.top + 'px';
    tip.style.display = 'block';
    el.style.cursor = 'pointer';
  }

  // ---------------------------------------------------------------- camera
  let tween = null;
  function flyTo(pos, target) {
    if (reduceMotion) {
      camera.position.copy(pos);
      controls.target.copy(target);
      return;
    }
    tween = { p0: camera.position.clone(), t0: controls.target.clone(), p1: pos, t1: target, k: 0 };
  }
  function fitDist() {
    const vf = (camera.fov * D2R) / 2, hf = Math.atan(Math.tan(vf) * camera.aspect);
    return Math.max(6.6 / Math.tan(hf), 3.4 / Math.tan(vf)) * (1 + state.layers * 0.7 + state.explode * 0.6);
  }
  function view(name, instant = false) {
    const ty = -state.layers * 1.4, t = V(-0.3, ty, 0);
    const pos = V(...VIEWS[name]).normalize().multiplyScalar(fitDist()).add(t);
    if (instant) {
      camera.position.copy(pos);
      controls.target.copy(t);
    } else flyTo(pos, t);
  }
  function zoomTo(id) {
    const p = partById[id];
    if (!p) return;
    const bb = new THREE.Box3();
    p.objs.forEach((o) => bb.expandByObject(o));
    if (bb.isEmpty()) return;
    const c = bb.getCenter(new THREE.Vector3()), size = bb.getSize(new THREE.Vector3()).length();
    const dir = camera.position.clone().sub(controls.target).normalize();
    flyTo(c.clone().addScaledVector(dir, Math.max(3, size * 2.2)), c);
  }

  // ---------------------------------------------------------------- resize
  function resize() {
    const w = container.clientWidth, h = container.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(container);

  // ---------------------------------------------------------------- loop
  const dummy = new THREE.Object3D();
  const clock = new THREE.Clock();
  let time = 0, raf = 0;
  const approach = (cur, tgt, rate, dt) => {
    const d = tgt - cur, s = rate * dt;
    return Math.abs(d) <= s ? tgt : cur + Math.sign(d) * s;
  };
  function frame() {
    const dt = Math.min(clock.getDelta(), 0.05);
    time += dt;
    if (tween) {
      tween.k = Math.min(1, tween.k + dt / 0.8);
      const e = 1 - Math.pow(1 - tween.k, 3);
      camera.position.lerpVectors(tween.p0, tween.p1, e);
      controls.target.lerpVectors(tween.t0, tween.t1, e);
      if (tween.k >= 1) tween = null;
    }
    controls.update();

    if (state.demo) {
      state.pitch = Math.sin(time * 0.9) * 0.6;
      state.roll = Math.sin(time * 0.6 + 0.8) * 0.8;
      state.yaw = Math.sin(time * 0.45 + 2) * 0.6;
    }
    state.gear = approach(state.gear, state.gearT, 0.45, dt);
    state.ab = approach(state.ab, state.abT, 1.2, dt);

    const { pitch: p, roll: r, yaw: y } = state;
    ['L', 'R'].forEach((s) => {
      surf.flap[s].set(state.flap * 40 * D2R);
      surf.slat[s].set(-state.flap * 20 * D2R);
    });
    surf.ail.R.set(-r * 20 * D2R);
    surf.ail.L.set(r * 20 * D2R);
    surf.stab.R.set((-p * 18 - r * 7) * D2R);
    surf.stab.L.set((-p * 18 + r * 7) * D2R);
    surf.rudder.set(y * 25 * D2R);
    surf.airbrake.set(state.ab * 50 * D2R);
    sticks.forEach((s) => s.rotation.set(r * 0.3, 0, p * 0.3));

    const up = 1 - state.gear, ease = up * up * (3 - 2 * up);
    noseGear.quaternion.setFromAxisAngle(V(0, 0, 1), ease * 92 * D2R);
    mains.forEach((g) => g.quaternion.setFromAxisAngle(g.userData.axis, ease * 88 * D2R));

    if (state.flow) fans.forEach((f) => (f.rotation.x += dt * 9));
    for (const f of flows) {
      f.inst.visible = state.flow;
      if (!state.flow || !shown(f.inst.parent)) continue;
      for (let i = 0; i < f.cnt; i++) {
        const t = (((f.off + time * f.v + i / f.cnt) % 1) + 1) % 1;
        f.curve.getPointAt(t, dummy.position);
        dummy.scale.setScalar(f.r);
        dummy.updateMatrix();
        f.inst.setMatrixAt(i, dummy.matrix);
      }
      f.inst.instanceMatrix.needsUpdate = true;
    }
    doHover();
    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  }

  applyMaterials();
  applyVisibility();
  applyExplode();
  applyLayers();
  resize();
  view('iso', true);
  raf = requestAnimationFrame(frame);

  // ---------------------------------------------------------------- API
  return {
    parts: parts.map((p) => ({ id: p.id, sys: p.sys, approx: !!p.approx, lo: p.lo || null })),
    setVisible(sys, v) { state.vis[sys] = v; applyVisibility(); },
    setFocus(sys) { state.focus = sys; applyMaterials(); applyVisibility(); },
    setSkin(v) { state.skin = v; applyMaterials(); applyVisibility(); },
    setExplode(v) { state.explode = v; applyExplode(); applyVisibility(); },
    setLayers(v) { state.layers = v; applyLayers(); applyVisibility(); },
    setFlow(v) { state.flow = v; },
    setEdges(v) { state.edges = v; applyMaterials(); },
    setStructure(v) { state.structure = !!v; applyVisibility(); },
    setLoadout(lo) { state.lo = lo; applyVisibility(); },
    setGearDown(v) { state.gearT = v ? 1 : 0; },
    setAirbrake(v) { state.abT = v ? 1 : 0; },
    setFlap(v) { state.flap = v; },
    setInputs({ pitch, roll, yaw }) { Object.assign(state, { pitch, roll, yaw }); },
    setDemo(v) { state.demo = v; if (!v) Object.assign(state, { pitch: 0, roll: 0, yaw: 0 }); },
    select(id) { if (id) select(id); else clearSel(); },
    zoomTo,
    view,
    dispose() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      controls.dispose();
      scene.traverse((o) => {
        o.geometry?.dispose();
        if (o.material) [].concat(o.material).forEach((m) => m.dispose());
      });
      renderer.dispose();
      el.remove();
      tip.remove();
    },
  };
}
