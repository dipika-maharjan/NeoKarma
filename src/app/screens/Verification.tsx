import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, CircleAlert, CloudUpload, ShieldCheck } from 'lucide-react';
import { upsertCurrentSchoolData } from '../utils/schoolSession';

type SelectedRecommendation = { title: string };
type FileState = { before: string; after: string };
type Status = 'not_started' | 'pending' | 'verified';

function normalizeKey(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

function loadSelectedRecommendations(): SelectedRecommendation[] {
  try {
    return JSON.parse(localStorage.getItem('selectedRecommendations') || '[]') as SelectedRecommendation[];
  } catch {
    return [];
  }
}

export function Verification() {
  const [selectedRecommendations, setSelectedRecommendations] = useState<SelectedRecommendation[]>([]);
  const [billProof, setBillProof] = useState<FileState>({ before: '', after: '' });
  const [actionProofs, setActionProofs] = useState<Record<string, string>>({});
  const [adminConfirmed, setAdminConfirmed] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<Status>('not_started');
  const [schoolName, setSchoolName] = useState('this school');

  useEffect(() => {
    setSelectedRecommendations(loadSelectedRecommendations());
    try {
      const profile = JSON.parse(localStorage.getItem('currentSchoolProfile') || 'null');
      if (profile?.schoolName) setSchoolName(profile.schoolName);
    } catch {}

    try {
      const raw = localStorage.getItem('billProof');
      if (raw) setBillProof({ before: '', after: '', ...(JSON.parse(raw) as Partial<FileState>) });
    } catch {}

    try {
      const raw = localStorage.getItem('actionPhotos');
      if (raw) setActionProofs(JSON.parse(raw) as Record<string, string>);
    } catch {}

    try {
      setAdminConfirmed(localStorage.getItem('adminConfirmed') === 'true');
      const status = localStorage.getItem('verificationStatus');
      if (status === 'not_started' || status === 'pending' || status === 'verified') setVerificationStatus(status);
    } catch {}
  }, []);

  const actionProofCards = useMemo(() => {
    const items = selectedRecommendations.length ? selectedRecommendations : [{ title: 'Improved Cookstove' }, { title: 'Composting Pit' }, { title: 'Walking Groups' }];
    return items.map((item) => ({
      title: item.title,
      key: normalizeKey(item.title),
      fileName: actionProofs[normalizeKey(item.title)] || '',
    }));
  }, [selectedRecommendations, actionProofs]);

  const completedCount = [billProof.before, billProof.after, actionProofCards.every((card) => Boolean(card.fileName)), adminConfirmed].filter(Boolean).length;
  const canSubmit = completedCount === 4;

  useEffect(() => {
    localStorage.setItem('billProof', JSON.stringify(billProof));
    localStorage.setItem('actionPhotos', JSON.stringify(actionProofs));
    localStorage.setItem('adminConfirmed', String(adminConfirmed));
    localStorage.setItem('verificationStatus', verificationStatus);
    upsertCurrentSchoolData({ billProof, actionPhotos: actionProofs, adminConfirmed, verificationStatus });
  }, [billProof, actionProofs, adminConfirmed, verificationStatus]);

  function uploadBill(slot: 'before' | 'after', fileName: string) {
    setBillProof((prev) => ({ ...prev, [slot]: fileName }));
  }

  function uploadAction(key: string, fileName: string) {
    setActionProofs((prev) => ({ ...prev, [key]: fileName }));
  }

  function submit() {
    if (!canSubmit) return;
    setVerificationStatus('pending');
    window.setTimeout(() => setVerificationStatus('verified'), 3000);
  }

  return (
    <div className="min-h-screen bg-[#f5f7f2] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-700 text-lg font-bold text-white">12</div>
          <h1 className="text-2xl font-bold text-slate-900">Verification Screen</h1>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3 text-sm font-semibold text-slate-700">
              <ShieldCheck className="h-5 w-5 text-emerald-700" />
              Verify uploaded evidence before submission
            </div>

            <div className="space-y-6">
              <section className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-semibold text-emerald-700">Step 1: Upload Electricity Bills (Before & After)</p>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <UploadBox title="Before (Old Month)" subtitle={billProof.before || 'Click to upload or drag and drop'} onUpload={(name) => uploadBill('before', name)} />
                  <UploadBox title="After (New Month)" subtitle={billProof.after || 'Click to upload or drag and drop'} onUpload={(name) => uploadBill('after', name)} />
                </div>
              </section>

              <section className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-semibold text-emerald-700">Step 2: Upload Action Proof Photos</p>
                <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {actionProofCards.map((card) => (
                    <UploadBox key={card.key} title={card.title} subtitle={card.fileName || 'Click to upload'} compact onUpload={(name) => uploadAction(card.key, name)} />
                  ))}
                </div>
              </section>

              <section className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-semibold text-emerald-700">Step 3: Admin / Teacher Confirmation</p>
                <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
                  <input
                    type="checkbox"
                    checked={adminConfirmed}
                    onChange={(e) => setAdminConfirmed(e.target.checked)}
                    className="h-5 w-5 rounded border-slate-300 text-emerald-700"
                  />
                  <span className="text-sm text-slate-700">I confirm the data and uploaded proofs are correct for {schoolName}.</span>
                </label>
              </section>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <button className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700">Cancel</button>
                <button
                  onClick={submit}
                  disabled={!canSubmit || verificationStatus === 'pending'}
                  className="rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-emerald-300"
                >
                  Submit for Verification
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <CircleAlert className="h-4 w-4 text-amber-500" />
              Verification Status
            </div>

            <div className="mb-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
              <p className="font-semibold text-slate-900">Summary</p>
              <p className="mt-1">Before bill: {billProof.before || '—'}</p>
              <p>After bill: {billProof.after || '—'}</p>
              <p>Action proofs: {actionProofCards.filter((card) => Boolean(card.fileName)).length}/{actionProofCards.length}</p>
            </div>

            <div className="space-y-4">
              <StatusStep active={verificationStatus === 'not_started'} title="Not Started" description="Waiting for uploads" icon={<CloudUpload className="h-5 w-5 text-emerald-700" />} />
              <StatusStep active={verificationStatus === 'pending'} title="Pending" description="Submitted and under review" icon={<CircleAlert className="h-5 w-5 text-amber-500" />} />
              <StatusStep active={verificationStatus === 'verified'} title="Verified" description="Approved and recorded" icon={<CheckCircle2 className="h-5 w-5 text-emerald-700" />} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function UploadBox({ title, subtitle, compact = false, onUpload }: { title: string; subtitle: string; compact?: boolean; onUpload: (fileName: string) => void }) {
  return (
    <div className={`rounded-3xl border border-dashed border-slate-300 bg-white ${compact ? 'p-4' : 'p-5'} text-center`}>
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
        <CloudUpload className="h-8 w-8" />
      </div>
      <p className="mt-4 text-sm font-semibold text-slate-800">{title}</p>
      <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
      <label className="mt-4 inline-flex cursor-pointer rounded-xl bg-emerald-700 px-4 py-2 text-xs font-semibold text-white">
        Upload
        <input type="file" accept="image/*" className="hidden" onChange={(e) => onUpload(e.target.files?.[0]?.name || '')} />
      </label>
    </div>
  );
}

function StatusStep({ title, description, active, icon }: { title: string; description: string; active: boolean; icon: React.ReactNode }) {
  return (
    <div className={`rounded-3xl border p-4 ${active ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-800">{title}</p>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
        {icon}
      </div>
    </div>
  );
}
