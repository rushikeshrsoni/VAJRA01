import React from 'react';
import { useLanguage } from '../context/LanguageContext.js';
import { Languages } from 'lucide-react';

export const LanguageToggle: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="inline-flex items-center rounded-lg bg-slate-100 p-0.5 border border-slate-200 shadow-inner">
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
          language === 'en'
            ? 'bg-white text-emerald-800 shadow-sm'
            : 'text-slate-600 hover:text-slate-900'
        }`}
        title="Switch to English"
      >
        {!compact && <Languages className="w-3.5 h-3.5 text-emerald-600" />}
        English
      </button>
      <button
        type="button"
        onClick={() => setLanguage('hi')}
        className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
          language === 'hi'
            ? 'bg-white text-emerald-800 shadow-sm font-medium'
            : 'text-slate-600 hover:text-slate-900'
        }`}
        title="हिंदी भाषा चुनें"
      >
        {!compact && <span className="text-xs">🇮🇳</span>}
        हिन्दी
      </button>
    </div>
  );
};
