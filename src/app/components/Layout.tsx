import { useEffect, useRef, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import { useLanguage } from './LanguageContext';
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  Sparkles,
  ListTodo,
  HandHeart,
  Trophy,
  Globe,
  CheckCircle,
  ChevronDown,
  UserCircle2,
  LogOut,
} from 'lucide-react';
import { clearSchoolProfile, getCurrentSchoolProfile } from '../utils/schoolSession';

export function Layout() {
  const { language, toggleLanguage, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const schoolProfile = getCurrentSchoolProfile();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    clearSchoolProfile();
    setProfileMenuOpen(false);
    navigate('/');
  };

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: t('dashboard') },
    { path: '/data-entry', icon: FileText, label: t('data_entry') },
    { path: '/carbon-report', icon: BarChart3, label: t('carbon_report') },
    { path: '/recommendations', icon: Sparkles, label: t('actions_for_school') },
    { path: '/action-plan', icon: ListTodo, label: t('action_plan') },
    { path: '/support', icon: HandHeart, label: t('support') },
    { path: '/leaderboard', icon: Trophy, label: t('leaderboard') },
    { path: '/impact-ledger', icon: Globe, label: t('impact_ledger') },
    { path: '/verification', icon: CheckCircle, label: t('verification') },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="border-b border-border bg-white sticky top-0 z-50 w-full">
        <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/logo.png" alt="Harit Pathshala" className="w-12 h-12 object-contain" />
            <h2 className="font-semibold text-foreground">{t('title')}</h2>
          </div>

            <div className="hidden lg:block relative" ref={profileMenuRef}>
              <button
                onClick={() => setProfileMenuOpen((open) => !open)}
                className="flex items-center gap-3 rounded-full border border-border bg-white px-3 py-2 hover:bg-accent transition-colors"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <UserCircle2 className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-muted-foreground leading-none">{t('signed_in_as')}</p>
                  <p className="max-w-48 truncate text-sm font-medium text-foreground">
                    {schoolProfile?.schoolName || 'Kathmandu Model School'}
                  </p>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-border bg-white p-4 shadow-lg z-20">
                  <div className="mb-3">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{t('current_school')}</p>
                    <p className="font-semibold text-foreground break-words">
                      {schoolProfile?.schoolName || 'Kathmandu Model School'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {schoolProfile?.district || 'Kathmandu'}
                      {schoolProfile?.province ? `, ${schoolProfile.province}` : ''}
                    </p>
                    {schoolProfile?.archetype && (
                      <p className="text-xs text-primary mt-2 font-medium">{schoolProfile.archetype}</p>
                    )}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-foreground hover:bg-red-50 hover:text-red-700 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    {t('logout')}
                  </button>
                </div>
              )}
            </div>

            <div className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-white p-1 shadow-sm">
              <button
                type="button"
                onClick={() => language !== 'ne' && toggleLanguage()}
                className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
                  language === 'ne' ? 'bg-emerald-700 text-white shadow-sm' : 'text-emerald-900 hover:bg-emerald-50'
                }`}
              >
                NP
              </button>
              <button
                type="button"
                onClick={() => language !== 'en' && toggleLanguage()}
                className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
                  language === 'en' ? 'bg-emerald-700 text-white shadow-sm' : 'text-emerald-900 hover:bg-emerald-50'
                }`}
              >
                EN
              </button>
            </div>
          </div>
        </header>

      <div className="flex flex-1 pt-8">
        <aside className="fixed left-0 w-64 bg-white border-r border-border flex-shrink-0 overflow-hidden h-[calc(100vh-80px)] top-20">
          <nav className="p-4 h-full overflow-hidden">
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

        <main className="flex-1 ml-64">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
