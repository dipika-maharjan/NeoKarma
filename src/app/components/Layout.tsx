import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router';
import { useLanguage } from './LanguageContext.tsx';
import {
  Leaf,
  Languages,
  LayoutDashboard,
  FileText,
  BarChart3,
  ListTodo,
  HandHeart,
  Trophy,
  Globe,
  CheckCircle,
  Menu,
  X
} from 'lucide-react';

export function Layout() {
  const { language, toggleLanguage, t } = useLanguage();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: t('dashboard') },
    { path: '/data-entry', icon: FileText, label: t('data_entry') },
    { path: '/carbon-report', icon: BarChart3, label: t('carbon_report') },
    { path: '/action-plan', icon: ListTodo, label: t('action_plan') },
    { path: '/support', icon: HandHeart, label: t('support') },
    { path: '/leaderboard', icon: Trophy, label: t('leaderboard') },
    { path: '/impact-ledger', icon: Globe, label: t('impact_ledger') },
    { path: '/verification', icon: CheckCircle, label: t('verification') },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-64 bg-white border-r border-border flex-shrink-0 hidden lg:block">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <Leaf className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground">{t('title')}</h1>
              <p className="text-xs text-muted-foreground">{t('tagline')}</p>
            </div>
          </div>
        </div>

        <nav className="p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="border-b border-border bg-white sticky top-0 z-10">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 hover:bg-accent rounded-lg transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <div className="flex items-center gap-3 lg:hidden">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-primary-foreground" />
                </div>
                <h1 className="font-semibold text-foreground">{t('title')}</h1>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  {t('urban')}
                </span>
                <span className="text-sm text-muted-foreground">Kathmandu Model School</span>
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
        </header>

        {mobileMenuOpen && (
          <nav className="lg:hidden bg-white border-b border-border p-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        )}

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
