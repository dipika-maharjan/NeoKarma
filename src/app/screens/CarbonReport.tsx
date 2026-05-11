import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../components/LanguageContext';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { AlertTriangle, TreePine, Droplets, Car, TrendingDown, Users } from 'lucide-react';
import {
  getCurrentMonthStudentEmissions,
  getStudentSubmissionCount,
  getCurrentMonthStudentEmissionsBySchool,
  getStudentSubmissionCountBySchool,
} from '../utils/studentDataStorage';
import { StudentSubmissionsView } from '../components/StudentSubmissionsView';
import { ensureMvpAnalysis } from '../utils/mvpPlanner';
import { getCurrentSchoolProfile, getRegisteredSchoolSummaries } from '../utils/schoolSession';

export function CarbonReport() {
  const { t } = useLanguage();
  const schoolProfile = getCurrentSchoolProfile();
  const registeredSchools = useMemo(() => getRegisteredSchoolSummaries(), []);
  const schoolOptions = useMemo(
    () => Array.from(new Set([...(schoolProfile?.schoolName ? [schoolProfile.schoolName] : []), ...registeredSchools.map((school) => school.schoolName)])),
    [registeredSchools, schoolProfile?.schoolName]
  );

  const [includeStudentData, setIncludeStudentData] = useState(false);
  const [studentEmissions, setStudentEmissions] = useState(0);
  const [studentCount, setStudentCount] = useState(0);
  const [selectedSchool, setSelectedSchool] = useState('');

  useEffect(() => {
    const initialSchool = schoolProfile?.schoolName || schoolOptions[0] || '';
    setSelectedSchool(initialSchool);
  }, [schoolOptions, schoolProfile?.schoolName]);

  const selectedSchoolSummary = useMemo(
    () => registeredSchools.find((school) => school.schoolName === selectedSchool) || null,
    [registeredSchools, selectedSchool]
  );

  const activeSchool = selectedSchoolSummary || registeredSchools[0] || null;
  const analysis = useMemo(
    () => ensureMvpAnalysis(activeSchool?.profile || schoolProfile, activeSchool?.entry || null),
    [activeSchool, schoolProfile]
  );

  useEffect(() => {
    if (selectedSchool) {
      setStudentEmissions(getCurrentMonthStudentEmissionsBySchool(selectedSchool));
      setStudentCount(getStudentSubmissionCountBySchool(selectedSchool));
      return;
    }

    setStudentEmissions(getCurrentMonthStudentEmissions());
    setStudentCount(getStudentSubmissionCount());
  }, [selectedSchool]);

  const schoolEmissions = {
    electricity: analysis.emissions.electricityCO2 + analysis.emissions.dieselCO2,
    transport: analysis.emissions.studentCO2,
    waste: analysis.emissions.wasteCO2,
    cooking: analysis.emissions.cookingCO2,
  };

  const totalSchoolEmissions = analysis.emissions.totalCO2;
  const hasStudentContext = schoolOptions.length > 0 || Boolean(schoolProfile?.schoolName);
  const totalEmissions = includeStudentData ? totalSchoolEmissions + Math.round(studentEmissions) : totalSchoolEmissions;

  const data = includeStudentData && studentEmissions > 0
    ? [
        {
          name: 'Electricity',
          value: schoolEmissions.electricity,
          percent: totalEmissions > 0 ? Math.round((schoolEmissions.electricity / totalEmissions) * 100) : 0,
        },
        {
          name: 'Transport',
          value: schoolEmissions.transport + Math.round(studentEmissions * 0.6),
          percent:
            totalEmissions > 0
              ? Math.round(((schoolEmissions.transport + Math.round(studentEmissions * 0.6)) / totalEmissions) * 100)
              : 0,
        },
        {
          name: 'Waste',
          value: schoolEmissions.waste + Math.round(studentEmissions * 0.3),
          percent:
            totalEmissions > 0
              ? Math.round(((schoolEmissions.waste + Math.round(studentEmissions * 0.3)) / totalEmissions) * 100)
              : 0,
        },
        {
          name: 'Cooking',
          value: schoolEmissions.cooking + Math.round(studentEmissions * 0.1),
          percent:
            totalEmissions > 0
              ? Math.round(((schoolEmissions.cooking + Math.round(studentEmissions * 0.1)) / totalEmissions) * 100)
              : 0,
        },
      ]
    : [
        {
          name: 'Electricity',
          value: schoolEmissions.electricity,
          percent: totalEmissions > 0 ? Math.round((schoolEmissions.electricity / totalEmissions) * 100) : 0,
        },
        {
          name: 'Transport',
          value: schoolEmissions.transport,
          percent: totalEmissions > 0 ? Math.round((schoolEmissions.transport / totalEmissions) * 100) : 0,
        },
        {
          name: 'Waste',
          value: schoolEmissions.waste,
          percent: totalEmissions > 0 ? Math.round((schoolEmissions.waste / totalEmissions) * 100) : 0,
        },
        {
          name: 'Cooking',
          value: schoolEmissions.cooking,
          percent: totalEmissions > 0 ? Math.round((schoolEmissions.cooking / totalEmissions) * 100) : 0,
        },
      ];

  const colors = ['#dc2626', '#f97316', '#fbbf24', '#3B7A2B'];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f0fdf4_0%,#f8fafc_44%,#fff7ed_100%)] p-2 sm:p-3">
      <div className="mx-auto max-w-6xl rounded-[2rem] border border-emerald-100 bg-white/96 p-4 shadow-[0_30px_80px_rgba(15,23,42,0.12)] sm:p-5 lg:p-6">
        <div className="mb-6 overflow-hidden rounded-[1.75rem] border border-emerald-100 bg-white shadow-sm">
          <div className="grid gap-6 p-6 sm:p-7 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-600">{t('carbon_report')}</p>
              <h1 className="mt-2 text-3xl font-semibold text-foreground">Your school's carbon footprint</h1>
              {(activeSchool?.schoolName || schoolProfile?.schoolName) && (
                <p className="mt-2 text-sm text-muted-foreground">{activeSchool?.schoolName || schoolProfile?.schoolName}</p>
              )}
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                <p className="text-[11px] uppercase tracking-wide text-emerald-700">Student submissions</p>
                <p className="mt-1 text-base font-semibold text-emerald-900">{studentCount} this month</p>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-slate-50 px-4 py-3">
                <p className="text-[11px] uppercase tracking-wide text-emerald-700/80">Student emissions</p>
                <p className="mt-1 text-base font-semibold text-emerald-900">{Math.round(studentEmissions)} kg CO₂</p>
              </div>
            </div>
          </div>
        </div>

        {hasStudentContext && (
          <div className="mb-6 rounded-[1.75rem] border border-emerald-100 bg-emerald-50/70 p-5 shadow-sm">
            <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-emerald-700" />
                <div>
                  <h3 className="font-semibold text-emerald-900">{studentCount} Student Submissions</h3>
                  <p className="text-sm text-emerald-700">{Math.round(studentEmissions)} kg CO₂ from student activities</p>
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-end">
                <div className="flex items-center gap-3 rounded-full border border-emerald-100 bg-white/95 px-4 py-2 shadow-sm">
                  <span className="text-sm font-medium text-emerald-900">School</span>
                  <select
                    value={selectedSchool}
                    onChange={(e) => setSelectedSchool(e.target.value)}
                    className="rounded-md border border-emerald-200 bg-white px-3 py-2"
                  >
                    <option value="">All schools</option>
                    {schoolOptions.map((school) => (
                      <option key={school} value={school}>
                        {school}
                      </option>
                    ))}
                  </select>
                </div>
                <label className="flex items-center gap-3 rounded-full border border-emerald-100 bg-white/95 px-4 py-2 shadow-sm">
                  <span className="text-sm font-medium text-emerald-900">Include student data</span>
                  <input
                    type="checkbox"
                    checked={includeStudentData}
                    onChange={(e) => setIncludeStudentData(e.target.checked)}
                    className="h-5 w-5 cursor-pointer rounded border-emerald-300 accent-emerald-700"
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        <StudentSubmissionsView schoolId={selectedSchool || undefined} />

        <div className="mb-6 rounded-[1.75rem] bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-800 p-8 text-center text-white shadow-[0_20px_45px_rgba(22,101,52,0.25)]">
          <h2 className="mb-2 text-lg opacity-90">{t('total_co2')}</h2>
          <div className="mb-4 flex items-baseline justify-center gap-3">
            <span className="text-6xl font-semibold">{totalEmissions}</span>
            <span className="text-2xl opacity-90">{t('kg_co2')}</span>
          </div>
          <div className="inline-block rounded-lg bg-white/20 px-6 py-2">
            <span className="text-sm">May 2026</span>
          </div>
          {includeStudentData && studentEmissions > 0 && (
            <p className="mt-4 text-sm opacity-90">School: {totalSchoolEmissions} kg + Students: {Math.round(studentEmissions)} kg</p>
          )}
        </div>

        <div className="mb-6 rounded-[1.5rem] border border-emerald-100 bg-white p-6">
          <h3 className="mb-4 font-medium text-foreground">Breakdown by Category</h3>
          <div className="mb-6 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical">
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {data.map((item, index) => (
              <div key={item.name} className="text-center">
                <div className="mx-auto mb-2 h-3 w-3 rounded-full" style={{ backgroundColor: colors[index] }} />
                <p className="mb-1 text-sm text-muted-foreground">{item.name}</p>
                <p className="text-lg font-semibold text-foreground">{item.percent}%</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6 rounded-[1.5rem] border border-amber-200 bg-amber-50 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-amber-500">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="mb-1 font-semibold text-amber-900">
                {t('biggest_issue')}: {data[0].name} ({data[0].percent}%)
              </h3>
              <p className="text-sm text-amber-800">
                {data[0].name === 'Electricity'
                  ? 'Your electricity consumption is the main contributor to carbon emissions. Consider switching to solar or reducing usage during peak hours.'
                  : data[0].name === 'Transport'
                    ? 'Transport is the main contributor right now. Safer walking routes or school-bus optimization can help.'
                    : data[0].name === 'Waste'
                      ? 'Waste is driving most of the footprint. Composting and waste separation will reduce emissions.'
                      : 'Cooking is the main contributor. Cleaner fuels and efficient stoves can reduce emissions quickly.'}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-[1.5rem] border border-emerald-100 bg-white p-6">
          <h3 className="mb-4 font-medium text-foreground">{t('emotional_impact')}</h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="p-4 text-center">
              <TreePine className="mx-auto mb-3 h-12 w-12 text-emerald-700" />
              <p className="mb-1 text-3xl font-semibold text-foreground">{Math.round((totalEmissions / 3.8) * 1.2)}</p>
              <p className="text-sm text-muted-foreground">Trees needed to absorb this CO₂</p>
            </div>
            <div className="p-4 text-center">
              <Droplets className="mx-auto mb-3 h-12 w-12 text-blue-600" />
              <p className="mb-1 text-3xl font-semibold text-foreground">{Math.round(totalEmissions * 36.5)}</p>
              <p className="text-sm text-muted-foreground">Liters of water equivalent impact</p>
            </div>
            <div className="p-4 text-center">
              <Car className="mx-auto mb-3 h-12 w-12 text-orange-600" />
              <p className="mb-1 text-3xl font-semibold text-foreground">{Math.round(totalEmissions * 3.7)}</p>
              <p className="text-sm text-muted-foreground">km driven by car equivalent</p>
            </div>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-emerald-100 bg-white p-6">
          <h3 className="mb-4 font-medium text-foreground">{t('before_after')}</h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
              <p className="mb-2 text-sm text-muted-foreground">Before (April 2026)</p>
              <p className="mb-1 text-4xl font-semibold text-foreground">{Math.max(totalSchoolEmissions + 150, totalSchoolEmissions)}</p>
              <p className="text-sm text-muted-foreground">{t('kg_co2')}</p>
            </div>
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-6 text-center">
              <p className="mb-2 text-sm text-muted-foreground">After (May 2026)</p>
              <p className="mb-1 text-4xl font-semibold text-emerald-700">{totalEmissions}</p>
              <p className="text-sm text-muted-foreground">{t('kg_co2')}</p>
            </div>
          </div>
          <div className="mt-6 flex items-center justify-center gap-2 text-emerald-700">
            <TrendingDown className="h-6 w-6" />
            <span className="text-2xl font-semibold">-{Math.round((150 / Math.max(totalSchoolEmissions + 150, 1)) * 100)}%</span>
            <span className="text-muted-foreground">reduction</span>
          </div>
        </div>
      </div>
    </div>
  );
}
