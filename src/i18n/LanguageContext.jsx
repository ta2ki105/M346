import { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { MESSAGES } from './messages.js';

export const LanguageContext = createContext({ lang: 'en', setLang: () => {}, t: (k) => k });

const STORAGE_KEY = 'm346_engine_lang';

function initialLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'ja') return saved;
  } catch (e) {
    // storage may be unavailable
  }
  return typeof navigator !== 'undefined' && navigator.language?.startsWith('ja') ? 'ja' : 'en';
}

function lookup(messages, key) {
  let cur = messages;
  for (const p of key.split('.')) {
    if (cur && typeof cur === 'object' && p in cur) cur = cur[p];
    else return null;
  }
  return cur;
}

function interpolate(template, vars) {
  if (!vars || typeof template !== 'string') return template;
  return template.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(initialLang);
  const setLang = useCallback((next) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch (e) {
      // ignore
    }
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  const t = useCallback(
    (key, vars) => {
      const v = lookup(MESSAGES[lang], key) ?? lookup(MESSAGES.en, key) ?? key;
      return typeof v === 'string' ? interpolate(v, vars) : v;
    },
    [lang]
  );
  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
