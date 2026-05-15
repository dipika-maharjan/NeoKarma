import { useEffect, useMemo, useState } from 'react';
import { Crown, Medal, Trophy } from 'lucide-react';
import { getCurrentSchoolProfile, getAllSchoolData } from '../utils/schoolSession';

type SchoolRow = {
  name: string;
  district: string;
  province: string;
  archetype: 'remote' | 'semi-urban' | 'urban';
  beforeCO2: number;
  afterCO2: number;
};

const mockSchools: SchoolRow[] = [
  { name: 'Narmada Secondary School', district: 'Mugu', province: 'Karnali', archetype: 'remote', beforeCO2: 650, afterCO2: 442 },
  { name: 'Shree Jan Jyoti Basic School', district: 'Dolpa', province: 'Karnali', archetype: 'remote', beforeCO2: 580, afterCO2: 417 },
  { name: 'Adarsha Basic School', district: 'Jumla', province: 'Karnali', archetype: 'remote', beforeCO2: 720, afterCO2: 561 },
  { name: 'Janata Secondary School', district: 'Kalikot', province: 'Karnali', archetype: 'remote', beforeCO2: 600, afterCO2: 492 },
  { name: 'Karnali Green School', district: 'Humla', province: 'Karnali', archetype: 'remote', beforeCO2: 680, afterCO2: 505 },
  { name: 'Bhattarai School', district: 'Surkhet', province: 'Karnali', archetype: 'semi-urban', beforeCO2: 850, afterCO2: 680 },
  { name: 'Eco Learning Centre', district: 'Nepalgunj', province: 'Karnali', archetype: 'semi-urban', beforeCO2: 920, afterCO2: 715 },
  { name: 'Namaste Public School', district: 'Pokhara', province: 'Gandaki', archetype: 'urban', beforeCO2: 1200, afterCO2: 840 },
  { name: 'Green Valley Academy', district: 'Kathmandu', province: 'Bagmati', archetype: 'urban', beforeCO2: 1450, afterCO2: 1015 },
  { name: 'Shree Nalanda School', district: 'Kathmandu', province: 'Bagmati', archetype: 'urban', beforeCO2: 1350, afterCO2: 945 },
  { name: 'Sagarmatha Learning School', district: 'Bhaktapur', province: 'Bagmati', archetype: 'urban', beforeCO2: 1100, afterCO2: 770 },
  { name: 'Himalayan Green School', district: 'Lalitpur', province: 'Bagmati', archetype: 'semi-urban', beforeCO2: 950, afterCO2: 665 },
  { name: 'Peace Valley School', district: 'Biratnagar', province: 'Kosi', archetype: 'semi-urban', beforeCO2: 800, afterCO2: 560 },
  { name: 'Janakpur Vision School', district: 'Janakpur', province: 'Mithila', archetype: 'semi-urban', beforeCO2: 750, afterCO2: 525 },
  { name: 'Dharan Youth Academy', district: 'Dharan', province: 'Kosi', archetype: 'urban', beforeCO2: 1250, afterCO2: 875 },
  { name: 'Chitwan Green Future', district: 'Chitwan', province: 'Gandaki', archetype: 'semi-urban', beforeCO2: 880, afterCO2: 616 },
];

function calculateImprovement(beforeCO2: number, afterCO2: number): number {
  if (beforeCO2 === 0) return 0;
  return Math.round(((beforeCO2 - afterCO2) / beforeCO2) * 1000) / 10;
}

function getBadge(rank: number): string {
  if (rank === 1) return 'Gold';
  if (rank === 2) return 'Silver';
  if (rank === 3) return 'Bronze';
  return 'Runner-up';
}

export function Leaderboard() {
  const [tab, setTab] = useState<'province' | 'archetype' | 'all'>('archetype');
  const [currentSchool, setCurrentSchool] = useState<SchoolRow | null>(null);
  const [currentSchoolRank, setCurrentSchoolRank] = useState<number | null>(null);

  useEffect(() => {
    try {
      const profile = getCurrentSchoolProfile();
      const all = getAllSchoolData();
      const entries = Object.values(all) as any[];
      const match = entries.find((e) => e.profile && e.profile.schoolName === profile.schoolName);
      if (match) {
        setCurrentSchool({
          name: match.profile.schoolName,
          district: match.profile.district,
          province: match.profile.province,
          archetype: (match.profile.archetype || 'remote') as 'remote' | 'semi-urban' | 'urban',
          beforeCO2: match.beforeCO2 ?? 0,
          afterCO2: match.afterCO2 ?? match.beforeCO2 ?? 0,
        });
        return;
      }

      // fallback to profile only
      setCurrentSchool({
        name: profile.schoolName,
        district: profile.district,
        province: profile.province,
        archetype: (profile.archetype || 'remote') as 'remote' | 'semi-urban' | 'urban',
        beforeCO2: 0,
        afterCO2: 0,
      });
    } catch {
      setCurrentSchool(null);
    }
  }, []);

  const filteredAndRanked = useMemo(() => {
    const all = getAllSchoolData();
    const entries = Object.values(all) as any[];
    const realSchools: SchoolRow[] = entries
      .map((e) => ({
        name: e.profile?.schoolName || 'Unknown',
        district: e.profile?.district || 'Unknown',
        province: e.profile?.province || 'Unknown',
        archetype: (e.profile?.archetype || 'remote') as 'remote' | 'semi-urban' | 'urban',
        beforeCO2: e.beforeCO2 ?? 0,
        afterCO2: e.afterCO2 ?? 0,
      }))
      .filter((s) => s.beforeCO2 > 0 || s.afterCO2 > 0);

    let filtered = realSchools.length ? realSchools : mockSchools;

    if (tab === 'archetype' && currentSchool) {
      filtered = filtered.filter((s) => s.archetype === currentSchool.archetype);
    } else if (tab === 'province' && currentSchool) {
      filtered = filtered.filter((s) => s.province === currentSchool.province);
    }

    const withImprovement = filtered.map((school) => ({
      ...school,
      improvement: calculateImprovement(school.beforeCO2, school.afterCO2),
    }));

    const sorted = withImprovement.sort((a, b) => b.improvement - a.improvement);
    const ranked = sorted.map((school, idx) => ({
      ...school,
      rank: idx + 1,
      badge: getBadge(idx + 1),
    }));

    const currentRank = ranked.find(
      (s) => s.name.toLowerCase() === currentSchool?.name.toLowerCase() || s.district === currentSchool?.district
    )?.rank ?? null;
    setCurrentSchoolRank(currentRank);

    return ranked;
  }, [tab, currentSchool]);

  const currentImprovement = currentSchool ? calculateImprovement(currentSchool.beforeCO2, currentSchool.afterCO2) : 0;
  const motivationalMessage =
    currentSchoolRank && currentSchool
      ? `You are ranked #${currentSchoolRank} in ${tab === 'all' ? 'Nepal' : tab === 'province' ? currentSchool.province + ' Province' : currentSchool.archetype + ' schools'} with ${currentImprovement}% improvement!`
      : null;

  return (
    <div className="min-h-screen bg-slate-50 p-6 sm:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-700 text-lg font-bold text-white">11</div>
          <h1 className="text-2xl font-bold text-foreground">School Comparison / Leaderboard</h1>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap gap-2">
            {[
              ['archetype', 'My Archetype'],
              ['province', 'My Province'],
              ['all', 'All Nepal'],
            ].map(([value, label]) => (
              <button
                key={value}
                onClick={() => setTab(value as 'province' | 'archetype' | 'all')}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  tab === value ? 'bg-emerald-700 text-white' : 'border border-slate-200 bg-white text-slate-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {motivationalMessage && (
            <div className="mt-6 rounded-3xl bg-emerald-50 p-5 text-center text-emerald-900">
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold shadow-sm">
                <Trophy className="h-4 w-4 text-amber-500" />
                {motivationalMessage}
              </div>
            </div>
          )}

          <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200">
            <table className="min-w-full text-left">
              <thead className="bg-[#f2f6ef] text-sm text-slate-700">
                <tr>
                  <th className="px-6 py-4 font-semibold">Rank</th>
                  <th className="px-6 py-4 font-semibold">School Name</th>
                  <th className="px-6 py-4 font-semibold">District</th>
                  <th className="px-6 py-4 font-semibold">Improvement %</th>
                  <th className="px-6 py-4 font-semibold">Badge</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white text-sm">
                {filteredAndRanked.map((row) => {
                  const isCurrentSchool =
                    row.name.toLowerCase() === currentSchool?.name.toLowerCase() ||
                    row.district === currentSchool?.district;
                  return (
                    <tr key={row.rank} className={isCurrentSchool ? 'bg-emerald-50/60' : ''}>
                      <td className="px-6 py-4 font-semibold text-slate-700">{row.rank}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {row.rank === 1 ? (
                            <Crown className="h-5 w-5 text-amber-500" />
                          ) : row.rank === 2 ? (
                            <Medal className="h-5 w-5 text-slate-400" />
                          ) : (
                            <Trophy className="h-5 w-5 text-emerald-700" />
                          )}
                          <span className={`font-medium ${isCurrentSchool ? 'text-emerald-700 font-bold' : 'text-slate-800'}`}>
                            {isCurrentSchool ? `Your School (${row.name})` : row.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{row.district}</td>
                      <td className="px-6 py-4 font-semibold text-emerald-700">{row.improvement}%</td>
                      <td className="px-6 py-4">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{row.badge}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-6 rounded-3xl bg-emerald-50 p-4 text-sm text-emerald-900">
            {tab === 'archetype'
              ? 'Schools are compared within the same archetype only for fairness (Remote vs Semi-Urban vs Urban).'
              : tab === 'province'
                ? 'Schools are compared within the same province for regional fairness.'
                : 'Showing all schools across Nepal.'}
          </div>
        </div>
      </div>
    </div>
  );
}