import { useState, useEffect } from 'react';
import { useLanguage } from '../components/LanguageContext';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { AlertTriangle, TreePine, Droplets, Car, TrendingDown, Users } from 'lucide-react';
import {
  getCurrentMonthStudentEmissions,
  getStudentSubmissionCount,
  getCurrentMonthStudentEmissionsBySchool,
  getStudentSubmissionCountBySchool,
  getAvailableSchools,
} from '../utils/studentDataStorage';
import SCHOOLS from '../data/schools';
import { StudentSubmissionsView } from '../components/StudentSubmissionsView';
import { getCurrentSchoolProfile } from '../utils/schoolSession';

export function CarbonReport() {
  const { t } = useLanguage();
  const schoolProfile = getCurrentSchoolProfile();
  const [includeStudentData, setIncludeStudentData] = useState(false);
  const [studentEmissions, setStudentEmissions] = useState(0);
  const [studentCount, setStudentCount] = useState(0);
  const [selectedSchool, setSelectedSchool] = useState('');
  const [availableSchools, setAvailableSchools] = useState<string[]>([]);

  useEffect(() => {
    const schools = Array.from(
      new Set([
        ...(schoolProfile?.schoolName ? [schoolProfile.schoolName] : []),
        ...SCHOOLS,
        ...getAvailableSchools(),
      ])
    );
    setAvailableSchools(schools);
    const initialSchool = schoolProfile?.schoolName || schools[0] || '';
    setSelectedSchool(initialSchool);
    if (initialSchool) {
      setStudentEmissions(getCurrentMonthStudentEmissionsBySchool(initialSchool));
      setStudentCount(getStudentSubmissionCountBySchool(initialSchool));
    } else {
      setStudentEmissions(getCurrentMonthStudentEmissions());
      setStudentCount(getStudentSubmissionCount());
    }
  }, []);

  useEffect(() => {
    if (selectedSchool) {
      setStudentEmissions(getCurrentMonthStudentEmissionsBySchool(selectedSchool));
      setStudentCount(getStudentSubmissionCountBySchool(selectedSchool));
    } else {
      setStudentEmissions(getCurrentMonthStudentEmissions());
      setStudentCount(getStudentSubmissionCount());
    }
  }, [selectedSchool]);

  // School data (base emissions)
  const schoolEmissions = {
    electricity: 215,
    transport: 87,
    waste: 30,
    cooking: 10,
  };

  const totalSchoolEmissions = schoolEmissions.electricity + schoolEmissions.transport + schoolEmissions.waste + schoolEmissions.cooking;
  const hasStudentContext = availableSchools.length > 0 || Boolean(schoolProfile?.schoolName);
  
  // Calculate combined emissions
  const totalEmissions = includeStudentData ? totalSchoolEmissions + Math.round(studentEmissions) : totalSchoolEmissions;
  
  // Build data with or without student data
  let data;
  if (includeStudentData && studentEmissions > 0) {
    data = [
      { name: 'Electricity', value: schoolEmissions.electricity, percent: Math.round((schoolEmissions.electricity / totalEmissions) * 100) },
      { name: 'Transport', value: schoolEmissions.transport + Math.round(studentEmissions * 0.6), percent: Math.round(((schoolEmissions.transport + Math.round(studentEmissions * 0.6)) / totalEmissions) * 100) },
      { name: 'Waste', value: schoolEmissions.waste + Math.round(studentEmissions * 0.3), percent: Math.round(((schoolEmissions.waste + Math.round(studentEmissions * 0.3)) / totalEmissions) * 100) },
      { name: 'Cooking', value: schoolEmissions.cooking + Math.round(studentEmissions * 0.1), percent: Math.round(((schoolEmissions.cooking + Math.round(studentEmissions * 0.1)) / totalEmissions) * 100) },
    ];
  } else {
    data = [
      { name: 'Electricity', value: schoolEmissions.electricity, percent: 63 },
      { name: 'Transport', value: schoolEmissions.transport, percent: 25 },
      { name: 'Waste', value: schoolEmissions.waste, percent: 9 },
      { name: 'Cooking', value: schoolEmissions.cooking, percent: 3 },
    ];
  }

  const colors = ['#dc2626', '#f97316', '#fbbf24', '#3B7A2B'];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f0fdf4_0%,#f8fafc_44%,#fff7ed_100%)] p-2 sm:p-3">
      <div className="mx-auto max-w-6xl rounded-[2rem] border border-emerald-100 bg-white/96 p-4 sm:p-5 lg:p-6 shadow-[0_30px_80px_rgba(15,23,42,0.12)]">
      <div className="mb-6 overflow-hidden rounded-[1.75rem] border border-emerald-100 bg-white shadow-sm">
        <div className="grid gap-6 p-6 sm:p-7 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-600">{t('carbon_report')}</p>
            <h1 className="mt-2 text-3xl font-semibold text-foreground">Your school's carbon footprint</h1>
            {schoolProfile?.schoolName && (
              <p className="mt-2 text-sm text-muted-foreground">
                {schoolProfile.schoolName}
              </p>
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
              <Users className="w-6 h-6 text-emerald-700" />
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
                  {availableSchools.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <label className="flex items-center gap-3 rounded-full border border-emerald-100 bg-white/95 px-4 py-2 shadow-sm">
                <span className="text-sm font-medium text-emerald-900">Include student data</span>
                <input
                  type="checkbox"
                  checked={includeStudentData}
                  onChange={(e) => setIncludeStudentData(e.target.checked)}
                  className="w-5 h-5 cursor-pointer rounded border-emerald-300 accent-emerald-700"
                />
              </label>
            </div>
          </div>
        </div>
      )}
        <StudentSubmissionsView schoolId={selectedSchool || undefined} />


      <div className="mb-6 rounded-[1.75rem] bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-800 p-8 text-white text-center shadow-[0_20px_45px_rgba(22,101,52,0.25)]">
        <h2 className="text-lg opacity-90 mb-2">{t('total_co2')}</h2>
        <div className="flex items-baseline justify-center gap-3 mb-4">
          <span className="text-6xl font-semibold">{totalEmissions}</span>
          <span className="text-2xl opacity-90">{t('kg_co2')}</span>
        </div>
        <div className="inline-block bg-white/20 rounded-lg px-6 py-2">
          <span className="text-sm">May 2026</span>
        </div>
        {includeStudentData && studentEmissions > 0 && (
          <p className="text-sm mt-4 opacity-90">School: {totalSchoolEmissions} kg + Students: {Math.round(studentEmissions)} kg</p>
        )}
      </div>

      <div className="mb-6 rounded-[1.5rem] border border-emerald-100 bg-white p-6">
        <h3 className="font-medium text-foreground mb-4">Breakdown by Category</h3>
        <div className="h-64 mb-6">
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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {data.map((item, index) => (
            <div key={item.name} className="text-center">
              <div className="w-3 h-3 rounded-full mx-auto mb-2" style={{ backgroundColor: colors[index] }} />
              <p className="text-sm text-muted-foreground mb-1">{item.name}</p>
              <p className="text-lg font-semibold text-foreground">{item.percent}%</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6 rounded-[1.5rem] border border-amber-200 bg-amber-50 p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-amber-900 mb-1">{t('biggest_issue')}: Electricity ({data[0].percent}%)</h3>
            <p className="text-sm text-amber-800">
              Your electricity consumption is the main contributor to carbon emissions.
              Consider switching to solar or reducing usage during peak hours.
            </p>
          </div>
        </div>
      </div>

      <div className="mb-6 rounded-[1.5rem] border border-emerald-100 bg-white p-6">
        <h3 className="font-medium text-foreground mb-4">{t('emotional_impact')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4">
            <TreePine className="w-12 h-12 text-emerald-700 mx-auto mb-3" />
            <p className="text-3xl font-semibold text-foreground mb-1">{Math.round((totalEmissions / 3.8) * 1.2)}</p>
            <p className="text-sm text-muted-foreground">Trees needed to absorb this CO₂</p>
          </div>
          <div className="text-center p-4">
            <Droplets className="w-12 h-12 text-blue-600 mx-auto mb-3" />
            <p className="text-3xl font-semibold text-foreground mb-1">{Math.round(totalEmissions * 36.5)}</p>
            <p className="text-sm text-muted-foreground">Liters of water equivalent impact</p>
          </div>
          <div className="text-center p-4">
            <Car className="w-12 h-12 text-orange-600 mx-auto mb-3" />
            <p className="text-3xl font-semibold text-foreground mb-1">{Math.round(totalEmissions * 3.7)}</p>
            <p className="text-sm text-muted-foreground">km driven by car equivalent</p>
          </div>
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-emerald-100 bg-white p-6">
        <h3 className="font-medium text-foreground mb-4">{t('before_after')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="text-center p-6 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-sm text-muted-foreground mb-2">Before (April 2026)</p>
            <p className="text-4xl font-semibold text-foreground mb-1">425</p>
            <p className="text-sm text-muted-foreground">{t('kg_co2')}</p>
          </div>
          <div className="text-center p-6 bg-emerald-50 rounded-xl border border-emerald-100">
            <p className="text-sm text-muted-foreground mb-2">After (May 2026)</p>
            <p className="text-4xl font-semibold text-emerald-700 mb-1">{totalEmissions}</p>
            <p className="text-sm text-muted-foreground">{t('kg_co2')}</p>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-center gap-2 text-emerald-700">
          <TrendingDown className="w-6 h-6" />
          <span className="text-2xl font-semibold">-{Math.round(((425 - totalEmissions) / 425) * 100)}%</span>
          <span className="text-muted-foreground">reduction</span>
        </div>
      </div>
      </div>
    </div>
  );
}
