import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import uk from './locales/uk.json'

export const supportedLanguages = ['en', 'uk'] as const
export type SupportedLanguage = (typeof supportedLanguages)[number]

function getInitialLanguage(): SupportedLanguage {
  try {
    const saved = window.localStorage.getItem('language')
    return saved === 'uk' || saved === 'en' ? saved : 'en'
  } catch {
    return 'en'
  }
}

void i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, uk: { translation: uk } },
  lng: getInitialLanguage(),
  fallbackLng: 'en',
  supportedLngs: [...supportedLanguages],
  interpolation: { escapeValue: false },
})

i18n.on('languageChanged', language => {
  if (language !== 'en' && language !== 'uk') return
  try {
    window.localStorage.setItem('language', language)
    document.documentElement.lang = language
  } catch {
    // The selected language still applies for this session if storage is unavailable.
  }
})

export default i18n
