import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { ChevronRight, Flame, Sparkles, TreePine } from 'lucide-react';
import { useLanguage } from '../components/LanguageContext';
import {
  addStudentData,
  calculateStudentEmissions,
  getSchoolAverageDistance,
  getStudentSubmissionCountBySchool,
} from '../utils/studentDataStorage';
import SCHOOLS from '../data/schools';
import { getCurrentSchoolProfile } from '../utils/schoolSession';

type SubmissionSummary = {
  schoolName: string;
  transport: string;
  plastic: boolean;
  foodWaste: boolean;
  distanceKm: number;
  emissions: number;
};

type TransportOption = {
  value: string;
  icon: 'walking' | 'bus' | 'motorbike' | 'car' | 'bike';
  label: {
    en: string;
    ne: string;
  };
};

const TRANSPORT_OPTIONS: TransportOption[] = [
  { value: 'walking', icon: 'walking', label: { en: 'Walking', ne: 'हिँडेर' } },
  { value: 'bus', icon: 'bus', label: { en: 'Bus', ne: 'बस' } },
  { value: 'motorbike', icon: 'motorbike', label: { en: 'Motorbike', ne: 'मोटरसाइकल' } },
  { value: 'car', icon: 'car', label: { en: 'Car', ne: 'कार' } },
  { value: 'bike', icon: 'bike', label: { en: 'Bicycle', ne: 'साइकल' } },
];

const COPY = {
  en: {
    pageTitle: 'Student Weekly Input',
    cardTitle: "This Week's Activity",
    cardSubtitle: 'Log the weekly habits that shape your carbon footprint.',
    transportPrompt: '1. How did you come to school today?',
    schoolPrompt: 'Select your school',
    schoolPlaceholder: 'Choose school',
    plasticPrompt: '2. Did you bring single-use plastic?',
    foodPrompt: '3. Did you waste food today?',
    yes: 'Yes',
    no: 'No',
    submit: 'Submit This Week',
    streakPrefix: 'You have submitted',
    streakSuffix: 'weeks in a row!',
    streakHint: 'Keep the momentum going.',
    savedLabel: 'Saved locally',
    illustrationTitle: 'Green habits grow here',
    illustrationBody: 'Small weekly actions become visible progress.',
    successBadge: 'Weekly submission complete',
    successTitle: 'Thank you for this week.',
    successBody: 'Your carbon choices are now saved. The report opens automatically.',
    successTrees: 'Trees saved',
    successStreak: 'Weekly streak',
    successReport: 'Your report is ready whenever you want it.',
    successReset: 'Submit another week',
    successView: 'View carbon report now',
    impactSaved: 'Impact saved',
    impactSnapshot: 'Weekly snapshot',
    transportLabel: 'Transport',
    flagsLabel: 'Flags',
    roundTripLabel: 'round trip',
    baselineLabel: 'Baseline',
    currentLabel: 'Your entry',
    lowImpact: 'Low-impact week achieved',
  },
  ne: {
    pageTitle: 'विद्यार्थी साप्ताहिक प्रविष्टि',
    cardTitle: 'यस हप्ता तपाईंको गतिविधि',
    cardSubtitle: 'साप्ताहिक बानीहरू दर्ता गर्नुहोस् जसले तपाईंको कार्बन पदचिह्नलाई आकार दिन्छ।',
    transportPrompt: '1. तपाईं आज विद्यालय कसरी आउनुभयो?',
    schoolPrompt: 'आफ्नो विद्यालय चयन गर्नुहोस्',
    schoolPlaceholder: 'विद्यालय छान्नुहोस्',
    plasticPrompt: '2. के तपाईंले एक पटक प्रयोग हुने प्लास्टिक ल्याउनुभयो?',
    foodPrompt: '3. के तपाईंले आज खाना बर्बाद गर्नुभयो?',
    yes: 'हो',
    no: 'होइन',
    submit: 'यो हप्ता पेश गर्नुहोस्',
    streakPrefix: 'तपाईंले लगातार',
    streakSuffix: 'हप्ता बुझाउनुभयो!',
    streakHint: 'यो गति कायम राख्नुहोस्।',
    savedLabel: 'लोकल रूपमा सुरक्षित',
    illustrationTitle: 'हरियो बानीहरू यहीं बढ्छन्',
    illustrationBody: 'सानो साप्ताहिक प्रयासहरू देखिने प्रगतिमा बदलिन्छन्।',
    successBadge: 'साप्ताहिक प्रविष्टि पूरा भयो',
    successTitle: 'यस हप्ताका लागि धन्यवाद।',
    successBody: 'तपाईंको कार्बन विवरण सुरक्षित भयो। रिपोर्ट स्वतः खुल्छ।',
    successTrees: 'बचाइएका रुखहरू',
    successStreak: 'साप्ताहिक क्रम',
    successReport: 'तपाईं चाहनुहुन्छ भने रिपोर्ट सधैं तयार छ।',
    successReset: 'अर्को हप्ता बुझाउनुहोस्',
    successView: 'अहिले कार्बन रिपोर्ट हेर्नुहोस्',
    impactSaved: 'सुरक्षित प्रभाव',
    impactSnapshot: 'साप्ताहिक सारांश',
    transportLabel: 'यातायात',
    flagsLabel: 'संकेतहरू',
    roundTripLabel: 'दुवैतर्फको दूरी',
    baselineLabel: 'आधाररेखा',
    currentLabel: 'तपाईंको प्रविष्टि',
    lowImpact: 'कम-प्रभाव सप्ताह पूरा भयो',
  },
} as const;

function TransportIcon({ icon }: { icon: TransportOption['icon'] }) {
  switch (icon) {
    case 'walking':
      return (
        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="4.5" r="1.5" />
          <path d="M12 6.5 10.5 10" />
          <path d="M10.5 10 8 12.5" />
          <path d="M10.5 10 13.5 12.2" />
          <path d="M10.2 12.2 8.2 18" />
          <path d="M12.9 12.2 15.5 17.8" />
          <path d="M9.1 8.2 7.2 9.8" />
        </svg>
      );
    case 'bus':
      return (
        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="5" y="4.5" width="14" height="11" rx="2.2" />
          <path d="M7.5 7.5h9" />
          <path d="M7.5 10h9" />
          <circle cx="8" cy="18" r="1.4" />
          <circle cx="16" cy="18" r="1.4" />
          <path d="M5 15.5h14" />
        </svg>
      );
    case 'motorbike':
      return (
        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="6.5" cy="17" r="2.2" />
          <circle cx="17.5" cy="17" r="2.2" />
          <path d="M8.5 17h3.6l1.4-4 2.3 1" />
          <path d="M11.2 13 9.2 10.8h3.4l1.2 2.2" />
          <path d="M14.1 9.8 16.7 9" />
          <path d="M15.2 7.8 16.6 6.8" />
        </svg>
      );
    case 'car':
      return (
        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 14.5 6.5 9.8A2 2 0 0 1 8.4 8.5h7.2a2 2 0 0 1 1.9 1.3L19 14.5" />
          <path d="M4.5 14.5h15" />
          <path d="M7 14.5v2" />
          <path d="M17 14.5v2" />
          <circle cx="7.2" cy="17.2" r="1.4" />
          <circle cx="16.8" cy="17.2" r="1.4" />
          <path d="M8.3 10.5h7.4" />
        </svg>
      );
    case 'bike':
      return (
        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="6.5" cy="17" r="2.2" />
          <circle cx="17.5" cy="17" r="2.2" />
          <path d="M6.5 17 10 10h3l1.5 3.2 3 3.8" />
          <path d="M10 10h2.5" />
          <path d="M13.4 10.5 16.2 10" />
          <path d="M11.2 7.8h1.6" />
        </svg>
      );
    default:
      return null;
  }
}

export function StudentInput() {
  const { language, toggleLanguage } = useLanguage();
  const navigate = useNavigate();
  const currentSchool = getCurrentSchoolProfile();
  const schools = Array.from(new Set([...(currentSchool?.schoolName ? [currentSchool.schoolName] : []), ...SCHOOLS]));

  const activeSchoolName = currentSchool?.schoolName?.trim() || schools[0] || '';
  const copy = language === 'ne' ? COPY.ne : COPY.en;
  const [school, setSchool] = useState(currentSchool?.schoolName ?? schools[0] ?? '');
  const selectedSchool = school.trim();
  const selectedDistance = useMemo(() => {
    const averageDistance = getSchoolAverageDistance(selectedSchool);
    return typeof averageDistance === 'number' && averageDistance > 0 ? averageDistance : 5;
  }, [selectedSchool]);

  const [transport, setTransport] = useState('');
  const [plastic, setPlastic] = useState<boolean | null>(null);
  const [foodWaste, setFoodWaste] = useState<boolean | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submissionSummary, setSubmissionSummary] = useState<SubmissionSummary | null>(null);
  const [displayTrees, setDisplayTrees] = useState(0);

  const streakCount = useMemo(() => {
    if (!selectedSchool) {
      return 1;
    }
    return Math.max(1, getStudentSubmissionCountBySchool(selectedSchool));
  }, [selectedSchool]);

  const successImpact = useMemo(() => {
    if (!submissionSummary) {
      return null;
    }

    const baseline = calculateStudentEmissions('car', true, true, submissionSummary.distanceKm);
    const saved = Math.max(0, baseline - submissionSummary.emissions);
    const score = baseline > 0 ? Math.max(10, Math.round((1 - submissionSummary.emissions / baseline) * 100)) : 100;

    return {
      baseline,
      saved,
      score,
      compareText: saved > 0 ? `${saved.toFixed(2)} kg CO₂e saved vs a car commute` : copy.lowImpact,
    };
  }, [copy.lowImpact, submissionSummary]);

  useEffect(() => {
    if (!submitted) {
      return;
    }

    let cancelled = false;
    import('canvas-confetti')
      .then(({ default: confetti }) => {
        if (cancelled) {
          return;
        }

        confetti({
          particleCount: 80,
          spread: 65,
          origin: { y: 0.65 },
          colors: ['#3B7A2B', '#22c55e', '#86efac', '#dcfce7'],
        });
      })
      .catch(() => {
        // Confetti is optional.
      });

    return () => {
      cancelled = true;
    };
  }, [submitted]);

  useEffect(() => {
    if (!submitted || !successImpact) {
      return;
    }

    const targetTrees = Math.max(1, Math.round((successImpact.saved > 0 ? successImpact.saved : successImpact.baseline) / 0.12));
    let current = 0;
    setDisplayTrees(0);

    const interval = window.setInterval(() => {
      current += Math.max(1, Math.ceil(targetTrees / 18));
      if (current >= targetTrees) {
        setDisplayTrees(targetTrees);
        window.clearInterval(interval);
        return;
      }

      setDisplayTrees(current);
    }, 45);

    return () => window.clearInterval(interval);
  }, [submitted, successImpact]);

  const resetForm = () => {
    setSubmitted(false);
    setSubmissionSummary(null);
    setTransport('');
    setPlastic(null);
    setFoodWaste(null);
    setDisplayTrees(0);
  };

  const handleSubmit = () => {
    if (!selectedSchool || !transport || plastic === null || foodWaste === null) {
      return;
    }

    const emissions = calculateStudentEmissions(transport, plastic, foodWaste, selectedDistance);

    addStudentData(selectedSchool, transport, plastic, foodWaste, selectedDistance);
    setSubmissionSummary({
      schoolName: selectedSchool,
      transport,
      plastic,
      foodWaste,
      distanceKm: selectedDistance,
      emissions,
    });
    setSubmitted(true);
  };

  if (submitted && submissionSummary && successImpact) {
    return (
      <div className="h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#f0fdf4_0%,#f8fafc_44%,#fff7ed_100%)] p-2 sm:p-3">
        <div className="mx-auto h-full max-w-5xl">
          <div className="flex h-full flex-col overflow-hidden rounded-[2rem] border border-emerald-100 bg-white/96 shadow-[0_30px_80px_rgba(15,23,42,0.12)]">
            <div className="grid h-full min-h-0 lg:grid-cols-[1.02fr_0.98fr]">
              <div className="relative overflow-hidden bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-800 p-6 text-white lg:p-7">
                <div className="absolute inset-0 opacity-30">
                  <div className="absolute -left-10 top-10 h-44 w-44 rounded-full bg-white/15 blur-3xl" />
                  <div className="absolute right-0 top-32 h-40 w-40 rounded-full bg-lime-300/15 blur-3xl" />
                  <div className="absolute bottom-0 left-24 h-36 w-36 rounded-full bg-white/10 blur-3xl" />
                </div>

                <div className="relative flex h-full flex-col justify-between gap-6">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-white/90">
                      {copy.successBadge}
                    </div>
                    <h2 className="mt-4 text-2xl font-semibold leading-tight lg:text-3xl">{copy.successTitle}</h2>
                    <p className="mt-3 max-w-md text-sm leading-6 text-emerald-50/90 lg:text-base">{copy.successBody}</p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-sm">
                      <p className="text-xs uppercase tracking-wide text-white/70">{copy.successTrees}</p>
                      <p className="mt-1 text-3xl font-semibold">{displayTrees}</p>
                    </div>
                    <div className="rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-sm">
                      <p className="text-xs uppercase tracking-wide text-white/70">{copy.successStreak}</p>
                      <p className="mt-1 text-3xl font-semibold">{streakCount}</p>
                      <p className="text-sm text-white/75">{copy.successReport}</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15">
                        <TreePine className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{copy.successBadge}</p>
                        <p className="text-sm text-white/75">{copy.successBody}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-5 lg:p-6">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.26em] text-emerald-700/80">{copy.pageTitle}</p>
                    <h1 className="mt-1 text-2xl font-semibold text-foreground">{submissionSummary.schoolName}</h1>
                  </div>
                  <div className="rounded-full bg-emerald-600/10 px-3 py-1 text-sm font-medium text-emerald-800">
                    {submissionSummary.emissions.toFixed(2)} kg CO₂e
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid gap-4">
                    <div className="rounded-[1.5rem] border border-emerald-100 bg-slate-50 p-4">
                      <div className="flex items-center gap-4">
                        <div
                          className="relative flex h-24 w-24 items-center justify-center rounded-full"
                          style={{ background: `conic-gradient(#3B7A2B ${successImpact.score}%, #e5e7eb 0)` }}
                        >
                          <div className="flex h-16 w-16 flex-col items-center justify-center rounded-full bg-white">
                            <span className="text-xl font-semibold text-foreground">{successImpact.score}</span>
                            <span className="text-[10px] text-muted-foreground">score</span>
                          </div>
                        </div>
                        <div>
                          <div className="mb-1 flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-emerald-700" />
                            <p className="text-sm font-medium text-foreground">{copy.impactSaved}</p>
                          </div>
                          <p className="text-sm text-muted-foreground">{successImpact.compareText}</p>
                          <p className="mt-2 text-xs text-muted-foreground">
                            {copy.baselineLabel}: {successImpact.baseline.toFixed(2)} kg CO₂e · {copy.currentLabel}: {submissionSummary.emissions.toFixed(2)} kg CO₂e
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[1.5rem] border border-emerald-100 bg-emerald-50 p-4">
                      <div className="mb-2 flex items-center gap-2 text-emerald-800">
                        <Sparkles className="h-4 w-4" />
                        <p className="text-sm font-semibold">{copy.impactSnapshot}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="rounded-xl border border-border bg-white p-3">
                          <p className="text-muted-foreground">{copy.transportLabel}</p>
                          <p className="font-medium text-foreground capitalize">{submissionSummary.transport}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {submissionSummary.distanceKm} km {copy.roundTripLabel}
                          </p>
                        </div>
                        <div className="rounded-xl border border-border bg-white p-3">
                          <p className="text-muted-foreground">{copy.flagsLabel}</p>
                          <p className="font-medium text-foreground">Plastic: {submissionSummary.plastic ? copy.yes : copy.no}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Food waste: {submissionSummary.foodWaste ? copy.yes : copy.no}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white">
                        {successImpact.saved > 0 ? `${successImpact.saved.toFixed(2)} kg CO₂e saved vs a car commute` : copy.lowImpact}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-white px-4 py-2.5 font-medium text-foreground transition-colors hover:bg-accent"
                    >
                      {copy.successReset}
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/carbon-report')}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-4 py-2.5 font-medium text-white transition-all hover:shadow-lg"
                    >
                      {copy.successView}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const submitDisabled = !selectedSchool || !transport || plastic === null || foodWaste === null;

  return (
    <div className="h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#f0fdf4_0%,#f8fafc_44%,#fff7ed_100%)] p-2 sm:p-3">
      <div className="mx-auto h-full max-w-6xl">
        <div className="flex h-full flex-col overflow-hidden rounded-[2rem] border border-emerald-100 bg-white/96 shadow-[0_30px_80px_rgba(15,23,42,0.12)]">
          <div className="border-b border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-lime-50 px-5 py-3 sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-emerald-700">{copy.pageTitle}</p>
                <h1 className="mt-1 text-2xl font-semibold text-foreground">{copy.cardTitle}</h1>
              </div>

              <div className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-white p-1 shadow-sm">
                <button
                  type="button"
                  onClick={() => language !== 'ne' && toggleLanguage()}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    language === 'ne' ? 'bg-emerald-700 text-white shadow-sm' : 'text-emerald-900 hover:bg-emerald-50'
                  }`}
                >
                  NP
                </button>
                <button
                  type="button"
                  onClick={() => language !== 'en' && toggleLanguage()}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    language === 'en' ? 'bg-emerald-700 text-white shadow-sm' : 'text-emerald-900 hover:bg-emerald-50'
                  }`}
                >
                  EN
                </button>
              </div>
            </div>
          </div>

          <div className="grid h-full min-h-0 gap-0 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="p-4 sm:p-5 lg:p-6">
              <div className="max-w-3xl space-y-4">

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-900">{copy.schoolPrompt}</label>
                  <select
                    value={school}
                    onChange={(event) => setSchool(event.target.value)}
                    className="w-full rounded-2xl border border-emerald-200 bg-white px-4 py-2.5 text-base font-medium text-slate-900 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  >
                    {!school && <option value="">{copy.schoolPlaceholder}</option>}
                    {schools.map((schoolName) => (
                      <option key={schoolName} value={schoolName}>
                        {schoolName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="mb-2">
                    <p className="text-base font-semibold text-slate-900">{copy.transportPrompt}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                    {TRANSPORT_OPTIONS.map((option) => {
                      const selected = transport === option.value;
                      const primaryLabel = language === 'ne' ? option.label.ne : option.label.en;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setTransport(option.value)}
                          className={`group rounded-2xl border p-2.5 text-center transition-all duration-200 ${
                            selected
                              ? 'border-emerald-700 bg-emerald-100/80 shadow-[0_10px_30px_rgba(22,101,52,0.12)]'
                              : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)]'
                          }`}
                        >
                          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-inner ring-1 ring-black/5">
                            <span className="text-slate-500 transition-colors group-hover:text-emerald-700">
                              <TransportIcon icon={option.icon} />
                            </span>
                          </div>
                          <p className={`text-sm font-semibold ${selected ? 'text-emerald-900' : 'text-slate-900'}`}>{primaryLabel}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid gap-4">
                  <div>
                    <div className="mb-2">
                      <p className="text-base font-semibold text-slate-900">{copy.plasticPrompt}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPlastic(true)}
                        className={`rounded-2xl border px-4 py-2.5 text-center text-base font-semibold transition-all ${
                          plastic === true
                            ? 'border-emerald-700 bg-emerald-700 text-white shadow-[0_10px_24px_rgba(22,101,52,0.18)]'
                            : 'border-emerald-200 bg-white text-emerald-800 hover:bg-emerald-50'
                        }`}
                      >
                        {copy.yes}
                      </button>
                      <button
                        type="button"
                        onClick={() => setPlastic(false)}
                        className={`rounded-2xl border px-4 py-2.5 text-center text-base font-semibold transition-all ${
                          plastic === false
                            ? 'border-emerald-700 bg-emerald-700 text-white shadow-[0_10px_24px_rgba(22,101,52,0.18)]'
                            : 'border-emerald-200 bg-white text-emerald-800 hover:bg-emerald-50'
                        }`}
                      >
                        {copy.no}
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="mb-2">
                      <p className="text-base font-semibold text-slate-900">{copy.foodPrompt}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setFoodWaste(true)}
                        className={`rounded-2xl border px-4 py-2.5 text-center text-base font-semibold transition-all ${
                          foodWaste === true
                            ? 'border-emerald-700 bg-emerald-700 text-white shadow-[0_10px_24px_rgba(22,101,52,0.18)]'
                            : 'border-emerald-200 bg-white text-emerald-800 hover:bg-emerald-50'
                        }`}
                      >
                        {copy.yes}
                      </button>
                      <button
                        type="button"
                        onClick={() => setFoodWaste(false)}
                        className={`rounded-2xl border px-4 py-2.5 text-center text-base font-semibold transition-all ${
                          foodWaste === false
                            ? 'border-emerald-700 bg-emerald-700 text-white shadow-[0_10px_24px_rgba(22,101,52,0.18)]'
                            : 'border-emerald-200 bg-white text-emerald-800 hover:bg-emerald-50'
                        }`}
                      >
                        {copy.no}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 px-4 py-2.5 shadow-[0_10px_26px_rgba(180,83,9,0.08)]">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-amber-300 bg-white text-amber-500 shadow-sm">
                        <Flame className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-base font-semibold text-amber-950">
                          {copy.streakPrefix} {streakCount} {copy.streakSuffix}
                        </p>
                        <p className="text-sm text-amber-800">{copy.streakHint}</p>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitDisabled}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-800 to-emerald-700 px-6 py-3.5 text-base font-semibold text-white shadow-[0_14px_30px_rgba(22,101,52,0.2)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(22,101,52,0.24)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                  >
                    {copy.submit}
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="border-t border-emerald-100 bg-[linear-gradient(180deg,#f8fcf7_0%,#ffffff_56%,#eefbf0_100%)] p-4 sm:p-5 lg:border-t-0 lg:border-l lg:p-0">
              <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-none bg-white">

                <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-gradient-to-b from-emerald-50 via-white to-emerald-100 p-2 sm:p-3">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.7)_0%,rgba(255,255,255,0.18)_42%,rgba(255,255,255,0)_70%)]" />
                  <img
                    src="/student.png"
                    alt="Student"
                    className="relative z-10 h-full max-h-[78%] w-full object-contain drop-shadow-[0_20px_45px_rgba(15,23,42,0.12)]"
                  />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white via-white/90 to-transparent" />
                </div>

                <div className="border-t border-emerald-100 bg-white px-5 py-3 sm:px-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      <TreePine className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{copy.illustrationTitle}</p>
                      <p className="text-sm text-slate-600">{selectedSchool || copy.illustrationBody}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
