'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const PhaseUnlockCelebration = ({ summary }) => {
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (summary?.phase !== 'personalized' || !summary?.personalizedUnlockedAt) return;

    const userId = user?._id || user?.id || 'default';
    const unlockId = new Date(summary.personalizedUnlockedAt).toISOString();
    const storageKey = `neokarma_personalized_unlock_seen_${userId}_${unlockId}`;

    if (localStorage.getItem(storageKey)) return;

    localStorage.setItem(storageKey, 'true');
    const timer = window.setTimeout(() => setVisible(true), 0);
    return () => window.clearTimeout(timer);
  }, [summary?.phase, summary?.personalizedUnlockedAt, user?._id, user?.id]);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-4 top-24 z-50 mx-auto max-w-xl rounded-2xl border border-[#BFE8CC] bg-white p-5 shadow-[0_18px_60px_rgba(10,61,37,0.18)]">
      <div className="flex items-start gap-4">
        <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#E8F8EE] text-[#0A3D25]">
          <CheckCircle2 size={24} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-extrabold uppercase tracking-[0.16em] text-[#1B5E20]">
            Personalized unlocked
          </p>
          <h2 className="mt-1 text-[20px] font-extrabold leading-tight text-[#0A3D25]">
            Your 30-day baseline is ready.
          </h2>
          <p className="mt-2 text-[14px] leading-relaxed text-[#4A5550]">
            Carbon Mirror insights and your personalized plan are now available.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E0E5E2] text-[#4A5550] hover:bg-[#F7FCF8]"
          aria-label="Dismiss unlock message"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default PhaseUnlockCelebration;
