'use client';

import React from 'react';

export default function ToggleButtonGroup({ options, value, onChange, name }) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange({ target: { name, value: option.value } })}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold border transition-all duration-200 cursor-pointer outline-none ${
              isSelected
                ? 'bg-forest-green text-white border-forest-green shadow-sm'
                : 'bg-[#F4F6F5] text-gray-600 border-transparent hover:bg-gray-200/80 hover:text-gray-800'
            }`}
          >
            {option.icon && <span className="flex items-center">{option.icon}</span>}
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
