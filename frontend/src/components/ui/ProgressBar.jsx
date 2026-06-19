import React from 'react';
import { useNumberFormatter } from '@/lib/utils/numberFormatter';

/**
 * ProgressBar - Horizontal progress indicator with optional comparison
 * @param {number} current - Current value
 * @param {number} total - Maximum/target value
 * @param {string} label - Label text
 * @param {string} unit - Unit display
 * @param {string} color - 'green', 'red', 'gray' - color of progress bar
 * @param {boolean} showPercentage - Show percentage label
 * @param {boolean} showValue - Show current/total values
 */
const ProgressBar = ({ 
  current = 0, 
  total = 100,
  label = '',
  unit = '',
  color = 'green',
  showPercentage = true,
  showValue = false,
  variant = 'default', // 'default', 'comparison'
  secondaryLabel = null,
  secondaryCurrent = null,
  className = ''
}) => {
  const formatNumber = useNumberFormatter();
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  const colorClasses = {
    green: 'bg-[#1B5E20]',
    red: 'bg-[#E53935]',
    gray: 'bg-gray-400',
    mint: 'bg-[#7FD8BE]'
  };

  if (variant === 'comparison' && secondaryLabel && secondaryCurrent !== null) {
    const secondaryPercentage = total > 0 ? Math.round((secondaryCurrent / total) * 100) : 0;

    return (
      <div className={`space-y-4 ${className}`}>
        {/* Primary bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-900">{label}</span>
            {showValue && (
              <span className="text-sm font-medium text-gray-600">
                {formatNumber(current, { maximumFractionDigits: 1 })}{unit}
              </span>
            )}
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${colorClasses[color]} transition-all duration-300`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Secondary bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-900">{secondaryLabel}</span>
            {showValue && (
              <span className="text-sm font-medium text-gray-600">
                {formatNumber(secondaryCurrent, { maximumFractionDigits: 1 })}{unit}
              </span>
            )}
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gray-400 transition-all duration-300"
              style={{ width: `${Math.min(secondaryPercentage, 100)}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <div>
          {label && <p className="text-sm font-semibold text-gray-900">{label}</p>}
        </div>
        <div className="flex items-center gap-2">
          {showPercentage && (
            <span className="text-sm font-bold text-[#1B5E20]">{percentage}%</span>
          )}
          {showValue && (
            <span className="text-sm font-medium text-gray-600">
              {formatNumber(current, { maximumFractionDigits: 1 })}/{formatNumber(total, { maximumFractionDigits: 1 })}{unit}
            </span>
          )}
        </div>
      </div>
      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClasses[color]} transition-all duration-300`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
