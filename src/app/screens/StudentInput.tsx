import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { ChevronRight, Sparkles, TreePine } from 'lucide-react';
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

export function StudentInput() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const currentSchool = getCurrentSchoolProfile();
  const schools = Array.from(new Set([
    ...(currentSchool?.schoolName ? [currentSchool.schoolName] : []),
    ...SCHOOLS,
  ]));

  const [school, setSchool] = useState(currentSchool?.schoolName ?? '');
  const [customSchool, setCustomSchool] = useState('');
  const [distanceKm, setDistanceKm] = useState<number | ''>(5);
  const [transport, setTransport] = useState('');
  const [plastic, setPlastic] = useState<boolean | null>(null);
  const [foodWaste, setFoodWaste] = useState<boolean | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submissionSummary, setSubmissionSummary] = useState<SubmissionSummary | null>(null);
  const [displayTrees, setDisplayTrees] = useState(0);

  const activeSchoolName = useMemo(() => {
    if (school === 'other') {
      return customSchool.trim();
    }
    return school.trim();
  }, [school, customSchool]);

  const streakCount = useMemo(() => {
    if (!activeSchoolName) {
      return 1;
    }
    return Math.max(1, getStudentSubmissionCountBySchool(activeSchoolName));
  }, [activeSchoolName]);

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
      compareText: saved > 0 ? `${saved.toFixed(2)} kg CO₂e saved vs a car commute` : 'Good choice - your week stayed low impact.',
    };
  }, [submissionSummary]);

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

  const prefillDistanceForSchool = (schoolName: string) => {
    if (!schoolName || schoolName === 'other') {
      return;
    }

    const averageDistance = getSchoolAverageDistance(schoolName);
    setDistanceKm(typeof averageDistance === 'number' ? averageDistance : 5);
  };

  const resetForm = () => {
    setSubmitted(false);
    setSubmissionSummary(null);
    setSchool(currentSchool?.schoolName ?? '');
    setCustomSchool('');
    setDistanceKm(5);
    setTransport('');
    setPlastic(null);
    setFoodWaste(null);
    setDisplayTrees(0);
  };

  const handleSubmit = () => {
    const finalSchool = activeSchoolName;
    if (!finalSchool || !transport || plastic === null || foodWaste === null) {
      return;
    }

    const finalDistance = typeof distanceKm === 'number' && distanceKm > 0 ? distanceKm : undefined;
    const emissions = calculateStudentEmissions(transport, plastic, foodWaste, finalDistance);

    addStudentData(finalSchool, transport, plastic, foodWaste, finalDistance);
    setSubmissionSummary({
      schoolName: finalSchool,
      transport,
      plastic,
      foodWaste,
      distanceKm: finalDistance ?? 5,
      emissions,
    });
    setSubmitted(true);
  };

  if (submitted && submissionSummary && successImpact) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,#ecfdf5_0%,#f8fafc_42%,#fefce8_100%)] p-4 sm:p-6">
        <div className="mx-auto max-w-3xl">
          <div className="overflow-hidden rounded-[2rem] border border-emerald-100 bg-white shadow-2xl">
            <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
              <div className="relative overflow-hidden bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-800 p-8 text-white lg:p-10">
                <div className="absolute inset-0 opacity-25">
                  <div className="absolute -left-10 top-8 h-44 w-44 rounded-full bg-white/20 blur-3xl" />
                  <div className="absolute right-0 top-32 h-40 w-40 rounded-full bg-lime-300/20 blur-3xl" />
                  <div className="absolute bottom-0 left-24 h-36 w-36 rounded-full bg-white/10 blur-3xl" />
                </div>

                <div className="relative flex h-full flex-col justify-between gap-8">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium uppercase tracking-widest text-white/90">
                      Weekly submission complete
                    </div>
                    <h2 className="mt-5 text-3xl font-semibold leading-tight lg:text-4xl">Thank you for this week.</h2>
                    <p className="mt-4 max-w-md text-sm leading-6 text-emerald-50/90 lg:text-base">
                      Your carbon choices are now saved. The report opens automatically.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                      <p className="text-xs uppercase tracking-wide text-white/70">Trees saved</p>
                      <p className="mt-1 text-3xl font-semibold">{displayTrees}</p>
                    </div>
                    <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                      <p className="text-xs uppercase tracking-wide text-white/70">Weekly streak</p>
                      <p className="mt-1 text-3xl font-semibold">{streakCount}</p>
                      <p className="text-sm text-white/75">Great job - keep building.</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15">
                        <TreePine className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Sending you forward</p>
                        <p className="text-sm text-white/75">Your report is ready whenever you want it.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6 lg:p-8">
                <div className="mb-6 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Submission saved for</p>
                    <h1 className="text-2xl font-semibold text-foreground">{submissionSummary.schoolName}</h1>
                  </div>
                  <div className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                    {submissionSummary.emissions.toFixed(2)} kg CO₂e
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-[0.95fr_1.05fr]">
                    <div className="rounded-2xl border border-border bg-slate-50 p-5">
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
                            <Sparkles className="h-4 w-4 text-primary" />
                            <p className="text-sm font-medium text-foreground">Impact saved</p>
                          </div>
                          <p className="text-sm text-muted-foreground">{successImpact.compareText}</p>
                          <p className="mt-2 text-xs text-muted-foreground">
                            Baseline: {successImpact.baseline.toFixed(2)} kg CO₂e · Your entry: {submissionSummary.emissions.toFixed(2)} kg CO₂e
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                      <div className="mb-2 flex items-center gap-2 text-emerald-800">
                        <Sparkles className="h-4 w-4" />
                        <p className="text-sm font-semibold">Weekly snapshot</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="rounded-xl border border-border bg-white p-3">
                          <p className="text-muted-foreground">Transport</p>
                          <p className="font-medium text-foreground capitalize">{submissionSummary.transport}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{submissionSummary.distanceKm} km round trip</p>
                        </div>
                        <div className="rounded-xl border border-border bg-white p-3">
                          <p className="text-muted-foreground">Flags</p>
                          <p className="font-medium text-foreground">Plastic: {submissionSummary.plastic ? 'Yes' : 'No'}</p>
                          <p className="mt-1 text-xs text-muted-foreground">Food waste: {submissionSummary.foodWaste ? 'Yes' : 'No'}</p>
                        </div>
                      </div>
                      <div className="mt-4 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground">
                        {successImpact.saved > 0 ? `${successImpact.saved.toFixed(2)} kg CO₂e under the baseline commute` : 'Low-impact week achieved'}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-border bg-white px-4 py-3 font-medium text-foreground transition-colors hover:bg-accent"
                    >
                      Submit another week
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/carbon-report')}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 font-medium text-primary-foreground transition-all hover:shadow-lg"
                    >
                      View carbon report now
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

  const submitDisabled = !activeSchoolName || !transport || plastic === null || foodWaste === null;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#ecfdf5_0%,#f8fafc_42%,#fefce8_100%)] p-4 sm:p-6">
      <div className="mx-auto max-w-3xl">
        <div className="overflow-hidden rounded-[2rem] border border-emerald-100 bg-white shadow-2xl">
          <div className="border-b border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-lime-50 px-5 py-4 sm:px-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-emerald-700">Student weekly input</p>
                <h1 className="mt-1 text-2xl font-semibold text-foreground">Log your actions for this week</h1>
              </div>
              <div className="inline-flex items-center gap-2 self-start rounded-full bg-emerald-600 px-3 py-1 text-sm font-medium text-white">
                <TreePine className="h-4 w-4" />
                Saved locally
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6 lg:p-8">
            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">Which school are you from?</label>
                <select
                  value={school}
                  onChange={(e) => {
                    const nextSchool = e.target.value;
                    setSchool(nextSchool);
                    prefillDistanceForSchool(nextSchool);
                  }}
                  className="w-full rounded-xl border border-border bg-white px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select your school</option>
                  {schools.map((schoolName) => (
                    <option key={schoolName} value={schoolName}>{schoolName}</option>
                  ))}
                  <option value="other">Other</option>
                </select>
                {school === 'other' && (
                  <input
                    type="text"
                    value={customSchool}
                    onChange={(e) => setCustomSchool(e.target.value)}
                    placeholder="Enter your school name"
                    className="mt-3 w-full rounded-xl border border-border bg-white px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">Round-trip distance</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    value={distanceKm}
                    onChange={(e) => setDistanceKm(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-28 rounded-xl border border-border bg-white px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <span className="text-sm text-muted-foreground">km</span>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">How did you come to school?</label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                  {[
                    { value: 'walking', icon: '🚶', label: 'Walk' },
                    { value: 'bus', icon: '🚌', label: 'Bus' },
                    { value: 'bike', icon: '🚴', label: 'Bike' },
                    { value: 'motorbike', icon: '🏍️', label: 'Moto' },
                    { value: 'car', icon: '🚗', label: 'Car' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setTransport(option.value)}
                      className={`rounded-xl border-2 p-3 transition-all ${
                        transport === option.value ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-2xl">{option.icon}</div>
                        <div className="mt-1 text-xs font-medium text-foreground">{option.label}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-foreground">Did you bring single-use plastic?</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPlastic(true)}
                      className={`rounded-xl border-2 p-4 text-center transition-all ${
                        plastic === true ? 'border-red-500 bg-red-50' : 'border-border hover:border-red-300'
                      }`}
                    >
                      <p className="text-2xl mb-2">❌</p>
                      <p className="font-semibold text-foreground">Yes</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlastic(false)}
                      className={`rounded-xl border-2 p-4 text-center transition-all ${
                        plastic === false ? 'border-primary bg-emerald-50' : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <p className="text-2xl mb-2">✅</p>
                      <p className="font-semibold text-foreground">No</p>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-foreground">Did you waste food today?</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFoodWaste(true)}
                      className={`rounded-xl border-2 p-4 text-center transition-all ${
                        foodWaste === true ? 'border-red-500 bg-red-50' : 'border-border hover:border-red-300'
                      }`}
                    >
                      <p className="text-2xl mb-2">🍽️</p>
                      <p className="font-semibold text-foreground">Yes</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFoodWaste(false)}
                      className={`rounded-xl border-2 p-4 text-center transition-all ${
                        foodWaste === false ? 'border-primary bg-emerald-50' : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <p className="text-2xl mb-2">✅</p>
                      <p className="font-semibold text-foreground">No</p>
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitDisabled}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-4 font-medium text-white transition-all hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Submit This Week
                <ChevronRight className="h-4 w-4" />
              </button>

              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-center">
                <p className="text-sm font-semibold text-emerald-900">{streakCount} weeks submitted</p>
                <p className="text-xs text-emerald-700">Keep the momentum going!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
