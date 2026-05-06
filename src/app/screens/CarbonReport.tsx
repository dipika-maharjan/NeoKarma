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
import { ensureMvpAnalysis, type MvpAnalysisBundle } from '../utils/mvpPlanner';

export function CarbonReport() {
  const { t } = useLanguage();
  const schoolProfile = getCurrentSchoolProfile();
  const [analysis, setAnalysis] = useState<MvpAnalysisBundle | null>(null);
  const [includeStudentData, setIncludeStudentData] = useState(false);
  const [studentEmissions, setStudentEmissions] = useState(0);
  const [studentCount, setStudentCount] = useState(0);
  const [selectedSchool, setSelectedSchool] = useState('');
  const [availableSchools, setAvailableSchools] = useState<string[]>([]);

  useEffect(() => {
    setAnalysis(ensureMvpAnalysis(schoolProfile));
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

  if (!analysis) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6 text-center">
        <div>
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
          <p className="text-foreground font-medium">Generating your school carbon report...</p>
          <p className="text-sm text-muted-foreground mt-1">Reading saved school and monthly data</p>
        </div>
      </div>
    );
  }

  const emissions = analysis.emissions;
  const schoolOnlyTotal = Math.max(0, emissions.totalCO2 - emissions.studentCO2);
  const hasStudentContext = availableSchools.length > 0 || Boolean(schoolProfile?.schoolName);
  
  const totalEmissions = includeStudentData ? emissions.totalCO2 : schoolOnlyTotal;
  const transportFromStudents = Math.round(emissions.studentCO2 * 0.7);
  const wasteFromStudents = Math.round(emissions.studentCO2 * 0.3);
  
  const data = [
    {
      name: 'Energy',
      value: analysis.emissions.electricityCO2 + analysis.emissions.dieselCO2,
      percent: Math.round(((analysis.emissions.electricityCO2 + analysis.emissions.dieselCO2) / Math.max(totalEmissions, 1)) * 100),
    },
    {
      name: 'Transport',
      value: includeStudentData ? transportFromStudents : 0,
      percent: includeStudentData ? Math.round((transportFromStudents / Math.max(totalEmissions, 1)) * 100) : 0,
    },
    {
      name: 'Cooking',
      value: analysis.emissions.cookingCO2,
      percent: Math.round((analysis.emissions.cookingCO2 / Math.max(totalEmissions, 1)) * 100),
    },
    {
      name: 'Waste',
      value: includeStudentData ? analysis.emissions.wasteCO2 : Math.max(0, analysis.emissions.wasteCO2 - wasteFromStudents),
      percent: Math.round((Math.max(0, includeStudentData ? analysis.emissions.wasteCO2 : analysis.emissions.wasteCO2 - wasteFromStudents) / Math.max(totalEmissions, 1)) * 100),
    },
  ];

  const colors = ['#dc2626', '#f97316', '#fbbf24', '#3B7A2B'];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-8 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
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
            <div className="rounded-2xl border border-border bg-slate-50 px-4 py-3">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Student emissions</p>
              <p className="mt-1 text-base font-semibold text-foreground">{Math.round(studentEmissions)} kg CO₂</p>
            </div>
          </div>
        </div>
      </div>

      {hasStudentContext && (
        <div className="mb-6 rounded-[1.75rem] border border-blue-100 bg-blue-50/80 p-5 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-blue-600" />
              <div>
                <h3 className="font-semibold text-blue-900">{studentCount} Student Submissions</h3>
                <p className="text-sm text-blue-700">{Math.round(studentEmissions)} kg CO₂ from student activities</p>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-end">
              <div className="flex items-center gap-3 rounded-full bg-white/90 px-4 py-2 shadow-sm">
                <span className="text-sm font-medium text-blue-900">School</span>
                <select
                  value={selectedSchool}
                  onChange={(e) => setSelectedSchool(e.target.value)}
                  className="rounded-md border border-border bg-input-background px-3 py-2"
                >
                  <option value="">All schools</option>
                  {availableSchools.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <label className="flex items-center gap-3 rounded-full bg-white/90 px-4 py-2 shadow-sm">
                <span className="text-sm font-medium text-blue-900">Include student data</span>
                <input
                  type="checkbox"
                  checked={includeStudentData}
                  onChange={(e) => setIncludeStudentData(e.target.checked)}
                  className="w-5 h-5 rounded cursor-pointer"
                />
              </label>
            </div>
          </div>
        </div>
      )}
        <StudentSubmissionsView schoolId={selectedSchool || undefined} />


      <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-8 text-primary-foreground mb-8 text-center">
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

      <div className="bg-white rounded-xl border border-border p-6 mb-6">
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

      <div className="bg-amber-50 border-2 border-amber-500 rounded-xl p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-amber-900 mb-1">{t('biggest_issue')}: {emissions.biggestSourceLabel} ({data.find((item) => item.name.toLowerCase() === emissions.biggestSourceLabel.toLowerCase())?.percent ?? 0}%)</h3>
            <p className="text-sm text-amber-800">
              {emissions.biggestSourceLabel === 'Energy'
                ? 'Your electricity and generator use are the main contributors to carbon emissions. Consider switching to solar or reducing usage during peak hours.'
                : emissions.biggestSourceLabel === 'Transport'
                  ? 'Student travel is the main contributor to carbon emissions. Walking groups and route optimization can reduce it quickly.'
                  : emissions.biggestSourceLabel === 'Cooking'
                    ? 'Cooking fuel is the main contributor to carbon emissions. Efficient stoves and fuel tracking can cut it fast.'
                    : 'Waste is the main contributor to carbon emissions. Sorting, composting, and safer disposal can reduce it.'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border p-6 mb-6">
        <h3 className="font-medium text-foreground mb-4">{t('emotional_impact')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4">
            <TreePine className="w-12 h-12 text-primary mx-auto mb-3" />
            <p className="text-3xl font-semibold text-foreground mb-1">{Math.round(totalEmissions / 21.7)}</p>
            <p className="text-sm text-muted-foreground">Trees needed to absorb this CO₂</p>
          </div>
          <div className="text-center p-4">
            <Droplets className="w-12 h-12 text-blue-600 mx-auto mb-3" />
            <p className="text-3xl font-semibold text-foreground mb-1">{Math.round(totalEmissions * 2)}</p>
            <p className="text-sm text-muted-foreground">Liters of water equivalent impact</p>
          </div>
          <div className="text-center p-4">
            <Car className="w-12 h-12 text-orange-600 mx-auto mb-3" />
            <p className="text-3xl font-semibold text-foreground mb-1">{Math.round(totalEmissions / 0.21)}</p>
            <p className="text-sm text-muted-foreground">km driven by car equivalent</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border p-6">
        <h3 className="font-medium text-foreground mb-4">{t('before_after')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="text-center p-6 bg-red-50 rounded-xl">
            <p className="text-sm text-muted-foreground mb-2">Before (April 2026)</p>
            <p className="text-4xl font-semibold text-foreground mb-1">425</p>
            <p className="text-sm text-muted-foreground">{t('kg_co2')}</p>
          </div>
          <div className="text-center p-6 bg-green-50 rounded-xl">
            <p className="text-sm text-muted-foreground mb-2">After (May 2026)</p>
            <p className="text-4xl font-semibold text-primary mb-1">{totalEmissions}</p>
            <p className="text-sm text-muted-foreground">{t('kg_co2')}</p>
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 mt-6 text-primary">
          <TrendingDown className="w-6 h-6" />
          <span className="text-2xl font-semibold">-{Math.round(((425 - totalEmissions) / 425) * 100)}%</span>
          <span className="text-muted-foreground">reduction</span>
        </div>
      </div>
    </div>
  );
}
