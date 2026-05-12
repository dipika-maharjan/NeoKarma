import { useEffect, useMemo, useState } from 'react';
import { Award, Globe2, TrendingDown, Users } from 'lucide-react';
import mapImage from '../../assets/map.png';
import { getAllSchoolData } from '../utils/schoolSession';

type SchoolImpact = {
  name: string;
  district: string;
  province: string;
  beforeCO2: number;
  afterCO2: number;
  action: string;
  resources: string;
  supportedBy: string;
  story: string;
};

const supportOrganizations = [
  { name: 'WWF Nepal', logo: '🐾' },
  { name: 'AEPC', logo: '☀️' },
  { name: 'District Forest Office', logo: '🌲' },
  { name: 'Municipality Fund', logo: '🏛️' },
];

const demoSchools: SchoolImpact[] = [
  { name: 'Shree Himalaya Basic School', district: 'Humla', province: 'Karnali', beforeCO2: 800, afterCO2: 560, action: 'Solar Lanterns + Compost', resources: 'AEPC', supportedBy: 'AEPC', story: 'Mountain school reduced fuel pressure with simple clean-lighting support.' },
  { name: 'Narmada Secondary School', district: 'Mugu', province: 'Karnali', beforeCO2: 650, afterCO2: 442, action: 'Improved Cookstove', resources: 'District Forest Office', supportedBy: 'District Forest Office', story: 'Cooking emissions dropped after switching to a more efficient stove.' },
  { name: 'Shree Jan Jyoti Basic School', district: 'Jumla', province: 'Karnali', beforeCO2: 720, afterCO2: 561, action: 'Walking Groups', resources: 'WWF Nepal', supportedBy: 'WWF Nepal', story: 'Students now walk together in organized groups from nearby settlements.' },
  { name: 'Kavre Green School', district: 'Kavrepalanchok', province: 'Bagmati', beforeCO2: 950, afterCO2: 640, action: 'Bus Route Optimization', resources: 'Municipality Fund', supportedBy: 'Municipality Fund', story: 'Route consolidation lowered diesel use and made pickups more efficient.' },
];

function buildSchools(): SchoolImpact[] {
  const all = getAllSchoolData();
  const entries = Object.values(all) as any[];

  const schools = entries
    .map((entry) => ({
      name: entry.profile?.schoolName || 'Unknown School',
      district: entry.profile?.district || 'Unknown',
      province: entry.profile?.province || 'Unknown',
      beforeCO2: Number(entry.beforeCO2 ?? entry.emissionData?.beforeCO2 ?? entry.emissionData?.totalCO2 ?? 0),
      afterCO2: Number(entry.afterCO2 ?? entry.emissionData?.afterCO2 ?? entry.beforeCO2 ?? 0),
      action:
        (entry.selectedRecommendations || [])
          .slice?.(0, 2)
          .map((r: any) => r?.title || String(r))
          .join(' + ') || 'Climate Action',
      resources: entry.supportedBy || 'Active Partner',
      supportedBy: entry.supportedBy || 'Active Partner',
      story: 'This school is reducing emissions through its selected action plan and support network.',
    }))
    .filter((school) => school.beforeCO2 > 0);

  return schools.length ? schools : demoSchools;
}

export function ImpactLedger() {
  const [schoolsData, setSchoolsData] = useState<SchoolImpact[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<SchoolImpact | null>(null);

  useEffect(() => {
    setSchoolsData(buildSchools());
  }, []);

  const totalCO2 = useMemo(() => schoolsData.reduce((sum, school) => sum + Math.max(0, school.beforeCO2 - school.afterCO2), 0), [schoolsData]);
  const treesEquivalent = useMemo(() => Math.round(totalCO2 / 21.7), [totalCO2]);
  const sortedSchools = useMemo(() => [...schoolsData].sort((a, b) => (b.beforeCO2 - b.afterCO2) - (a.beforeCO2 - a.afterCO2)), [schoolsData]);

  const districtCount = useMemo(() => {
    const count: Record<string, number> = {};
    schoolsData.forEach((school) => {
      count[school.district] = (count[school.district] || 0) + 1;
    });
    return count;
  }, [schoolsData]);

  function getRowColor(co2Reduced: number): string {
    if (co2Reduced > 500) return 'bg-emerald-50/80';
    if (co2Reduced >= 100) return 'bg-amber-50/60';
    return 'bg-white';
  }

  return (
    <div className="min-h-screen bg-[#f3f8ef] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-[1.75rem] border border-emerald-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-emerald-700">Harit Pathshala — Nepal School Impact Tracker</p>
              <h1 className="mt-2 text-3xl font-semibold text-emerald-800">Impact Ledger Dashboard</h1>
            </div>
            <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              Public dashboard, no login required
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
          <div className="space-y-6 rounded-[1.75rem] border border-emerald-100 bg-white p-6 shadow-sm">
            <div className="rounded-2xl bg-emerald-50 p-5">
              <p className="text-sm font-medium text-emerald-700">Total CO₂ Reduced by All Schools</p>
              <div className="mt-3 flex items-end gap-3 text-emerald-900">
                <span className="text-5xl font-semibold leading-none">{totalCO2.toLocaleString()}</span>
                <span className="pb-1 text-lg font-medium">kg</span>
              </div>
              <p className="mt-2 text-xs text-emerald-700">Since Launch</p>
              <div className="mt-4 flex items-center gap-2 text-xs text-emerald-700">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-700" />
                <span>≈ {treesEquivalent.toLocaleString()} trees</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="mb-3 text-sm font-semibold text-slate-700">Active School Districts</p>
              <div className="space-y-2 text-xs max-h-48 overflow-y-auto pr-1">
                {Object.entries(districtCount).length > 0 ? (
                  Object.entries(districtCount).map(([district, count]) => (
                    <div key={district} className="flex items-center justify-between rounded-lg bg-white px-3 py-2">
                      <span className="text-slate-700">{district}</span>
                      <div className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-emerald-600" />
                        <span className="font-semibold text-emerald-700">{count}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-500">No data yet</div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4 overflow-hidden">
              <p className="mb-3 text-sm font-semibold text-emerald-800">Nepal Map</p>
              <img src={mapImage} alt="Nepal map showing active school districts" className="w-full rounded-lg object-cover" />
              <div className="mt-2 text-xs text-emerald-700">Colored regions show elevation; schools active across districts</div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="overflow-hidden rounded-[1.75rem] border border-emerald-100 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead className="bg-[#f1f7ea] text-sm text-emerald-900">
                    <tr>
                      <th className="px-6 py-4 font-semibold">School Name</th>
                      <th className="px-6 py-4 font-semibold">District</th>
                      <th className="px-6 py-4 font-semibold">CO₂ Reduced (kg)</th>
                      <th className="px-6 py-4 font-semibold">Actions</th>
                      <th className="px-6 py-4 font-semibold">Resources</th>
                      <th className="px-6 py-4 font-semibold">Supported By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-50 text-sm">
                    {sortedSchools.map((school) => {
                      const co2Reduced = school.beforeCO2 - school.afterCO2;
                      return (
                        <tr key={`${school.name}-${school.district}`} className={`${getRowColor(co2Reduced)} cursor-pointer transition-colors hover:opacity-80`} onClick={() => setSelectedSchool(school)}>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <Award className="h-5 w-5 text-emerald-700" />
                              <span className="font-medium text-slate-800">{school.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-600">{school.district}</td>
                          <td className="px-6 py-4 font-semibold text-emerald-700">{Math.round(co2Reduced)}</td>
                          <td className="px-6 py-4 text-slate-600">{school.action}</td>
                          <td className="px-6 py-4 text-slate-600">{school.resources}</td>
                          <td className="px-6 py-4">
                            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">{school.supportedBy}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid gap-6 rounded-[1.75rem] border border-emerald-100 bg-white p-6 shadow-sm lg:grid-cols-[1.2fr_1fr]">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Globe2 className="h-4 w-4 text-emerald-700" />
                  Fund Pool Available: NPR 5,00,000
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  {supportOrganizations.map((org) => (
                    <div key={org.name} className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-xs">
                      <span className="text-lg">{org.logo}</span>
                      <span className="font-semibold text-slate-700">{org.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl bg-emerald-50 p-5 text-sm text-emerald-900">
                <div className="flex items-center gap-2 font-semibold">
                  <Users className="h-4 w-4" />
                  Impact Overview
                </div>
                <p className="mt-3 text-emerald-800">
                  {sortedSchools.length} {sortedSchools.length === 1 ? 'school' : 'schools'} across {Object.keys(districtCount).length} districts actively reducing emissions.
                </p>
              </div>
            </div>
          </div>
        </div>

        {selectedSchool && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={() => setSelectedSchool(null)}>
            <div className="max-w-lg rounded-[1.75rem] bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">School Details</p>
                  <h3 className="mt-2 text-2xl font-semibold text-slate-900">{selectedSchool.name}</h3>
                </div>
                <button className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600" onClick={() => setSelectedSchool(null)}>
                  Close
                </button>
              </div>
              <div className="mt-4 space-y-2 text-sm text-slate-700">
                <p><span className="font-semibold">District:</span> {selectedSchool.district}</p>
                <p><span className="font-semibold">CO₂ Reduced:</span> {Math.round(selectedSchool.beforeCO2 - selectedSchool.afterCO2)} kg</p>
                <p><span className="font-semibold">Action:</span> {selectedSchool.action}</p>
                <p><span className="font-semibold">Impact story:</span> {selectedSchool.story}</p>
              </div>
            </div>
          </div>
        )}

        {totalCO2 > 0 && (
          <div className="rounded-[1.75rem] border border-emerald-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Average reduction: {Math.round((totalCO2 / Math.max(sortedSchools.length, 1)) / Math.max((sortedSchools.reduce((sum, school) => sum + school.beforeCO2, 0) / Math.max(sortedSchools.length, 1)), 1) * 100)}% across all active schools</span>
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-700">
                <TrendingDown className="h-4 w-4" />
                Rising every month
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
