import React from 'react';
import { Plus, Minus } from 'lucide-react';

/**
 * NumericStepper - Input control with +/- buttons for numeric values
 * @param {number} value - Current numeric value
 * @param {function} onChange - Callback with new value
 * @param {string} label - Label text
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @param {number} step - Increment/decrement amount
 * @param {string} unit - Unit display (e.g., 'km', 'hours')
 * @param {number} decimals - Number of decimal places
 */
const NumericStepper = ({ 
  value = 0, 
  onChange, 
  label = '',
  min = 0,
  max = 1000,
  step = 1,
  unit = '',
  decimals = 0,
  disabled = false,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'h-8 text-sm',
    md: 'h-10 text-base',
    lg: 'h-12 text-lg'
  };

  const buttonSizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg'
  };

  const handleDecrement = () => {
    const newValue = Math.max(min, value - step);
    onChange(parseFloat(newValue.toFixed(decimals)));
  };

  const handleIncrement = () => {
    const newValue = Math.min(max, value + step);
    onChange(parseFloat(newValue.toFixed(decimals)));
  };

  const handleInputChange = (e) => {
    const inputValue = e.target.value === '' ? 0 : parseFloat(e.target.value);
    if (!isNaN(inputValue)) {
      const newValue = Math.max(min, Math.min(max, inputValue));
      onChange(parseFloat(newValue.toFixed(decimals)));
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          {label}
        </label>
      )}
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={disabled || value <= min}
          onClick={handleDecrement}
          className={`
            flex items-center justify-center rounded-lg bg-white border-2 border-gray-200
            transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
            hover:border-[#1B5E20] hover:text-[#1B5E20]
            ${buttonSizeClasses[size]}
          `}
        >
          <Minus size={size === 'sm' ? 16 : size === 'md' ? 20 : 24} />
        </button>

        <div className={`flex-1 flex items-center justify-center px-3 py-2 border-2 border-gray-200 rounded-lg bg-white ${sizeClasses[size]}`}>
          <input
            type="number"
            value={value}
            onChange={handleInputChange}
            disabled={disabled}
            min={min}
            max={max}
            step={step}
            className={`
              w-full text-center bg-transparent font-semibold text-gray-900
              focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed
              ${sizeClasses[size]}
            `}
          />
          {unit && (
            <span className="ml-2 text-sm font-medium text-gray-600">
              {unit}
            </span>
          )}
        </div>

        <button
          type="button"
          disabled={disabled || value >= max}
          onClick={handleIncrement}
          className={`
            flex items-center justify-center rounded-lg bg-[#1B5E20] text-white border-2 border-[#1B5E20]
            transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
            hover:bg-[#0D3D14]
            ${buttonSizeClasses[size]}
          `}
        >
          <Plus size={size === 'sm' ? 16 : size === 'md' ? 20 : 24} />
        </button>
      </div>
    </div>
  );
};

export default NumericStepper;
