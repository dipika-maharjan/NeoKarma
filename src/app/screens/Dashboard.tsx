import { useEffect, useState } from 'react';
import { useLanguage } from '../components/LanguageContext';
import { StatCard } from '../components/StatCard';
import { ActivityItem } from '../components/ActivityItem';
import { CloudRain, TreePine, Zap, Recycle, Users, Calendar, TrendingDown } from 'lucide-react';
import { Link } from 'react-router';
import { getCurrentSchoolProfile } from '../utils/schoolSession';
import { ensureMvpAnalysis, type MvpAnalysisBundle } from '../utils/mvpPlanner';

export function Dashboard() {
  const { t } = useLanguage();
  const schoolProfile = getCurrentSchoolProfile();
  const [analysis, setAnalysis] = useState<MvpAnalysisBundle | null>(null);

  useEffect(() => {
    setAnalysis(ensureMvpAnalysis(schoolProfile));
  }, [schoolProfile]);

  const emissions = analysis?.emissions;
  const totalCO2 = emissions?.totalCO2 ?? 0;
  const energyCO2 = emissions ? emissions.electricityCO2 + emissions.dieselCO2 : 0;
  const transportCO2 = emissions ? Math.round(emissions.studentCO2 * 0.7) : 0;
  const wasteCO2 = emissions ? emissions.wasteCO2 : 0;
  const progressPercent = totalCO2 > 0 ? Math.min(100, Math.max(10, 100 - Math.round(totalCO2 / 5))) : 0;

  if (!analysis) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-8 text-center">
        <div>
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
          <p className="text-foreground font-medium">Loading your dashboard...</p>
          <p className="text-sm text-muted-foreground mt-1">Reading saved school data and carbon analysis</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="mb-6 overflow-hidden rounded-[2rem] border border-emerald-100 bg-white shadow-sm">
          <div className="grid gap-6 p-6 sm:p-7 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-600">{t('current_school')}</p>
              <h2 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">{schoolProfile?.schoolName || 'Kathmandu Model School'}</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {schoolProfile?.district || 'Kathmandu'}{schoolProfile?.province ? `, ${schoolProfile.province}` : ''}
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
              <p className="text-[11px] uppercase tracking-wide text-emerald-700">Type</p>
              <p className="mt-1 text-base font-semibold text-emerald-900">{schoolProfile?.archetype || t('urban')}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-8 text-primary-foreground mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-lg opacity-90 mb-2">{t('monthly_footprint')}</h2>
              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-semibold">{totalCO2}</span>
                <span className="text-xl opacity-90">{t('kg_co2')}</span>
              </div>
            </div>
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-2xl font-semibold">{progressPercent}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white/10 rounded-lg px-4 py-3">
            <TreePine className="w-5 h-5" />
            <span className="text-sm">= {Math.round(totalCO2 / 21.7)} {t('trees_needed')}</span>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="opacity-90">{t('progress_to_goal')}</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <StatCard
            icon={<Zap className="w-6 h-6 text-primary" />}
            title={t('energy_co2')}
            value={String(energyCO2)}
            unit={t('kg_co2')}
            iconBg="bg-orange-50"
          />
          <StatCard
            icon={<CloudRain className="w-6 h-6 text-primary" />}
            title={t('transport_co2')}
            value={String(transportCO2)}
            unit={t('kg_co2')}
            iconBg="bg-blue-50"
          />
          <StatCard
            icon={<Recycle className="w-6 h-6 text-primary" />}
            title={t('waste_co2')}
            value={String(wasteCO2)}
            unit={t('kg_co2')}
            iconBg="bg-green-50"
          />
        </div>

        <Link
          to="/data-entry"
          className="block w-full bg-primary text-primary-foreground rounded-xl p-6 hover:shadow-lg transition-all text-center"
        >
          <TrendingDown className="w-8 h-8 mx-auto mb-2" />
          <span className="text-lg font-medium">{t('enter_monthly_data')}</span>
        </Link>
      </div>

      <div>
        <h2 className="mb-4">{t('recent_activities')}</h2>
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <ActivityItem
            icon={<TreePine className="w-5 h-5" />}
            title="School Garden Plantation Drive"
            date="May 2, 2026"
            status="complete"
            statusText={t('complete')}
          />
          <ActivityItem
            icon={<Recycle className="w-5 h-5" />}
            title="Paper Recycling Workshop"
            date="May 3, 2026"
            status="in_progress"
            statusText={t('in_progress')}
          />
          <ActivityItem
            icon={<Users className="w-5 h-5" />}
            title="Climate Awareness Assembly"
            date="May 1, 2026"
            status="complete"
            statusText={t('complete')}
          />
          <ActivityItem
            icon={<Calendar className="w-5 h-5" />}
            title="Monthly Carbon Audit"
            date="May 5, 2026"
            status="pending"
            statusText={t('pending')}
          />
        </div>
      </div>
    </div>
  );
}
