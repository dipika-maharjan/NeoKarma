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
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-foreground mb-2">{t('carbon_report')}</h1>
        <p className="text-muted-foreground">Your school's carbon footprint analysis</p>
        {schoolProfile?.schoolName && (
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            {t('current_school')}: {schoolProfile.schoolName}
          </div>
        )}
      </div>

      {/* Student Data Toggle */}
      {hasStudentContext && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-blue-600" />
              <div>
                <h3 className="font-semibold text-blue-900">{studentCount} Student Submissions</h3>
                <p className="text-sm text-blue-700">{Math.round(studentEmissions)} kg CO₂ from student activities</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-blue-900">School:</span>
                <select
                  value={selectedSchool}
                  onChange={(e) => setSelectedSchool(e.target.value)}
                  className="px-3 py-2 rounded border border-border bg-input-background"
                >
                  <option value="">All schools</option>
                  {availableSchools.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-blue-900">Include Student Data:</span>
                <input
                  type="checkbox"
                  checked={includeStudentData}
                  onChange={(e) => setIncludeStudentData(e.target.checked)}
                  className="w-5 h-5 rounded cursor-pointer"
                />
              </div>
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
            <h3 className="font-semibold text-amber-900 mb-1">{t('biggest_issue')}: Electricity ({data[0].percent}%)</h3>
            <p className="text-sm text-amber-800">
              Your electricity consumption is the main contributor to carbon emissions.
              Consider switching to solar or reducing usage during peak hours.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border p-6 mb-6">
        <h3 className="font-medium text-foreground mb-4">{t('emotional_impact')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4">
            <TreePine className="w-12 h-12 text-primary mx-auto mb-3" />
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
