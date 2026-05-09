import { useEffect, useMemo, useState } from 'react';
import { upsertCurrentSchoolData } from '../utils/schoolSession';
import { CheckCircle2, CircleAlert, CloudUpload, ShieldCheck } from 'lucide-react';

type SelectedRecommendation = { title: string };

type VerificationTask = {
  id: string;
  title: string;
  week: string;
  completed: boolean;
  photo?: string;
};

const taskTitles: Record<string, string> = {
  'cookstove-m1w1': 'Find cookstove supplier in local bazaar',
  'cookstove-m1w2': 'Purchase cookstove',
  'cookstove-m2w1': 'Install and start using',
  'cookstove-m2w2': 'Compare fuel usage with last month',
  'cookstove-m3w1': 'Update fuel data in calculator',
  'cookstove-m3w2': 'Upload photo proof',
  'compost-m1w1': 'Identify location for pit behind kitchen',
  'compost-m1w2': 'Dig pit and label waste bins',
  'compost-m2w1': 'Begin composting all organic waste daily',
  'compost-m2w2': 'Track waste bags reduced',
  'compost-m3w1': 'Update waste data in calculator',
  'compost-m3w2': 'Upload compost photo for verification',
  'walking-m1w1': 'Map safe student walking routes',
  'walking-m1w2': 'Assign route captains and buddy groups',
  'walking-m2w1': 'Launch walking group schedule',
  'walking-m2w2': 'Record student participation',
  'walking-m3w1': 'Update transport data in calculator',
  'walking-m3w2': 'Upload route photo proof',
  'solar-m1w1': 'Check roof space and shading',
  'solar-m1w2': 'Request vendor quotations',
  'solar-m2w1': 'Approve installation plan',
  'solar-m2w2': 'Monitor electricity savings',
  'solar-m3w1': 'Update energy data in calculator',
  'solar-m3w2': 'Upload solar proof photo',
  'led-m1w1': 'Survey rooms needing LED replacement',
  'led-m1w2': 'Buy LED bulbs in bulk',
  'led-m2w1': 'Replace lights classroom by classroom',
  'led-m2w2': 'Record lower electricity usage',
  'led-m3w1': 'Update energy data in calculator',
  'led-m3w2': 'Upload LED installation photo',
  'bus-m1w1': 'Map student pickup points',
  'bus-m1w2': 'Review current bus routes',
  'bus-m2w1': 'Consolidate bus routes',
  'bus-m2w2': 'Track diesel saved',
  'bus-m3w1': 'Update transport data in calculator',
  'bus-m3w2': 'Upload bus route photo proof',
  'audit-m1w1': 'List main energy loss points',
  'audit-m1w2': 'Prepare audit checklist',
  'audit-m2w1': 'Inspect classroom equipment usage',
  'audit-m2w2': 'Record savings opportunities',
  'audit-m3w1': 'Update energy data in calculator',
  'audit-m3w2': 'Upload audit report photo',
};

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

function buildVerificationTasks(selectedRecommendations: SelectedRecommendation[], weekCompletion: Record<string, boolean>, actionPhotos: Record<string, string>) {
  const tasks: VerificationTask[] = [];

  selectedRecommendations.forEach((item) => {
    const key = recommendationKey(item.title);
    const ids = Object.keys(taskTitles).filter((taskId) => taskId.startsWith(`${key}-`));
    ids.forEach((id) => {
      tasks.push({
        id,
        title: taskTitles[id] || id,
        week: id.includes('m1') ? 'Month 1' : id.includes('m2') ? 'Month 2' : 'Month 3',
        completed: Boolean(weekCompletion[id]),
        photo: actionPhotos[id],
      });
    });
  });

  const unique = new Map<string, VerificationTask>();
  tasks.forEach((task) => {
    if (!unique.has(task.id)) unique.set(task.id, task);
  });

  return Array.from(unique.values()).sort((a, b) => a.id.localeCompare(b.id));
}

export function Verification() {
  const [selectedRecommendations, setSelectedRecommendations] = useState<SelectedRecommendation[]>([]);
  const [weekCompletion, setWeekCompletion] = useState<Record<string, boolean>>({});
  const [actionPhotos, setActionPhotos] = useState<Record<string, string>>({});
  const [teacherConfirmed, setTeacherConfirmed] = useState(false);

  useEffect(() => {
    try {
      const rawSelected = localStorage.getItem('selectedRecommendations');
      if (rawSelected) setSelectedRecommendations(JSON.parse(rawSelected) as SelectedRecommendation[]);
    } catch {
      setSelectedRecommendations([]);
    }

    try {
      const rawCompletion = localStorage.getItem('weekCompletion');
      if (rawCompletion) setWeekCompletion(JSON.parse(rawCompletion) as Record<string, boolean>);
    } catch {
      setWeekCompletion({});
    }

    try {
      const rawPhotos = localStorage.getItem('actionPhotos');
      if (rawPhotos) setActionPhotos(JSON.parse(rawPhotos) as Record<string, string>);
    } catch {
      setActionPhotos({});
    }
  }, []);

  const verificationTasks = useMemo(
    () => buildVerificationTasks(selectedRecommendations, weekCompletion, actionPhotos),
    [selectedRecommendations, weekCompletion, actionPhotos]
  );

  const completedCount = verificationTasks.filter((task) => task.completed).length;
  const totalCount = verificationTasks.length;
  const proofCount = Object.keys(actionPhotos).length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const statusSteps = [
    { title: 'Pending', description: 'Waiting for uploads', active: progress < 100 },
    { title: 'Under Review', description: 'Teacher is checking', active: progress > 0 && progress < 100 },
    { title: 'Verified', description: 'Approved and recorded', active: progress === 100 && teacherConfirmed },
  ];

  useEffect(() => {
    try {
      const verificationStatus = progress === 100 && teacherConfirmed ? 'verified' : progress === 100 ? 'pending_review' : 'in_progress';
      upsertCurrentSchoolData({ verificationStatus, teacherConfirmed, proofCount: Object.keys(actionPhotos).length });
    } catch {
      // ignore
    }
  }, [progress, teacherConfirmed, actionPhotos]);

  return (
    <div className="min-h-screen bg-slate-50 p-6 sm:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-700 text-lg font-bold text-white">12</div>
          <h1 className="text-2xl font-bold text-foreground">Verification Screen</h1>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3 text-sm font-semibold text-slate-700">
              <ShieldCheck className="h-5 w-5 text-emerald-700" />
              Verify reduction evidence before submission
            </div>

            <div className="space-y-6">
              <section className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-emerald-700">Step 1: Review weekly completion</p>
                    <h2 className="mt-1 text-lg font-semibold text-slate-900">{completedCount}/{totalCount || 0} tasks completed</h2>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">Verification Status</span>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {verificationTasks.slice(0, 2).map((task) => (
                    <UploadCard key={task.id} title={task.title} subtitle={task.photo ? `Saved proof: ${task.photo}` : 'Click to upload or drag and drop'} uploaded={Boolean(task.photo)} />
                  ))}
                </div>
              </section>

              <section className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-semibold text-emerald-700">Step 2: Uploaded action proof</p>
                <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {verificationTasks.length ? verificationTasks.map((task) => (
                    <UploadCard
                      key={task.id}
                      title={task.title}
                      subtitle={task.photo ? `Saved: ${task.photo}` : 'No photo uploaded yet'}
                      compact
                      uploaded={Boolean(task.photo)}
                    />
                  )) : (
                    <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500 xl:col-span-4">
                      No proof files found yet. Complete tasks in Action Plan and upload photo filenames there.
                    </div>
                  )}
                </div>
              </section>

              <section className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-semibold text-emerald-700">Step 3: Admin / Teacher Confirmation</p>
                <label className="mt-4 flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
                  <input type="checkbox" checked={teacherConfirmed} onChange={(event) => setTeacherConfirmed(event.target.checked)} className="h-5 w-5 rounded border-slate-300 text-emerald-700" />
                  <span className="text-sm text-slate-700">I confirm the data and uploaded proofs are correct.</span>
                </label>
              </section>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <button className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700">Cancel</button>
                <button className="rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white">Submit for Verification</button>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <CircleAlert className="h-4 w-4 text-amber-500" />
              Verification Status
            </div>

            <div className="mb-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
              <p className="font-semibold text-slate-900">Summary</p>
              <p className="mt-1">Completed tasks: {completedCount}</p>
              <p>Uploaded proofs: {proofCount}</p>
              <p>Progress: {progress}%</p>
            </div>

            <div className="space-y-4">
              {statusSteps.map((step, index) => (
                <div key={step.title} className={`rounded-3xl border p-4 ${step.active ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{step.title}</p>
                      <p className="text-xs text-slate-500">{step.description}</p>
                    </div>
                    {index === 0 ? <CloudUpload className="h-5 w-5 text-emerald-700" /> : index === 1 ? <CircleAlert className="h-5 w-5 text-amber-500" /> : <CheckCircle2 className="h-5 w-5 text-emerald-700" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function UploadCard({ title, subtitle, compact = false, uploaded = false }: { title: string; subtitle: string; compact?: boolean; uploaded?: boolean }) {
  return (
    <div className={`rounded-3xl border border-dashed ${compact ? 'p-4' : 'p-5'} text-center ${uploaded ? 'border-emerald-300 bg-emerald-50' : 'border-slate-300 bg-white'}`}>
      <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${uploaded ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-50 text-emerald-700'}`}>
        <CloudUpload className="h-8 w-8" />
      </div>
      <p className="mt-4 text-sm font-semibold text-slate-800">{title}</p>
      <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
      <button className="mt-4 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-semibold text-white">Upload</button>
    </div>
  );
}