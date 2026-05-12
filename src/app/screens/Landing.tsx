import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowRight, GraduationCap, Sparkles, UserCircle } from 'lucide-react';
import { useLanguage } from '../components/LanguageContext';
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

  const copy =
    language === 'en'
      ? {
          nav: ['About', 'Impact', 'Contact'],
          heroTitle: 'Leading Nepal Towards a Carbon-Free Future',
          heroLead: 'Measure. Reduce. Grow.',
          heroBody: 'Nepal’s premier clean school climate platform for connecting schools and students.',
          adminLabel: 'Join as a School Admin',
          adminDetail: 'Register your school and begin your climate journey.',
          adminAction: 'Get Started',
          studentLabel: 'Join as a Student',
          studentDetail: 'Submit weekly actions and see your global impact.',
          studentAction: 'Log Action',
          footer: 'TOGETHER FOR A CARBON-FREE NEPAL',
          toggleLabel: 'NP',
          steps: ['Measure', 'Reduce', 'Grow'],
        }
      : {
          nav: ['हाम्रो बारेमा', 'प्रभाव', 'सम्पर्क'],
          heroTitle: 'नेपाललाई कार्बन-मुक्त भविष्यतर्फ अघि बढाउँदै',
          heroLead: 'मापन गर्नुहोस्। घटाउनुहोस्। बढाउनुहोस्।',
          heroBody: 'विद्यालय र विद्यार्थीहरूलाई जोड्ने नेपालको सफा जलवायु प्लेटफर्म।',
          adminLabel: 'विद्यालय प्रशासकका रूपमा प्रवेश गर्नुहोस्',
          adminDetail: 'आफ्नो विद्यालय दर्ता गरेर जलवायु यात्रा सुरु गर्नुहोस्।',
          adminAction: 'सुरु गर्नुहोस्',
          studentLabel: 'विद्यार्थीका रूपमा प्रवेश गर्नुहोस्',
          studentDetail: 'साप्ताहिक विवरण पठाउनुहोस् र आफ्नो प्रभाव हेर्नुहोस्।',
          studentAction: 'विवरण पठाउनुहोस्',
          footer: 'कार्बन-मुक्त नेपालको लागि सँगै',
          toggleLabel: 'EN',
          steps: ['मापन', 'विद्यालय', 'घटाउने', 'बढाउने'],
        };

  return (
    <div className="h-screen w-screen overflow-hidden bg-black">
      <div className="flex h-full w-full items-center justify-center">
        <div className="relative h-full w-full overflow-hidden bg-[#f7faf4]">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/Gemini_Generated_Image_esgyq2esgyq2esgy.png')" }}
          />
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/18 via-black/34 to-black/72" />

          <div className="relative z-10 flex h-full min-h-0 flex-col px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-7">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 px-1 py-1">
                <img
                  src="/logo.png"
                  alt="Logo"
                  className="h-16 w-16 object-contain brightness-150 contrast-110 saturate-150 drop-shadow-[0_4px_14px_rgba(255,255,255,1)] sm:h-20 sm:w-20"
                />
                <div className="flex flex-col">
                  <img
                    src="/name1.png"
                    alt="App Name"
                    className="h-10 w-auto object-contain ml-2 sm:h-12"
                  />
                  <div className="mt-1 text-[11px] font-medium tracking-[0.08em] text-emerald-100/95 drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)] text-center">
                    {language === 'en' ? 'Nepal School Climate Platform' : 'नेपाल विद्यालय जलवायु प्लेटफर्म'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <nav className="hidden items-center gap-6 text-[14px] font-medium text-slate-900 md:flex">
                  {copy.nav.map((item) => (
                    <a key={item} href="#" className="transition-colors hover:text-emerald-800">
                      {item}
                    </a>
                  ))}
                </nav>

                <button
                  onClick={toggleLanguage}
                  className="inline-flex items-center rounded-full border border-white/75 bg-white/92 px-3.5 py-1.5 text-[11px] font-semibold text-emerald-800 shadow-[0_6px_16px_rgba(15,23,42,0.10)] backdrop-blur-md transition-colors hover:bg-white"
                >
                  {copy.toggleLabel}
                </button>
              </div>
            </div>

            <div className="flex flex-1 items-center justify-center py-3 sm:py-5">
              <div className="grid w-full max-w-[1240px] items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
                <section className="max-w-[620px] text-left text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.16)]">

                  <h2 className="max-w-[580px] text-[46px] font-semibold leading-[0.98] tracking-tight text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.18)] sm:text-[58px] lg:text-[64px]">
                    {copy.heroTitle}
                  </h2>

                  <p className="mt-7 text-[24px] font-semibold text-emerald-50 sm:text-[28px]">
                    {copy.heroLead}
                  </p>

                  <p className="mt-4 max-w-[520px] text-[17px] leading-8 text-white/88 sm:text-[19px]">
                    {copy.heroBody}
                  </p>

                  <div className="mt-9 flex flex-wrap items-center gap-3.5 text-[12px] font-semibold uppercase tracking-[0.26em] text-white/90 sm:text-[13px]">
                    {copy.steps.map((step, index) => (
                      <div key={step} className="flex items-center gap-3">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/35 bg-white/10 text-[11px] tracking-normal text-white/90 backdrop-blur-sm">
                          {index + 1}
                        </span>
                        <span>{step}</span>
                        {index < copy.steps.length - 1 && <ArrowRight className="h-3.5 w-3.5 text-white/70" />}
                      </div>
                    ))}
                  </div>
                </section>

                <section className="flex justify-center lg:justify-end">
                  <div className="grid w-full max-w-[500px] gap-6 sm:grid-cols-2 lg:max-w-none">
                    <Link
                      to="/register"
                      className="group overflow-hidden rounded-[24px] border border-white/35 bg-white/96 text-foreground shadow-[0_18px_42px_rgba(15,23,42,0.16)] backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_50px_rgba(15,23,42,0.2)]"
                    >
                      <div className="h-12 bg-gradient-to-r from-emerald-800 to-emerald-600" />
                      <div className="px-6 pb-6 pt-0 text-center sm:px-7 sm:pb-7">
                        <div className="mx-auto -mt-7 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-lg shadow-emerald-700/20 ring-4 ring-white">
                          <UserCircle className="h-8 w-8" />
                        </div>
                        <h3 className="mt-6 text-[17px] font-semibold text-slate-950">{copy.adminLabel}</h3>
                        <p className="mt-3 text-[13px] leading-6 text-slate-600">{copy.adminDetail}</p>
                        <div className="mt-6 inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-[12px] font-semibold text-emerald-800 transition-colors group-hover:bg-emerald-100">
                          {copy.adminAction}
                        </div>
                      </div>
                    </Link>

                    <Link
                      to="/student-input"
                      className="group overflow-hidden rounded-[24px] border border-white/35 bg-white/96 text-foreground shadow-[0_18px_42px_rgba(15,23,42,0.16)] backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_50px_rgba(15,23,42,0.2)]"
                    >
                      <div className="h-12 bg-gradient-to-r from-lime-400 to-emerald-300" />
                      <div className="px-6 pb-6 pt-0 text-center sm:px-7 sm:pb-7">
                        <div className="mx-auto -mt-7 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 shadow-lg shadow-emerald-700/15 ring-4 ring-white">
                          <GraduationCap className="h-8 w-8" />
                        </div>
                        <h3 className="mt-6 text-[17px] font-semibold text-slate-950">{copy.studentLabel}</h3>
                        <p className="mt-3 text-[13px] leading-6 text-slate-600">{copy.studentDetail}</p>
                        <div className="mt-6 inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-[12px] font-semibold text-emerald-800 transition-colors group-hover:bg-emerald-100">
                          {copy.studentAction}
                        </div>
                      </div>
                    </Link>
                  </div>
                </section>
              </div>
            </div>

            <div className="pb-2 pt-6 text-center text-[11px] font-semibold uppercase tracking-[0.34em] text-white/85 sm:pt-7 sm:text-xs">
              <span className="inline-flex items-center gap-2 rounded-full bg-black/14 px-4 py-2 backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5 text-lime-200" />
                {copy.footer}
                <Sparkles className="h-3.5 w-3.5 text-lime-200" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
