import { useLanguage } from '../components/LanguageContext';
import { Link } from 'react-router';
import { Leaf, Languages, UserCircle, GraduationCap } from 'lucide-react';

export function Landing() {
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex flex-col">
      <header className="p-6 flex justify-end">
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-white hover:bg-accent transition-colors"
        >
          <Languages className="w-4 h-4" />
          <span className="text-sm font-medium">
            {language === 'en' ? 'नेपाली' : 'English'}
          </span>
        </button>
      </header>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
                <Leaf className="w-10 h-10 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-4xl font-semibold text-foreground">{t('title')}</h1>
                <p className="text-lg text-primary font-medium mt-1">{t('tagline')}</p>
              </div>
            </div>

            <p className="text-muted-foreground text-lg mb-8">
              {t('subtitle')}
            </p>

            <div className="relative h-48 mb-8">
              <svg viewBox="0 0 400 200" className="w-full h-full">
                <path
                  d="M0,150 Q50,100 100,120 T200,100 T300,110 T400,90 L400,200 L0,200 Z"
                  fill="#e8f5e3"
                  opacity="0.5"
                />
                <path
                  d="M0,160 L50,140 L100,145 L150,130 L200,135 L250,125 L300,140 L350,120 L400,130"
                  stroke="#3B7A2B"
                  strokeWidth="2"
                  fill="none"
                />
                <circle cx="200" cy="80" r="30" fill="#fff" stroke="#3B7A2B" strokeWidth="2" />
                <path
                  d="M180,100 L200,60 L220,100 M180,100 L200,80 L220,100"
                  stroke="#3B7A2B"
                  strokeWidth="2"
                  fill="none"
                />
              </svg>
            </div>
          </div>

          <div className="space-y-4">
            <Link
              to="/register"
              className="block bg-primary text-primary-foreground rounded-xl p-8 hover:shadow-lg transition-shadow group"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                  <UserCircle className="w-10 h-10" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-medium mb-1">{t('school_admin')}</h2>
                  <p className="text-primary-foreground/80 text-sm">
                    Register your school and start tracking carbon footprint
                  </p>
                </div>
              </div>
            </Link>

            <Link
              to="/student-input"
              className="block bg-white border-2 border-primary text-foreground rounded-xl p-8 hover:shadow-lg transition-shadow group"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center">
                  <GraduationCap className="w-10 h-10 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-medium mb-1">{t('student')}</h2>
                  <p className="text-muted-foreground text-sm">
                    Submit your weekly environmental actions
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
