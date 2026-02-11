import { useTranslation } from 'react-i18next';
import { supportedLanguages, type SupportedLanguage } from '../i18n';

export function LanguageSelector() {
  const { i18n } = useTranslation();
  
  const handleLanguageChange = (lang: SupportedLanguage) => {
    i18n.changeLanguage(lang);
  };
  
  return (
    <div className="relative group">
      <button
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
        aria-label="Select language"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
          />
        </svg>
        <span className="hidden sm:inline">
          {supportedLanguages[i18n.language as SupportedLanguage]?.nativeName || 'Language'}
        </span>
      </button>
      
      <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="py-1" role="menu">
          {Object.entries(supportedLanguages).map(([code, lang]) => (
            <button
              key={code}
              onClick={() => handleLanguageChange(code as SupportedLanguage)}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-700 transition-colors ${
                i18n.language === code
                  ? 'text-red-400 bg-gray-700/50'
                  : 'text-gray-300'
              }`}
              role="menuitem"
              dir={lang.dir}
            >
              <span className="flex items-center justify-between">
                <span>{lang.nativeName}</span>
                <span className="text-gray-500 text-xs">{lang.name}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
