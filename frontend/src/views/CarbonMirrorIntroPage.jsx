'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { BarChart3, Bus, ClipboardList, Leaf, Lock, TreePine, Waves } from 'lucide-react';

const steps = [
  {
    title: 'Log your daily habits',
    body: 'Add transport, food, waste, and energy choices each day so Neo Karma can build your real carbon baseline.',
    icon: ClipboardList
  },
  {
    title: 'Complete your 30-day baseline',
    body: 'After 30 logs, the app has enough data to compare patterns and unlock your personalized Carbon Mirror.',
    icon: Lock
  },
  {
    title: 'See impact as a story',
    body: 'Your data becomes a class-level environmental story with trees, water, emissions, and Nepal-specific progress.',
    icon: TreePine
  }
];

const insights = [
  {
    title: 'See your class story',
    body: 'Find out if your class is cutting trees or protecting them this week',
    icon: TreePine,
    color: 'bg-green-50 text-green-700'
  },
  {
    title: 'What-if scenarios',
    body: 'Discover how 4 students switching to bus twice a week saves 42 kg CO2',
    icon: Bus,
    color: 'bg-amber-50 text-amber-700'
  },
  {
    title: 'Monthly trends',
    body: 'Watch your class improve month by month with real data',
    icon: BarChart3,
    color: 'bg-teal-50 text-teal-700'
  }
];

export default function CarbonMirrorIntroPage() {
  const router = useRouter();

  return (
    <main className="min-h-[calc(100vh-76px)] bg-[#FAFAFA] px-4 py-8 md:px-8 lg:px-12 xl:px-16">
      <div className="mx-auto w-full max-w-[1500px] space-y-8">
        <section className="grid gap-8 overflow-hidden rounded-2xl border border-[#D8EBDD] bg-[#F4FBF6] p-6 shadow-sm md:p-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="text-[12px] font-extrabold uppercase tracking-[0.18em] text-[#0A3D25]/70">
              Carbon Mirror guide
            </p>
            <h1 className="mt-3 text-[36px] font-extrabold leading-tight text-[#0A3D25] md:text-[46px]">
              Your habits become visible impact
            </h1>
            <p className="mt-4 max-w-3xl text-[17px] leading-relaxed text-[#33443D]">
              The Carbon Mirror turns everyday student choices into a clear environmental story. You log what you do, Neo Karma builds a 30-day baseline, and then the mirror shows how your class is affecting trees, water, and emissions.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => router.push('/calculator')}
                className="inline-flex h-12 items-center justify-center rounded-full bg-[#0A3D25] px-7 text-[15px] font-bold text-white transition-colors hover:bg-[#072B1A]"
              >
                Start logging
              </button>
              <button
                type="button"
                onClick={() => router.push('/carbon-mirror')}
                className="inline-flex h-12 items-center justify-center rounded-full border border-[#0A3D25] px-7 text-[15px] font-bold text-[#0A3D25] transition-colors hover:bg-white"
              >
                Back to mirror
              </button>
            </div>
          </div>

          <div className="relative min-h-[340px] overflow-hidden rounded-2xl bg-white shadow-[0_24px_70px_rgba(10,61,37,0.12)]">
            <Image src="/earth_gauge_bg.png" alt="Carbon impact mirror preview" fill className="object-cover opacity-90" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 rounded-xl border border-white/80 bg-white/90 p-5 shadow-sm backdrop-blur-sm">
              <p className="text-[13px] font-extrabold uppercase tracking-wider text-[#0A3D25]">After 30 days</p>
              <p className="mt-2 text-[22px] font-extrabold text-[#17202A]">A personal mirror for your class impact</p>
            </div>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-3">
          {steps.map(({ title, body, icon: Icon }) => (
            <div key={title} className="rounded-xl border border-[#E0E5E2] bg-white p-5 shadow-sm">
              <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#E8F5E9] text-[#0A3D25]">
                <Icon size={21} />
              </span>
              <h2 className="text-[19px] font-extrabold text-[#17202A]">{title}</h2>
              <p className="mt-2 text-[14px] leading-relaxed text-[#4A5550]">{body}</p>
            </div>
          ))}
        </section>

        <section>
          <h2 className="mb-4 text-[26px] font-extrabold text-[#17202A]">Small actions, visible impact</h2>
          <div className="grid gap-5 md:grid-cols-3">
            {insights.map(({ title, body, icon: Icon, color }) => (
              <div key={title} className="rounded-xl border border-[#E0E5E2] bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                <span className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full ${color}`}>
                  <Icon size={20} />
                </span>
                <h3 className="text-[18px] font-extrabold text-[#17202A]">{title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-[#4A5550]">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-5 rounded-2xl bg-[#0A3D25] p-6 text-white md:grid-cols-3">
          {[
            ['Trees', 'Understand forest-equivalent impact from class emissions.', Leaf],
            ['Water', 'Connect better habits to protected local resources.', Waves],
            ['Choices', 'Test how small routine changes add up across classmates.', Bus]
          ].map(([title, body, Icon]) => (
            <div key={title} className="rounded-xl bg-white/8 p-5">
              <Icon size={22} className="text-[#CBE3D8]" />
              <h3 className="mt-3 text-[18px] font-extrabold !text-white">{title}</h3>
              <p className="mt-2 text-[14px] leading-relaxed !text-white/75">{body}</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
