import React from 'react';
import Card from './Card';

const MetricCard = ({ 
  label, 
  value, 
  unit = '', 
  icon: Icon = null, 
  trend = null, 
  trendColor = 'neutral',
  className = '',
  ...props 
}) => {
  const trendColors = {
    improved: 'text-green-600 bg-green-50',
    worsened: 'text-red-600 bg-red-50',
    neutral: 'text-gray-600 bg-gray-50'
  };

  return (
    <Card className={className} {...props}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 uppercase tracking-wider mb-2">
            {label}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-gray-900">
              {typeof value === 'number' ? value.toFixed(2) : value}
            </span>
            {unit && <span className="text-lg text-gray-500">{unit}</span>}
          </div>
          {trend && (
            <p className={`text-xs font-semibold mt-2 ${trendColors[trendColor]}`}>
              {trend}
            </p>
          )}
        </div>
        {Icon && (
          <div className="text-[#1B5E20]">
            <Icon size={32} />
          </div>
        )}
      </div>
    </Card>
  );
};

export default MetricCard;
