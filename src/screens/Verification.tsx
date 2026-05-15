import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../app/components/LanguageContext';
import { TrendingDown, Award, Image as ImageIcon } from 'lucide-react';
import { getCurrentSchoolProfile } from '../app/utils/schoolSession';
import { ensureMvpAnalysis, type MvpAnalysisBundle } from '../app/utils/mvpPlanner.ts';

const TASK_STATE_STORAGE_KEY = 'haritPathshala:actionPlanTaskState';

type ProofItem = {
  fileName: string;
  uploadedAt: string;
  dataUrl?: string;
};

type StoredTaskState = Record<string, { completed: boolean; proof?: ProofItem }>;

const getTaskState = (): StoredTaskState => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(TASK_STATE_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredTaskState) : {};
  } catch {
    return {};
  }
};

export function Verification() {
  const { t } = useLanguage();
  const schoolProfile = getCurrentSchoolProfile();
  const [analysis, setAnalysis] = useState<MvpAnalysisBundle | null>(null);
  const [taskState, setTaskState] = useState<StoredTaskState>({});
  const [proofsWithImages, setProofsWithImages] = useState<
    Array<{ month: number; week: number; proof: ProofItem; imageUrl?: string }>
  >([]);

  useEffect(() => {
    const profile = getCurrentSchoolProfile();
    const bundle = ensureMvpAnalysis(profile);
    setAnalysis(bundle);
    setTaskState(getTaskState());

    // Extract all proofs with images
    const proofs: Array<{
      month: number;
      week: number;
      proof: ProofItem;
      imageUrl?: string;
    }> = [];
    for (const [key, task] of Object.entries(getTaskState())) {
      if (task.completed && task.proof?.dataUrl) {
        const [month, week] = key.split('-').map(Number);
        proofs.push({
          month,
          week,
          proof: task.proof,
          imageUrl: task.proof.dataUrl,
        });
      }
    }
    setProofsWithImages(proofs.sort((a, b) => (a.month - b.month) || (a.week - b.week)));
  }, []);

  const completedTasks = useMemo(() => {
    return Object.values(taskState).filter((i) => i.completed).length;
  }, [taskState]);

  const selectedRecommendation = useMemo(() => {
    try {
      if (typeof window !== 'undefined') {
        const stored = window.localStorage.getItem('haritPathshala:selectedRecommendation');
        if (stored) {
          return JSON.parse(stored);
        }
      }
    } catch {
      return null;
    }
    return null;
  }, []);

  const estimatedCO2Savings = useMemo(() => {
    if (!selectedRecommendation) return 0;
    const total = Number(selectedRecommendation.co2_saved_kg) || 0;
    const perWeek = total / 12;
    return Math.round(completedTasks * perWeek * 10) / 10;
  }, [completedTasks, selectedRecommendation]);

  // Calculate support tier based on CO2 savings
  const supportTier = useMemo(() => {
    if (estimatedCO2Savings < 10) return 'Bronze';
    if (estimatedCO2Savings < 50) return 'Silver';
    if (estimatedCO2Savings < 100) return 'Gold';
    return 'Platinum';
  }, [estimatedCO2Savings]);

  const tierColors = {
    Bronze: 'from-amber-600 to-amber-700',
    Silver: 'from-slate-400 to-slate-500',
    Gold: 'from-yellow-400 to-yellow-500',
    Platinum: 'from-purple-500 to-purple-600',
  };

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h1 className="text-3xl font-semibold text-foreground mb-2">Impact Verification</h1>
        <p className="text-sm text-muted-foreground">
          {schoolProfile?.schoolName || 'Your School'} - Track your environmental progress
        </p>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* CO2 Savings */}
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-emerald-900">CO₂ Saved</h3>
            <TrendingDown className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-3xl font-semibold text-emerald-700 mb-1">{estimatedCO2Savings} kg</p>
          <p className="text-xs text-emerald-600">
            {selectedRecommendation ? ` from ${selectedRecommendation.title_en}` : ''}
          </p>
        </div>

        {/* Tasks Completed */}
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-blue-900">Tasks Completed</h3>
            <Award className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-semibold text-blue-700 mb-1">{completedTasks}</p>
          <p className="text-xs text-blue-600">Evidence uploaded: {proofsWithImages.length}</p>
        </div>

        {/* Support Tier */}
        <div className={`rounded-xl bg-gradient-to-br ${tierColors[supportTier]} p-6 text-white`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Support Tier</h3>
            <Award className="w-5 h-5 text-white/80" />
          </div>
          <p className="text-3xl font-semibold mb-1">{supportTier}</p>
          <p className="text-xs text-white/80">Unlocked sustainability status</p>
        </div>
      </div>

      {/* Before/After Comparison */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Emissions Impact</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Before */}
          <div className="text-center p-6 rounded-lg bg-red-50">
            <p className="text-sm text-muted-foreground mb-2">Before Implementation</p>
            <p className="text-4xl font-semibold text-red-700 mb-1">
              {analysis?.emissions.totalCO2 || 0}
            </p>
            <p className="text-sm text-muted-foreground">kg CO₂/month</p>
          </div>

          {/* Arrow */}
          <div className="flex items-center justify-center">
            <div className="flex flex-col items-center">
              <TrendingDown className="w-8 h-8 text-emerald-600 mb-2" />
              <p className="text-2xl font-semibold text-emerald-600">
                -{Math.round((estimatedCO2Savings / (analysis?.emissions.totalCO2 || 1)) * 100)}%
              </p>
            </div>
          </div>

          {/* After */}
          <div className="text-center p-6 rounded-lg bg-emerald-50">
            <p className="text-sm text-muted-foreground mb-2">After Completed Tasks</p>
            <p className="text-4xl font-semibold text-emerald-700 mb-1">
              {Math.round((analysis?.emissions.totalCO2 || 0) - estimatedCO2Savings)}
            </p>
            <p className="text-sm text-muted-foreground">kg CO₂/month (projected)</p>
          </div>
        </div>
      </div>

      {/* Proof Gallery */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Photo Evidence ({proofsWithImages.length} uploads)
        </h2>

        {proofsWithImages.length === 0 ? (
          <div className="text-center p-12 bg-slate-50 rounded-lg">
            <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-muted-foreground">No proof photos uploaded yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Complete tasks in the Action Plan and upload photos to see them here
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {proofsWithImages.map((item, idx) => (
              <div key={idx} className="rounded-lg overflow-hidden border border-slate-200 shadow">
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={`Proof M${item.month}W${item.week}`}
                    className="w-full h-48 object-cover bg-slate-100"
                  />
                )}
                <div className="p-3 bg-slate-50">
                  <p className="text-xs font-semibold text-foreground">Month {item.month}, Week {item.week}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.proof.fileName}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {new Date(item.proof.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tier Benefits */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Your Status: {supportTier} Tier</h2>

        <div className="space-y-3">
          <div
            className={`p-4 rounded-lg border-2 ${
              supportTier === 'Bronze' || supportTier === 'Silver' || supportTier === 'Gold' || supportTier === 'Platinum'
                ? 'border-amber-300 bg-amber-50'
                : 'border-slate-200 bg-slate-50 opacity-50'
            }`}
          >
            <p className="font-semibold text-amber-900">🥉 Bronze (0-10 kg CO₂)</p>
            <p className="text-sm text-amber-800 mt-1">Awareness and planning phase</p>
          </div>

          <div
            className={`p-4 rounded-lg border-2 ${
              supportTier === 'Silver' || supportTier === 'Gold' || supportTier === 'Platinum'
                ? 'border-slate-400 bg-slate-100'
                : 'border-slate-200 bg-slate-50 opacity-50'
            }`}
          >
            <p className="font-semibold text-slate-900">🥈 Silver (10-50 kg CO₂)</p>
            <p className="text-sm text-slate-700 mt-1">Active implementation started</p>
          </div>

          <div
            className={`p-4 rounded-lg border-2 ${
              supportTier === 'Gold' || supportTier === 'Platinum'
                ? 'border-yellow-400 bg-yellow-50'
                : 'border-slate-200 bg-slate-50 opacity-50'
            }`}
          >
            <p className="font-semibold text-yellow-900">🥇 Gold (50-100 kg CO₂)</p>
            <p className="text-sm text-yellow-800 mt-1">Significant environmental impact achieved</p>
          </div>

          <div
            className={`p-4 rounded-lg border-2 ${
              supportTier === 'Platinum' ? 'border-purple-400 bg-purple-50' : 'border-slate-200 bg-slate-50 opacity-50'
            }`}
          >
            <p className="font-semibold text-purple-900">💎 Platinum (100+ kg CO₂)</p>
            <p className="text-sm text-purple-800 mt-1">Sustainability leader - showcase your school!</p>
          </div>
        </div>
      </div>
    </div>
  );
}

