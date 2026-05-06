import { useEffect, useRef, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import { useLanguage } from './LanguageContext';
import {
  Leaf,
  Languages,
  LayoutDashboard,
  FileText,
  BarChart3,
  Sparkles,
  ListTodo,
  HandHeart,
  Trophy,
  Globe,
  CheckCircle,
  Menu,
  X,
  ChevronDown,
  UserCircle2,
  LogOut,
} from 'lucide-react';
import { clearSchoolProfile, getCurrentSchoolProfile } from '../utils/schoolSession';

export function Layout() {
  const { language, toggleLanguage, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

            <div className="flex items-center gap-2">
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
