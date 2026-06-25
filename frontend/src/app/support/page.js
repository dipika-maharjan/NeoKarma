'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'What is a carbon footprint?',
    a: 'The total amount of greenhouse gases produced by daily activities such as transportation, electricity use, and waste generation.',
  },
  {
    q: 'How is my carbon footprint calculated?',
    a: 'NeoKarma uses verified emission factors for each activity, including transport mode, distance, meal type, energy use, and plastic waste, to compute your daily CO₂ equivalent in kilograms.',
  },
  {
    q: 'Why should students track emissions?',
    a: 'Awareness is the first step to change. Tracking helps students understand which habits have the biggest environmental impact and motivates them to make greener, more conscious choices.',
  },
  {
    q: 'How can students reduce their carbon footprint?',
    a: 'Students can walk or cycle instead of using motorized transport, save electricity at home, reduce waste and plastic use, choose plant-based meals, and actively participate in school sustainability activities.',
  },
  {
    q: 'What activities can I log in NeoKarma?',
    a: 'You can log four categories each day: transportation (mode and distance), food choices (meal type), energy usage (hours and firewood), and waste & plastic consumption (item count).',
  },
  {
    q: 'How does the streak system work?',
    a: 'Log your carbon activity every day to build a streak. If you log yesterday and today, your streak continues. Missing a day resets your current streak to 1, but your longest ever streak is always saved.',
  },
  {
    q: 'How are eco-actions rewarded?',
    a: 'Consistent daily logging earns participation scores that your school admin can see. Admins can also award practical marks based on your current streak and total log days.',
  },
  {
    q: 'Is my data secure?',
    a: 'Yes. Your data is stored securely and is only visible to you and your school administrator. It is never shared with third parties or used for advertising purposes.',
  },
];

function FaqItem({ question, answer, isOpen, onToggle, index }) {
  return (
    <div className="border-b border-[#DCE9E0] last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="group flex w-full items-start justify-between gap-4 py-5 text-left transition-colors duration-200"
      >
        <span
          className={`text-[16px] font-semibold leading-snug transition-colors duration-200 md:text-[17px] ${
            isOpen ? 'text-[#0A3D25]' : 'text-[#1E3322] group-hover:text-[#0A3D25]'
          }`}
        >
          {question}
        </span>
        <span
          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
            isOpen
              ? 'border-[#0A3D25] bg-[#0A3D25] text-white'
              : 'border-[#C9D8CF] bg-white text-[#5C8A72] group-hover:border-[#0A3D25] group-hover:text-[#0A3D25]'
          }`}
        >
          <ChevronDown
            size={14}
            className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          />
        </span>
      </button>

      {/* Smooth expand */}
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: isOpen ? '300px' : '0px' }}
        aria-hidden={!isOpen}
      >
        <p className="pb-5 text-[16px] leading-8 text-[#4A5550] md:text-[17px]">{answer}</p>
      </div>
    </div>
  );
}

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState(null);
  const toggle = (i) => setOpenFaq((prev) => (prev === i ? null : i));

  return (
    <main className="bg-[#FAFAFA] px-4 py-12 md:px-8 md:py-16 lg:px-12">
      <section className="mx-auto w-full max-w-screen-2xl">

        {/* ── Header matches FooterInfoPage exactly ── */}
        <div className="border-b border-[#DCE9E0] pb-8 md:pb-10">
          <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-[#5C8A72]">
            Support
          </p>
          <h1 className="mt-4 max-w-4xl text-[34px] font-extrabold leading-tight text-[#0A3D25] md:text-[48px]">
            FAQ
          </h1>
        </div>

        {/* ── Intro ── */}
        <div className="py-8 md:py-10">
          <p className="max-w-3xl text-[17px] leading-8 text-[#4A5550] md:text-[18px]">
            Find answers to the most common questions about Neoकर्म.
          </p>
        </div>

        {/* ── Accordion ── */}
        <div className="max-w-3xl">
          {faqs.map((faq, i) => (
            <FaqItem
              key={i}
              index={i}
              question={faq.q}
              answer={faq.a}
              isOpen={openFaq === i}
              onToggle={() => toggle(i)}
            />
          ))}
        </div>

        {/* ── Bottom CTA ── */}
        <div className="mt-14 rounded-2xl border border-[#CFE2D5] bg-[#EEF7F1] px-6 py-8 md:px-10">
          <p className="text-[13px] font-bold uppercase tracking-[0.18em] text-[#5C8A72]">
            Still have questions?
          </p>
          <p className="mt-3 max-w-xl text-[17px] leading-7 text-[#1E3322]">
            Reach out to your school coordinator or contact us directly; we're happy to help.
          </p>
          <a
            href="/contact"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#0A3D25] px-6 py-2.5 text-[14px] font-semibold text-white transition-all duration-200 hover:bg-[#0d5233] hover:shadow-md"
          >
            Contact Support
          </a>
        </div>

      </section>
    </main>
  );
}
