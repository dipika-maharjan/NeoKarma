'use client';

import React from 'react';

export default function SegmentedYesNo({ value, onChange, name }) {
  const isYes = value === true;
  const isNo = value === false;

  return (
    <div className="flex w-fit bg-[#F4F6F5] p-1 rounded-full border border-gray-100">
      <button
        type="button"
        onClick={() => onChange({ target: { name, value: true } })}
        className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer outline-none ${
          isYes
            ? 'bg-forest-green text-white shadow-sm'
            : 'text-gray-600 hover:text-gray-800'
        }`}
      >
        Yes
      </button>
      <button
        type="button"
        onClick={() => onChange({ target: { name, value: false } })}
        className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer outline-none ${
          isNo
            ? 'bg-forest-green text-white shadow-sm'
            : 'text-gray-600 hover:text-gray-800'
        }`}
      >
        No
      </button>
    </div>
  );
}
