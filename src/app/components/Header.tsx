import { useLanguage } from './LanguageContext';
import { Leaf, Languages } from 'lucide-react';

export function Header() {
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <header className="border-b border-border bg-white sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <Leaf className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                {t('title')}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t('subtitle')}
              </p>
            </div>
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
