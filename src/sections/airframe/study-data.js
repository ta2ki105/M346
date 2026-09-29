// Public-source learning facts. Keep operational limits out of these cards.
// Each value carries its own applicability and source; do not merge variants.
export const SOURCES = {
  itaf: { title: 'Aeronautica Militare · T-346A (27 Jun 2024)', url: 'https://www.aeronautica.difesa.it/en/2024/06/27/t-346a-2/' },
  leonardo: { title: 'Leonardo · Aermacchi M-346 (Jan 2020)', url: 'https://aircraft.leonardo.com/documents/16114715/17989163/Aermacchi%2BM-346_brochure_ENG_new.pdf?t=1602499684962' },
  singapore: { title: 'MINDEF Singapore · M-346 (13 Jul 2018)', url: 'https://www.mindef.gov.sg/news-and-events/latest-releases/13jul18_fs/' },
};
const bi = (ja, en) => ({ ja, en });
const fact = (id, sys, part, question, answer, condition, source, page = '') => ({ id, sys, part, question, answer, condition, source, page });
export const STUDY_FACTS = [
  fact('length', 'airframe', 'fus-fwd', bi('T-346Aの全長は？', 'What is the T-346A length?'), bi('11.49 m', '11.49 m'), bi('イタリア空軍の公開諸元', 'Italian Air Force published specifications'), 'itaf'),
  fact('span', 'airframe', 'wing-R', bi('練習機型M-346の全幅は？', 'What is the trainer M-346 wingspan?'), bi('9.72 m', '9.72 m'), bi('練習機型。FAの寸法と区別', 'Trainer variant; distinguish from FA'), 'leonardo', 'PDF p.10'),
  fact('height-it', 'airframe', 'fin', bi('イタリア空軍公表のT-346A全高は？', 'What height does the Italian Air Force publish?'), bi('4.76 m', '4.76 m'), bi('他資料の4.98 mと差異あり。測定条件の違いは未確認', 'Other sources give 4.98 m; reason for the difference unverified'), 'itaf'),
  fact('height-sg', 'airframe', 'fin', bi('シンガポール国防省の2018年資料にある全高は？', 'What height is in the 2018 Singapore MINDEF fact sheet?'), bi('4.98 m', '4.98 m'), bi('RSAF紹介資料。4.76 mを一律に置き換えない', 'RSAF fact sheet; do not universally replace 4.76 m'), 'singapore'),
  fact('area', 'airframe', 'wing-L', bi('主翼基準面積は？', 'What is the reference wing area?'), bi('23.52 m²', '23.52 m²'), bi('メーカー諸元の基準面積。3Dメッシュの実測値ではない', 'Published reference area, not a mesh measurement'), 'leonardo', 'PDF p.10'),
  fact('mtow', 'airframe', 'fus-ctr', bi('イタリア空軍公表の最大離陸重量は？', 'What maximum take-off weight does the Italian Air Force publish?'), bi('9,500 kg', '9,500 kg'), bi('公開諸元。個別の搭載形態の許容重量は別途確認', 'Published specification; configuration-specific allowances differ'), 'itaf'),
  fact('engine', 'engine', 'f124', bi('エンジンの型式と搭載数は？', 'What engine type and how many?'), bi('F124-GA-200 × 2', '2 × F124-GA-200'), bi('Honeywell製ターボファン', 'Honeywell turbofans'), 'itaf'),
  fact('thrust', 'engine', 'f124', bi('イタリア空軍公表の1基あたり推力は？', 'What thrust per engine does the Italian Air Force publish?'), bi('27.9 kN', '27.9 kN'), bi('当該公開ページの丸め値。質量kgと混同しない', 'Rounded value on this public page; thrust is not mass'), 'itaf'),
  fact('internal', 'fuel', 'tank-feed', bi('内部燃料の公表容量は？', 'What is the published internal fuel capacity?'), bi('2,500 L', '2,500 L'), bi('体積。kgへの換算には燃料密度が必要', 'Volume; conversion to kg requires fuel density'), 'leonardo', 'PDF p.4'),
  fact('external', 'fuel', 'drop-wing', bi('増槽1本の公表容量は？', 'What is the published capacity of one external tank?'), bi('630 L', '630 L'), bi('最大3本の構成を記載。3D上の大きさは概略', 'Up to three tanks described; model shape is illustrative'), 'leonardo', 'PDF p.4'),
  fact('mfd', 'cockpit', 'mfd', bi('メーカー資料にあるMFDの合計数は？', 'How many MFDs does the manufacturer list?'), bi('6', '6'), bi('前後席を合わせた数', 'Total across both cockpits'), 'leonardo', 'PDF p.4'),
  fact('seat', 'cockpit', 'seats', bi('射出座席の型式は？', 'What is the ejection-seat type?'), bi('Martin-Baker Mk.IT16D', 'Martin-Baker Mk.IT16D'), bi('メーカー公開資料の表記', 'Designation in the public manufacturer brochure'), 'leonardo', 'PDF p.4'),
];

export const STUDY_UI = {
  ja: { title: '諸元を覚える', intro: '数値と適用条件をセットで確認。出典を開いて照合できます。', cards: '暗記カード', table: '諸元一覧', all: '全系統', reveal: '答えを見る', known: '覚えた', again: 'もう一度', next: '次へ', review: '要復習だけ', reset: 'この範囲をやり直す', empty: 'この範囲に復習対象はありません。', condition: '適用・注意', source: '出典', locate: '3Dで位置を見る', note: '学習用の公開諸元です。飛行・整備の判断には承認済みの現行資料を使用してください。', progress: '習得', question: '項目', answer: '値・名称', conflict: '全高は出典によって異なるため、資料名を含めて出題します。' },
  en: { title: 'Learn the specifications', intro: 'Learn each value with its applicability. Open the source to check it.', cards: 'Flashcards', table: 'Specifications', all: 'All systems', reveal: 'Reveal answer', known: 'Learned', again: 'Review again', next: 'Next', review: 'Review only', reset: 'Reset this selection', empty: 'No cards need review in this selection.', condition: 'Applicability', source: 'Source', locate: 'Locate in 3D', note: 'Public specifications for learning. Use current approved documents for flight and maintenance decisions.', progress: 'Learned', question: 'Item', answer: 'Value / name', conflict: 'Height varies by source; questions explicitly name the publication.' },
};
