import { useEffect } from 'react';
import { useLanguage } from '../components/LanguageContext';
import { Link, useNavigate } from 'react-router';
import { Leaf, Languages, UserCircle, GraduationCap, TreePine, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';
import { getCurrentSchoolProfile } from '../utils/schoolSession';

export function Landing() {
  const { language, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    if (getCurrentSchoolProfile()) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const schoolProfile = getCurrentSchoolProfile();

  if (schoolProfile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#ecfdf5_0%,#f8fafc_45%,#ffffff_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col">
        <header className="mb-6 flex items-center justify-end">
          <button
            onClick={toggleLanguage}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent"
          >
            <Languages className="w-4 h-4" />
            <span>{language === 'en' ? 'नेपाली' : 'English'}</span>
          </button>
        </header>

        <main className="grid flex-1 items-stretch gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-800 p-8 text-white shadow-2xl lg:p-10">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute -left-16 top-10 h-52 w-52 rounded-full bg-white/20 blur-3xl" />
              <div className="absolute right-0 top-32 h-44 w-44 rounded-full bg-lime-300/20 blur-3xl" />
              <div className="absolute bottom-0 left-1/4 h-44 w-44 rounded-full bg-white/10 blur-3xl" />
            </div>

            <div className="relative flex h-full flex-col justify-between gap-8">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15">
                    <Leaf className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-semibold tracking-tight lg:text-5xl">{t('title')}</h1>
                    <p className="mt-1 text-lg font-medium text-emerald-50/90">{t('tagline')}</p>
                  </div>
                </div>

                <p className="max-w-2xl text-base leading-7 text-emerald-50/85 lg:text-lg">
                  {t('subtitle')}
                </p>

                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-sm font-medium text-white/80">
                      <ShieldCheck className="h-4 w-4" />
                      School flow
                    </div>
                    <p className="mt-2 text-sm text-white/80">Register, track, review, and improve in one browser session.</p>
                  </div>
                  <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-sm font-medium text-white/80">
                      <Sparkles className="h-4 w-4" />
                      Student rhythm
                    </div>
                    <p className="mt-2 text-sm text-white/80">Weekly inputs feel lightweight and actionable, not static.</p>
                  </div>
                  <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-sm font-medium text-white/80">
                      <TreePine className="h-4 w-4" />
                      Climate context
                    </div>
                    <p className="mt-2 text-sm text-white/80">Designed for Nepal schools and the Harit Pathshala flow.</p>
                  </div>
                </div>
              </div>

              <div className="relative rounded-[1.75rem] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-white/60">Ready to start</p>
                    <p className="mt-1 text-2xl font-semibold">Choose your entry point</p>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-medium">
                    <Leaf className="h-4 w-4" />
                    No backend needed yet
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <Link
                    to="/register"
                    className="group rounded-2xl bg-white p-5 text-foreground transition-transform hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-primary">
                        <UserCircle className="h-8 w-8" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h2 className="text-xl font-semibold">{t('school_admin')}</h2>
                        <p className="text-sm text-muted-foreground">Register your school and continue as that school.</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>

                  <Link
                    to="/student-input"
                    className="group rounded-2xl border border-white/20 bg-white/10 p-5 text-white transition-transform hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-white">
                        <GraduationCap className="h-8 w-8" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h2 className="text-xl font-semibold">{t('student')}</h2>
                        <p className="text-sm text-white/75">Submit weekly actions from a clean, guided screen.</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-white transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-[2rem] border border-emerald-100 bg-white shadow-2xl">
            <div className="border-b border-border bg-slate-50 px-6 py-5 sm:px-8">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Visual preview</p>
              <h2 className="mt-1 text-2xl font-semibold text-foreground">A calmer first screen</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                The goal is to make the first interaction feel professional, school-focused, and easy to trust.
              </p>
            </div>

            <div className="space-y-4 p-6 sm:p-8">
              <div className="rounded-3xl bg-gradient-to-br from-emerald-50 to-lime-50 p-5 shadow-sm">
                <div className="mx-auto max-w-md rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-2xl bg-emerald-600/10 flex items-center justify-center text-primary">
                      <TreePine className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Harit Pathshala</p>
                      <p className="text-lg font-semibold text-foreground">Measure. Reduce. Grow.</p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-border p-3">
                      <p className="text-xs text-muted-foreground">School admin</p>
                      <p className="text-sm font-medium text-foreground">Start school profile</p>
                    </div>
                    <div className="rounded-2xl border border-border p-3">
                      <p className="text-xs text-muted-foreground">Student input</p>
                      <p className="text-sm font-medium text-foreground">Weekly actions</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-border bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">1</p>
                  <p className="mt-1 font-semibold text-foreground">Register</p>
                  <p className="text-sm text-muted-foreground">Capture school details.</p>
                </div>
                <div className="rounded-2xl border border-border bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">2</p>
                  <p className="mt-1 font-semibold text-foreground">Track</p>
                  <p className="text-sm text-muted-foreground">Collect school and student data.</p>
                </div>
                <div className="rounded-2xl border border-border bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">3</p>
                  <p className="mt-1 font-semibold text-foreground">Improve</p>
                  <p className="text-sm text-muted-foreground">See carbon impact clearly.</p>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
