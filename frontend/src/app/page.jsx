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
    { id: 'walk', label: 'Walk', icon: <Footprints size={28} /> },
    { id: 'bicycle', label: 'Bicycle', icon: <Bike size={28} /> },
    { id: 'bus', label: 'Bus', icon: <Bus size={28} /> },
    { id: 'motorbike', label: 'Motorbike', icon: <Bike size={28} /> },
    { id: 'car', label: 'Car', icon: <Car size={28} /> },
  ];

  const journeySteps = [
    {
      icon: <ClipboardPen size={30} />,
      title: 'Log',
      description: 'Input your daily activities effortlessly.',
    },
    {
      icon: <Calculator size={30} />,
      title: 'Calculate',
      description: 'Our AI calculates your CO2 footprint.',
    },
    {
      icon: <Leaf size={30} />,
      title: 'Mirror',
      description: 'See the real environmental impact.',
    },
    {
      icon: <CalendarCheck size={30} />,
      title: 'Plan',
      description: 'Actionable steps to reduce impact.',
    },
    {
      icon: <Award size={30} />,
      title: 'Score',
      description: 'Earn streaks.',
    },
  ];

  const featureCards = [
    {
      icon: <FlaskConical size={36} />,
      title: 'Science Based',
      description:
        "Calculations aligned with DEFRA and international climate standards, localized for Nepal's specific grid and transport mix.",
    },
    {
      icon: <Users size={36} />,
      title: 'Made for Students',
      description:
        'Gamified experience tailored for grades 8-12, helping schools integrate environmental education into daily life.',
    },
    {
      icon: <Shield size={36} />,
      title: 'Secure & Private',
      description:
        'Your data belongs to you. We follow strict privacy protocols to ensure student information remains confidential.',
    },
  ];

  return (
    <>
      <LandingNavbar />
      <main className="min-h-screen bg-[#f7f8fd]">
        <section className="mx-auto max-w-[1840px] px-6 pb-[118px] pt-[112px] md:px-14">
          <div className="grid items-center gap-20 lg:grid-cols-[0.93fr_1fr]">
            <div>
              <div className="mb-14 inline-flex items-center gap-2 rounded-full bg-[#c8f3da] px-6 py-2 text-[13px] font-extrabold uppercase tracking-wide text-[#6c8c7d]">
                <GraduationCap size={18} />
                Made for Nepalese Schools
              </div>

              <h1 className="mb-10 max-w-[780px] text-[48px] font-extrabold leading-[1.22] text-[#063f2f] md:text-[64px]">
                Your actions today shape tomorrow. Track. Reflect. Reduce.
              </h1>

              <p className="mb-12 max-w-[760px] text-[21px] font-medium leading-8 text-[#6c7370]">
                Neo Karma helps Nepalese students understand their carbon
                footprint and take meaningful actions for a better, greener
                future.
              </p>

              <div className="flex flex-wrap gap-6">
                <Link
                  href="/calculator"
                  className="inline-flex items-center gap-3 rounded-full bg-[#063f2f] px-12 py-5 text-[16px] font-extrabold text-white no-underline shadow-xl shadow-green-950/20 transition hover:bg-[#052f23]"
                >
                  Try Carbon Calculator
                  <ArrowRight size={22} />
                </Link>

                <Link
                  href="#preview"
                  className="rounded-full border-2 border-[#9fa6a3] bg-white/20 px-12 py-5 text-[16px] font-extrabold text-[#46504b] no-underline transition hover:bg-white"
                >
                  Try Quick Calculator
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="relative overflow-hidden rounded-[32px] shadow-2xl shadow-slate-400/50">
                <Image
                  src="/images/hero.png"
                  alt="Students planting trees in Nepal"
                  width={900}
                  height={680}
                  className="aspect-[1.22/1] w-full object-cover"
                  priority
                />
                <div className="absolute bottom-[16%] right-8 rounded-sm bg-white/90 px-4 py-3 text-center shadow-md">
                  <p className="text-[11px] font-extrabold leading-tight text-[#558c24]">
                    Reduce Today
                  </p>
                  <p className="text-[10px] font-bold leading-tight text-[#558c24]">
                    Greener Tomorrow
                  </p>
                  <div className="mt-2 flex items-center justify-center gap-1">
                    <Sprout size={24} className="text-[#6aa548]" />
                    <Globe2 size={30} className="text-[#73a5c9]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="preview" className="bg-[#eef3ff] py-20">
          <div className="mx-auto max-w-[1840px] px-6 md:px-9">
            <div className="mb-12 text-center">
              <h2 className="mb-1 text-3xl font-extrabold text-[#063f2f]">
                Live Carbon Preview
              </h2>
              <p className="text-lg font-medium text-[#666f6b]">
                See how your daily choices impact the planet in real-time.
              </p>
            </div>

            <div className="grid gap-9 lg:grid-cols-[1fr_0.49fr]">
              <div className="rounded-3xl border border-gray-200 bg-white p-12 shadow-md shadow-slate-200/70">
                <p className="mb-7 text-[17px] font-semibold text-[#276254]">
                  Transport: How did you get to school today?
                </p>

                <div className="mb-12 grid grid-cols-2 gap-3 sm:grid-cols-5">
                  {transportOptions.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setTransport(opt.id)}
                      className={`flex h-[126px] flex-col items-center justify-center rounded-xl border-2 text-[#222833] transition ${
                        transport === opt.id
                          ? 'border-[#1b6d5e] bg-[#eef8f3] text-[#063f2f]'
                          : 'border-[#d4dbd8] bg-white hover:border-[#9eb8ae]'
                      }`}
                    >
                      {opt.icon}
                      <span className="mt-2 text-[13px] font-extrabold">{opt.label}</span>
                    </button>
                  ))}
                </div>

                <div className="grid gap-12 md:grid-cols-2">
                  <div>
                    <p className="mb-4 text-[17px] font-semibold text-[#276254]">
                      Lunch Selection
                    </p>
                    <div className="grid grid-cols-3 rounded-full border border-[#c7d0cf] bg-[#eef3ff] p-1">
                      {['vegetarian', 'mixed', 'non-veg'].map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setLunch(option)}
                          className={`h-11 rounded-full text-[14px] font-extrabold transition ${
                            lunch === option
                              ? 'bg-[#063f2f] text-white shadow-sm'
                              : 'text-[#555d60] hover:text-[#063f2f]'
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
                    <p className="mb-4 text-[17px] font-semibold text-[#276254]">
                      Plastic Waste Produced?
                    </p>
                    <div className="grid grid-cols-2 rounded-full border border-[#c7d0cf] bg-[#eef3ff] p-1">
                      {['yes', 'no'].map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setPlasticWaste(option)}
                          className={`h-11 rounded-full text-[14px] font-extrabold transition ${
                            plasticWaste === option
                              ? 'bg-[#063f2f] text-white shadow-sm'
                              : 'text-[#555d60] hover:text-[#063f2f]'
                          }`}
                        >
                          {option.charAt(0).toUpperCase() + option.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-12 flex justify-center">
                  <button
                    type="button"
                    onClick={handleCalculate}
                    className="h-[72px] w-full max-w-[390px] rounded-2xl bg-[#063f2f] text-[15px] font-extrabold text-white shadow-lg shadow-green-950/15 transition hover:bg-[#052f23]"
                  >
                    Calculate
                  </button>
                </div>
              </div>

              <div className="rounded-3xl border-t-[6px] border-[#4eedaf] bg-[#063f2f] px-12 py-20 text-center text-white shadow-md shadow-slate-200/70">
                <p className="mb-7 text-[16px] font-bold uppercase tracking-[0.25em] text-[#a6c4bb]">
                  Your Estimated Emission
                </p>
                <div className="mb-5 flex items-end justify-center gap-4">
                  <span className="text-[86px] font-extrabold leading-none tracking-wide">
                    {co2.toFixed(1)}
                  </span>
                  <span className="mb-3 text-[28px] font-extrabold text-[#d3dfdc]">
                    kg CO<sub>2</sub>
                  </span>
                </div>
                <p className="mb-7 text-[15px] font-medium text-[#c1d4ce]">
                  ~ {(co2 * 0.05).toFixed(1)} trees needed to absorb this
                </p>
                <div className="mb-8 h-2 rounded-full bg-[#d5f8e3]">
                  <div
                    className="h-full rounded-full bg-[#69e7ae] transition-all"
                    style={{ width: `${Math.min(100, co2 * 18)}%` }}
                  />
                </div>
                <Link
                  href="/register"
                  className="block rounded-xl bg-white px-8 py-5 text-[15px] font-extrabold text-[#063f2f] no-underline transition hover:bg-[#f3fff8]"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section id="journey" className="bg-[#f7f8fd] py-20">
          <div className="mx-auto max-w-[1680px] px-6 md:px-9">
            <h2 className="mb-16 text-center text-3xl font-extrabold text-[#063f2f]">
              The Neoकर्म Journey
            </h2>

            <div className="grid grid-cols-2 gap-10 md:grid-cols-5 md:gap-0">
              {journeySteps.map((step, index) => (
                <div key={step.title} className="relative flex flex-col items-center text-center">
                  {index > 0 && (
                    <div className="absolute left-[-50%] top-10 hidden h-px w-full border-t-2 border-dashed border-[#b6c3bf] md:block" />
                  )}
                  <div className="relative z-10 mb-6 flex h-[86px] w-[86px] items-center justify-center rounded-full border-2 border-[#1b6d5e] bg-white text-[#243039] shadow-md shadow-green-950/10">
                    {step.icon}
                  </div>
                  <h3 className="mb-2 text-xl font-extrabold text-[#232735]">{step.title}</h3>
                  <p className="max-w-[220px] text-[15px] font-medium leading-5 text-[#6c7370]">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="bg-[#063f2f] px-6 py-[74px] md:px-9">
          <div className="mx-auto grid max-w-[1840px] gap-10 md:grid-cols-3">
            {featureCards.map((card) => (
              <div
                key={card.title}
                className="rounded-[28px] border-l-[6px] border-[#49e6a4] bg-[#0e6049] p-12 text-white shadow-xl shadow-green-950/20"
              >
                <div className="mb-8 text-[#5df0ad]">{card.icon}</div>
                <h3 className="mb-7 text-[25px] font-extrabold text-white">{card.title}</h3>
                <p className="text-[16px] font-medium leading-7 text-[#b7d0c7]">
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
