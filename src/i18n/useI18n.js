import { useContext } from 'react';
import { LanguageContext } from './LanguageContext.jsx';

/**
 * Access the i18n context: { lang, setLang, t }.
 *
 * Usage:
 *   const { t } = useI18n();
 *   return <button>{t('common.next')}</button>;
 *
 *   // with variables:
 *   {t('grading.section_label', { current: 2, total: 4 })}
 */
export function useI18n() {
  return useContext(LanguageContext);
}
