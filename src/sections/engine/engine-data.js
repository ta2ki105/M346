// M-346 engine explorer - content data
// ----------------------------------------------------------------------------
// Honeywell/ITEC F124-GA-200 low-bypass two-spool turbofan (2 per M-346).
//
// Architecture and headline figures below come from public sources
// (manufacturer press material and general references):
//   - 3-stage fan (LP compressor), fan pressure ratio ~2.5:1
//   - HP compressor: 4 axial stages + 1 centrifugal stage
//   - annular combustor, 1-stage HP turbine, 1-stage LP turbine
//   - bypass ratio ~0.47, overall pressure ratio ~19.4:1
//   - max thrust ~6,250 lbf (27.8 kN), no afterburner, FADEC control
//   - F124/F125 family dry weight ~520 kg (1,150 lb)
// Geometry in EnginePanel.jsx is a SIMPLIFIED SCHEMATIC for learning, not a
// maintenance drawing. Intermediate pressure/temperature values in GAS_PATH
// are illustrative only (only 2.5 and 19.4 are published figures).
//
// Every text field is { en, ja } so the panel can switch with the UI language.
// UI chrome (buttons, headings) lives in i18n/messages.js under `engine.*`.
// ----------------------------------------------------------------------------

export const ENGINE_SPECS = [
  { k: { en: 'Type', ja: '形式' }, v: { en: 'Low-bypass, two-spool turbofan', ja: '低バイパス比 2軸ターボファン' } },
  { k: { en: 'Max thrust', ja: '最大推力' }, v: { en: '≈ 27.8 kN (6,250 lbf) each, dry', ja: '1基あたり 約27.8 kN（6,250 lbf）・A/Bなし' } },
  { k: { en: 'Installed', ja: '搭載数' }, v: { en: '2 per M-346 (≈ 55.6 kN total)', ja: 'M-346に2基（合計 約55.6 kN）' } },
  { k: { en: 'Bypass ratio', ja: 'バイパス比' }, v: { en: '≈ 0.47 : 1', ja: '約 0.47 : 1' } },
  { k: { en: 'Fan pressure ratio', ja: 'ファン圧力比' }, v: { en: '≈ 2.5 : 1', ja: '約 2.5 : 1' } },
  { k: { en: 'Overall pressure ratio', ja: '全体圧力比' }, v: { en: '≈ 19.4 : 1', ja: '約 19.4 : 1' } },
  { k: { en: 'Dry weight (family)', ja: '乾燥重量（系列）' }, v: { en: '≈ 520 kg (1,150 lb)', ja: '約 520 kg（1,150 lb）' } },
  { k: { en: 'Control', ja: '制御' }, v: { en: 'FADEC (full-authority digital)', ja: 'FADEC（全権限デジタル制御）' } },
];

// Every drawable module. `spool` drives the "spool" colour mode.
// `temp` (0..1) drives the qualitative temperature colour mode.
export const MODULES = {
  inlet: {
    no: 1, spool: 'static', temp: 0.03,
    name: { en: 'Inlet & spinner', ja: 'インレット／スピナー' },
    short: { en: 'Inlet', ja: 'インレット' },
    role: {
      en: 'Guides air smoothly into the fan face. The spinner (nose cone) streamlines the fan hub.',
      ja: '空気を乱さずにファン前面へ導く入口部。スピナー（ノーズコーン）はファンハブ前方を整流します。',
    },
    how: {
      en: 'The M-346 airframe intakes slow the air down and deliver it to the engine with as little distortion as possible; the engine lip and spinner finish the job right in front of the first fan stage.',
      ja: '機体側のエアインテークで減速された空気を、できるだけ乱れ（ディストーション）の少ない状態で第1段ファンへ送ります。エンジン側のリップとスピナーが最後の整流を担います。',
    },
    facts: [
      { en: 'Station 0 → 2 (free stream → fan face)', ja: 'ステーション 0 → 2（自由流 → ファン前面）' },
      { en: 'The spinner rotates with the LP spool', ja: 'スピナーは低圧スプールと一緒に回転' },
    ],
    vocab: [
      { en: 'intake / inlet', ja: '空気取入口' },
      { en: 'spinner (nose cone)', ja: 'スピナー（ノーズコーン）' },
      { en: 'inlet distortion', ja: 'インレット・ディストーション（流れの乱れ）' },
      { en: 'foreign object damage (FOD)', ja: '異物吸入による損傷' },
    ],
  },
  fan: {
    no: 2, spool: 'lp', temp: 0.12,
    name: { en: 'Fan / LP compressor (3 stages)', ja: 'ファン／低圧圧縮機（3段）' },
    short: { en: 'Fan', ja: 'ファン' },
    role: {
      en: 'Three rotor stages (titanium blades) with stators between them. Raises pressure about 2.5 times and splits the flow: roughly one third goes down the bypass duct, two thirds into the core.',
      ja: 'チタン製ブレードの3段ロータとその間のステータで構成。圧力を約2.5倍に高め、流れを分けます。約1/3がバイパスダクトへ、約2/3がコア（中心部）へ流れます。',
    },
    how: {
      en: 'Rotor blades add energy (swirl + velocity); stator vanes turn the flow straight again and convert velocity into pressure. It is driven by the LP turbine through the long LP shaft.',
      ja: 'ロータブレードが空気にエネルギー（旋回と速度）を与え、ステータベーンが流れを整えて速度を圧力に変換します。駆動源は長い低圧シャフトでつながった低圧タービンです。',
    },
    facts: [
      { en: 'Fan pressure ratio ≈ 2.5 : 1', ja: 'ファン圧力比 約2.5 : 1' },
      { en: 'Bypass ratio ≈ 0.47 → ~32 % bypass / ~68 % core', ja: 'バイパス比 約0.47 → バイパス約32%／コア約68%' },
      { en: 'Part of the LP spool', ja: '低圧スプールの一部' },
    ],
    vocab: [
      { en: 'rotor blade', ja: '動翼（ロータブレード）' },
      { en: 'stator vane', ja: '静翼（ステータベーン）' },
      { en: 'stage', ja: '段（ロータ＋ステータ1組）' },
      { en: 'splitter', ja: 'スプリッタ（流れの分岐部）' },
      { en: 'compressor stall / surge', ja: '圧縮機失速／サージ' },
    ],
  },
  bypass: {
    no: 3, spool: 'static', temp: 0.12,
    name: { en: 'Fan case & bypass duct', ja: 'ファンケース／バイパスダクト' },
    short: { en: 'Bypass duct', ja: 'バイパス' },
    role: {
      en: 'The outer casing. It contains the fan and forms the outer wall of the bypass duct, the annular channel that carries fan air around the core.',
      ja: 'エンジン外側のケーシング。ファンを収め、コアの外周を回り込む環状通路（バイパスダクト）の外壁になります。',
    },
    how: {
      en: 'Bypass air is compressed only by the fan, so it stays cool. It adds thrust efficiently and helps cool the engine bay before it rejoins the hot core stream at the rear.',
      ja: 'バイパス空気はファンでしか圧縮されないため低温のまま。効率よく推力を生み、エンジン周辺を冷やしながら後方でコアの高温流と合流します。',
    },
    facts: [
      { en: 'Low bypass (≈ 0.47) = fighter-like response, good for a lead-in fighter trainer', ja: '低バイパス（約0.47）＝戦闘機的なレスポンス。LIFT（戦闘機前段練習機）向き' },
      { en: 'The fan case must contain a released blade', ja: 'ファンケースはブレード破断時の飛散を封じ込める設計' },
    ],
    vocab: [
      { en: 'bypass ratio', ja: 'バイパス比' },
      { en: 'casing', ja: 'ケーシング（外殻）' },
      { en: 'blade containment', ja: 'ブレード飛散防止' },
      { en: 'annular duct', ja: '環状ダクト' },
    ],
  },
  hpc: {
    no: 4, spool: 'hp', temp: 0.32,
    name: { en: 'HP compressor – axial (4 stages)', ja: '高圧圧縮機・軸流部（4段）' },
    short: { en: 'HPC axial', ja: '高圧軸流' },
    role: {
      en: 'Four axial stages at the front of the HP compressor keep squeezing the core air after the fan.',
      ja: '高圧圧縮機の前側4段（軸流式）。ファンを出たコア空気をさらに圧縮します。',
    },
    how: {
      en: 'Blades get shorter toward the rear because the same mass of air takes up less volume as pressure rises. The stages are on the HP spool, driven by the HP turbine.',
      ja: '圧力が上がると同じ質量の空気でも体積が小さくなるため、後段ほどブレードが短くなります。高圧タービンが駆動する高圧スプールに乗っています。',
    },
    facts: [
      { en: 'Station 2.5 → centrifugal inlet', ja: 'ステーション 2.5 → 遠心段入口' },
      { en: 'Unusual layout: axial + centrifugal in one HP compressor', ja: '珍しい構成：1つの高圧圧縮機に軸流＋遠心を組み合わせ' },
    ],
    vocab: [
      { en: 'axial compressor', ja: '軸流圧縮機' },
      { en: 'compression ratio', ja: '圧縮比' },
      { en: 'blade tip clearance', ja: 'ブレード先端すき間' },
      { en: 'bleed air', ja: '抽気（ブリードエア）' },
    ],
  },
  cfc: {
    no: 5, spool: 'hp', temp: 0.48,
    name: { en: 'HP compressor – centrifugal stage + diffuser', ja: '高圧圧縮機・遠心段＋ディフューザ' },
    short: { en: 'Centrifugal', ja: '遠心段' },
    role: {
      en: 'The 5th and final HP stage is a centrifugal impeller. It flings air outward, then the diffuser turns it back rearward and converts speed into pressure for the combustor.',
      ja: '高圧側の第5段（最終段）は遠心インペラ。空気を外側へ放り出し、ディフューザが流れを後ろ向きに戻しながら速度を圧力に変えて燃焼器へ送ります。',
    },
    how: {
      en: 'A single centrifugal stage gives a large pressure rise in a short length and is robust. After it, the air is at its highest pressure in the engine (≈ 19.4 × inlet).',
      ja: '遠心式は1段で大きな昇圧ができ、短く頑丈です。ここを出た空気がエンジン内で最も高い圧力（入口の約19.4倍）になります。',
    },
    facts: [
      { en: 'Compressor delivery = station 3', ja: '圧縮機出口＝ステーション 3' },
      { en: 'Overall pressure ratio ≈ 19.4 : 1', ja: '全体圧力比 約19.4 : 1' },
      { en: 'Heritage from the TFE731 family of Garrett/Honeywell engines', ja: 'ギャレット／ハネウェルのTFE731系の設計思想を受け継ぐ' },
    ],
    vocab: [
      { en: 'centrifugal impeller', ja: '遠心インペラ（羽根車）' },
      { en: 'diffuser', ja: 'ディフューザ（減速・昇圧部）' },
      { en: 'compressor delivery pressure', ja: '圧縮機吐出圧力' },
    ],
  },
  combustor: {
    no: 6, spool: 'static', temp: 1.0,
    name: { en: 'Annular combustor', ja: '環状燃焼器' },
    short: { en: 'Combustor', ja: '燃焼器' },
    role: {
      en: 'A ring-shaped combustion chamber around the shaft. Fuel is sprayed in and burned continuously, making the hottest gas in the engine.',
      ja: 'シャフトを囲むリング状の燃焼室。燃料を噴射して連続的に燃焼させ、エンジン内で最も高温のガスを作ります。',
    },
    how: {
      en: 'Only part of the air is used for burning (primary zone); the rest flows around the liner and enters through dilution holes to cool the gas down to a temperature the turbine can survive. Igniters light it for start.',
      ja: '燃焼に使うのは空気の一部（一次燃焼域）だけ。残りはライナーの外側を流れて希釈孔から入り、タービンが耐えられる温度までガスを冷やします。始動時はイグナイタで点火します。',
    },
    facts: [
      { en: 'Station 3 → 4 (turbine inlet)', ja: 'ステーション 3 → 4（タービン入口）' },
      { en: 'Pressure stays almost constant; temperature jumps', ja: '圧力はほぼ一定のまま、温度が急上昇' },
      { en: 'Fuel flow is scheduled by the FADEC', ja: '燃料流量はFADECが制御' },
    ],
    vocab: [
      { en: 'fuel nozzle / injector', ja: '燃料ノズル／インジェクタ' },
      { en: 'combustor liner', ja: '燃焼器ライナー' },
      { en: 'igniter', ja: 'イグナイタ（点火装置）' },
      { en: 'dilution air', ja: '希釈空気' },
      { en: 'flameout', ja: 'フレームアウト（燃焼停止）' },
    ],
  },
  hpt: {
    no: 7, spool: 'hp', temp: 0.9,
    name: { en: 'HP turbine (1 stage)', ja: '高圧タービン（1段）' },
    short: { en: 'HP turbine', ja: '高圧タービン' },
    role: {
      en: 'One stage of nozzle guide vanes plus a rotor. It extracts energy from the hottest gas to drive the whole HP compressor through the HP shaft.',
      ja: 'ノズルガイドベーン1列とロータ1段。最も高温のガスからエネルギーを取り出し、高圧シャフト経由で高圧圧縮機全体を回します。',
    },
    how: {
      en: 'The nozzle guide vanes accelerate and turn the gas onto the rotor blades. These parts work above the melting point of their metal and survive only thanks to internal cooling air and coatings.',
      ja: 'ノズルガイドベーンでガスを加速・転向させてロータブレードに当てます。部品は金属の融点を超える環境で働き、内部冷却空気とコーティングで耐えています。',
    },
    facts: [
      { en: 'Station 4 → 4.5', ja: 'ステーション 4 → 4.5' },
      { en: 'Most thermally stressed part of the engine', ja: 'エンジンで最も熱負荷の大きい部品' },
      { en: 'Part of the HP spool', ja: '高圧スプールの一部' },
    ],
    vocab: [
      { en: 'nozzle guide vane (NGV)', ja: 'ノズルガイドベーン' },
      { en: 'turbine inlet temperature (TIT)', ja: 'タービン入口温度' },
      { en: 'blade cooling', ja: 'ブレード冷却' },
      { en: 'creep', ja: 'クリープ（高温下の変形）' },
    ],
  },
  lpt: {
    no: 8, spool: 'lp', temp: 0.7,
    name: { en: 'LP turbine (1 stage)', ja: '低圧タービン（1段）' },
    short: { en: 'LP turbine', ja: '低圧タービン' },
    role: {
      en: 'The second turbine stage. It takes more energy out of the gas to drive the fan through the LP shaft, which runs through the middle of the HP shaft.',
      ja: '2つ目のタービン段。ガスからさらにエネルギーを取り出し、高圧シャフトの内側を通る低圧シャフト経由でファンを回します。',
    },
    how: {
      en: 'Because the gas has already expanded, the LP turbine blades are longer than the HP ones. The LP spool turns slower than the HP spool.',
      ja: 'ガスがすでに膨張しているため、低圧タービンのブレードは高圧側より長くなります。低圧スプールは高圧スプールより低い回転数で回ります。',
    },
    facts: [
      { en: 'Station 4.5 → 5', ja: 'ステーション 4.5 → 5' },
      { en: 'Part of the LP spool', ja: '低圧スプールの一部' },
      { en: 'Exhaust gas temperature is sensed around here', ja: '排気ガス温度（EGT）はこの付近で計測' },
    ],
    vocab: [
      { en: 'exhaust gas temperature (EGT)', ja: '排気ガス温度' },
      { en: 'spool speed (N1 / N2)', ja: 'スプール回転数（N1／N2）' },
      { en: 'expansion', ja: '膨張' },
    ],
  },
  exhaust: {
    no: 9, spool: 'static', temp: 0.55,
    name: { en: 'Mixer, tail cone & nozzle', ja: 'ミキサー／テールコーン／ノズル' },
    short: { en: 'Exhaust', ja: '排気部' },
    role: {
      en: 'Hot core gas and cool bypass air meet behind the turbines and leave through a convergent nozzle. No afterburner – the M-346 is designed for dry-thrust performance.',
      ja: 'タービン後方で高温のコア流と低温のバイパス流が合流し、先細ノズルから噴出します。アフターバーナーはなく、ドライ推力で性能を出す設計です。',
    },
    how: {
      en: 'The tail cone guides the core flow; the nozzle accelerates the gas. Thrust = mass flow × (exit velocity − flight velocity) plus a pressure term.',
      ja: 'テールコーンがコア流を整え、ノズルでガスを加速します。推力 ＝ 質量流量 ×（噴出速度 − 飛行速度）＋ 圧力項。',
    },
    facts: [
      { en: 'Station 5 → 9 (nozzle exit)', ja: 'ステーション 5 → 9（ノズル出口）' },
      { en: 'No afterburner (dry engine)', ja: 'アフターバーナーなし（ドライエンジン）' },
    ],
    vocab: [
      { en: 'exhaust nozzle', ja: '排気ノズル' },
      { en: 'tail cone', ja: 'テールコーン' },
      { en: 'afterburner / reheat', ja: 'アフターバーナー／リヒート' },
      { en: 'dry thrust', ja: 'ドライ推力（A/B不使用）' },
    ],
  },
  lpShaft: {
    no: 10, spool: 'lp', temp: 0.3,
    name: { en: 'LP shaft', ja: '低圧シャフト' },
    short: { en: 'LP shaft', ja: '低圧軸' },
    role: {
      en: 'The long inner shaft connecting the LP turbine at the back to the fan at the front. Together they are the LP spool (N1).',
      ja: '後方の低圧タービンと前方のファンをつなぐ長い内側シャフト。これらをまとめて低圧スプール（N1）と呼びます。',
    },
    how: {
      en: 'It runs concentrically inside the hollow HP shaft, so the two spools can turn at different speeds. Bearings support it at the front and rear.',
      ja: '中空の高圧シャフトの内側を同心で通るため、2つのスプールは別々の回転数で回れます。前後のベアリングで支持されます。',
    },
    facts: [
      { en: 'Fan + LP shaft + LP turbine = LP spool', ja: 'ファン＋低圧シャフト＋低圧タービン＝低圧スプール' },
      { en: 'Concentric with the HP shaft ("two-spool")', ja: '高圧シャフトと同心（＝2軸式）' },
    ],
    vocab: [
      { en: 'spool', ja: 'スプール（回転体一式）' },
      { en: 'concentric shafts', ja: '同心軸' },
      { en: 'bearing', ja: 'ベアリング（軸受）' },
    ],
  },
  hpShaft: {
    no: 11, spool: 'hp', temp: 0.45,
    name: { en: 'HP shaft', ja: '高圧シャフト' },
    short: { en: 'HP shaft', ja: '高圧軸' },
    role: {
      en: 'The short, hollow outer shaft linking the HP turbine to the HP compressor. Together they are the HP spool (N2), which also drives the accessory gearbox.',
      ja: '高圧タービンと高圧圧縮機をつなぐ短い中空の外側シャフト。まとめて高圧スプール（N2）と呼び、補機ギアボックスもここから駆動されます。',
    },
    how: {
      en: 'For engine start, the starter turns the HP spool through the gearbox until the compressor delivers enough air to light the combustor.',
      ja: '始動時はスタータがギアボックス経由で高圧スプールを回し、燃焼器に点火できるだけの空気が送られるまで加速させます。',
    },
    facts: [
      { en: 'HPC (axial + centrifugal) + HP shaft + HP turbine = HP spool', ja: '高圧圧縮機（軸流＋遠心）＋高圧シャフト＋高圧タービン＝高圧スプール' },
      { en: 'Radial drive (tower shaft) takes power off to the gearbox', ja: 'タワーシャフトで動力を取り出しギアボックスへ' },
    ],
    vocab: [
      { en: 'tower shaft / radial drive', ja: 'タワーシャフト（動力取出軸）' },
      { en: 'engine start sequence', ja: 'エンジン始動シーケンス' },
      { en: 'core speed (N2)', ja: 'コア回転数（N2）' },
    ],
  },
  agb: {
    no: 12, spool: 'acc', temp: 0.18,
    name: { en: 'Accessory gearbox', ja: '補機ギアボックス' },
    short: { en: 'Gearbox', ja: 'ギアボックス' },
    role: {
      en: 'Mounted under the engine and driven by the HP spool. It runs the engine and aircraft accessories: fuel pump, oil pump, generator and the starter input.',
      ja: 'エンジン下部に取り付けられ、高圧スプールから駆動されます。燃料ポンプ、オイルポンプ、発電機、スタータ入力などを回します。',
    },
    how: {
      en: 'A train of gears reduces the high HP-spool speed to the speed each accessory needs. Shown schematically here – the exact accessory set is simplified.',
      ja: '歯車列で高圧スプールの高回転を各補機に合った回転数へ落とします。※ここでは補機構成を簡略化して表示しています。',
    },
    facts: [
      { en: 'Driven via the tower shaft from the HP spool', ja: '高圧スプールからタワーシャフトで駆動' },
      { en: 'Fuel pump, oil pump, generator, starter (schematic)', ja: '燃料ポンプ・オイルポンプ・発電機・スタータ（概念図）' },
    ],
    vocab: [
      { en: 'accessory gearbox (AGB)', ja: '補機ギアボックス' },
      { en: 'fuel pump', ja: '燃料ポンプ' },
      { en: 'lubrication system', ja: '潤滑系統' },
      { en: 'generator', ja: '発電機' },
    ],
  },
  fadec: {
    no: 13, spool: 'acc', temp: 0.08,
    name: { en: 'FADEC', ja: 'FADEC（エンジン制御装置）' },
    short: { en: 'FADEC', ja: 'FADEC' },
    role: {
      en: 'Full Authority Digital Engine Control: the computer that runs the engine. The pilot moves the throttle; the FADEC decides the fuel flow.',
      ja: 'Full Authority Digital Engine Control（全権限デジタルエンジン制御）。パイロットはスロットルを動かすだけで、燃料流量はFADECが決めます。',
    },
    how: {
      en: 'It reads spool speeds, temperatures and pressures and meters fuel to give the requested thrust while protecting the engine from overspeed, overtemperature and surge. It also handles automatic start.',
      ja: 'スプール回転数・温度・圧力を読み取り、要求推力が出るよう燃料を調量しつつ、過回転・過熱・サージからエンジンを守ります。自動始動も担当します。',
    },
    facts: [
      { en: 'Carefree handling: no manual engine limits for the pilot to watch', ja: 'ケアフリー・ハンドリング：パイロットがエンジン制限を手動で監視する必要が少ない' },
      { en: 'Sensors: N1, N2, temperatures, pressures (schematic)', ja: 'センサ：N1、N2、温度、圧力（概念図）' },
    ],
    vocab: [
      { en: 'throttle / power lever', ja: 'スロットル／パワーレバー' },
      { en: 'fuel metering', ja: '燃料調量' },
      { en: 'overtemperature', ja: '過熱（オーバーテンプ）' },
      { en: 'overspeed', ja: '過回転（オーバースピード）' },
    ],
  },
};

export const QUIZ_POOL = ['inlet', 'fan', 'bypass', 'hpc', 'cfc', 'combustor', 'hpt', 'lpt', 'exhaust', 'lpShaft', 'hpShaft', 'agb', 'fadec'];

// Hierarchical breakdown. Leaf nodes point at one module; group nodes
// highlight every module underneath them (or an explicit `ids` list).
export const STRUCTURE_TREE = {
  id: 'root',
  label: { en: 'F124-GA-200 turbofan', ja: 'F124-GA-200 ターボファン' },
  note: { en: 'Whole engine', ja: 'エンジン全体' },
  children: [
    {
      id: 'g_cold',
      label: { en: 'Cold section', ja: '低温部（コールドセクション）' },
      note: { en: 'Compresses the air', ja: '空気を圧縮する' },
      children: [
        { id: 'inlet' },
        { id: 'fan' },
        {
          id: 'g_hpc',
          label: { en: 'HP compressor (5 stages)', ja: '高圧圧縮機（計5段）' },
          note: { en: '4 axial + 1 centrifugal', ja: '軸流4段＋遠心1段' },
          children: [{ id: 'hpc' }, { id: 'cfc' }],
        },
      ],
    },
    {
      id: 'g_hot',
      label: { en: 'Hot section', ja: '高温部（ホットセクション）' },
      note: { en: 'Burns fuel, extracts work', ja: '燃焼して仕事を取り出す' },
      children: [{ id: 'combustor' }, { id: 'hpt' }, { id: 'lpt' }],
    },
    {
      id: 'g_exh',
      label: { en: 'Flow paths & exhaust', ja: '流路と排気' },
      note: { en: 'Bypass + core → nozzle', ja: 'バイパス＋コア → ノズル' },
      children: [{ id: 'bypass' }, { id: 'exhaust' }],
    },
    {
      id: 'g_rot',
      label: { en: 'Rotating assemblies (spools)', ja: '回転系（スプール）' },
      note: { en: 'Two independent spools', ja: '独立した2本のスプール' },
      children: [
        {
          id: 'g_lp',
          label: { en: 'LP spool (N1)', ja: '低圧スプール（N1）' },
          note: { en: 'Fan ↔ LP turbine', ja: 'ファン ↔ 低圧タービン' },
          ids: ['fan', 'lpShaft', 'lpt'],
          children: [{ id: 'lpShaft' }],
        },
        {
          id: 'g_hp',
          label: { en: 'HP spool (N2)', ja: '高圧スプール（N2）' },
          note: { en: 'HPC ↔ HP turbine', ja: '高圧圧縮機 ↔ 高圧タービン' },
          ids: ['hpc', 'cfc', 'hpShaft', 'hpt'],
          children: [{ id: 'hpShaft' }],
        },
      ],
    },
    {
      id: 'g_sys',
      label: { en: 'Engine systems', ja: 'エンジン系統' },
      note: { en: 'Power take-off & control', ja: '動力取出しと制御' },
      children: [{ id: 'agb' }, { id: 'fadec' }],
    },
  ],
};

// Gas-path walkthrough, following one parcel of air front to back.
// p = pressure relative to inlet, t = qualitative temperature (0..1).
// Only p = 2.5 (fan) and p = 19.4 (compressor delivery) are published
// figures; every other value is illustrative.
export const GAS_PATH = [
  {
    station: '0–2', ids: ['inlet'], p: 1, t: 0.03,
    title: { en: 'Air enters', ja: '空気の取り入れ' },
    text: {
      en: 'Air arrives through the M-346 side intakes and is presented to the fan face, slowed down and as uniform as possible.',
      ja: 'M-346の側面インテークから入った空気が、減速・整流されてファン前面に届きます。',
    },
  },
  {
    station: '2–2.5', ids: ['fan'], p: 2.5, t: 0.12, published: true,
    title: { en: 'Fan: first squeeze and split', ja: 'ファン：最初の圧縮と分流' },
    text: {
      en: 'Three fan stages raise the pressure about 2.5×. Then the splitter divides the stream: ~1/3 bypass, ~2/3 core.',
      ja: '3段ファンで圧力が約2.5倍に。スプリッタで流れが分かれ、約1/3がバイパス、約2/3がコアへ。',
    },
  },
  {
    station: '13–16', ids: ['bypass'], p: 2.5, t: 0.12, bypass: true,
    title: { en: 'Bypass stream', ja: 'バイパス流' },
    text: {
      en: 'The bypass air skips the core entirely and flows rearward in the annular duct, still cool, carrying a share of the thrust.',
      ja: 'バイパス空気はコアを通らず環状ダクトを後方へ。低温のまま推力の一部を担います。',
    },
  },
  {
    station: '2.5–2.8', ids: ['hpc'], p: 8, t: 0.3,
    title: { en: 'Axial HP stages', ja: '高圧軸流段' },
    text: {
      en: 'Four axial stages on the HP spool keep compressing the core flow; the annulus narrows as the air gets denser.',
      ja: '高圧スプール上の軸流4段がコア流をさらに圧縮。空気が濃くなるにつれて流路が細くなります。',
    },
  },
  {
    station: '2.8–3', ids: ['cfc'], p: 19.4, t: 0.46, published: true,
    title: { en: 'Centrifugal stage', ja: '遠心段' },
    text: {
      en: 'The impeller flings the air outward; the diffuser turns it rearward. Peak pressure: ≈ 19.4× the inlet.',
      ja: 'インペラが空気を外側へ飛ばし、ディフューザが後方へ向きを変えます。最高圧力＝入口の約19.4倍。',
    },
  },
  {
    station: '3–4', ids: ['combustor', 'fadec'], p: 18.6, t: 1.0,
    title: { en: 'Combustion', ja: '燃焼' },
    text: {
      en: 'The FADEC meters fuel into the annular combustor. Pressure barely changes (small loss) but temperature peaks.',
      ja: 'FADECが調量した燃料を環状燃焼器で燃焼。圧力はほぼ変わらず（わずかな損失）、温度が最高点に。',
    },
  },
  {
    station: '4–4.5', ids: ['hpt', 'hpShaft'], p: 6.5, t: 0.8,
    title: { en: 'HP turbine', ja: '高圧タービン' },
    text: {
      en: 'The gas expands through the HP turbine, which drives the HP compressor via the HP shaft.',
      ja: 'ガスが高圧タービンで膨張し、高圧シャフトを通じて高圧圧縮機を回します。',
    },
  },
  {
    station: '4.5–5', ids: ['lpt', 'lpShaft'], p: 2.6, t: 0.64,
    title: { en: 'LP turbine', ja: '低圧タービン' },
    text: {
      en: 'The LP turbine extracts more energy and drives the fan through the LP shaft.',
      ja: '低圧タービンがさらにエネルギーを取り出し、低圧シャフトを通じてファンを回します。',
    },
  },
  {
    station: '5–9', ids: ['exhaust', 'bypass'], p: 1, t: 0.5,
    title: { en: 'Mix and exhaust', ja: '合流と排気' },
    text: {
      en: 'Core and bypass streams meet and accelerate out of the nozzle: this velocity increase is the thrust.',
      ja: 'コア流とバイパス流が合流し、ノズルから加速して噴出。この速度増加が推力になります。',
    },
  },
];
