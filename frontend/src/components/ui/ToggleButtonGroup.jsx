import React from 'react';

/**
 * ToggleButtonGroup - Reusable single-select icon/text toggle component
 * @param {Array} options - Array of { value, label, icon? } objects
 * @param {string} selected - Currently selected value
 * @param {function} onChange - Callback when selection changes
 * @param {boolean} fullWidth - Make buttons stretch to fill container
 * @param {string} size - 'sm', 'md', 'lg' - affects button height and padding
 */
const ToggleButtonGroup = ({ 
  options, 
  selected, 
  onChange, 
  fullWidth = true,
  size = 'md',
  label = '',
  disabled = false
}) => {
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg'
  };

  const selectedSizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-14 h-14'
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          {label}
        </label>
      )}
      <div className={`flex gap-3 flex-wrap ${fullWidth ? 'justify-between' : 'justify-start'}`}>
        {options.map((option) => {
          const isSelected = selected === option.value;
          return (
            <button
              key={option.value}
              type="button"
              disabled={disabled}
              onClick={() => !disabled && onChange(option.value)}
              className={`
                flex flex-col items-center justify-center rounded-xl
                transition-all duration-200 border-2 font-medium
                disabled:opacity-50 disabled:cursor-not-allowed
                ${fullWidth ? 'flex-1 min-w-20' : ''}
                ${isSelected 
                  ? 'bg-[#1B5E20] text-white border-[#1B5E20]' 
                  : 'bg-white text-gray-700 border-gray-200 hover:border-[#1B5E20]'
                }
                ${sizeClasses[size]}
              `}
            >
              {option.icon && (
                <div className={`${selectedSizeClasses[size]} flex items-center justify-center mb-1`}>
                  {option.icon}
                </div>
              )}
              <span className="text-xs font-semibold">{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ToggleButtonGroup;
