import React from 'react';

/**
 * SegmentedYesNo - Binary yes/no toggle control
 * @param {boolean} value - Current value (true = yes, false = no, null = unset)
 * @param {function} onChange - Callback with true/false/null
 * @param {string} label - Question/label text
 * @param {boolean} required - Whether selection is mandatory
 */
const SegmentedYesNo = ({ 
  value, 
  onChange, 
  label = '',
  required = false,
  disabled = false,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3.5 text-lg'
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="flex gap-2">
        {[
          { val: true, label: 'Yes', color: 'green' },
          { val: false, label: 'No', color: 'gray' }
        ].map((option) => {
          const isSelected = value === option.val;
          return (
            <button
              key={option.label}
              type="button"
              disabled={disabled}
              onClick={() => !disabled && onChange(option.val)}
              className={`
                flex-1 rounded-lg font-semibold transition-all duration-200
                border-2 disabled:opacity-50 disabled:cursor-not-allowed
                ${sizeClasses[size]}
                ${isSelected
                  ? option.color === 'green'
                    ? 'bg-[#1B5E20] text-white border-[#1B5E20]'
                    : 'bg-gray-700 text-white border-gray-700'
                  : option.color === 'green'
                    ? 'bg-white text-gray-700 border-gray-200 hover:border-[#1B5E20]'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                }
              `}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SegmentedYesNo;
