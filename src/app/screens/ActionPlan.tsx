import { useState } from 'react';
import { useLanguage } from '../components/LanguageContext';
import { CheckCircle, Circle, Upload, Clock } from 'lucide-react';

const planData = [
  {
    month: 1,
    weeks: [
      { id: 1, task: 'Survey current energy usage', status: 'completed' },
      { id: 2, task: 'Purchase LED bulbs', status: 'completed' },
      { id: 3, task: 'Install LED lights in classrooms', status: 'completed' },
      { id: 4, task: 'Install LED lights in office areas', status: 'in_progress' },
    ]
  },
  {
    month: 2,
    weeks: [
      { id: 5, task: 'Start composting pit construction', status: 'in_progress' },
      { id: 6, task: 'Complete composting pit', status: 'upcoming' },
      { id: 7, task: 'Train students on composting', status: 'upcoming' },
      { id: 8, task: 'Begin organic waste separation', status: 'upcoming' },
    ]
  },
  {
    month: 3,
    weeks: [
      { id: 9, task: 'Launch walking group program', status: 'upcoming' },
      { id: 10, task: 'Organize tree planting event', status: 'upcoming' },
      { id: 11, task: 'Install rainwater collection system', status: 'upcoming' },
      { id: 12, task: 'Final month evaluation', status: 'upcoming' },
    ]
  },
];

export function ActionPlan() {
  const { t } = useLanguage();
  const [selectedTask, setSelectedTask] = useState<number | null>(null);

  const totalTasks = planData.reduce((sum, month) => sum + month.weeks.length, 0);
  const completedTasks = planData.reduce(
    (sum, month) => sum + month.weeks.filter(w => w.status === 'completed').length,
    0
  );
  const progressPercent = Math.round((completedTasks / totalTasks) * 100);

  const statusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-primary bg-primary/10';
      case 'in_progress': return 'text-amber-600 bg-amber-50';
      case 'upcoming': return 'text-gray-400 bg-gray-50';
      default: return 'text-gray-400 bg-gray-50';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-foreground mb-2">3-{t('month')} {t('action_plan')}</h1>
        <p className="text-muted-foreground">Track your school's carbon reduction initiatives</p>
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
          <div key={monthData.month} className="bg-white rounded-xl border border-border p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                {monthData.month}
              </div>
              <h3 className="font-medium text-foreground">
                {t('month')} {monthData.month}
              </h3>
            </div>

            <div className="space-y-3">
              {monthData.weeks.map((week, index) => (
                <div
                  key={week.id}
                  className={`p-4 rounded-lg border transition-all ${
                    week.status === 'completed'
                      ? 'border-primary/20 bg-primary/5'
                      : week.status === 'in_progress'
                      ? 'border-amber-200 bg-amber-50'
                      : 'border-border bg-white'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {week.status === 'completed' ? (
                        <CheckCircle className="w-5 h-5 text-primary" />
                      ) : week.status === 'in_progress' ? (
                        <Clock className="w-5 h-5 text-amber-600" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-300" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground mb-1">
                        {t('week')} {index + 1}
                      </p>
                      <p className={`text-sm font-medium ${
                        week.status === 'upcoming' ? 'text-muted-foreground' : 'text-foreground'
                      }`}>
                        {week.task}
                      </p>
                      {week.status === 'completed' && (
                        <button
                          onClick={() => setSelectedTask(week.id)}
                          className="mt-2 flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          <Upload className="w-3 h-3" />
                          View proof
                        </button>
                      )}
                      {week.status === 'in_progress' && (
                        <button
                          onClick={() => setSelectedTask(week.id)}
                          className="mt-2 flex items-center gap-1 text-xs text-amber-600 hover:underline"
                        >
                          <Upload className="w-3 h-3" />
                          {t('upload_proof')}
                        </button>
                      )}
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
