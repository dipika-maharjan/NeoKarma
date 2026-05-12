import { useMemo } from 'react';
import { Award, MapPin, TreePine, TrendingDown, Users } from 'lucide-react';
import { useLanguage } from '../components/LanguageContext';
import { getCurrentSchoolProfile, getRegisteredSchoolSummaries } from '../utils/schoolSession';

const supporters = ['WWF Nepal', 'AEPC', 'NCELL', 'ASIA', 'Chaudhary Group'];

export function Dashboard() {
  const { t } = useLanguage();
  const schoolProfile = getCurrentSchoolProfile();
  const registeredSchools = useMemo(() => getRegisteredSchoolSummaries(), []);
  const totalCO2Reduced = registeredSchools.reduce((sum, school) => sum + school.co2Reduced, 0);
  const activeSchoolCount = registeredSchools.length;

  return (
    <div className="mx-auto max-w-8xl p-3 sm:p-4 lg:p-5">
      <div className="mb-4 rounded-2xl border border-emerald-100 bg-white p-4 sm:p-5">
        <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-600">{t('current_school')}</p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">
              {schoolProfile?.schoolName || 'Shree Jana Jyoti School'}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {schoolProfile?.district || 'Kathmandu'}
              {schoolProfile?.province ? `, ${schoolProfile.province}` : ''}
            </p>
          </div>

          <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
            <p className="text-[11px] uppercase tracking-wide text-emerald-700">Type</p>
            <p className="mt-1 font-medium text-emerald-900">{schoolProfile?.archetype || t('urban')}</p>
          </div>
        </div>
      </div>

      <div className="mb-4 rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-4 text-primary-foreground sm:p-6">
        <h3 className="text-lg opacity-90">Harit Pathshala - Nepal School Impact Tracker</h3>
        <div className="mt-4 flex flex-wrap items-end gap-x-3 gap-y-2">
          <span className="text-5xl font-semibold sm:text-6xl">{totalCO2Reduced.toLocaleString()}</span>
          <span className="pb-2 text-xl opacity-90">{t('kg_co2')}</span>
        </div>
        <p className="mt-1 text-sm opacity-90">Since launch</p>

        <div className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
          <div className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-3">
            <Users className="h-5 w-5" />
            <span>4 active schools</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-3">
            <TrendingDown className="h-5 w-5" />
            <span>26% average reduction</span>
          </div>
        </div>
      </div>

      <div className="mb-4 rounded-2xl border border-border bg-white p-4 sm:p-5">
        <div className="mb-3 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          <h3 className="font-medium text-foreground">Registered School Footprint</h3>
        </div>

        <div className="rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-4 sm:p-5">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-sm text-muted-foreground">Schools are pulled from `schoolData`, not a manual list.</p>
              <p className="mt-2 text-3xl font-semibold text-foreground">{activeSchoolCount} registered schools</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {registeredSchools.slice(0, 4).map((school) => (
                <span
                  key={school.key}
                  className="rounded-full border border-emerald-100 bg-white px-3 py-2 text-sm font-medium text-emerald-900"
                >
                  {school.schoolName}
                </span>
              ))}
            </div>
          </div>
          <div className="mt-4 rounded-xl border border-dashed border-emerald-200 bg-white/70 p-4 text-sm text-muted-foreground">
            Add location data later if you want to plot these schools on the map. The table below already uses the real registered records.
          </div>
        </div>
      </div>

      <div className="mb-4 overflow-hidden rounded-2xl border border-border bg-white">
        <div className="border-b border-border bg-accent/60 px-4 py-3 sm:px-5">
          <h3 className="font-medium text-foreground">Top Impact Schools</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px]">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground sm:px-5">School Name</th>
                <th className="px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground sm:px-5">{t('district')}</th>
                <th className="px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground sm:px-5">CO₂ Reduced (kg)</th>
                <th className="px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground sm:px-5">{t('actions_taken')}</th>
                <th className="px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground sm:px-5">{t('resources_received')}</th>
                <th className="px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground sm:px-5">{t('supported_by')}</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {registeredSchools.length > 0 ? registeredSchools.map((school) => (
                <tr key={school.key} className="hover:bg-accent/40">
                  <td className="px-4 py-2 sm:px-5">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-emerald-100 p-2 text-emerald-800">
                        <Award className="h-4 w-4" />
                      </div>
                      <span className="font-medium text-foreground">{school.schoolName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-muted-foreground sm:px-5">{school.district}</td>
                  <td className="px-4 py-2 sm:px-5">
                    <span className="font-semibold text-primary">{school.co2Reduced.toLocaleString()}</span>
                  </td>
                  <td className="px-4 py-2 text-muted-foreground sm:px-5">{school.actionsTaken}</td>
                  <td className="px-4 py-2 text-muted-foreground sm:px-5">{school.resourcesReceived}</td>
                  <td className="px-4 py-2 sm:px-5">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">{school.supportedBy}</span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td className="px-4 py-6 text-center text-muted-foreground sm:px-5" colSpan={6}>
                    No registered schools found yet. Complete registration to populate this table.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-white p-4 sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-medium text-foreground">{t('fund_pool')}: NPR 12,45,000</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TreePine className="h-4 w-4 text-primary" />
            Pool available for school climate actions
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="pt-2 text-sm text-muted-foreground">{t('contributed_by')}:</span>
          {supporters.map((supporter) => (
            <span
              key={supporter}
              className="rounded-lg border border-border bg-accent px-3 py-2 text-sm font-medium text-foreground"
            >
              {supporter}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
