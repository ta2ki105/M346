// Content for the airframe & systems section ({ en, ja } everywhere).
// Geometry lives in atlas-scene.js; this file only holds text and the
// system colour / layer registry that both the scene and the panel use.
//
// Accuracy: dimensions, engine, hardpoints and external load are public
// figures. Equipment positions and pipe / wire routings are illustrative and
// flagged `approx` in the scene, which the panel shows as "position approximate".

export const AIRFRAME_SPECS = [
  { k: { en: 'Length', ja: '全長' }, v: { en: '11.49 m', ja: '11.49 m' } },
  { k: { en: 'Span', ja: '全幅' }, v: { en: '9.72 m', ja: '9.72 m' } },
  { k: { en: 'Height (ItAF public data)', ja: '全高（伊空軍公表値）' }, v: { en: '4.76 m*', ja: '4.76 m※' } },
  { k: { en: 'Crew', ja: '乗員' }, v: { en: '2, stepped tandem', ja: '2（段差式タンデム）' } },
  { k: { en: 'Engines', ja: 'エンジン' }, v: { en: '2 × F124-GA-200', ja: 'F124-GA-200 ×2' } },
  { k: { en: 'Thrust (ItAF public data)', ja: '推力（伊空軍公表値）' }, v: { en: '≈ 27.9 kN each', ja: '1基 約27.9 kN' } },
  { k: { en: 'Flight controls', ja: '操縦系統' }, v: { en: 'Quadruplex digital FBW', ja: '4重冗長デジタルFBW' } },
  { k: { en: 'Internal fuel volume', ja: '内部燃料容量' }, v: { en: '2,500 L', ja: '2,500 L' } },
];

// layer: vertical slot used by "separate systems into layers" (0 = airframe level)
export const SYSTEMS = {
  airframe: {
    color: '#9aa7b4', layer: 0,
    name: { en: 'Airframe', ja: '機体構造' },
    desc: {
      en: 'Semi-monocoque fuselage with a tapered wing and leading-edge extensions (LEX), all-moving tailplanes and a single fin. The fuselage is shown as forward, centre and aft sections.',
      ja: 'セミモノコック構造の胴体に、LEX（前縁付け根延長）付きのテーパー主翼、全遊動式の水平尾翼、単垂直尾翼を組み合わせた構成。胴体は前部・中部・後部の3区画に分けて表示しています。',
    },
  },
  fctl: {
    color: '#4cc38a', layer: -3,
    name: { en: 'Flight controls', ja: '操縦系統' },
    desc: {
      en: 'Full-authority quadruplex digital fly-by-wire. Stick and pedal inputs are processed by the flight control computers (FCC), and hydraulic actuators move each surface. The FCS protects angle-of-attack and g limits ("carefree handling"). The moving surfaces stay with the wing and tail when the systems are separated into layers.',
      ja: '4重冗長のフルオーソリティ・デジタル・フライ・バイ・ワイヤ。操縦桿とペダルの入力はFCC（飛行制御コンピュータ）が処理し、油圧アクチュエータが各舵面を動かします。迎角や荷重倍数の限界を機体側で守る「ケアフリー・ハンドリング」が特徴です。舵面は主翼・尾翼と一緒に動かすため、レイヤー分離では機体側に残ります。',
    },
  },
  hyd: {
    color: '#3fa9c9', layer: -2,
    name: { en: 'Hydraulics', ja: '油圧系統' },
    desc: {
      en: 'Two independent systems, each with an engine-driven pump. They power the control-surface actuators, landing-gear retraction, wheel brakes, nose-wheel steering and the airbrake. Line routing is illustrative.',
      ja: 'エンジン駆動ポンプを持つ独立2系統。舵面アクチュエータ、脚の上げ下げ、車輪ブレーキ、前輪ステアリング、エアブレーキを駆動します。配管経路は概略です。',
    },
  },
  fuel: {
    color: '#e2a93b', layer: -1,
    name: { en: 'Fuel', ja: '燃料系統' },
    desc: {
      en: 'Fuselage tanks and integral wing tanks. A fuselage feeder tank supplies both engines and the APU. Drop tanks can be carried under the wings and fuselage, and an air-refuelling probe is optional.',
      ja: '胴体タンクと主翼のインテグラル（一体型）タンクで構成し、胴体のフィーダー（集合）タンクから左右エンジンとAPUへ供給します。翼下・胴体下に増槽を装着でき、オプションで空中給油プローブを備えます。',
    },
  },
  elec: {
    color: '#a98cf2', layer: 2,
    name: { en: 'Electrical', ja: '電気系統' },
    desc: {
      en: 'Generators driven by each engine’s accessory gearbox are the main power source. The battery covers engine start and emergencies. The power distribution unit feeds avionics, the FBW system and lighting.',
      ja: '各エンジンの補機ギアボックスで駆動する発電機が主電源です。バッテリーはエンジン始動と非常時の電源。配電盤から電子機器、FBW、照明へ給電します。',
    },
  },
  bleed: {
    color: '#e5664a', layer: 1,
    name: { en: 'Bleed air / ECS', ja: '抽気・空調系統' },
    desc: {
      en: 'Air bled from the engine compressors is cooled and regulated by a heat exchanger and the environmental control system (ECS), then used for cockpit pressurisation and air conditioning, avionics cooling, the on-board oxygen generating system (OBOGS) and the anti-g suits.',
      ja: 'エンジン圧縮機から取り出した抽気を、熱交換器と空調装置（ECS）で調温・調圧し、コックピットの与圧と空調、電子機器の冷却、OBOGS（機上酸素発生装置）、耐Gスーツに使います。',
    },
  },
  engine: {
    color: '#8c99a6', layer: 0,
    name: { en: 'Propulsion', ja: 'エンジン・APU' },
    desc: {
      en: 'Two Honeywell/ITEC F124-GA-200 low-bypass turbofans (no afterburner, FADEC control), fed by side intakes through S-shaped ducts. An APU allows engine start without ground equipment. See the Engine section for the engine itself.',
      ja: 'ハネウェル／ITEC F124-GA-200 低バイパス・ターボファン×2（アフターバーナーなし、FADEC制御）。胴体側面の空気取入口からS字ダクトで吸気します。APUで地上機材なしのエンジン始動が可能です。エンジン内部は「エンジン」の節で詳しく扱っています。',
    },
  },
  gear: {
    color: '#d6cfbf', layer: -4,
    name: { en: 'Landing gear', ja: '降着装置' },
    desc: {
      en: 'Retractable tricycle gear. The nose leg retracts forward and the main legs retract towards the fuselage (retraction paths are illustrative). Use “Gear up” to watch it move.',
      ja: '前輪式の引込脚。前脚は前方へ、主脚は胴体側へ引き込みます（引込み軌跡は概略）。「脚 上げ」で作動を確認できます。',
    },
  },
  weapons: {
    color: '#d8608a', layer: -5,
    name: { en: 'Stores', ja: '兵装・外部搭載' },
    desc: {
      en: 'Nine hardpoints: one centreline, six under the wings and two wingtip rails, with up to about 3,000 kg of external load (published figures). In training, the Embedded Tactical Training System (ETTS) can simulate radar, weapons and threats in flight. The stores shown are shape examples.',
      ja: '胴体中心線1・翼下6・翼端2の計9ハードポイント。外部搭載は最大約3,000 kg（公表値）。訓練ではETTS（組込み戦術訓練システム）で、レーダー・兵装・脅威を機上で模擬できます。表示している搭載品は形状の例です。',
    },
  },
  cockpit: {
    color: '#5d8ff0', layer: 3,
    name: { en: 'Cockpit / avionics', ja: 'コックピット・電子機器' },
    desc: {
      en: 'Stepped tandem cockpit with the rear seat raised. Three multifunction displays (MFD) in each cockpit and a HUD in the front. Martin-Baker Mk.16-family zero-zero ejection seats.',
      ja: '後席が一段高い段差式タンデム複座。各席に多機能ディスプレイ（MFD）3面、前席にHUD。射出座席はマーチン・ベーカー Mk.16系のゼロ・ゼロ座席です。',
    },
  },
};

export const SYSTEM_ORDER = ['airframe', 'fctl', 'hyd', 'fuel', 'elec', 'bleed', 'engine', 'gear', 'weapons', 'cockpit'];

export const SIDES = { L: { en: 'Left', ja: '左' }, R: { en: 'Right', ja: '右' } };

// Keyed by base id. Sided parts (id "<base>-L" / "<base>-R") get the side
// prepended: "Right wing" / "右主翼", so their English names are lower-case.
export const PARTS = {
  // ---- airframe
  'fus-fwd': {
    name: { en: 'Forward fuselage', ja: '前部胴体' },
    desc: {
      en: 'Holds the radome, the forward avionics bay, the stepped tandem cockpit and the nose-gear bay. The rear seat sits higher than the front one, giving the instructor a view forward.',
      ja: 'レドーム、前部電子機器室、段差式タンデム複座のコックピット、前脚収納部を収める区画。後席は前席より一段高く、教官の前方視界を確保しています。',
    },
  },
  'fus-ctr': {
    name: { en: 'Centre fuselage', ja: '中部胴体' },
    desc: {
      en: 'Where the wing, LEX and intakes join the fuselage. Houses the fuselage fuel tanks, main-gear bays, the dorsal airbrake and equipment such as the ECS.',
      ja: '主翼、LEX、空気取入口が結合する区画。胴体燃料タンク、主脚収納部、背面のエアブレーキ、空調装置などの機器を収めます。',
    },
  },
  'fus-aft': {
    name: { en: 'Aft fuselage', ja: '後部胴体' },
    desc: {
      en: 'Carries the two engines side by side, and the all-moving tailplanes and fin.',
      ja: '2基のエンジンを並列に収める区画。全遊動式水平尾翼と垂直尾翼が結合します。',
    },
  },
  canopy: {
    name: { en: 'Canopy', ja: 'キャノピー' },
    desc: {
      en: 'Transparent canopy over both cockpits. It is designed to let the seats pass through on ejection (method not covered here). The stepped layout gives the rear seat a forward view.',
      ja: '前席・後席を覆う透明キャノピー。射出時は座席が通過できる仕組みを持ちます（方式の詳細は省略）。段差式配置により後席からも前方視界が得られます。',
    },
  },
  wing: {
    sided: true,
    name: { en: 'wing', ja: '主翼' },
    desc: {
      en: 'Tapered wing with roughly 30° of leading-edge sweep (approximate). The main box doubles as an integral fuel tank. Three underwing hardpoints and a wingtip rail per side.',
      ja: 'テーパー翼。前縁後退角は約30度（概略）。翼内の主要部はインテグラル（一体型）燃料タンクを兼ね、翼下に3か所、翼端に1か所の搭載点を持ちます。',
    },
  },
  lex: {
    sided: true,
    name: { en: 'LEX (leading-edge extension)', ja: 'LEX（前縁付け根延長）' },
    desc: {
      en: 'A slender surface running forward from the wing root. At high angle of attack it sheds a strong vortex that delays flow separation over the wing, supporting control at high AoA. It also conditions the airflow into the intake below it.',
      ja: '主翼付け根から前方へ延びる細長い面。大迎角で強い渦を作って主翼上面の気流剥離を遅らせ、高迎角域での操縦性を支えます。下にある空気取入口への気流も整えます。',
    },
  },
  intake: {
    sided: true,
    name: { en: 'air intake', ja: '空気取入口' },
    desc: {
      en: 'Fixed intake on the fuselage side under the LEX. An S-shaped duct leads the air to the engine face.',
      ja: 'LEX下の胴体側面に置いた固定式の取入口。後方のS字ダクトでエンジン正面へ空気を導きます。',
    },
  },
  fin: {
    name: { en: 'Vertical fin', ja: '垂直尾翼' },
    desc: {
      en: 'Single fin providing directional stability, with the rudder on its trailing edge and a tail light at the top.',
      ja: '単垂直尾翼。方向安定を受け持ち、後縁にラダーを持ちます。上端に尾灯を備えます。',
    },
  },
  // ---- flight controls
  slat: {
    sided: true,
    name: { en: 'leading-edge flap', ja: '前縁フラップ' },
    desc: {
      en: 'Movable leading edge outboard of the LEX. The FCS lowers it automatically with angle of attack and speed to delay wing stall. In this model it is linked to the flap slider.',
      ja: 'LEXより外側の前縁全体に設けた可動前縁。FCSが迎角と速度に応じて自動で下げ、主翼の失速を遅らせます。このモデルでは後縁フラップのスライダーと連動して表示します。',
    },
  },
  flap: {
    sided: true,
    name: { en: 'trailing-edge flap', ja: '後縁フラップ' },
    desc: {
      en: 'Inboard trailing-edge flap, lowered for take-off and landing to add lift and reduce approach speed. Deflection angles shown are illustrative.',
      ja: '主翼内側の後縁フラップ。離着陸時に下げて揚力を増し、進入速度を下げます。表示角は概略です。',
    },
  },
  ail: {
    sided: true,
    name: { en: 'aileron', ja: 'エルロン' },
    desc: {
      en: 'Outboard trailing-edge surface. Left and right move in opposite directions to roll the aircraft; the tailplanes also move differentially to help.',
      ja: '主翼外側の補助翼。左右逆に動いてロールを制御します。水平尾翼も左右差動してロールを補助します。',
    },
  },
  stab: {
    sided: true,
    name: { en: 'all-moving tailplane', ja: '水平尾翼（スタビレーター）' },
    desc: {
      en: 'The whole tailplane pivots. Both sides together control pitch; moving them differentially adds roll control.',
      ja: '水平尾翼全体が軸まわりに回転する全遊動式。左右同時に動いてピッチを、左右差動でロールを補助します。',
    },
  },
  rudder: {
    name: { en: 'Rudder', ja: 'ラダー' },
    desc: {
      en: 'Controls yaw. The FBW coordinates it automatically to keep sideslip small.',
      ja: '垂直尾翼後縁の方向舵。ヨーを制御し、FBWが横滑りを抑えるように自動で協調させます。',
    },
  },
  airbrake: {
    name: { en: 'Dorsal airbrake', ja: 'エアブレーキ' },
    desc: {
      en: 'Single panel on the fuselage spine behind the cockpit. It hinges at its front edge and rises into the airflow to add drag for slowing down or descending.',
      ja: 'コックピット後方、胴体背面の1枚板エアブレーキ。前縁を軸に立ち上がって抗力を増やし、減速や降下に使います。',
    },
  },
  fcc: {
    name: { en: 'Flight control computers (FCC) × 4', ja: '飛行制御コンピュータ（FCC）×4' },
    desc: {
      en: 'The four channels of the quadruplex FBW. They compute surface commands from pilot inputs and inertial / air data, and vote so that one failed channel cannot pass a wrong command. Angle-of-attack and g limiting also run here.',
      ja: '4重冗長のFBWを担うコンピュータ群。操縦入力と慣性・大気データから舵面指令を計算し、1台が故障しても多数決で正しい指令を保ちます。迎角・荷重倍数の制限機能もここで働きます。',
    },
  },
  acts: {
    name: { en: 'Control-surface actuators', ja: '舵面アクチュエータ' },
    desc: {
      en: 'Hydraulic rams that move each surface on electrical commands from the FCC: tailplanes, ailerons, flaps, leading-edge flaps, rudder and airbrake.',
      ja: 'FCCの電気指令を受けて、油圧で舵面を動かす作動筒。水平尾翼・エルロン・フラップ・前縁フラップ・ラダー・エアブレーキにあります。',
    },
  },
  sticks: {
    name: { en: 'Control sticks (front / rear)', ja: '操縦桿（前席・後席）' },
    desc: {
      en: 'Centre sticks in both cockpits. Inputs go to the FCC as electrical signals; there is no mechanical link to the surfaces. The instructor in the rear can fly the aircraft in the same way.',
      ja: '前席・後席の中央操縦桿。入力は電気信号でFCCへ送られ、舵面との機械的なつながりはありません。後席の教官も同じ操縦ができます。',
    },
  },
  fbw: {
    name: { en: 'FBW signal paths', ja: 'FBW信号線' },
    desc: {
      en: 'Electrical signal paths from the sticks to the FCC and on to each actuator. On the real aircraft the four channels are routed physically apart.',
      ja: '操縦桿→FCC→各アクチュエータの電気信号経路。実機では4系統が物理的に離して配線されます。',
    },
  },
  // ---- propulsion
  f124: {
    name: { en: 'F124-GA-200 turbofans × 2', ja: 'F124-GA-200 ターボファン ×2' },
    desc: {
      en: 'Two-spool low-bypass turbofan, about 27.8 kN (6,250 lbf) each, no afterburner, FADEC controlled. With two engines the aircraft can keep flying after one fails. Light parts at the front are the fan; the darker aft part is the combustor, turbines and exhaust.',
      ja: '低バイパス比の2軸ターボファン。推力は1基あたり約27.8 kN（6,250 lbf）で、アフターバーナーは持たず、FADECで制御します。双発のため片発停止後も飛行を継続できます。図の前方がファン、後方の暗い部分が燃焼器・タービン・排気部です。',
    },
  },
  'intake-ducts': {
    name: { en: 'S-shaped intake ducts', ja: 'S字吸気ダクト' },
    desc: {
      en: 'Curved ducts from the side intakes to the engine faces nearer the centreline. They smooth the airflow and hide the fan face from direct view.',
      ja: '胴体側面の取入口から、胴体中心寄りのエンジン正面へ空気を導く曲がったダクト。流れを整え、ファン面を正面から見えにくくします。',
    },
  },
  agb: {
    name: { en: 'Accessory gearboxes', ja: '補機ギアボックス' },
    desc: {
      en: 'Take power off each engine shaft to drive the generator, hydraulic pump, fuel pump and other accessories.',
      ja: 'エンジン軸から動力を取り出し、発電機・油圧ポンプ・燃料ポンプなどの補機を駆動します。',
    },
  },
  apu: {
    name: { en: 'APU (auxiliary power unit)', ja: 'APU（補助動力装置）' },
    desc: {
      en: 'Small gas turbine that lets the aircraft start its engines and run power and air conditioning on the ground without a ground cart.',
      ja: '小型のガスタービン。地上で外部電源車なしにエンジン始動、電力供給、空調を可能にします。',
    },
  },
  // ---- fuel
  'tank-fwd': {
    name: { en: 'Forward fuselage tank', ja: '胴体前方タンク' },
    desc: {
      en: 'Fuselage tank behind the rear cockpit. It transfers fuel aft to the feeder tank. Size and shape are illustrative.',
      ja: '後席後方の胴体タンク。燃料を後方のフィーダータンクへ移送します。容量・形状は概略です。',
    },
  },
  'tank-feed': {
    name: { en: 'Feeder tank', ja: 'フィーダー（集合）タンク' },
    desc: {
      en: 'Collects fuel from the other tanks; boost pumps send it to both engines and the APU. Feeder tanks are typically built to keep feeding for a time in inverted or negative-g flight.',
      ja: '各タンクからの燃料を集め、ブーストポンプで左右エンジンとAPUへ送るタンク。背面飛行や負Gでも一定時間供給を続けられる構造を持つのが一般的です。',
    },
  },
  'tank-wing': {
    name: { en: 'Integral wing tanks', ja: '主翼インテグラルタンク' },
    desc: {
      en: 'The wing spars and skins themselves form the tank. Tanks are used in a set order to limit centre-of-gravity movement.',
      ja: '主翼の桁と外板そのものを燃料タンクとして使う一体型タンク。重心変化を抑えるよう、胴体タンクと順序を決めて消費します。',
    },
  },
  probe: {
    name: { en: 'Air-refuelling probe (optional)', ja: '空中給油プローブ（オプション）' },
    desc: {
      en: 'Removable probe on the right side of the nose. Fuel taken on board goes to the fuselage tanks.',
      ja: '機首右側に装着する空中給油用プローブ（オプション・着脱式）。受油した燃料は胴体タンクへ送られます。',
    },
  },
  'fuel-lines': {
    name: { en: 'Fuel lines', ja: '燃料配管' },
    desc: {
      en: 'Transfer lines between tanks, and feed lines from the feeder tank to both engines and the APU. Moving dots show the direction of flow.',
      ja: 'タンク間の移送配管と、フィーダータンクから左右エンジン・APUへの供給配管。動く点は燃料の向きを示します。',
    },
  },
  'drop-wing': {
    name: { en: 'Underwing drop tanks', ja: '翼下増槽' },
    desc: {
      en: 'Drop tanks on the inboard wing pylons for more range and endurance. Fuel transfers through the pylon into the wing tanks.',
      ja: '翼下内側パイロンに装着する増槽。航続距離・滞空時間を延ばし、パイロンの配管から主翼タンクへ燃料を移送します。',
    },
  },
  'drop-c': {
    name: { en: 'Centreline drop tank', ja: '胴体下増槽' },
    desc: {
      en: 'Drop tank on the centreline pylon, used for ferry flights.',
      ja: '胴体中心線パイロンに装着する増槽。フェリー飛行などで使います。',
    },
  },
  'drop-lines': {
    name: { en: 'Drop-tank transfer lines', ja: '増槽移送配管' },
    desc: {
      en: 'Lines carrying fuel from the drop tanks into the wing tanks.',
      ja: '増槽から主翼タンクへ燃料を送る配管です。',
    },
  },
  // ---- stores
  'pyl-c': {
    name: { en: 'Centreline pylon', ja: '胴体中心線パイロン' },
    desc: { en: 'Under-fuselage station for a drop tank or gun pod.', ja: '胴体下面の搭載点。増槽やガンポッドを搭載します。' },
  },
  'pyl-i': {
    name: { en: 'Inboard wing pylons', ja: '翼下内側パイロン' },
    desc: {
      en: 'Innermost underwing stations. As “wet” pylons with fuel plumbing they can carry drop tanks.',
      ja: '翼下で最も内側の搭載点。燃料配管を持つ「ウェット」パイロンとして増槽を搭載できます。',
    },
  },
  'pyl-m': {
    name: { en: 'Mid wing pylons', ja: '翼下中間パイロン' },
    desc: { en: 'Underwing stations for stores such as bombs.', ja: '爆弾などを搭載する翼下の搭載点。' },
  },
  'pyl-o': {
    name: { en: 'Outboard wing pylons', ja: '翼下外側パイロン' },
    desc: { en: 'Underwing stations for lighter stores such as rocket pods.', ja: 'ロケット弾ポッドなど比較的軽い搭載品向けの翼下搭載点。' },
  },
  rails: {
    name: { en: 'Wingtip rails', ja: '翼端ランチャーレール' },
    desc: {
      en: 'Wingtip stations for short-range infrared air-to-air missiles or training instrumentation pods.',
      ja: '翼端の搭載点。赤外線誘導の短射程空対空ミサイルや、訓練用の計測ポッドを搭載します。',
    },
  },
  aam: {
    name: { en: 'Air-to-air missile (AIM-9 class)', ja: '空対空ミサイル（AIM-9級）' },
    desc: {
      en: 'Shape example of a short-range infrared missile on the wingtip rail. In T-346A training this kind of weapon is often simulated by ETTS.',
      ja: '翼端レールに搭載する赤外線誘導の短射程空対空ミサイルの形状例。T-346Aの訓練ではETTSで模擬することが多い兵装です。',
    },
  },
  bomb: {
    name: { en: 'General-purpose bomb (Mk 82 class, 500 lb)', ja: '汎用爆弾（Mk 82級 500 lb）' },
    desc: { en: 'Shape example of a general-purpose bomb on the mid pylon.', ja: '翼下中間パイロンに搭載する汎用爆弾の形状例。' },
  },
  rocket: {
    name: { en: 'Rocket pod', ja: 'ロケット弾ポッド' },
    desc: { en: 'Shape example of a rocket pod on the outboard pylon.', ja: '翼下外側に搭載するロケット弾ポッドの形状例。' },
  },
  gunpod: {
    name: { en: 'Gun pod (12.7 mm class)', ja: 'ガンポッド（12.7 mm級）' },
    desc: {
      en: 'Shape example of a gun pod on the centreline. The M-346 has no built-in gun.',
      ja: '胴体中心線に搭載する機関銃ポッドの形状例。M-346は内蔵機関砲を持ちません。',
    },
  },
  // ---- electrical
  gen: {
    name: { en: 'Engine-driven generators × 2', ja: 'エンジン駆動発電機 ×2' },
    desc: {
      en: 'Main generators on each engine’s accessory gearbox. One generator can carry the essential load if the other fails.',
      ja: '左右エンジンの補機ギアボックスで駆動する主発電機。片側が故障しても残りの1基で必要な電力をまかなえる構成です。',
    },
  },
  battery: {
    name: { en: 'Battery', ja: 'バッテリー' },
    desc: { en: 'Power for engine / APU start and for emergencies when no generator is available.', ja: 'エンジン・APUの始動と、発電機が使えないときの非常用電源。' },
  },
  pdu: {
    name: { en: 'Power distribution (buses)', ja: '配電盤（電源バス）' },
    desc: {
      en: 'Splits generator and battery power into buses and supplies equipment by priority.',
      ja: '発電機・バッテリーからの電力を各バスに分け、優先度に応じて機器へ配ります。',
    },
  },
  nav: {
    name: { en: 'Navigation lights', ja: '航法灯' },
    desc: {
      en: 'Green on the right wingtip, red on the left, white at the tail, so other aircraft can tell which way you are heading at night.',
      ja: '右翼端が緑、左翼端が赤、尾部が白の航法灯。夜間に他機から進行方向を判別できるようにします。',
    },
  },
  harness: {
    name: { en: 'Wiring (main routes)', ja: '電気配線（主要経路）' },
    desc: {
      en: 'Main power routes: generators → distribution → cockpit, avionics, FCC and lights. Moving dots show the direction of power flow.',
      ja: '発電機→配電盤→コックピット・電子機器・FCC・照明への主な給電経路。点の動きは電力の向きを示します。',
    },
  },
  // ---- bleed / ECS
  ports: {
    name: { en: 'Engine bleed ports', ja: 'エンジン抽気口' },
    desc: { en: 'Take hot, high-pressure air from each engine compressor; either engine can supply the system.', ja: 'エンジン圧縮機から高温・高圧の空気を取り出す部分。左右どちらのエンジンからも供給できます。' },
  },
  hx: {
    name: { en: 'Heat exchanger / ram-air inlet', ja: '熱交換器・ラムエア取入口' },
    desc: { en: 'Pre-cools bleed air with outside (ram) air taken in through a small inlet.', ja: '抽気を外気（ラムエア）で予冷する熱交換器と、その冷却用の取入口。' },
  },
  ecs: {
    name: { en: 'Environmental control system (ECS)', ja: '空調装置（ECS）' },
    desc: {
      en: 'An air-cycle machine expands, cools and dries the bleed air for cockpit conditioning and pressurisation and for avionics cooling.',
      ja: 'エアサイクル・マシンで抽気を膨張・冷却し、除湿して、コックピットの空調と与圧、電子機器の冷却に供給します。',
    },
  },
  obogs: {
    name: { en: 'OBOGS', ja: 'OBOGS（機上酸素発生装置）' },
    desc: {
      en: 'On-board oxygen generating system: passes bleed air through molecular sieves (zeolite) to concentrate oxygen for both crew. No liquid-oxygen servicing is needed.',
      ja: '抽気を分子ふるい（ゼオライト）に通して酸素を濃縮し、両席のパイロットへ供給します。液体酸素の補給が要りません。',
    },
  },
  'bleed-ducts': {
    name: { en: 'Bleed & conditioned-air ducts', ja: '抽気・空調ダクト' },
    desc: {
      en: 'Bleed ducts from the engines through the heat exchanger to the ECS, and distribution ducts from the ECS to the cockpits, the forward avionics bay and OBOGS.',
      ja: 'エンジン→熱交換器→ECSの抽気ダクトと、ECSからコックピット・前部電子機器室・OBOGSへの分配ダクトです。',
    },
  },
  // ---- hydraulics
  pumps: {
    name: { en: 'Engine-driven hydraulic pumps × 2', ja: 'エンジン駆動油圧ポンプ ×2' },
    desc: {
      en: 'Variable-displacement pumps on each accessory gearbox create two independent systems, so the surfaces can still move if one is lost.',
      ja: '各エンジンの補機ギアボックスで駆動する可変容量ポンプ。左右で独立した2系統をつくり、片方が失われても舵面を動かせます。',
    },
  },
  resv: {
    name: { en: 'Reservoirs × 2', ja: '作動油リザーバー ×2' },
    desc: { en: 'Fluid tank for each system; it absorbs volume changes from temperature and actuator movement.', ja: '各系統の作動油タンク。温度変化や作動による油量の増減を吸収します。' },
  },
  hlines: {
    name: { en: 'Hydraulic lines', ja: '油圧配管' },
    desc: {
      en: 'Pressure lines from the pumps to the surface actuators, landing gear, brakes and airbrake.',
      ja: 'ポンプから各舵面アクチュエータ、主脚・前脚、ブレーキ、エアブレーキへ圧油を送る配管です。',
    },
  },
  // ---- gear
  ngear: {
    name: { en: 'Nose landing gear', ja: '前脚' },
    desc: { en: 'Single-wheel nose leg. Retracts forward; hydraulic nose-wheel steering for taxiing.', ja: '単輪の前脚。前方へ引き込み、油圧の前輪ステアリングで地上走行時の方向を制御します。' },
  },
  mgear: {
    name: { en: 'Main landing gear', ja: '主脚' },
    desc: { en: 'Two single-wheel main legs with anti-skid brakes, retracting towards the fuselage.', ja: '単輪の主脚×2。ブレーキはアンチスキッド付きで、胴体側へ引き込みます。' },
  },
  // ---- cockpit
  seats: {
    name: { en: 'Ejection seats (front / rear)', ja: '射出座席（前席・後席）' },
    desc: {
      en: 'Martin-Baker Mk.16-family zero-zero seats (usable at zero speed and zero altitude). Yellow marks roughly where the ejection handle is.',
      ja: 'マーチン・ベーカー Mk.16系のゼロ・ゼロ射出座席（地上静止状態から射出可能）。黄色は射出ハンドルの位置の目安です。',
    },
  },
  mfd: {
    name: { en: 'Instrument panels / MFDs', ja: '計器盤・MFD' },
    desc: {
      en: 'Glass cockpit with three colour multifunction displays per seat, laid out like a modern fighter. The instructor can manage what both cockpits show.',
      ja: '各席にカラー多機能ディスプレイ3面を並べたグラス・コックピット。現代の戦闘機に近い操作系で、前・後席の表示は教官が管理できます。',
    },
  },
  hud: {
    name: { en: 'Head-up display (HUD)', ja: 'HUD（ヘッドアップディスプレイ）' },
    desc: { en: 'Transparent display above the front panel that overlays flight data and aiming symbols on the pilot’s view.', ja: '前席の計器盤上に置いた透明表示器。飛行諸元や照準をパイロットの視線上に重ねて表示します。' },
  },
  avbay: {
    name: { en: 'Forward avionics bay', ja: '前部電子機器室' },
    desc: {
      en: 'Holds the mission computer, navigation (INS/GPS), radios and ETTS equipment (contents illustrative). ETTS links with ground stations and other aircraft to recreate virtual radar targets and weapons in flight.',
      ja: 'ミッションコンピュータ、航法装置（INS/GPS）、通信機、ETTS関連機器などを収める区画（構成は概略）。ETTSは地上局やほかの機体とデータリンクで結び、仮想のレーダー目標や兵装を機上で再現します。',
    },
  },
};

export function partText(id) {
  const m = /^(.*)-([LR])$/.exec(id);
  if (m && PARTS[m[1]]?.sided) return { ...PARTS[m[1]], side: m[2] };
  return PARTS[id];
}

export function partName(id, lang) {
  const p = partText(id);
  if (!p) return id;
  if (!p.side) return p.name[lang] ?? p.name.en;
  if (lang === 'ja') return SIDES[p.side].ja + p.name.ja;
  return `${SIDES[p.side].en} ${p.name.en}`;
}
