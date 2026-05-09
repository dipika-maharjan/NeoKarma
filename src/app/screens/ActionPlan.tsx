import { useEffect, useMemo, useState } from 'react';
import { upsertCurrentSchoolData } from '../utils/schoolSession';
import { Check, Circle, Upload, Clock3 } from 'lucide-react';

type SelectedRecommendation = { title: string; co2?: string; cost?: string; difficulty?: string };

type PlanTask = {
  id: string;
  month: 1 | 2 | 3;
  week: 1 | 2 | 3 | 4;
  label: string;
  relatedTo: string;
  requiresPhoto?: boolean;
};

const taskTemplates: Record<string, PlanTask[]> = {
  cookstove: [
    { id: 'cookstove-m1w1', month: 1, week: 1, label: 'Find cookstove supplier in local bazaar', relatedTo: 'Improved Cookstove' },
    { id: 'cookstove-m1w2', month: 1, week: 2, label: 'Purchase cookstove', relatedTo: 'Improved Cookstove' },
    { id: 'cookstove-m2w1', month: 2, week: 1, label: 'Install and start using', relatedTo: 'Improved Cookstove' },
    { id: 'cookstove-m2w2', month: 2, week: 2, label: 'Compare fuel usage with last month', relatedTo: 'Improved Cookstove' },
    { id: 'cookstove-m3w1', month: 3, week: 1, label: 'Update fuel data in calculator', relatedTo: 'Improved Cookstove' },
    { id: 'cookstove-m3w2', month: 3, week: 2, label: 'Upload photo proof', relatedTo: 'Improved Cookstove', requiresPhoto: true },
  ],
  compost: [
    { id: 'compost-m1w1', month: 1, week: 1, label: 'Identify location for pit behind kitchen', relatedTo: 'Composting Pit' },
    { id: 'compost-m1w2', month: 1, week: 2, label: 'Dig pit and label waste bins', relatedTo: 'Composting Pit' },
    { id: 'compost-m2w1', month: 2, week: 1, label: 'Begin composting all organic waste daily', relatedTo: 'Composting Pit' },
    { id: 'compost-m2w2', month: 2, week: 2, label: 'Track waste bags reduced', relatedTo: 'Composting Pit' },
    { id: 'compost-m3w1', month: 3, week: 1, label: 'Update waste data in calculator', relatedTo: 'Composting Pit' },
    { id: 'compost-m3w2', month: 3, week: 2, label: 'Upload compost photo for verification', relatedTo: 'Composting Pit', requiresPhoto: true },
  ],
  walking: [
    { id: 'walking-m1w1', month: 1, week: 1, label: 'Map safe student walking routes', relatedTo: 'Walking Groups' },
    { id: 'walking-m1w2', month: 1, week: 2, label: 'Assign route captains and buddy groups', relatedTo: 'Walking Groups' },
    { id: 'walking-m2w1', month: 2, week: 1, label: 'Launch walking group schedule', relatedTo: 'Walking Groups' },
    { id: 'walking-m2w2', month: 2, week: 2, label: 'Record student participation', relatedTo: 'Walking Groups' },
    { id: 'walking-m3w1', month: 3, week: 1, label: 'Update transport data in calculator', relatedTo: 'Walking Groups' },
    { id: 'walking-m3w2', month: 3, week: 2, label: 'Upload route photo proof', relatedTo: 'Walking Groups', requiresPhoto: true },
  ],
  solar: [
    { id: 'solar-m1w1', month: 1, week: 1, label: 'Check roof space and shading', relatedTo: 'Solar Action' },
    { id: 'solar-m1w2', month: 1, week: 2, label: 'Request vendor quotations', relatedTo: 'Solar Action' },
    { id: 'solar-m2w1', month: 2, week: 1, label: 'Approve installation plan', relatedTo: 'Solar Action' },
    { id: 'solar-m2w2', month: 2, week: 2, label: 'Monitor electricity savings', relatedTo: 'Solar Action' },
    { id: 'solar-m3w1', month: 3, week: 1, label: 'Update energy data in calculator', relatedTo: 'Solar Action' },
    { id: 'solar-m3w2', month: 3, week: 2, label: 'Upload solar proof photo', relatedTo: 'Solar Action', requiresPhoto: true },
  ],
  led: [
    { id: 'led-m1w1', month: 1, week: 1, label: 'Survey rooms needing LED replacement', relatedTo: 'LED Replacement Drive' },
    { id: 'led-m1w2', month: 1, week: 2, label: 'Buy LED bulbs in bulk', relatedTo: 'LED Replacement Drive' },
    { id: 'led-m2w1', month: 2, week: 1, label: 'Replace lights classroom by classroom', relatedTo: 'LED Replacement Drive' },
    { id: 'led-m2w2', month: 2, week: 2, label: 'Record lower electricity usage', relatedTo: 'LED Replacement Drive' },
    { id: 'led-m3w1', month: 3, week: 1, label: 'Update energy data in calculator', relatedTo: 'LED Replacement Drive' },
    { id: 'led-m3w2', month: 3, week: 2, label: 'Upload LED installation photo', relatedTo: 'LED Replacement Drive', requiresPhoto: true },
  ],
  bus: [
    { id: 'bus-m1w1', month: 1, week: 1, label: 'Map student pickup points', relatedTo: 'Bus Route Optimization' },
    { id: 'bus-m1w2', month: 1, week: 2, label: 'Review current bus routes', relatedTo: 'Bus Route Optimization' },
    { id: 'bus-m2w1', month: 2, week: 1, label: 'Consolidate bus routes', relatedTo: 'Bus Route Optimization' },
    { id: 'bus-m2w2', month: 2, week: 2, label: 'Track diesel saved', relatedTo: 'Bus Route Optimization' },
    { id: 'bus-m3w1', month: 3, week: 1, label: 'Update transport data in calculator', relatedTo: 'Bus Route Optimization' },
    { id: 'bus-m3w2', month: 3, week: 2, label: 'Upload bus route photo proof', relatedTo: 'Bus Route Optimization', requiresPhoto: true },
  ],
  audit: [
    { id: 'audit-m1w1', month: 1, week: 1, label: 'List main energy loss points', relatedTo: 'Energy Audit Walkthrough' },
    { id: 'audit-m1w2', month: 1, week: 2, label: 'Prepare audit checklist', relatedTo: 'Energy Audit Walkthrough' },
    { id: 'audit-m2w1', month: 2, week: 1, label: 'Inspect classroom equipment usage', relatedTo: 'Energy Audit Walkthrough' },
    { id: 'audit-m2w2', month: 2, week: 2, label: 'Record savings opportunities', relatedTo: 'Energy Audit Walkthrough' },
    { id: 'audit-m3w1', month: 3, week: 1, label: 'Update energy data in calculator', relatedTo: 'Energy Audit Walkthrough' },
    { id: 'audit-m3w2', month: 3, week: 2, label: 'Upload audit report photo', relatedTo: 'Energy Audit Walkthrough', requiresPhoto: true },
  ],
};

const monthMeta = {
  1: { title: 'Month 1', subtitle: 'Plan & Prepare', accent: 'bg-[#ecf5e7]' },
  2: { title: 'Month 2', subtitle: 'Implement', accent: 'bg-[#f2f1df]' },
  3: { title: 'Month 3', subtitle: 'Monitor & Optimize', accent: 'bg-[#e8f2e8]' },
} as const;

function normalizeSelectedRecommendations(raw: string | null): SelectedRecommendation[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Array<string | SelectedRecommendation>;
    return parsed
      .map((item) => (typeof item === 'string' ? { title: item } : item))
      .filter((item): item is SelectedRecommendation => Boolean(item?.title));
  } catch {
    return [];
  }
}

function recommendationKey(title: string) {
  const normalized = title.toLowerCase();
  if (normalized.includes('cookstove')) return 'cookstove';
  if (normalized.includes('compost')) return 'compost';
  if (normalized.includes('walk')) return 'walking';
  if (normalized.includes('lantern') || normalized.includes('solar')) return 'solar';
  if (normalized.includes('led')) return 'led';
  if (normalized.includes('bus')) return 'bus';
  if (normalized.includes('audit')) return 'audit';
  return 'solar';
}

function buildPlan(selectedRecommendations: SelectedRecommendation[]) {
  const selectedKeys = selectedRecommendations.map((item) => recommendationKey(item.title));
  const tasksByMonth: Record<1 | 2 | 3, PlanTask[]> = { 1: [], 2: [], 3: [] };

  selectedKeys.forEach((key) => {
    const templates = taskTemplates[key] || [];
    templates.forEach((task) => {
      tasksByMonth[task.month].push(task);
    });
  });

  const limited = (tasks: PlanTask[]) => {
    const seen = new Set<string>();
    return tasks
      .filter((task) => {
        if (seen.has(task.label)) return false;
        seen.add(task.label);
        return true;
      })
      .slice(0, 4);
  };

  return {
    1: limited(tasksByMonth[1]),
    2: limited(tasksByMonth[2]),
    3: limited(tasksByMonth[3]),
  };
}

export function ActionPlan() {
  const [selectedRecommendations, setSelectedRecommendations] = useState<SelectedRecommendation[]>([]);
  const [weekCompletion, setWeekCompletion] = useState<Record<string, boolean>>({});
  const [actionPhotos, setActionPhotos] = useState<Record<string, string>>({});

  useEffect(() => {
    setSelectedRecommendations(normalizeSelectedRecommendations(localStorage.getItem('selectedRecommendations')));

    try {
      const rawCompletion = localStorage.getItem('weekCompletion');
      if (rawCompletion) setWeekCompletion(JSON.parse(rawCompletion) as Record<string, boolean>);
    } catch {
      // ignore
    }

    try {
      const rawPhotos = localStorage.getItem('actionPhotos');
      if (rawPhotos) setActionPhotos(JSON.parse(rawPhotos) as Record<string, string>);
    } catch {
      // ignore
    }
  }, []);

  const plan = useMemo(() => buildPlan(selectedRecommendations), [selectedRecommendations]);

  const progress = useMemo(() => {
    const allTasks = [...plan[1], ...plan[2], ...plan[3]];
    if (!allTasks.length) return 0;
    const completeCount = allTasks.filter((task) => weekCompletion[task.id]).length;
    return Math.round((completeCount / allTasks.length) * 100);
  }, [plan, weekCompletion]);

  function toggleWeek(taskId: string) {
    setWeekCompletion((prev) => {
      const next = { ...prev, [taskId]: !prev[taskId] };
      localStorage.setItem('weekCompletion', JSON.stringify(next));
      try {
        upsertCurrentSchoolData({ weekCompletion: next });
      } catch {}
      return next;
    });
  }

  function handlePhotoUpload(taskId: string, file: File | null) {
    if (!file) return;
    setActionPhotos((prev) => {
      const next = { ...prev, [taskId]: file.name };
      localStorage.setItem('actionPhotos', JSON.stringify(next));
      try {
        upsertCurrentSchoolData({ actionPhotos: next });
      } catch {}
      return next;
    });
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 sm:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-700 text-lg font-bold text-white">8</div>
          <h1 className="text-2xl font-bold text-foreground">3-Month Action Plan</h1>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-[60%] rounded-full bg-emerald-700" />
            </div>
            <span className="text-sm font-semibold text-slate-600">{progress}%</span>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            {([1, 2, 3] as const).map((monthNumber) => {
              const month = monthMeta[monthNumber];
              const tasks = plan[monthNumber];

              return (
              <section key={month.title} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className={`rounded-2xl ${month.accent} p-4`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-700">{month.title}</p>
                      <h2 className="mt-1 text-lg font-semibold text-slate-900">{month.subtitle}</h2>
                    </div>
                    <Clock3 className="h-5 w-5 text-slate-500" />
                  </div>

                  <div className="mt-4 space-y-3">
                    {tasks.length ? tasks.map((task) => (
                      <div key={task.id} className="rounded-2xl bg-white/80 p-3 shadow-sm">
                        <div className="flex items-start gap-3">
                          <TaskStatus checked={Boolean(weekCompletion[task.id])} />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-sm font-medium text-slate-700">Week {task.week}: {task.label}</span>
                              <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                                <input
                                  type="checkbox"
                                  checked={Boolean(weekCompletion[task.id])}
                                  onChange={() => toggleWeek(task.id)}
                                  className="h-4 w-4 rounded border-slate-300 text-emerald-700"
                                />
                                Done
                              </label>
                            </div>
                            <p className="mt-1 text-xs text-slate-500">{task.relatedTo}</p>
                            {task.requiresPhoto && (
                              <div className="mt-3 flex flex-wrap items-center gap-2">
                                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                  <Upload className="h-3.5 w-3.5" />
                                  {actionPhotos[task.id] ? 'Replace photo' : 'Upload photo'}
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(event) => handlePhotoUpload(task.id, event.target.files?.[0] ?? null)}
                                  />
                                </label>
                                {actionPhotos[task.id] && <span className="text-xs text-slate-500">Saved: {actionPhotos[task.id]}</span>}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-4 text-sm text-slate-500">
                        No selected recommendations yet. Go back to the Recommendation screen and add actions to plan.
                      </div>
                    )}
                  </div>
                </div>
              </section>
              );
            })}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-slate-600">
            <Legend color="bg-emerald-700" label="Completed" />
            <Legend color="bg-amber-500" label="In Progress" />
            <Legend color="bg-slate-300" label="Upcoming" />
          </div>

          <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-900">
            Weekly checklist is aligned to your selected recommendations and can be expanded later with real progress logic.
          </div>
        </div>
      </div>
    </div>
  );
}

function TaskStatus({ checked }: { checked: boolean }) {
  if (checked) {
    return <Check className="h-5 w-5 rounded-full bg-emerald-700 p-1 text-white" />;
  }

  return <Circle className="h-5 w-5 rounded-full border-2 border-slate-300 text-slate-300" />;
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-3 w-3 rounded-full ${color}`} />
      <span>{label}</span>
    </div>
  );
}