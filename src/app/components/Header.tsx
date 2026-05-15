import { useLanguage } from './LanguageContext';

export function Header() {
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <header className="border-b border-border bg-white sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/name.png" alt="App Name" className="w-32 h-auto object-contain" />
          </div>

          <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-accent transition-colors"
          >
            <Languages className="w-4 h-4" />
            <span className="text-sm font-medium">
              {language === 'en' ? 'नेपाली' : 'English'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
