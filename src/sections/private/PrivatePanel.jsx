// Private edition only. This module is compiled into the build ONLY with
// `vite build --mode private` (see sections/index.js); the public build never
// contains it. It carries no data: the TO-derived facts are injected into the
// private HTML as an AES-GCM payload (window.__M346_PRIVATE__) by
// scripts/build-private.mjs and decrypted here with the passphrase.
// UI strings live in this file on purpose so the public bundle stays clean.
import { useState, useMemo } from 'react';
import { useI18n } from '../../i18n/useI18n.js';

const UI = {
  ja: {
    lockedTitle: 'TO照合ノート（非公開）',
    lockedText: 'この資料は暗号化されています。合言葉を入力すると、この端末の中だけで復号して表示します（通信は行いません）。',
    pass: '合言葉',
    unlock: '解除',
    wrong: '合言葉が違うか、ファイルが壊れています。',
    noPayload: 'このファイルには非公開データが含まれていません。',
    lock: '🔒 ロック',
    source: '出典',
    all: 'すべて',
    engine: 'エンジン',
    airframe: '機体',
    site: 'サイト（公開版）の記載',
    to: 'TOの記載',
    quote: '原文を表示',
    notInTo: 'TOに記載なし',
    verdict: { confirmed: '一致', partial: '一部一致', contradicted: '食い違い', not_found: 'TOに記載なし' },
    count: '{n}件',
  },
  en: {
    lockedTitle: 'TO cross-check notes (private)',
    lockedText: 'This material is encrypted. Enter the passphrase to decrypt it on this device only (no network access).',
    pass: 'Passphrase',
    unlock: 'Unlock',
    wrong: 'Wrong passphrase, or the file is damaged.',
    noPayload: 'This file does not contain private data.',
    lock: '🔒 Lock',
    source: 'Source',
    all: 'All',
    engine: 'Engine',
    airframe: 'Airframe',
    site: 'Public site says',
    to: 'TO says',
    quote: 'Show original text',
    notInTo: 'Not in the TO',
    verdict: { confirmed: 'Confirmed', partial: 'Partial', contradicted: 'Differs', not_found: 'Not in TO' },
    count: '{n}',
  },
};

const VERDICT_STYLE = {
  confirmed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  partial: 'bg-amber-100 text-amber-800 border-amber-200',
  contradicted: 'bg-rose-100 text-rose-800 border-rose-200',
  not_found: 'bg-slate-100 text-slate-600 border-slate-200',
};
const VERDICTS = ['confirmed', 'partial', 'contradicted', 'not_found'];

const b64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

async function decrypt(payload, passphrase) {
  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey('raw', enc.encode(passphrase), 'PBKDF2', false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: b64(payload.salt), iterations: payload.iter, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64(payload.iv) }, key, b64(payload.ct));
  return JSON.parse(new TextDecoder().decode(plain));
}

export default function PrivatePanel() {
  const { lang } = useI18n();
  const u = UI[lang] || UI.en;
  const L = (o) => (o ? o[lang] ?? o.en : '');
  const payload = typeof window !== 'undefined' ? window.__M346_PRIVATE__ : null;

  const [pass, setPass] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [sys, setSys] = useState('all');
  const [verdict, setVerdict] = useState('all');

  const unlock = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      setData(await decrypt(payload, pass));
      setPass('');
    } catch (err) {
      setError(u.wrong);
    } finally {
      setBusy(false);
    }
  };

  const rows = useMemo(() => {
    if (!data) return [];
    return data.checks.filter((c) => (sys === 'all' || c.sys === sys) && (verdict === 'all' || c.verdict === verdict));
  }, [data, sys, verdict]);

  const counts = useMemo(() => {
    const out = {};
    (data?.checks || []).filter((c) => sys === 'all' || c.sys === sys).forEach((c) => {
      out[c.verdict] = (out[c.verdict] || 0) + 1;
    });
    return out;
  }, [data, sys]);

  if (!payload) {
    return <p className="text-sm text-slate-500">{u.noPayload}</p>;
  }

  if (!data) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-6 fade-in">
        <p className="text-3xl mb-2">🔒</p>
        <h2 className="text-lg font-bold text-slate-900">{u.lockedTitle}</h2>
        <p className="text-sm text-slate-600 mt-1 mb-4 leading-relaxed">{u.lockedText}</p>
        <form onSubmit={unlock} className="flex gap-2">
          <label htmlFor="m346-pass" className="sr-only">
            {u.pass}
          </label>
          <input
            id="m346-pass"
            type="password"
            autoComplete="off"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            placeholder={u.pass}
            className="flex-1 min-w-0 text-sm border border-slate-300 rounded-lg px-3 py-2"
          />
          <button
            type="submit"
            disabled={busy || !pass}
            className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold disabled:opacity-40"
          >
            {busy ? '…' : u.unlock}
          </button>
        </form>
        {error && <p className="text-sm text-rose-600 mt-2">{error}</p>}
      </div>
    );
  }

  const chip = (active) =>
    `px-2.5 py-1 rounded-full text-xs border transition-colors ${
      active ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'
    }`;

  return (
    <div className="space-y-4 fade-in">
      <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 flex flex-wrap items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-amber-900">⚠️ {L(data.meta.handling)}</p>
          <p className="text-xs text-amber-800 mt-1">
            {u.source}: {data.meta.source} · {data.meta.extracted}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setData(null)}
          className="flex-none px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-xs font-semibold text-amber-900"
        >
          {u.lock}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {['all', 'engine', 'airframe'].map((s) => (
            <button key={s} type="button" onClick={() => setSys(s)} className={chip(sys === s)} aria-pressed={sys === s}>
              {u[s]}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button type="button" onClick={() => setVerdict('all')} className={chip(verdict === 'all')} aria-pressed={verdict === 'all'}>
            {u.all}
          </button>
          {VERDICTS.map((v) => (
            <button key={v} type="button" onClick={() => setVerdict(v)} className={chip(verdict === v)} aria-pressed={verdict === v}>
              {u.verdict[v]} <span className="tabular-nums opacity-70">{counts[v] || 0}</span>
            </button>
          ))}
        </div>
      </div>

      <ul className="space-y-3">
        {rows.map((c) => (
          <li key={c.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="font-mono text-[11px] text-slate-400">{c.id}</span>
              <span className="text-[11px] text-slate-500">{L(c.part)}</span>
              <span className={`ml-auto text-[11px] font-semibold border rounded-full px-2 py-0.5 ${VERDICT_STYLE[c.verdict]}`}>
                {u.verdict[c.verdict]}
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-900 mb-2">{L(c.claim)}</p>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 min-w-0">
                <p className="text-[10px] uppercase tracking-wide text-slate-500">{u.site}</p>
                <p className="text-sm text-slate-800 break-words">{c.site}</p>
              </div>
              <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 min-w-0">
                <p className="text-[10px] uppercase tracking-wide text-slate-500">{u.to}</p>
                <p className="text-sm text-slate-800 break-words">{c.to || u.notInTo}</p>
              </div>
            </div>
            {L(c.note) && <p className="text-sm text-slate-700 leading-relaxed">{L(c.note)}</p>}
            {c.quote && (
              <details className="mt-2">
                <summary className="text-xs text-blue-700 cursor-pointer select-none">
                  {u.quote} · <span className="font-mono">{c.loc}</span>
                </summary>
                <blockquote className="mt-1.5 text-xs text-slate-600 border-l-2 border-slate-300 pl-3 italic">{c.quote}</blockquote>
              </details>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
