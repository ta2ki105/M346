// M-346 airframe section - content data
// ----------------------------------------------------------------------------
// Published facts used here (manufacturer material and general references):
//   - length 11.49 m, span 9.72 m, height 4.76 m
//   - empty ≈ 4,600 kg, max take-off 9,500 kg, max level speed 1,090 km/h
//   - digital fly-by-wire, quadruple redundancy
//   - wing LERX (vortex lift) + computer-controlled leading-edge flaps,
//     large trailing-edge flaps, outboard ailerons
//   - single swept fin with a large one-piece rudder
//   - all-moving horizontal tail, used differentially
//   - large forward-hinged dorsal airbrake on the fuselage spine
//   - fixed (removable) in-flight refuelling probe, right side of the nose
//   - up to nine hardpoints including wingtip rails (varies by version)
//   - Martin-Baker Mk16 zero-zero ejection seats, stepped tandem cockpit
//   - primary structure mainly aluminium alloy, titanium and steel in
//     specific areas; most fuselage skins, access panels, intakes and ducts
//     in composites (carbon fibre, Kevlar); fatigue life up to 10,000 h
// Drawings in AirframeDiagram.jsx are SIMPLIFIED LEARNING SCHEMATICS: the
// outline follows the published dimensions but internal structure, fuel
// tank layout and the material colouring are illustrative.
// ----------------------------------------------------------------------------

export const AIRFRAME_SPECS = [
  { k: { en: 'Length', ja: '全長' }, v: { en: '11.49 m', ja: '11.49 m' } },
  { k: { en: 'Wingspan', ja: '翼幅' }, v: { en: '9.72 m', ja: '9.72 m' } },
  { k: { en: 'Height', ja: '全高' }, v: { en: '4.76 m', ja: '4.76 m' } },
  { k: { en: 'Crew', ja: '乗員' }, v: { en: '2, stepped tandem', ja: '2名（段差付きタンデム）' } },
  { k: { en: 'Empty weight', ja: '空虚重量' }, v: { en: '≈ 4,600 kg', ja: '約 4,600 kg' } },
  { k: { en: 'Max take-off weight', ja: '最大離陸重量' }, v: { en: '9,500 kg', ja: '9,500 kg' } },
  { k: { en: 'Max level speed', ja: '最大水平速度' }, v: { en: '1,090 km/h', ja: '1,090 km/h' } },
  { k: { en: 'Fatigue life', ja: '疲労寿命' }, v: { en: 'up to 10,000 flight hours', ja: '最大 10,000 飛行時間' } },
];

// view: which drawing(s) the part appears in.
// movable: a control surface / moving panel (used by the "moving parts" colour mode).
// material: illustrative mapping of the published materials statement.
export const PARTS = {
  radome: {
    no: 1, view: ['top', 'side'], material: 'composite',
    name: { en: 'Radome (nose cone)', ja: 'レドーム（機首コーン）' },
    short: { en: 'Radome', ja: 'レドーム' },
    role: {
      en: 'The pointed nose. It streamlines the front of the aircraft and covers equipment in the nose.',
      ja: '尖った機首部分。機体前端を整流し、機首内の機器を覆います。',
    },
    how: {
      en: 'A radome has to be aerodynamically smooth and, where a radar or antenna sits behind it, transparent to radio waves – so it is made of non-metallic composite rather than aluminium.',
      ja: 'レドームは空力的に滑らかであることに加え、後ろにレーダーやアンテナがある場合は電波を通す必要があるため、アルミではなく非金属の複合材で作られます。',
    },
    facts: [
      { en: 'Front end of the 11.49 m fuselage', ja: '全長11.49 mの胴体の最前端' },
      { en: 'Removable for access to the nose bay', ja: '機首ベイへのアクセスのため取り外し可能' },
    ],
    vocab: [
      { en: 'radome', ja: 'レドーム（レーダードーム）' },
      { en: 'nose cone', ja: 'ノーズコーン' },
      { en: 'radio-transparent', ja: '電波透過性の' },
    ],
  },
  fwdFuselage: {
    no: 2, view: ['top', 'side'], material: 'composite',
    name: { en: 'Forward fuselage', ja: '前部胴体' },
    short: { en: 'Fwd fuselage', ja: '前胴' },
    role: {
      en: 'The section under and ahead of the cockpit. It holds avionics bays and the nose landing gear bay.',
      ja: 'コクピットの下と前方の区画。アビオニクス（電子機器）ベイや前脚の収納部があります。',
    },
    how: {
      en: 'Like the rest of the fuselage it is a semi-monocoque: ring-shaped frames and lengthwise longerons/stringers covered by a skin that shares the load.',
      ja: '胴体の他の部分と同じくセミモノコック構造です。リング状のフレームと前後方向のロンジロン／ストリンガーを外板で覆い、外板も荷重を分担します。',
    },
    facts: [
      { en: 'Nose landing gear retracts into this section', ja: '前脚はこの区画に格納される' },
      { en: 'Access panels for avionics maintenance', ja: 'アビオニクス整備用のアクセスパネル' },
    ],
    vocab: [
      { en: 'avionics bay', ja: 'アビオニクス（電子機器）ベイ' },
      { en: 'access panel', ja: 'アクセスパネル（点検口）' },
      { en: 'semi-monocoque', ja: 'セミモノコック構造' },
    ],
  },
  cockpit: {
    no: 3, view: ['top', 'side'], material: 'transparency',
    name: { en: 'Cockpit & canopy', ja: 'コクピット／キャノピー' },
    short: { en: 'Canopy', ja: 'キャノピー' },
    role: {
      en: 'Stepped tandem cockpit: the student sits in front, the instructor behind and higher so they can see over the front seat.',
      ja: '段差付きタンデム（縦列）コクピット。前席に学生、後席に教官が座り、後席は一段高くして前席越しに前方が見えるようになっています。',
    },
    how: {
      en: 'The transparent canopy is framed and hinged so crew can get in; it must withstand pressurisation, bird strikes and allow ejection through or after jettison.',
      ja: '透明なキャノピーは枠で支えられ、ヒンジで開閉して搭乗します。与圧やバードストライク（鳥衝突）に耐え、射出時には破砕または投棄できる必要があります。',
    },
    facts: [
      { en: 'Student in front, instructor behind', ja: '前席＝学生、後席＝教官' },
      { en: 'Rear seat raised for forward view', ja: '後席は前方視界のため高い位置' },
    ],
    vocab: [
      { en: 'canopy', ja: 'キャノピー（風防）' },
      { en: 'windscreen', ja: 'ウインドスクリーン（前面風防）' },
      { en: 'tandem seating', ja: 'タンデム（縦列）配置' },
      { en: 'bird strike', ja: 'バードストライク（鳥衝突）' },
    ],
  },
  seats: {
    no: 4, view: ['top', 'side'], material: 'equipment',
    name: { en: 'Ejection seats (Martin-Baker Mk16)', ja: '射出座席（マーチン・ベーカー Mk16）' },
    short: { en: 'Seats', ja: '射出座席' },
    role: {
      en: 'Two Martin-Baker Mk16-family ejection seats with zero-zero capability: they can save the crew even at zero height and zero speed.',
      ja: 'マーチン・ベーカー Mk16系の射出座席2基。ゼロ・ゼロ能力（高度ゼロ・速度ゼロでも脱出可能）を持ちます。',
    },
    how: {
      en: 'When the handle is pulled the canopy is cleared, a rocket pack fires the seat out of the aircraft, and the parachute deploys automatically.',
      ja: 'ハンドルを引くとキャノピーが除去され、ロケットで座席ごと機外へ射出、パラシュートが自動で開きます。',
    },
    facts: [
      { en: 'Zero-zero capability', ja: 'ゼロ・ゼロ能力' },
      { en: 'One seat per crew member (front and rear)', ja: '前席・後席に1基ずつ' },
    ],
    vocab: [
      { en: 'ejection seat', ja: '射出座席' },
      { en: 'zero-zero', ja: 'ゼロ・ゼロ（高度・速度ゼロで脱出可）' },
      { en: 'eject / bail out', ja: '射出する／脱出する' },
      { en: 'canopy jettison', ja: 'キャノピー投棄' },
    ],
  },
  ctrFuselage: {
    no: 5, view: ['top', 'side'], material: 'composite',
    name: { en: 'Centre fuselage', ja: '中部胴体' },
    short: { en: 'Ctr fuselage', ja: '中胴' },
    role: {
      en: 'The strongest part of the fuselage. The wings attach here and it carries internal fuel and the main landing gear loads.',
      ja: '胴体で最も頑丈な区画。主翼が取り付けられ、機内燃料と主脚からの荷重を受け持ちます。',
    },
    how: {
      en: 'Heavy wing-attach frames take the bending and lift from both wings and spread it into the fuselage shell. Primary structure is mainly aluminium alloy; most skins are composite.',
      ja: '頑丈な主翼取付フレームが左右の主翼の揚力・曲げ荷重を受け、胴体の外殻へ分散させます。主構造は主にアルミ合金、外板の多くは複合材です。',
    },
    facts: [
      { en: 'Wing-to-fuselage attachment', ja: '主翼と胴体の結合部' },
      { en: 'Internal fuel tanks (schematic in the drawing)', ja: '機内燃料タンク（図は概念図）' },
    ],
    vocab: [
      { en: 'wing attach frame', ja: '主翼取付フレーム' },
      { en: 'fuel tank', ja: '燃料タンク' },
      { en: 'primary structure', ja: '一次構造（主構造）' },
      { en: 'load path', ja: '荷重経路' },
    ],
  },
  intakes: {
    no: 6, view: ['top', 'side'], material: 'composite',
    name: { en: 'Air intakes & ducts', ja: 'エアインテーク／ダクト' },
    short: { en: 'Intakes', ja: 'インテーク' },
    role: {
      en: 'One intake on each side of the fuselage, under the LERX, feeding air through ducts to the two engines.',
      ja: '胴体の左右に1つずつ、LERXの下にあるインテーク。ダクトを通して2基のエンジンへ空気を送ります。',
    },
    how: {
      en: 'The LERX above shields the intake at high angles of attack so the engines keep a smooth airflow. Intakes and ducts are made from composites.',
      ja: '上にあるLERXが高迎え角でインテークを覆い、エンジンへ乱れの少ない空気を送り続けます。インテークとダクトは複合材製です。',
    },
    facts: [
      { en: 'Two intakes → two F124 engines (see Engine section)', ja: '2つのインテーク → 2基のF124（エンジン単元参照）' },
      { en: 'Composite intakes and ducts', ja: 'インテーク・ダクトは複合材' },
    ],
    vocab: [
      { en: 'air intake', ja: 'エアインテーク（空気取入口）' },
      { en: 'intake duct', ja: 'インテークダクト' },
      { en: 'angle of attack (AoA)', ja: '迎え角' },
    ],
  },
  lerx: {
    no: 7, view: ['top', 'side'], material: 'aluminium',
    name: { en: 'LERX (leading-edge root extension)', ja: 'LERX（主翼前縁付け根延長部）' },
    short: { en: 'LERX', ja: 'LERX' },
    role: {
      en: 'The long, sharply swept strake from the wing root forward along the fuselage. It generates a strong vortex that adds lift at high angles of attack.',
      ja: '主翼の付け根から胴体に沿って前方へ伸びる、強い後退角の張り出し。強い渦（ボルテックス）を発生させ、高迎え角で揚力を増やします。',
    },
    how: {
      en: 'At high AoA the flow separates cleanly off the sharp LERX edge and rolls up into a vortex that runs over the wing, keeping the airflow attached – this is "vortex lift". Small fins near the wing roots help keep the vortices symmetrical.',
      ja: '高迎え角では鋭いLERXの縁で流れがはく離して渦を巻き、その渦が主翼上面を流れて気流のはく離を防ぎます。これが「ボルテックス・リフト（渦揚力）」です。主翼付け根付近の小さなフィンが左右の渦を対称に保つのを助けます。',
    },
    facts: [
      { en: 'Vortex lift for high-AoA manoeuvring', ja: '高迎え角機動のための渦揚力' },
      { en: 'Also shields the intakes at high AoA', ja: '高迎え角時にインテークを覆う役割も' },
    ],
    vocab: [
      { en: 'leading-edge root extension (LERX)', ja: '前縁付け根延長部' },
      { en: 'vortex lift', ja: '渦揚力（ボルテックス・リフト）' },
      { en: 'flow separation', ja: '流れのはく離' },
      { en: 'strake', ja: 'ストレーキ' },
    ],
  },
  wing: {
    no: 8, view: ['top', 'side'], material: 'aluminium',
    name: { en: 'Wing (torsion box)', ja: '主翼（トーションボックス）' },
    short: { en: 'Wing', ja: '主翼' },
    role: {
      en: 'The main lifting surface, moderately swept, spanning 9.72 m. Its core is a box made of spars, ribs and skin.',
      ja: '揚力を生む主翼。中程度の後退角を持ち、翼幅は9.72 m。中心部は桁（スパー）・小骨（リブ）・外板で作る箱構造です。',
    },
    how: {
      en: 'Spars run span-wise and carry bending; ribs keep the aerofoil shape and pass loads to the spars; skin and stringers take shear and torsion. Together they form a torsion box, which is also a natural place for fuel.',
      ja: '桁（スパー）は翼幅方向に走って曲げを受け持ち、小骨（リブ）は翼型を保ちつつ荷重を桁へ伝えます。外板とストリンガーはせん断とねじりを受けます。これらが合わさってトーションボックス（ねじり箱）になり、燃料を入れる場所にもなります。',
    },
    facts: [
      { en: 'Span 9.72 m (incl. wingtip rails)', ja: '翼幅 9.72 m（翼端レール含む）' },
      { en: 'Carries leading-edge flaps, trailing-edge flaps, ailerons and pylons', ja: '前縁フラップ・後縁フラップ・エルロン・パイロンを装備' },
    ],
    vocab: [
      { en: 'spar', ja: '桁（スパー）' },
      { en: 'rib', ja: '小骨（リブ）' },
      { en: 'skin', ja: '外板' },
      { en: 'stringer', ja: 'ストリンガー（縦通材）' },
      { en: 'torsion box', ja: 'トーションボックス（ねじり箱）' },
      { en: 'sweep', ja: '後退角' },
    ],
  },
  leFlaps: {
    no: 9, view: ['top'], movable: true, material: 'aluminium',
    name: { en: 'Leading-edge flaps', ja: '前縁フラップ' },
    short: { en: 'LE flaps', ja: '前縁フラップ' },
    role: {
      en: 'Computer-controlled flaps along the front edge of the wing. Drooping them changes the wing camber for better lift and handling at high AoA.',
      ja: '主翼前縁に沿ったコンピュータ制御のフラップ。下げることで翼のキャンバー（反り）を変え、高迎え角での揚力と操縦性を高めます。',
    },
    how: {
      en: 'The fly-by-wire system schedules them automatically – the pilot does not select them. This gives a "variable-camber" wing.',
      ja: 'フライ・バイ・ワイヤが自動でスケジュール制御し、パイロットが操作することはありません。これにより「可変キャンバー翼」になります。',
    },
    facts: [
      { en: 'Moved by the flight control computers', ja: '飛行制御コンピュータが作動させる' },
      { en: 'Variable camber', ja: '可変キャンバー' },
    ],
    vocab: [
      { en: 'leading-edge flap', ja: '前縁フラップ' },
      { en: 'camber', ja: 'キャンバー（翼の反り）' },
      { en: 'high-lift device', ja: '高揚力装置' },
    ],
  },
  teFlaps: {
    no: 10, view: ['top'], movable: true, material: 'aluminium',
    name: { en: 'Trailing-edge flaps', ja: '後縁フラップ' },
    short: { en: 'TE flaps', ja: '後縁フラップ' },
    role: {
      en: 'Large flaps on the inner rear edge of each wing, lowered for take-off and landing to increase lift at low speed.',
      ja: '主翼後縁の内側にある大きなフラップ。離着陸時に下げて低速での揚力を増やします。',
    },
    how: {
      en: 'Lowering the flap increases camber (and wing area on some designs), so the wing makes the same lift at a lower speed – shorter take-off and landing runs.',
      ja: 'フラップを下げるとキャンバーが増え（機種によっては翼面積も増え）、より低い速度で同じ揚力が得られます。離着陸距離が短くなります。',
    },
    facts: [
      { en: 'Inboard, on the wing trailing edge', ja: '主翼後縁の内側' },
      { en: 'Used mainly for take-off and landing', ja: '主に離着陸で使用' },
    ],
    vocab: [
      { en: 'trailing-edge flap', ja: '後縁フラップ' },
      { en: 'flap setting', ja: 'フラップ位置（設定）' },
      { en: 'approach speed', ja: '進入速度' },
    ],
  },
  ailerons: {
    no: 11, view: ['top'], movable: true, material: 'aluminium',
    name: { en: 'Ailerons', ja: 'エルロン（補助翼）' },
    short: { en: 'Ailerons', ja: 'エルロン' },
    role: {
      en: 'Control surfaces on the outer rear edge of each wing. They move in opposite directions to roll the aircraft.',
      ja: '主翼後縁の外側にある操縦翼面。左右が逆方向に動いて機体をロール（横転）させます。',
    },
    how: {
      en: 'One aileron goes up (less lift), the other down (more lift), so the aircraft rolls. On the M-346 roll control is shared with the differential all-moving tail, all mixed by the fly-by-wire computers.',
      ja: '片側が上がり（揚力減）、反対側が下がる（揚力増）ことで機体がロールします。M-346ではロール操縦を差動式の全遊動水平尾翼と分担し、フライ・バイ・ワイヤが両者を混合制御します。',
    },
    facts: [
      { en: 'Outboard on the wing', ja: '主翼の外側' },
      { en: 'Roll control (with the differential tail)', ja: 'ロール操縦（差動尾翼と分担）' },
    ],
    vocab: [
      { en: 'aileron', ja: 'エルロン（補助翼）' },
      { en: 'roll', ja: 'ロール（横転）' },
      { en: 'control surface', ja: '操縦翼面（舵面）' },
    ],
  },
  hardpoints: {
    no: 12, view: ['top', 'side'], material: 'metal',
    name: { en: 'Hardpoints & wingtip rails', ja: 'ハードポイント／翼端レール' },
    short: { en: 'Hardpoints', ja: 'ハードポイント' },
    role: {
      en: 'Reinforced attachment points for pylons: under the wings, under the fuselage centreline and rails on the wingtips – up to nine in total depending on version.',
      ja: 'パイロンを取り付ける補強された取付点。主翼下、胴体中心線下、翼端レールがあり、型式により最大9か所です。',
    },
    how: {
      en: 'Some are "wet" – plumbed for external fuel tanks. In training they carry tanks, training pods or practice stores.',
      ja: '一部は「ウェット」（燃料配管あり）で外部燃料タンクを搭載できます。訓練では燃料タンク、訓練用ポッド、演習弾などを搭載します。',
    },
    facts: [
      { en: 'Up to 9 including wingtip rails (varies by version)', ja: '翼端レールを含め最大9か所（型式による）' },
      { en: 'Some are wet (external fuel)', ja: '一部はウェット（外部燃料用）' },
    ],
    vocab: [
      { en: 'hardpoint', ja: 'ハードポイント（兵装取付点）' },
      { en: 'pylon', ja: 'パイロン' },
      { en: 'wet station', ja: 'ウェット・ステーション（燃料配管付き）' },
      { en: 'external store', ja: '外部搭載物' },
    ],
  },
  rearFuselage: {
    no: 13, view: ['top', 'side'], material: 'composite',
    name: { en: 'Rear fuselage (engine bay)', ja: '後部胴体（エンジン区画）' },
    short: { en: 'Rear fuselage', ja: '後胴' },
    role: {
      en: 'Houses the two F124 engines side by side and carries the fin and the all-moving tail.',
      ja: '2基のF124エンジンを左右に並べて収め、垂直尾翼と全遊動水平尾翼を支えます。',
    },
    how: {
      en: 'Engine bays need fire protection and access doors for engine removal. The tail loads also come in here, so the aft frames are strong.',
      ja: 'エンジン区画には防火対策と、エンジン脱着用のアクセスドアが必要です。尾翼の荷重もここに入るため、後部フレームは頑丈に作られます。',
    },
    facts: [
      { en: 'Two engines side by side', ja: 'エンジン2基を横並びに搭載' },
      { en: 'Supports fin and horizontal tail', ja: '垂直尾翼と水平尾翼を支持' },
    ],
    vocab: [
      { en: 'engine bay', ja: 'エンジン区画（ベイ）' },
      { en: 'firewall', ja: '防火壁' },
      { en: 'exhaust nozzle', ja: '排気ノズル' },
    ],
  },
  airbrake: {
    no: 14, view: ['top', 'side'], movable: true, material: 'aluminium',
    name: { en: 'Dorsal airbrake', ja: '背面エアブレーキ' },
    short: { en: 'Airbrake', ja: 'エアブレーキ' },
    role: {
      en: 'A large panel on top of the fuselage spine, hinged at its front edge. Opening it adds drag to slow down or steepen a descent.',
      ja: '胴体背面にある大きなパネルで、前端がヒンジ。開くと抗力が増え、減速したり降下角を深くしたりできます。',
    },
    how: {
      en: 'Being on the top centreline it creates drag without a big pitch or roll disturbance. In the side view, the explode slider opens it.',
      ja: '機体上面の中心線上にあるため、大きなピッチやロールの乱れを起こさずに抗力を発生させます。側面図では分解スライダーで開きます。',
    },
    facts: [
      { en: 'Forward-hinged, on the spine', ja: '前ヒンジ式、胴体背面' },
      { en: 'Speed control without changing thrust', ja: '推力を変えずに速度を調整' },
    ],
    vocab: [
      { en: 'airbrake / speed brake', ja: 'エアブレーキ（スピードブレーキ）' },
      { en: 'drag', ja: '抗力' },
      { en: 'spine', ja: '胴体背面（スパイン）' },
    ],
  },
  fin: {
    no: 15, view: ['top', 'side'], material: 'aluminium',
    name: { en: 'Vertical fin', ja: '垂直尾翼' },
    short: { en: 'Fin', ja: '垂直尾翼' },
    role: {
      en: 'A single, large swept fin. It gives directional (yaw) stability – it keeps the nose pointing into the airflow.',
      ja: '大きな後退角付きの単垂直尾翼。方向（ヨー）安定を与え、機首を気流の方向に向け続けます。',
    },
    how: {
      en: 'If the aircraft yaws, the fin meets the air at an angle and makes a side force that pushes the tail back – like the feathers of an arrow.',
      ja: '機体が横を向く（ヨーする）と、尾翼が斜めに気流を受けて横向きの力が発生し、尾部を元に戻します。矢の羽根と同じ原理です。',
    },
    facts: [
      { en: 'Single fin (not twin tails)', ja: '単垂直尾翼（双尾翼ではない）' },
      { en: 'Top of fin = 4.76 m overall height', ja: '尾翼上端＝全高 4.76 m' },
    ],
    vocab: [
      { en: 'vertical stabiliser / fin', ja: '垂直安定板（垂直尾翼）' },
      { en: 'directional stability', ja: '方向安定' },
      { en: 'yaw', ja: 'ヨー（偏揺れ）' },
    ],
  },
  rudder: {
    no: 16, view: ['side'], movable: true, material: 'aluminium',
    name: { en: 'Rudder', ja: 'ラダー（方向舵）' },
    short: { en: 'Rudder', ja: 'ラダー' },
    role: {
      en: 'The large one-piece moving rear part of the fin, controlled by the rudder pedals. It yaws the nose left or right.',
      ja: '垂直尾翼の後ろにある大きな一体型の可動部。ラダーペダルで操作し、機首を左右に振ります（ヨー）。',
    },
    how: {
      en: 'Used to keep turns coordinated, to control crosswind landings and, with fly-by-wire help, at high angles of attack.',
      ja: '旋回を釣り合わせる（コーディネート）、横風着陸を制御する、そして高迎え角でFBWの補助を受けて操縦するために使います。',
    },
    facts: [
      { en: 'Large single-piece rudder', ja: '大型の一体型ラダー' },
      { en: 'Pilot input: rudder pedals', ja: '操作：ラダーペダル' },
    ],
    vocab: [
      { en: 'rudder', ja: 'ラダー（方向舵）' },
      { en: 'rudder pedals', ja: 'ラダーペダル' },
      { en: 'crosswind', ja: '横風' },
      { en: 'coordinated turn', ja: '釣り合い旋回' },
    ],
  },
  stabilator: {
    no: 17, view: ['top', 'side'], movable: true, material: 'aluminium',
    name: { en: 'All-moving horizontal tail (stabilator)', ja: '全遊動式水平尾翼（スタビレータ）' },
    short: { en: 'Stabilator', ja: '水平尾翼' },
    role: {
      en: 'Each half of the horizontal tail pivots as a whole. Together they pitch the aircraft; moved differentially they also help it roll.',
      ja: '水平尾翼の左右それぞれが丸ごと回転します。同じ向きに動けばピッチ（機首上げ下げ）、差動で動けばロールも助けます。',
    },
    how: {
      en: 'A whole moving surface is more powerful than a fixed stabiliser with an elevator, which matters at high speed and high angle of attack. There is no separate elevator.',
      ja: '面全体が動くため、固定尾翼＋昇降舵より効きが強く、高速・高迎え角で有利です。独立した昇降舵（エレベーター）はありません。',
    },
    facts: [
      { en: 'Pitch control (both halves together)', ja: 'ピッチ操縦（左右同方向）' },
      { en: 'Roll assist (halves differential)', ja: 'ロール補助（左右差動）' },
    ],
    vocab: [
      { en: 'stabilator / all-moving tail', ja: 'スタビレータ（全遊動尾翼）' },
      { en: 'taileron (differential tail)', ja: 'テイルロン（差動尾翼）' },
      { en: 'pitch', ja: 'ピッチ（縦揺れ）' },
      { en: 'elevator', ja: 'エレベーター（昇降舵）' },
    ],
  },
  noseGear: {
    no: 18, view: ['side'], material: 'steel',
    name: { en: 'Nose landing gear', ja: '前脚（ノーズギア）' },
    short: { en: 'Nose gear', ja: '前脚' },
    role: {
      en: 'The front leg of the tricycle landing gear. It steers the aircraft on the ground and retracts into the forward fuselage.',
      ja: '三脚式（トライシクル）降着装置の前の脚。地上で機体の向きを変え、前部胴体に格納されます。',
    },
    how: {
      en: 'A shock strut (oil and gas) absorbs landing and taxiing bumps; nose-wheel steering is controlled from the cockpit.',
      ja: 'ショックストラット（油と気体の緩衝脚）が着陸や地上走行の衝撃を吸収します。前輪ステアリングはコクピットから操作します。',
    },
    facts: [
      { en: 'Tricycle gear, retractable', ja: '三脚式・引込み式' },
      { en: 'Ground steering', ja: '地上での操向' },
    ],
    vocab: [
      { en: 'nose gear', ja: '前脚' },
      { en: 'nose-wheel steering', ja: '前輪ステアリング' },
      { en: 'shock strut / oleo', ja: 'ショックストラット（オレオ緩衝脚）' },
      { en: 'taxi', ja: 'タキシング（地上走行）' },
    ],
  },
  mainGear: {
    no: 19, view: ['side'], material: 'steel',
    name: { en: 'Main landing gear', ja: '主脚（メインギア）' },
    short: { en: 'Main gear', ja: '主脚' },
    role: {
      en: 'The two main legs that take most of the weight and the landing impact. They carry the wheel brakes.',
      ja: '機体重量と着陸時の衝撃の大部分を受ける左右2本の脚。車輪ブレーキを備えます。',
    },
    how: {
      en: 'Landing loads go up the strut into strong fuselage frames. Landing gear is typically high-strength steel because it must be compact and very strong.',
      ja: '着陸荷重は脚を通って胴体の頑丈なフレームへ伝わります。コンパクトで非常に強い必要があるため、一般に高強度鋼で作られます。',
    },
    facts: [
      { en: 'Carries wheel brakes', ja: '車輪ブレーキを装備' },
      { en: 'Retracts in flight', ja: '飛行中は格納' },
    ],
    vocab: [
      { en: 'main gear', ja: '主脚' },
      { en: 'wheel brake', ja: '車輪ブレーキ' },
      { en: 'gear up / gear down', ja: '脚上げ／脚下げ' },
      { en: 'touchdown', ja: '接地' },
    ],
  },
  probe: {
    no: 20, view: ['top', 'side'], material: 'metal',
    name: { en: 'In-flight refuelling probe', ja: '空中給油プローブ' },
    short: { en: 'Refuel probe', ja: '給油プローブ' },
    role: {
      en: 'A fixed but removable probe on the right side of the nose, for receiving fuel from a tanker with a hose-and-drogue system.',
      ja: '機首右側にある固定式（取り外し可能）のプローブ。ホース・ドローグ方式の空中給油機から燃料を受け取ります。',
    },
    how: {
      en: 'The pilot flies the probe into the basket (drogue) trailed by the tanker; the probe tip latches and fuel flows. In the side view it is on the far side of the nose.',
      ja: 'パイロットは給油機が曳航するバスケット（ドローグ）にプローブを差し込みます。先端が結合すると燃料が流れます。側面図では機首の向こう側にあります。',
    },
    facts: [
      { en: 'Right side of the nose', ja: '機首右側' },
      { en: 'Fixed, removable', ja: '固定式・取り外し可能' },
    ],
    vocab: [
      { en: 'air-to-air refuelling (AAR)', ja: '空中給油' },
      { en: 'probe and drogue', ja: 'プローブ・アンド・ドローグ方式' },
      { en: 'tanker', ja: '空中給油機' },
    ],
  },
};

export const MOVABLE_IDS = Object.keys(PARTS).filter((id) => PARTS[id].movable);

export const STRUCTURE_TREE = {
  id: 'root',
  label: { en: 'M-346 airframe', ja: 'M-346 機体' },
  note: { en: 'Whole aircraft', ja: '機体全体' },
  children: [
    {
      id: 'g_fus',
      label: { en: 'Fuselage', ja: '胴体' },
      note: { en: 'Nose to tail, semi-monocoque', ja: '機首から尾部まで・セミモノコック' },
      children: [
        { id: 'radome' },
        { id: 'fwdFuselage' },
        {
          id: 'g_cockpit',
          label: { en: 'Cockpit', ja: 'コクピット' },
          note: { en: 'Stepped tandem, 2 crew', ja: '段差付きタンデム・2名' },
          children: [{ id: 'cockpit' }, { id: 'seats' }],
        },
        { id: 'ctrFuselage' },
        { id: 'intakes' },
        { id: 'rearFuselage' },
        { id: 'airbrake' },
        { id: 'probe' },
      ],
    },
    {
      id: 'g_wing',
      label: { en: 'Wing', ja: '主翼' },
      note: { en: 'Lift + high-AoA devices', ja: '揚力と高迎え角対策' },
      children: [{ id: 'wing' }, { id: 'lerx' }, { id: 'leFlaps' }, { id: 'teFlaps' }, { id: 'ailerons' }, { id: 'hardpoints' }],
    },
    {
      id: 'g_tail',
      label: { en: 'Empennage (tail)', ja: '尾翼' },
      note: { en: 'Stability and control', ja: '安定と操縦' },
      children: [{ id: 'fin' }, { id: 'rudder' }, { id: 'stabilator' }],
    },
    {
      id: 'g_gear',
      label: { en: 'Landing gear', ja: '降着装置' },
      note: { en: 'Tricycle, retractable', ja: '三脚式・引込み式' },
      children: [{ id: 'noseGear' }, { id: 'mainGear' }],
    },
    {
      id: 'g_move',
      label: { en: 'Moving surfaces (cross-cutting)', ja: '可動翼面（横断グループ）' },
      note: { en: 'Everything the FBW moves', ja: 'FBWが動かすもの' },
      ids: MOVABLE_IDS,
      children: [],
    },
  ],
};

// How loads travel through the structure.
export const LOAD_PATH = [
  {
    ids: ['wing'],
    title: { en: 'Lift acts on the skin', ja: '揚力が外板に働く' },
    text: {
      en: 'Air pressure is spread over the whole wing skin. The skin is thin, so it passes the load on to the stringers and ribs underneath.',
      ja: '空気の圧力は主翼の外板全体に分布します。外板は薄いので、内側のストリンガーとリブへ荷重を渡します。',
    },
  },
  {
    ids: ['wing'],
    title: { en: 'Ribs → spars', ja: 'リブ → 桁（スパー）' },
    text: {
      en: 'Ribs collect the load and feed it into the spars. The spars bend like a diving board; the closed box of spars + skin resists twisting.',
      ja: 'リブが荷重を集めて桁へ送ります。桁は飛び込み板のようにしなって曲げを受け、桁と外板で作る閉じた箱がねじれに抵抗します。',
    },
  },
  {
    ids: ['wing', 'ctrFuselage'],
    title: { en: 'Wing → fuselage', ja: '主翼 → 胴体' },
    text: {
      en: 'At the root, the spars bolt to heavy wing-attach frames in the centre fuselage. Left and right wing bending balance each other through the fuselage.',
      ja: '付け根で桁が中胴の頑丈な主翼取付フレームに結合されます。左右の主翼の曲げは胴体を介して互いに釣り合います。',
    },
  },
  {
    ids: ['radome', 'fwdFuselage', 'ctrFuselage', 'rearFuselage'],
    title: { en: 'Through the fuselage shell', ja: '胴体の外殻を伝わる' },
    text: {
      en: 'Frames, longerons and skin (semi-monocoque) carry the load along the fuselage, holding up the nose, cockpit, engines and tail – about 4.6 tonnes empty, up to 9.5 tonnes loaded.',
      ja: 'フレーム・ロンジロン・外板（セミモノコック）が胴体に沿って荷重を運び、機首・コクピット・エンジン・尾翼を支えます。空虚重量約4.6トン、最大9.5トン。',
    },
  },
  {
    ids: ['fin', 'rudder', 'stabilator', 'rearFuselage'],
    title: { en: 'Tail loads', ja: '尾翼の荷重' },
    text: {
      en: 'The fin and the all-moving tail produce control and trim forces; these go into the strong aft frames of the rear fuselage.',
      ja: '垂直尾翼と全遊動水平尾翼が操縦力・トリム力を生み、その荷重は後胴の頑丈な後部フレームに入ります。',
    },
  },
  {
    ids: ['noseGear', 'mainGear', 'ctrFuselage', 'fwdFuselage'],
    title: { en: 'On the ground: landing gear', ja: '地上：降着装置' },
    text: {
      en: 'At touchdown the shock struts absorb the impact and pass the rest into the gear-attach frames – a completely different load path from flight.',
      ja: '接地時はショックストラットが衝撃を吸収し、残りを脚取付フレームへ伝えます。飛行中とはまったく異なる荷重経路です。',
    },
  },
];

// Structural element types shown by the "internal structure" layer.
export const STRUCT_ELEMENTS = [
  {
    id: 'spar', color: '#fbbf24',
    name: { en: 'Spar', ja: '桁（スパー）' },
    text: { en: 'Main span-wise beam of the wing; carries bending.', ja: '主翼の翼幅方向の主梁。曲げを受け持つ。' },
  },
  {
    id: 'rib', color: '#38bdf8',
    name: { en: 'Rib', ja: '小骨（リブ）' },
    text: { en: 'Chord-wise member; keeps the aerofoil shape.', ja: '翼弦方向の部材。翼型の形を保つ。' },
  },
  {
    id: 'frame', color: '#a78bfa',
    name: { en: 'Frame', ja: 'フレーム（円框）' },
    text: { en: 'Ring across the fuselage; keeps its cross-section.', ja: '胴体を輪切りにするリング。断面形を保つ。' },
  },
  {
    id: 'longeron', color: '#34d399',
    name: { en: 'Longeron / stringer', ja: 'ロンジロン／ストリンガー' },
    text: { en: 'Lengthwise member; carries fuselage bending.', ja: '前後方向の部材。胴体の曲げを受け持つ。' },
  },
  {
    id: 'fuel', color: '#0ea5e9',
    name: { en: 'Fuel tanks (schematic)', ja: '燃料タンク（概念図）' },
    text: { en: 'Shown schematically – layout simplified.', ja: '配置は簡略化した概念図。' },
  },
];

export const MATERIALS = {
  composite: { color: '#a78bfa', name: { en: 'Composite skin (CFRP / Kevlar)', ja: '複合材外板（CFRP／ケブラー）' } },
  aluminium: { color: '#94a3b8', name: { en: 'Aluminium alloy', ja: 'アルミ合金' } },
  steel: { color: '#f59e0b', name: { en: 'High-strength steel', ja: '高強度鋼' } },
  metal: { color: '#fcd34d', name: { en: 'Metal fittings', ja: '金属部品' } },
  transparency: { color: '#7dd3fc', name: { en: 'Transparency', ja: '透明材' } },
  equipment: { color: '#fb7185', name: { en: 'Equipment', ja: '装備品' } },
};
