import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { ChevronRight, Sparkles, TreePine, Leaf } from 'lucide-react';
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
        <div className="mx-auto max-w-4xl">
          <div className="overflow-hidden rounded-[2rem] border border-emerald-100 bg-white shadow-2xl">
            <div className="grid lg:grid-cols-2">
              <div className="relative overflow-hidden bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-800 p-8 text-white lg:p-10">
                <div className="absolute inset-0 opacity-25">
                  <div className="absolute -left-10 top-8 h-44 w-44 rounded-full bg-white/20 blur-3xl" />
                  <div className="absolute right-0 top-32 h-40 w-40 rounded-full bg-lime-300/20 blur-3xl" />
                  <div className="absolute bottom-0 left-24 h-36 w-36 rounded-full bg-white/10 blur-3xl" />
                </div>

                <div className="relative flex h-full flex-col justify-between gap-8">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium uppercase tracking-widest text-white/90">
                      <Sparkles className="h-3 w-3" />
                      Weekly submission complete
                    </div>
                    <h2 className="mt-5 text-3xl font-semibold leading-tight lg:text-4xl">Thank you for this week.</h2>
                    <p className="mt-4 max-w-md text-sm leading-6 text-emerald-50/90 lg:text-base">
                      Your carbon choices are now saved. The report opens automatically.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                      <p className="text-xs uppercase tracking-wide text-white/70">Trees saved this week</p>
                      <p className="mt-1 text-3xl font-semibold">{displayTrees}</p>
                    </div>
                    <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                      <p className="text-xs uppercase tracking-wide text-white/70">Weekly streak</p>
                      <p className="mt-1 text-3xl font-semibold">{streakCount}</p>
                      <p className="text-sm text-white/75">Keep building!</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15">
                        <TreePine className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Your impact is being tracked</p>
                        <p className="text-sm text-white/75">Progress saved in browser</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8 lg:p-10">
                <div className="mb-6">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">This week's submission</p>
                  <h1 className="text-2xl font-semibold text-foreground">{submissionSummary.schoolName}</h1>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl border border-border bg-slate-50 p-5">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <p className="text-sm font-medium text-foreground">CO₂ Impact</p>
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                        {submissionSummary.emissions.toFixed(2)} kg CO₂e
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <p className="text-muted-foreground">Transport</p>
                        <p className="font-semibold text-foreground capitalize">{submissionSummary.transport}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Plastic?</p>
                        <p className="font-semibold text-foreground">{submissionSummary.plastic ? 'Yes' : 'No'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Food waste?</p>
                        <p className="font-semibold text-foreground">{submissionSummary.foodWaste ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                    <p className="text-sm font-medium text-emerald-900 mb-3">Weekly score</p>
                    <div className="flex items-center gap-4">
                      <div
                        className="relative flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full"
                        style={{ background: `conic-gradient(#3B7A2B ${successImpact.score}%, #e5e7eb 0)` }}
                      >
                        <div className="flex h-16 w-16 flex-col items-center justify-center rounded-full bg-white">
                          <span className="text-lg font-semibold text-foreground">{successImpact.score}</span>
                          <span className="text-[10px] text-muted-foreground">/100</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Impact saved vs car</p>
                        <p className="text-sm font-semibold text-emerald-900">{successImpact.compareText}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => navigate('/carbon-report')}
                      className="w-full bg-primary text-primary-foreground rounded-xl py-3 font-medium hover:shadow-lg transition-all"
                    >
                      View your report
                    </button>
                    <button
                      onClick={resetForm}
                      className="w-full border border-border text-foreground rounded-xl py-3 font-medium hover:bg-accent transition-colors"
                    >
                      Submit another week
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

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#ecfdf5_0%,#f8fafc_45%,#ffffff_100%)] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-medium text-emerald-700 shadow-sm">
            <Leaf className="h-4 w-4" />
            Student weekly input
          </div>
          <h1 className="mt-4 text-3xl font-semibold text-foreground">Log your actions for this week</h1>
          <p className="mt-2 text-muted-foreground">Quick questions about your carbon footprint</p>
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-emerald-100 bg-white shadow-xl">
          <div className="p-6 sm:p-8 lg:p-10">
            <div className="space-y-8">
              {/* School selection */}
              <div>
                <label className="block mb-3 text-sm font-medium text-foreground">Which school are you from?</label>
                <select
                  value={school}
                  onChange={(e) => {
                    setSchool(e.target.value);
                    prefillDistanceForSchool(e.target.value);
                  }}
                  className="w-full rounded-xl border border-border bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select your school</option>
                  {schools.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                  <option value="other">Other / Not listed</option>
                </select>
                {school === 'other' && (
                  <input
                    type="text"
                    value={customSchool}
                    onChange={(e) => setCustomSchool(e.target.value)}
                    placeholder="Enter your school name"
                    className="mt-3 w-full rounded-xl border border-border bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                )}
              </div>

              {/* Transport mode */}
              <div>
                <label className="block mb-4 text-sm font-medium text-foreground">How did you travel this week?</label>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                  {[
                    { value: 'walking', label: 'Walking', icon: '🚶' },
                    { value: 'bike', label: 'Bike', icon: '🚴' },
                    { value: 'bus', label: 'Bus', icon: '🚌' },
                    { value: 'motorcycle', label: 'Motorcycle', icon: '🏍️' },
                    { value: 'car', label: 'Car', icon: '🚗' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setTransport(option.value)}
                      className={`rounded-2xl border-2 bg-white p-4 transition-all text-center ${
                        transport === option.value
                          ? 'border-primary shadow-md'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="text-3xl mb-2">{option.icon}</div>
                      <p className="text-sm font-medium">{option.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Distance if not walking/bike */}
              {transport && !['walking', 'bike'].includes(transport) && (
                <div>
                  <label className="block mb-3 text-sm font-medium text-foreground">
                    Round-trip distance (km)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={distanceKm}
                      onChange={(e) => setDistanceKm(e.target.valueAsNumber || '')}
                      className="flex-1 rounded-xl border border-border bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="0"
                      min="0"
                    />
                    <span className="text-sm font-medium text-muted-foreground">km</span>
                  </div>
                </div>
              )}

              {/* Plastic usage */}
              <div>
                <label className="block mb-4 text-sm font-medium text-foreground">Did you use single-use plastic this week?</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setPlastic(true)}
                    className={`rounded-2xl border-2 bg-white p-6 transition-all text-center font-medium ${
                      plastic === true ? 'border-red-500 bg-red-50 shadow-md' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="text-3xl mb-2">♻️</div>
                    Yes
                  </button>
                  <button
                    onClick={() => setPlastic(false)}
                    className={`rounded-2xl border-2 bg-white p-6 transition-all text-center font-medium ${
                      plastic === false ? 'border-green-500 bg-green-50 shadow-md' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="text-3xl mb-2">🌱</div>
                    No
                  </button>
                </div>
              </div>

              {/* Food waste */}
              <div>
                <label className="block mb-4 text-sm font-medium text-foreground">Did you create food waste this week?</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setFoodWaste(true)}
                    className={`rounded-2xl border-2 bg-white p-6 transition-all text-center font-medium ${
                      foodWaste === true ? 'border-red-500 bg-red-50 shadow-md' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="text-3xl mb-2">🥗</div>
                    Yes
                  </button>
                  <button
                    onClick={() => setFoodWaste(false)}
                    className={`rounded-2xl border-2 bg-white p-6 transition-all text-center font-medium ${
                      foodWaste === false ? 'border-green-500 bg-green-50 shadow-md' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="text-3xl mb-2">🍴</div>
                    No
                  </button>
                </div>
              </div>

              {/* Submit button */}
              <button
                onClick={handleSubmit}
                disabled={!activeSchoolName || !transport || plastic === null || foodWaste === null}
                className="w-full bg-primary text-primary-foreground rounded-xl py-4 font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-center gap-2">
                  Submit This Week
                  <ChevronRight className="w-5 h-5" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
