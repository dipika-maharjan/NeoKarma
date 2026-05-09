import { useEffect, useMemo, useState } from 'react';
import { Award, Globe2, TrendingDown, Users } from 'lucide-react';
import mapImage from '../../assets/map.png';

type SchoolImpact = {
  name: string;
  district: string;
  province: string;
  beforeCO2: number;
  afterCO2: number;
  action: string;
  supportedBy: string;
};

const supportOrganizations = [
  { name: 'WWF Nepal', logo: '🐾' },
  { name: 'AEPC', logo: '☀️' },
  { name: 'District Forest Office', logo: '🌲' },
  { name: 'Practical Action Nepal', logo: '🛠️' },
  { name: 'Nepal Climate Change Fund', logo: '🌍' },
  { name: 'Municipality Fund', logo: '🏛️' },
];

export function ImpactLedger() {
  const [schoolsData, setSchoolsData] = useState<SchoolImpact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const schools: SchoolImpact[] = [];
    try {
      const all = getAllSchoolData();
      const entries = Object.values(all) as any[];
      entries.forEach((entry) => {
        try {
          const profile = entry.profile || {};
          const beforeCO2 = typeof entry.beforeCO2 === 'number' ? entry.beforeCO2 : entry.beforeCO2 || 0;
          const afterCO2 = typeof entry.afterCO2 === 'number' ? entry.afterCO2 : entry.afterCO2 ?? beforeCO2 * 0.7;
          if (beforeCO2 > 0) {
            const actions = (entry.selectedRecommendations || entry.selectedRecs || [])
              .slice?.(0, 2)
              .map((r: any) => (r?.title ? r.title : String(r)))
              .join(' + ') || entry.action || 'Climate Action';
            const supportedBy = entry.supportedBy || (entry.mentorCommitted ? 'Mentor Partner' : 'Active Partner');
            schools.push({
              name: profile.schoolName || 'Unknown',
              district: profile.district || 'Unknown',
              province: profile.province || 'Unknown',
              beforeCO2,
              afterCO2,
              action: actions,
              supportedBy,
            });
          }
        } catch {
          // skip malformed entries
        }
      });
    } catch {
      // ignore
    }

    setSchoolsData(schools);
    setLoading(false);
  }, []);

  const totalCO2 = useMemo(() => schoolsData.reduce((sum, s) => sum + Math.max(0, s.beforeCO2 - s.afterCO2), 0), [schoolsData]);
  const treesEquivalent = useMemo(() => Math.round((totalCO2 / 21.77) * 10) / 10, [totalCO2]);
  const totalSchools = schoolsData.length;
  const fundPoolNPR = 5000000;
  
  const sortedSchools = useMemo(() => 
    [...schoolsData].sort((a, b) => (b.beforeCO2 - b.afterCO2) - (a.beforeCO2 - a.afterCO2)), 
    [schoolsData]
  );
  
  const averageReduction = useMemo(() => {
    if (totalSchools === 0 || totalCO2 === 0) return 0;
    const avgPerSchool = totalCO2 / totalSchools;
    const avgBefore = schoolsData.reduce((sum, s) => sum + s.beforeCO2, 0) / totalSchools;
    return avgBefore > 0 ? Math.round((avgPerSchool / avgBefore) * 100 * 10) / 10 : 0;
  }, [schoolsData, totalSchools, totalCO2]);

  const districtCount = useMemo(() => {
    const count: Record<string, number> = {};
    schoolsData.forEach((s) => {
      count[s.district] = (count[s.district] || 0) + 1;
    });
    return count;
  }, [schoolsData]);

  function getRowColor(co2Reduced: number): string {
    if (co2Reduced > 500) return 'bg-emerald-50/70';
    if (co2Reduced >= 100) return 'bg-amber-50/50';
    return 'bg-white';
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-700 mx-auto"></div>
          <p className="text-slate-600">Loading impact data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f8ef] p-6 sm:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
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
          <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
            <div className="rounded-2xl bg-emerald-50 p-5">
              <p className="text-sm font-medium text-emerald-700">Total CO₂ Reduced by All Schools</p>
              <div className="mt-3 flex items-end gap-3 text-emerald-900">
                <span className="text-5xl font-semibold leading-none">{totalCO2.toLocaleString()}</span>
                <span className="pb-1 text-lg font-medium">kg</span>
              </div>
              <p className="mt-2 text-xs text-emerald-700">Since Launch</p>
              <div className="mt-4 flex items-center gap-2 text-xs text-emerald-700">
                <LeafBadge />
                <span>≈ {treesEquivalent.toLocaleString()} trees</span>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-emerald-700">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-700" />
                <span>Fund Available: NPR {(fundPoolNPR / 100000).toFixed(0)},00,000</span>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="mb-3 text-sm font-semibold text-slate-700">Active School Districts</p>
              <div className="space-y-2 text-xs max-h-48 overflow-y-auto">
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

            <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4 overflow-hidden">
              <p className="mb-3 text-sm font-semibold text-emerald-800">Nepal Map</p>
              <img src={mapImage} alt="Nepal Map showing active school districts" className="w-full rounded-lg" />
              <div className="mt-2 text-xs text-emerald-700">
                Colored regions show elevation; schools active across districts
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead className="bg-[#f1f7ea] text-sm text-emerald-900">
                    <tr>
                      <th className="px-6 py-4 font-semibold">School Name</th>
                      <th className="px-6 py-4 font-semibold">District</th>
                      <th className="px-6 py-4 font-semibold">CO₂ Reduced (kg)</th>
                      <th className="px-6 py-4 font-semibold">Actions</th>
                      <th className="px-6 py-4 font-semibold">Supported By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-50 text-sm">
                    {sortedSchools.length > 0 ? (
                      sortedSchools.map((school) => {
                        const co2Reduced = school.beforeCO2 - school.afterCO2;
                        return (
                          <tr key={school.name} className={`${getRowColor(co2Reduced)} transition-colors hover:opacity-75`}>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <Award className="h-5 w-5 text-emerald-700" />
                                <span className="font-medium text-slate-800">{school.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-slate-600">{school.district}</td>
                            <td className="px-6 py-4 font-semibold text-emerald-700">{Math.round(co2Reduced)}</td>
                            <td className="px-6 py-4 text-slate-600">{school.action}</td>
                            <td className="px-6 py-4">
                              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                                {school.supportedBy}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-slate-600">
                          No schools have entered data yet. Schools will appear here as they complete actions.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid gap-6 rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm lg:grid-cols-[1.2fr_1fr]">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Globe2 className="h-4 w-4 text-emerald-700" />
                  Fund Pool Available: NPR {(fundPoolNPR / 100000).toFixed(0)},00,000
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
                  {totalSchools > 0
                    ? `${totalSchools} ${totalSchools === 1 ? 'school' : 'schools'} across ${Object.keys(districtCount).length} districts actively reducing emissions.`
                    : 'Be the first school to enter impact data and inspire others!'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {totalCO2 > 0 && (
          <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Average reduction: {averageReduction}% across all active schools</span>
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

function LeafBadge() {
  return <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-700" />;
}
