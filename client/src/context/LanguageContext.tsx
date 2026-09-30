import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations, Language } from '../lib/translations.js';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations['en']) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('croppilot_lang') as Language;
    if (saved === 'en' || saved === 'hi') return saved;
    return 'en';
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('croppilot_lang', lang);
  }, []);

  const t = useCallback(
    (key: keyof typeof translations['en']): string => {
      const dict = translations[language] || translations['en'];
      return dict[key] || translations['en'][key] || String(key);
    },
    [language]
  );

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
