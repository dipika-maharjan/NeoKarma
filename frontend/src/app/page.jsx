'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import LandingNavbar from '@/components/LandingNavbar';
import Footer from '@/components/Footer';
import {
  ArrowRight,
  Award,
  Bike,
  Bus,
  Calculator,
  CalendarCheck,
  Car,
  ClipboardPen,
  FlaskConical,
  Footprints,
  Globe2,
  GraduationCap,
  Leaf,
  Shield,
  Sprout,
  Users,
} from 'lucide-react';

export default function Home() {
  const [transport, setTransport] = useState('walk');
  const [lunch, setLunch] = useState('vegetarian');
  const [plasticWaste, setPlasticWaste] = useState('no');
  const [co2, setCo2] = useState(0.0);

  const transportEmissions = {
    walk: 0,
    bicycle: 0,
    bus: 0.5,
    motorbike: 1.2,
    car: 2.3,
  };

  const lunchEmissions = {
    vegetarian: 0.3,
    mixed: 0.8,
    'non-veg': 1.5,
  };

  const plasticEmissions = {
    yes: 0.4,
    no: 0,
  };

  const handleCalculate = () => {
    const total =
      (transportEmissions[transport] || 0) +
      (lunchEmissions[lunch] || 0) +
      (plasticEmissions[plasticWaste] || 0);
    setCo2(Number(total.toFixed(1)));
  };

  const transportOptions = [
    { id: 'walk', label: 'Walk', icon: <Footprints size={22} /> },
    { id: 'bicycle', label: 'Bicycle', icon: <Bike size={22} /> },
    { id: 'bus', label: 'Bus', icon: <Bus size={22} /> },
    { id: 'motorbike', label: 'Motorbike', icon: <Bike size={22} /> },
    { id: 'car', label: 'Car', icon: <Car size={22} /> },
  ];

  const journeySteps = [
    {
      icon: <ClipboardPen size={22} />,
      title: 'Log',
      description: 'Input your daily activities effortlessly.',
    },
    {
      icon: <Calculator size={22} />,
      title: 'Calculate',
      description: 'Our AI calculates your CO2 footprint.',
    },
    {
      icon: <Leaf size={22} />,
      title: 'Mirror',
      description: 'See the real environmental impact.',
    },
    {
      icon: <CalendarCheck size={22} />,
      title: 'Plan',
      description: 'Actionable steps to reduce impact.',
    },
    {
      icon: <Award size={22} />,
      title: 'Score',
      description: 'Earn streaks.',
    },
  ];

  const featureCards = [
    {
      icon: <FlaskConical size={28} />,
      title: 'Science Based',
      description:
        "Calculations aligned with DEFRA and international climate standards, localized for Nepal's specific grid and transport mix.",
    },
    {
      icon: <Users size={28} />,
      title: 'Made for Students',
      description:
        'Gamified experience tailored for grades 8-12, helping schools integrate environmental education into daily life.',
    },
    {
      icon: <Shield size={28} />,
      title: 'Secure & Private',
      description:
        'Your data belongs to you. We follow strict privacy protocols to ensure student information remains confidential.',
    },
  ];

  return (
    <>
      <LandingNavbar />
      <main className="min-h-screen bg-[#FAFAFA]">
        <section className="mx-auto max-w-[94%] px-4 py-12 md:py-16 md:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#E8F5E9] px-4 py-1.5 text-[12px] font-bold uppercase tracking-wider text-[#1B5E20]">
                <GraduationCap size={16} />
                Made for Nepalese Schools
              </div>

              <h1 className="mb-6 max-w-[780px] text-[34px] font-extrabold leading-[1.25] text-[#0A3D25] md:text-[44px]">
                Your actions today shape tomorrow. Track. Reflect. Reduce.
              </h1>

              <p className="mb-8 max-w-[700px] text-[16px] md:text-[18px] leading-relaxed text-[#4A5550]">
                Neo Karma helps Nepalese students understand their carbon
                footprint and take meaningful actions for a better, greener
                future.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/calculator"
                  className="inline-flex items-center gap-2 rounded-full bg-[#0A3D25] px-7 py-3 text-[15px] font-bold text-white no-underline shadow-sm transition hover:bg-[#072B1A]"
                >
                  Try Carbon Calculator
                  <ArrowRight size={18} />
                </Link>

                <Link
                  href="#preview"
                  className="rounded-full border border-[#BFCBC5] bg-white/40 px-7 py-3 text-[15px] font-bold text-[#4A5550] no-underline transition hover:bg-white"
                >
                  Try Quick Calculator
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="relative overflow-hidden rounded-xl shadow-lg shadow-slate-200/50">
                <Image
                  src="/images/hero.png"
                  alt="Students planting trees in Nepal"
                  width={900}
                  height={680}
                  className="aspect-[1.22/1] w-full object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        <section id="preview" className="bg-[#F1F4F2] py-16">
          <div className="mx-auto max-w-[94%] px-4 md:px-8">
            <div className="mb-8 text-center">
              <h2 className="mb-2 text-[26px] md:text-[28px] font-extrabold text-[#0A3D25]">
                Live Carbon Preview
              </h2>
              <p className="text-[15px] text-[#4A5550]">
                See how your daily choices impact the planet in real-time.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
              <div className="rounded-xl border border-[#E0E5E2] bg-white p-6 md:p-8 shadow-[0_2px_8px_rgba(15,23,42,0.06)]">
                <p className="mb-4 text-[15px] font-bold text-[#17202A]">
                  Transport: How did you get to school today?
                </p>

                <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
                  {transportOptions.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setTransport(opt.id)}
                      className={`flex h-[88px] flex-col items-center justify-center rounded-lg border text-[#17202A] transition-all ${
                        transport === opt.id
                          ? 'border-[#0A3D25] bg-[#C7EEDC] text-[#0A3D25] font-semibold'
                          : 'border-[#BFCBC5] bg-white hover:border-[#0A3D25]'
                      }`}
                    >
                      <span className="mb-1 flex h-6 items-center justify-center">{opt.icon}</span>
                      <span className="text-[12px] font-semibold">{opt.label}</span>
                    </button>
                  ))}
                </div>

                <div className="grid gap-8 md:grid-cols-2">
                  <div>
                    <p className="mb-3 text-[15px] font-bold text-[#17202A]">
                      Lunch Selection
                    </p>
                    <div className="grid grid-cols-3 rounded-full border border-[#BFCBC5] bg-[#F1F4F2] p-0.5">
                      {['vegetarian', 'mixed', 'non-veg'].map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setLunch(option)}
                          className={`h-9 rounded-full text-[13px] font-semibold transition ${
                            lunch === option
                              ? 'bg-[#0A3D25] text-white shadow-sm'
                              : 'text-[#4A5550] hover:text-[#0A3D25]'
                          }`}
                        >
                          {option === 'non-veg'
                            ? 'Non-Veg'
                            : option.charAt(0).toUpperCase() + option.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="mb-3 text-[15px] font-bold text-[#17202A]">
                      Plastic Waste Produced?
                    </p>
                    <div className="grid grid-cols-2 rounded-full border border-[#BFCBC5] bg-[#F1F4F2] p-0.5">
                      {['yes', 'no'].map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setPlasticWaste(option)}
                          className={`h-9 rounded-full text-[13px] font-semibold transition ${
                            plasticWaste === option
                              ? 'bg-[#0A3D25] text-white shadow-sm'
                              : 'text-[#4A5550] hover:text-[#0A3D25]'
                          }`}
                        >
                          {option.charAt(0).toUpperCase() + option.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-center">
                  <button
                    type="button"
                    onClick={handleCalculate}
                    className="h-11 w-full max-w-[260px] rounded-full bg-[#0A3D25] text-[14px] font-bold text-white shadow-sm hover:bg-[#072B1A] transition-colors"
                  >
                    Calculate
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-white/5 bg-[#0A3D25] px-6 py-10 text-center text-white shadow-md flex flex-col justify-between h-full">
                <div>
                  <p className="mb-5 text-[13px] font-bold uppercase tracking-[0.15em] text-[#72B99C]">
                    Your Estimated Emission
                  </p>
                  <div className="mb-4 flex items-end justify-center gap-2">
                    <span className="text-[64px] font-extrabold leading-none tracking-tight">
                      {co2.toFixed(1)}
                    </span>
                    <span className="mb-1.5 text-[20px] font-bold text-[#BCE5D1]">
                      kg CO₂
                    </span>
                  </div>
                  <p className="mb-6 text-[14px] text-[#BCE5D1]">
                    ~ {(co2 * 0.05).toFixed(1)} trees needed to absorb this
                  </p>
                  <div className="mb-8 h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#72B99C] transition-all"
                      style={{ width: `${Math.min(100, co2 * 18)}%` }}
                    />
                  </div>
                </div>
                <Link
                  href="/register"
                  className="block rounded-full bg-white py-3 text-[14px] font-bold text-[#0A3D25] no-underline transition hover:bg-gray-50"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section id="journey" className="bg-[#FAFAFA] py-16">
          <div className="mx-auto max-w-[94%] px-4 md:px-8">
            <h2 className="mb-12 text-center text-[26px] md:text-[28px] font-extrabold text-[#0A3D25]">
              The Neoकर्म Journey
            </h2>

            <div className="grid grid-cols-2 gap-8 md:grid-cols-5 md:gap-4">
              {journeySteps.map((step, index) => (
                <div key={step.title} className="relative flex flex-col items-center text-center">
                  {index > 0 && (
                    <div className="absolute left-[-50%] top-8 hidden h-px w-full border-t border-dashed border-[#BFCBC5] md:block" />
                  )}
                  <div className="relative z-10 mb-4 flex h-[68px] w-[68px] items-center justify-center rounded-full border border-[#0A3D25] bg-white text-[#0A3D25] shadow-sm">
                    {step.icon}
                  </div>
                  <h3 className="mb-1.5 text-[16px] font-bold text-[#17202A]">{step.title}</h3>
                  <p className="max-w-[180px] text-[13px] text-[#4A5550] leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="bg-[#0A3D25] px-4 py-16 md:px-8">
          <div className="mx-auto max-w-[94%] grid gap-6 md:grid-cols-3">
            {featureCards.map((card) => (
              <div
                key={card.title}
                className="rounded-xl border border-white/10 bg-[#07563F] p-8 text-white "
              >
                <div className="mb-5 text-white">{card.icon}</div>
                <h3 className="mb-3 text-[18px] font-bold text-white">{card.title}</h3>
                <p className="text-[14px] text-whiteleading-relaxed">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
