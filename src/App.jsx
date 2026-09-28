import { useState } from 'react';
import { useI18n } from './i18n/useI18n.js';
import { SECTIONS } from './sections/index.js';

const SECTION_KEY = 'm346_section';

function initialSection() {
  try {
    const saved = localStorage.getItem(SECTION_KEY);
    if (SECTIONS.some((s) => s.id === saved)) return saved;
  } catch (e) {
    // storage may be unavailable
  }
  return SECTIONS[0].id;
}

export default function App() {
  const { t, lang, setLang } = useI18n();
  const [section, setSection] = useState(initialSection);
  const Current = (SECTIONS.find((s) => s.id === section) || SECTIONS[0]).Component;

  const choose = (id) => {
    setSection(id);
    try {
      localStorage.setItem(SECTION_KEY, id);
    } catch (e) {
      // ignore
    }
  };

  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-10 backdrop-blur bg-white/85 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-3 flex flex-wrap items-center gap-x-3 gap-y-2">
          <div className="w-9 h-9 flex-none rounded-lg bg-slate-900 text-sky-300 flex items-center justify-center font-bold text-[11px]">
            346
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-bold text-slate-900 leading-tight truncate">{t('app.title')}</h1>
            <p className="text-xs text-slate-500 leading-tight truncate">{t('app.tagline')}</p>
          </div>
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 text-xs font-semibold sm:order-3" role="group" aria-label="Language">
            {['ja', 'en'].map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                aria-pressed={lang === l}
                className={`px-2 py-1 rounded-md transition-colors ${
                  lang === l ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          {SECTIONS.length > 1 && (
            <nav className="w-full sm:w-auto sm:order-2 flex gap-1 bg-slate-100 rounded-xl p-1">
              {SECTIONS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => choose(s.id)}
                  aria-current={section === s.id ? 'page' : undefined}
                  className={`flex-1 sm:flex-none px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    section === s.id ? 'bg-white text-blue-700 shadow-sm font-medium' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className="mr-1">{s.icon}</span>
                  {t(`app.sections.${s.id}`)}
                </button>
              ))}
            </nav>
          )}
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-6">
        <Current />
      </main>
      <footer className="max-w-4xl mx-auto px-4 pb-8 text-center text-[11px] text-slate-400">{t('app.footer')}</footer>
    </div>
  );
}
