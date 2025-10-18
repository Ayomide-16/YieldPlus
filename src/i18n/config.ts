import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import fr from './locales/fr.json';
import es from './locales/es.json';
import pt from './locales/pt.json';
import ar from './locales/ar.json';
import zh from './locales/zh.json';
import yo from './locales/yo.json';
import ha from './locales/ha.json';
import ig from './locales/ig.json';
import sw from './locales/sw.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      fr: { translation: fr },
      es: { translation: es },
      pt: { translation: pt },
      ar: { translation: ar },
      zh: { translation: zh },
      yo: { translation: yo },
      ha: { translation: ha },
      ig: { translation: ig },
      sw: { translation: sw },
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
