import React from 'react';

/**
 * StatCard - Displays a statistic with label and value
 * @param {string} label - Stat label
 * @param {string|number} value - Stat value
 * @param {string} unit - Unit suffix (e.g., 'kg CO₂', 'trees', '%')
 * @param {ReactNode} icon - Icon element to display
 * @param {string} size - 'sm', 'md', 'lg'
 * @param {string} variant - 'default', 'highlight', 'dark'
 * @param {boolean} compact - Compact layout for inline display
 */
const StatCard = ({ 
  label = '', 
  value = '—', 
  unit = '',
  icon = null,
  size = 'md',
  variant = 'default',
  compact = false,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  const valueSizeClasses = {
    sm: 'text-lg font-bold',
    md: 'text-2xl font-bold',
    lg: 'text-4xl font-bold'
  };

  const labelSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const variantClasses = {
    default: 'bg-white border border-gray-100 text-gray-900',
    highlight: 'bg-[#E8F5E9] border border-[#C8E6C9] text-gray-900',
    dark: 'bg-gray-900 border border-gray-800 text-white'
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {icon && <div className="text-[#1B5E20]">{icon}</div>}
        <div>
          <p className={`text-gray-600 ${labelSizeClasses[size]}`}>{label}</p>
          <p className={`${valueSizeClasses[size]} text-gray-900`}>
            {value}
            {unit && <span className={`ml-1 text-gray-600 ${labelSizeClasses[size]}`}>{unit}</span>}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className={`text-gray-600 font-medium ${labelSizeClasses[size]} mb-2`}>
            {label}
          </p>
          <div className="flex items-baseline gap-1">
            <p className={`${valueSizeClasses[size]}`}>
              {value}
            </p>
            {unit && <span className={`text-gray-600 font-medium ${labelSizeClasses[size]}`}>{unit}</span>}
          </div>
        </div>
        {icon && (
          <div className={`flex-shrink-0 ${variant === 'dark' ? 'text-[#7FD8BE]' : 'text-[#1B5E20]'}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
