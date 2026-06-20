'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Footprints,
  Recycle,
  Users,
  ClipboardCheck,
  Leaf,
  ChevronDown,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const URBAN_STARTER_PLAN = [
  {
    week: 'Week 1',
    title: 'Understand your transport impact',
    icon: Footprints,
    tasks: [
      ['w1-log-travel', 'Notice how you travel to school each day and log it honestly', 'Awareness task'],
      ['w1-walk-cycle', 'Try walking or cycling one day this week if possible', '0.5 kg CO2 reduction | Easy'],
      ['w1-plastic-count', 'Count how many single-use plastic items you use in one day', 'Awareness task']
    ]
  },
  {
    week: 'Week 2',
    title: 'Food and waste awareness',
    icon: Recycle,
    tasks: [
      ['w2-veg-lunch', 'Choose vegetarian lunch at least twice this week', '1.2 kg CO2 reduction | Easy'],
      ['w2-bottle', 'Bring a reusable water bottle instead of buying plastic', '0.3 kg CO2 reduction | Easy'],
      ['w2-compost', 'Check if your school canteen has a composting system', 'Awareness task']
    ]
  },
  {
    week: 'Week 3',
    title: 'Collective action',
    icon: Users,
    tasks: [
      ['w3-classmates', 'Talk to 3 classmates about your carbon footprint results', 'Awareness task'],
      ['w3-lights-off', 'Suggest a lights-off rule during breaks to your teacher', '0.5 kg CO2 reduction | Easy'],
      ['w3-walk-twice', 'Walk or cycle to school at least twice this week', '1.0 kg CO2 reduction | Medium']
    ]
  },
  {
    week: 'Week 4',
    title: 'Prepare for your personalized plan',
    icon: ClipboardCheck,
    tasks: [
      ['w4-log-30', 'Complete your 30th daily log to unlock your AI plan', 'Milestone task'],
      ['w4-review-streak', 'Review your streak because consistency earns the highest score', 'Milestone task'],
      ['w4-countdown', 'Your personalized plan unlocks soon', 'Countdown milestone']
    ]
  }
];

const RURAL_STARTER_PLAN = [
  {
    week: 'Week 1',
    title: 'Map your daily route and energy use',
    icon: Footprints,
    tasks: [
      ['rw1-route', 'Notice how you travel to school: walking, bicycle, bus, motorbike, or shared jeep', 'Awareness task'],
      ['rw1-safe-walk', 'If safe, walk with friends at least one extra day this week', '0.4 kg CO2 reduction | Easy'],
      ['rw1-evening-energy', 'Write down when lights, phone charging, or TV are used at home after school', 'Awareness task']
    ]
  },
  {
    week: 'Week 2',
    title: 'Cleaner cooking and less smoke',
    icon: Leaf,
    tasks: [
      ['rw2-firewood', 'Log firewood use honestly if your home cooks with firewood', 'Awareness task'],
      ['rw2-dry-wood', 'Ask your family if firewood can be kept dry before cooking to reduce smoke', '0.5 kg CO2 reduction | Easy'],
      ['rw2-ventilation', 'Notice whether the cooking area has good airflow or a chimney', 'Health and climate task']
    ]
  },
  {
    week: 'Week 3',
    title: 'Water, waste, and local resources',
    icon: Recycle,
    tasks: [
      ['rw3-bottle', 'Carry a reusable bottle instead of buying plastic packets or bottles', '0.3 kg CO2 reduction | Easy'],
      ['rw3-waste-separate', 'Separate organic waste from plastic waste at home or school for one week', 'Awareness task'],
      ['rw3-water-care', 'Check if taps are left running at school and remind classmates to close them', 'Water protection task']
    ]
  },
  {
    week: 'Week 4',
    title: 'Community action before unlock',
    icon: Users,
    tasks: [
      ['rw4-garden', 'Help care for a school garden, sapling, or compost pit if available', 'Community task'],
      ['rw4-talk-family', 'Share one carbon habit you noticed with someone at home', 'Awareness task'],
      ['rw4-log-30', 'Complete your 30th daily log to unlock your personalized rural plan', 'Milestone task']
    ]
  }
];

export default function AllPlansPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [expandedPlan, setExpandedPlan] = useState(null);

  const isRural = user?.locationType === 'rural';
  const starterPlan = isRural ? RURAL_STARTER_PLAN : URBAN_STARTER_PLAN;

  return (
    <main className="min-h-[calc(100vh-76px)] bg-white px-4 py-8 md:px-8 lg:px-12 xl:px-16">
      <div className="mx-auto w-full max-w-[1400px]">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#E0E5E2] hover:bg-[#F7FCF8]"
          >
            <ArrowLeft size={20} className="text-[#4A5550]" />
          </button>
          <div>
            <h1 className="text-3xl font-extrabold text-[#0A3D25]">Starter Plans</h1>
            <p className="mt-1 text-sm text-[#4A5550]">Choose a starter plan to keep your climate action moving before your personalized plan unlocks.</p>
          </div>
        </div>

        <section className="space-y-4">
          <div className="mb-6">
            <h2 className="text-2xl font-extrabold text-[#0A3D25]">{isRural ? '🏡 Rural Climate Starter Plan' : '🌍 Urban Climate Starter Plan'}</h2>
            <p className="mt-2 text-[#4A5550]">
              A practical 30-day plan designed for {isRural ? 'rural Nepal' : 'urban areas'}. These actions are easy for students to try and help your class build a strong climate baseline.
            </p>
          </div>

          <div className="space-y-3">
            {starterPlan.map((week) => {
              const Icon = week.icon;
              const isOpen = expandedPlan === week.week;
              return (
                <div key={week.week} className="overflow-hidden rounded-xl border border-[#E8F1EA] bg-white shadow-sm">
                  <button
                    type="button"
                    onClick={() => setExpandedPlan(isOpen ? null : week.week)}
                    className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left transition-colors hover:bg-[#F9FFFC]"
                  >
                    <span className="flex items-center gap-4">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F1FBF5] text-[#0A3D25]">
                        <Icon size={18} />
                      </span>
                      <span>
                        <span className="block text-[12px] font-extrabold uppercase tracking-wider text-[#4A5550]">{week.week}</span>
                        <span className="block text-[16px] font-bold text-[#17202A]">{week.title}</span>
                      </span>
                    </span>
                    <ChevronDown className={`text-[#4A5550] transition-transform ${isOpen ? 'rotate-180' : ''}`} size={20} />
                  </button>

                  {isOpen && (
                    <div className="border-t border-[#E8F1EA] bg-[#F9FFFC] px-6 py-4">
                      <ul className="space-y-3">
                        {week.tasks.map(([id, text, meta]) => (
                          <li key={id} className="flex gap-3">
                            <span className="mt-1 text-[#77C9A6]">✓</span>
                            <div>
                              <p className="text-[14px] font-semibold text-[#17202A]">{text}</p>
                              <p className="mt-1 text-[12px] text-[#6A7C73]">{meta}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
