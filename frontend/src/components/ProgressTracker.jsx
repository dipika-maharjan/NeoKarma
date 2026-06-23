import React from 'react';
import { useTranslations } from 'next-intl';

/**
 * Half-circle progress tracker component
 * Shows visual progress of action completion based on actual user data
 */
const ProgressTracker = ({ percentage, current, target, message, unit = 'days' }) => {
  const t = useTranslations('Plan');

  const radius = 50;
  const circumference = Math.PI * radius; // Half circle
  const offset = circumference * (1 - percentage / 100);

  // Determine color based on progress
  const getColor = () => {
    if (percentage >= 100) return '#0A3D25'; // Dark green - completed
    if (percentage >= 66) return '#52A578'; // Green - good progress
    if (percentage >= 33) return '#8DB79D'; // Light green - some progress
    return '#C9D8CF'; // Very light - just started
  };

  const color = getColor();

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Half-circle SVG Progress */}
      <div className="relative w-24 h-12">
        <svg
          viewBox="0 0 120 60"
          className="w-full h-full"
          style={{ overflow: 'visible' }}
        >
          {/* Background half-circle */}
          <path
            d="M 10 50 A 40 40 0 0 1 110 50"
            stroke="#E8F0EB"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
          />
          {/* Progress half-circle */}
          <path
            d="M 10 50 A 40 40 0 0 1 110 50"
            stroke={color}
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>

        {/* Center percentage display */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-[#0A3D25]">
            {Math.round(percentage)}%
          </span>
        </div>
      </div>

      {/* Progress text */}
      <div className="text-center">
        <p className="text-xs font-medium text-[#4E6256]">
          {current} {t('of')} {target} {unit}
        </p>
        <p className="text-xs text-[#5D6F60] mt-1 max-w-xs">
          {message}
        </p>
      </div>

      {/* Status badge */}
      {percentage >= 100 && (
        <span className="inline-block px-2.5 py-1 bg-green-50 text-green-700 text-[10px] font-semibold rounded-full border border-green-200">
          ✓ {t('onTrack')}
        </span>
      )}
    </div>
  );
};

export default ProgressTracker;
