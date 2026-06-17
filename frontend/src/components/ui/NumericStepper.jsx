'use client';

import React from 'react';
import { Minus, Plus } from 'lucide-react';

export default function NumericStepper({ value, onChange, name, min = 0, step = 1, unit = '' }) {
  const handleDecrement = () => {
    const newVal = Math.max(min, value - step);
    onChange({ target: { name, value: parseFloat(newVal.toFixed(2)) } });
  };

  const handleIncrement = () => {
    const newVal = value + step;
    onChange({ target: { name, value: parseFloat(newVal.toFixed(2)) } });
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleDecrement}
        className="w-10 h-10 flex items-center justify-center rounded-full bg-[#F4F6F5] text-gray-600 hover:bg-gray-200/80 active:bg-gray-300/80 transition-colors cursor-pointer outline-none"
      >
        <Minus size={16} />
      </button>
      
      <div className="flex items-center gap-1 bg-[#F4F6F5] px-5 py-2 rounded-full min-w-[100px] justify-center select-none border border-transparent">
        <span className="text-sm font-bold text-gray-800">{value}</span>
        {unit && <span className="text-xs font-semibold text-gray-400">{unit}</span>}
      </div>

      <button
        type="button"
        onClick={handleIncrement}
        className="w-10 h-10 flex items-center justify-center rounded-full bg-[#F4F6F5] text-gray-600 hover:bg-gray-200/80 active:bg-gray-300/80 transition-colors cursor-pointer outline-none"
      >
        <Plus size={16} />
      </button>
    </div>
  );
}
