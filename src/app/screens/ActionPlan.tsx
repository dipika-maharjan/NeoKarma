import { useEffect, useState } from 'react';
import { useLanguage } from '../components/LanguageContext';
import { Circle, Upload, CalendarDays, CheckCircle2, Gauge } from 'lucide-react';
import { getCurrentSchoolProfile } from '../utils/schoolSession';
import { ensureMvpAnalysis, type ActionPlanBundle } from '../utils/mvpPlanner';

export function ActionPlan() {
  const { t } = useLanguage();
  const [selectedTask, setSelectedTask] = useState<number | null>(null);
  const [plan, setPlan] = useState<ActionPlanBundle | null>(null);

  useEffect(() => {
    const profile = getCurrentSchoolProfile();
    const analysis = ensureMvpAnalysis(profile);
    setPlan(analysis.actionPlan);
  }, []);

  if (!plan) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-8 text-center">
        <div>
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
          <p className="text-foreground font-medium">Generating your 3-month action plan...</p>
          <p className="text-sm text-muted-foreground mt-1">Using the saved carbon profile and recommendations</p>
        </div>
      </div>
    );
  }

  const planData = [
    { month: 1, title_en: plan.month1.title_en, title_np: plan.month1.title_np, weeks: plan.month1.weeks },
    { month: 2, title_en: plan.month2.title_en, title_np: plan.month2.title_np, weeks: plan.month2.weeks },
    { month: 3, title_en: plan.month3.title_en, title_np: plan.month3.title_np, weeks: plan.month3.weeks },
  ];

  const totalTasks = planData.reduce((sum, month) => sum + month.weeks.length, 0);
  const completedTasks = 0;
  const progressPercent = 0;
  const schoolProfile = getCurrentSchoolProfile();

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-foreground mb-2">3-{t('month')} {t('action_plan')}</h1>
        <p className="text-muted-foreground">Generated from your current emission profile and recommended actions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="rounded-xl border border-border bg-white p-4">
          <div className="flex items-center gap-3 mb-2">
            <CalendarDays className="w-5 h-5 text-primary" />
            <p className="text-sm font-medium text-foreground">Plan length</p>
          </div>
          <p className="text-lg font-semibold text-foreground">3 months</p>
          <p className="text-xs text-muted-foreground">Weekly tasks designed for your MVP flow.</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-4">
          <div className="flex items-center gap-3 mb-2">
            <Gauge className="w-5 h-5 text-primary" />
            <p className="text-sm font-medium text-foreground">Current completion</p>
          </div>
          <p className="text-lg font-semibold text-foreground">{progressPercent}%</p>
          <p className="text-xs text-muted-foreground">Updates are saved locally when you add proof later.</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-4">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            <p className="text-sm font-medium text-foreground">Generated for</p>
          </div>
          <p className="text-lg font-semibold text-foreground">{schoolProfile?.schoolName || 'your school'}</p>
          <p className="text-xs text-muted-foreground">Based on the saved school profile and emissions.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-foreground">Overall Progress</h3>
          <span className="text-2xl font-semibold text-primary">{progressPercent}%</span>
        </div>
        <div className="h-3 bg-accent rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-3 text-sm text-muted-foreground">
          <span>{completedTasks} of {totalTasks} tasks completed</span>
          <span>{totalTasks - completedTasks} remaining</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {planData.map((monthData) => (
          <div key={monthData.month} className="bg-white rounded-xl border border-border p-6 shadow-sm">
            <div className="flex items-start justify-between gap-3 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                  {monthData.month}
                </div>
                <div>
                  <h3 className="font-medium text-foreground">{t('month')} {monthData.month}</h3>
                  <span className="text-xs text-muted-foreground">{monthData.title_en}</span>
                </div>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">{monthData.title_np}</span>
            </div>

            <div className="space-y-3">
              {monthData.weeks.map((week, index) => (
                <div
                  key={`${monthData.month}-${week.week}`}
                  className="p-4 rounded-lg border border-border bg-gradient-to-br from-white to-accent/40 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <Circle className="w-5 h-5 text-gray-300" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground mb-1">
                        {t('week')} {index + 1}
                      </p>
                      <p className="text-sm font-medium text-foreground">{week.task_en}</p>
                      <p className="text-xs text-primary/80 mt-1">{week.task_np}</p>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <span className="inline-flex rounded-full bg-accent px-2 py-1 text-[11px] font-medium text-foreground">
                          {week.category}
                        </span>
                        <button
                          onClick={() => setSelectedTask(week.week)}
                          className="flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          <Upload className="w-3 h-3" />
                          {t('upload_proof')}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="font-medium text-foreground mb-4">{t('upload_proof')}</h3>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center mb-4">
              <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-foreground mb-1">Upload photo proof</p>
              <p className="text-xs text-muted-foreground">Click to browse or drag and drop</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedTask(null)}
                className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setSelectedTask(null)}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:shadow-lg transition-all"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
