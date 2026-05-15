import { useEffect, useMemo, useState } from 'react';
import { HandHeart, LockKeyhole, MapPin, Medal, ShieldCheck, Sprout, Users2 } from 'lucide-react';
import { ensureMvpAnalysis } from '../utils/mvpPlanner';
import { getCurrentSchoolProfile, upsertCurrentSchoolData } from '../utils/schoolSession';

type SelectedRecommendation = { title: string };

const allOrganizations = [
  { name: 'AEPC', description: 'Solar & energy efficiency support', badge: 'Technical support', categories: ['solar', 'led', 'energy'] },
  { name: 'Nepal Climate Change Fund', description: 'Financial support for green initiatives', badge: 'Grant support', categories: ['solar', 'energy', 'audit'] },
  { name: 'District Forest Office', description: 'Local forest & waste management support', badge: 'Local support', categories: ['cookstove', 'compost', 'walking'] },
  { name: 'Practical Action Nepal', description: 'Cooking efficiency and livelihood support', badge: 'Technical support', categories: ['cookstove'] },
  { name: 'WWF Nepal', description: 'Technical support & environmental guidance', badge: 'Mentorship', categories: ['solar', 'cookstove', 'compost', 'walking', 'led', 'bus', 'audit'] },
  { name: 'Municipality Environment Fund', description: 'Local climate action support', badge: 'Local funding', categories: ['solar', 'cookstove', 'compost', 'walking', 'led', 'bus', 'audit'] },
];

function recommendationKey(title: string): string {
  const normalized = title.toLowerCase();
  if (normalized.includes('cookstove')) return 'cookstove';
  if (normalized.includes('compost')) return 'compost';
  if (normalized.includes('walk')) return 'walking';
  if (normalized.includes('lantern') || normalized.includes('solar')) return 'solar';
  if (normalized.includes('led')) return 'led';
  if (normalized.includes('bus')) return 'bus';
  if (normalized.includes('audit')) return 'audit';
  return 'solar';
}

function getRelevantOrganizations(selectedRecommendations: SelectedRecommendation[]) {
  if (!selectedRecommendations.length) {
    return allOrganizations.filter((org) => org.categories.length > 3);
  }

  const selectedKeys = new Set(selectedRecommendations.map((item) => recommendationKey(item.title)));
  const matched = allOrganizations.filter((org) => org.categories.some((cat) => selectedKeys.has(cat)));

  const always = allOrganizations.filter((org) => org.name === 'WWF Nepal' || org.name === 'Municipality Environment Fund');
  const combined = new Map<string, (typeof allOrganizations)[0]>();
  matched.forEach((org) => combined.set(org.name, org));
  always.forEach((org) => combined.set(org.name, org));

  return Array.from(combined.values());
}

function getTierState(points: number, mentorCommitted: boolean) {
  if (points >= 500 || (points >= 250 && mentorCommitted)) {
    return { tier: 3, unlocked: 3, state: 'Tier 3 Unlocked' };
  }
  if (points >= 250 || (points >= 100 && mentorCommitted)) {
    return { tier: 2, unlocked: 2, state: 'Tier 2 Unlocked' };
  }
  if (points >= 100) {
    return { tier: 1, unlocked: 1, state: 'Tier 1 Unlocked' };
  }
  return { tier: 0, unlocked: 0, state: 'No tier unlocked yet' };
}

export function Support() {
  const [selectedRecommendations, setSelectedRecommendations] = useState<SelectedRecommendation[]>([]);
  const [beforeCO2, setBeforeCO2] = useState<number>(0);
  const [afterCO2, setAfterCO2] = useState<number>(0);
  const [mentorCommitted, setMentorCommitted] = useState(false);

  useEffect(() => {
    try {
      const rawSelected = localStorage.getItem('selectedRecommendations');
      if (rawSelected) setSelectedRecommendations(JSON.parse(rawSelected) as SelectedRecommendation[]);
    } catch {
      setSelectedRecommendations([]);
    }

    try {
      const profile = getCurrentSchoolProfile();
      const analysis = ensureMvpAnalysis(profile);
      setBeforeCO2(analysis.emissions.totalCO2);
    } catch {
      setBeforeCO2(0);
    }

    try {
      const rawMentor = localStorage.getItem('mentorCommitted');
      setMentorCommitted(rawMentor === 'true');
    } catch {
      setMentorCommitted(false);
    }

    try {
      const rawAfter = localStorage.getItem('afterCO2');
      if (rawAfter) setAfterCO2(parseFloat(rawAfter));
      else setAfterCO2(Math.max(0, beforeCO2 - 150));
    } catch {
      setAfterCO2(Math.max(0, beforeCO2 - 150));
    }
  }, [beforeCO2]);

  const impactPoints = useMemo(() => Math.max(0, beforeCO2 - afterCO2), [beforeCO2, afterCO2]);
  const tierInfo = useMemo(() => getTierState(impactPoints, mentorCommitted), [impactPoints, mentorCommitted]);
  const relevantOrganizations = useMemo(() => getRelevantOrganizations(selectedRecommendations), [selectedRecommendations]);

  useEffect(() => {
    try {
      upsertCurrentSchoolData({
        beforeCO2,
        afterCO2,
        impactPoints,
        mentorCommitted,
        selectedRecommendations,
      });
    } catch {
      // ignore
    }
  }, [afterCO2, impactPoints, mentorCommitted, selectedRecommendations]);

  const tierDefinitions = [
    { title: 'Tier 1', points: '100 Points', subtitle: 'Compost bins + saplings', icon: Sprout, level: 1 },
    { title: 'Tier 2', points: '250 Points', subtitle: 'Solar lamps + dustbins', icon: Medal, level: 2 },
    { title: 'Tier 3', points: '500 Points', subtitle: 'Priority NGO access', icon: LockKeyhole, level: 3 },
  ];

  function handleMentorToggle() {
    const newValue = !mentorCommitted;
    setMentorCommitted(newValue);
    localStorage.setItem('mentorCommitted', String(newValue));
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 sm:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="mb-1 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-700 text-lg font-bold text-white">10</div>
          <h1 className="text-2xl font-bold text-foreground">Support Connector</h1>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-500">Support Tiers (Unlock with Impact Points)</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-900">Your impact score</h2>
              </div>
              <div className="rounded-2xl bg-emerald-50 px-5 py-3 text-center text-emerald-900">
                <p className="text-sm font-medium">Your Impact Score</p>
                <p className="text-3xl font-semibold leading-none">{impactPoints}</p>
                <p className="text-sm font-medium">Points</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {tierDefinitions.map((tier) => {
                const Icon = tier.icon;
                const isUnlocked = tier.level <= tierInfo.unlocked;
                const accentClass = isUnlocked
                  ? tier.level === 1
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : tier.level === 2
                      ? 'bg-amber-50 border-amber-200 text-amber-800'
                      : 'bg-blue-50 border-blue-200 text-blue-800'
                  : 'bg-slate-50 border-slate-200 text-slate-700';

                return (
                  <div key={tier.title} className={`rounded-3xl border p-4 ${accentClass}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold">{tier.title}</p>
                        <p className="text-xs font-medium opacity-80">{tier.points}</p>
                      </div>
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="mt-3 text-sm font-medium">{tier.subtitle}</p>
                    <div className="mt-4 rounded-full bg-white/80 px-3 py-1 text-center text-xs font-semibold">
                      {isUnlocked ? 'Unlocked' : `Unlock at ${tier.points.split(' ')[0]} pts`}
                    </div>
                  </div>
                );
              })}
            </div>

            <div>
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Users2 className="h-4 w-4 text-emerald-700" />
                Available Support Organizations
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {relevantOrganizations.length > 0 ? relevantOrganizations.map((org) => (
                  <div key={org.name} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-slate-900">{org.name}</h3>
                        <p className="mt-1 text-sm text-slate-600">{org.description}</p>
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm">{org.badge}</span>
                    </div>
                    <button className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white">
                      Contact
                      <HandHeart className="h-4 w-4" />
                    </button>
                  </div>
                )) : (
                  <div className="col-span-2 rounded-3xl border border-dashed border-slate-300 bg-white p-4 text-center text-sm text-slate-500">
                    No organizations available yet. Select recommendations to see relevant organizations.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="rounded-3xl bg-emerald-50 p-5 text-slate-800">
              <p className="text-sm font-semibold text-emerald-700">Mentor commitment</p>
              <p className="mt-2 text-base font-medium">To receive support, commit to mentoring 1 nearby school.</p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center justify-between gap-2 text-sm font-semibold text-slate-700">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={mentorCommitted}
                    onChange={handleMentorToggle}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-700"
                  />
                  <MapPin className="h-4 w-4 text-emerald-700" />
                  <span>I commit to mentoring 1 nearby school</span>
                </label>
              </div>
              <div className="mt-4 flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
                <div>
                  <p className="text-sm font-semibold text-slate-800">1 nearby mentor school</p>
                  <p className="text-xs text-slate-500">Your school commits to peer support</p>
                </div>
                <ShieldCheck className={`h-10 w-10 ${mentorCommitted ? 'text-emerald-700' : 'text-slate-300'}`} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}