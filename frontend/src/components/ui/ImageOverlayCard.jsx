import React from 'react';

/**
 * ImageOverlayCard - Card with background image and text overlay
 * @param {string} backgroundImage - URL or gradient for background
 * @param {string} caption - Main overlay caption/title
 * @param {Array} stats - Array of { label, value } stat items to display below caption
 * @param {string} variant - 'light', 'dark' - affects text color
 * @param {ReactNode} icon - Optional icon in corner
 * @param {boolean} fullHeight - Make card full height
 */
const ImageOverlayCard = ({ 
  backgroundImage = '', 
  caption = '', 
  stats = [],
  variant = 'dark',
  icon = null,
  fullHeight = false,
  className = ''
}) => {
  const textColor = variant === 'light' ? 'text-white' : 'text-gray-900';
  const statLabelColor = variant === 'light' ? 'text-white/80' : 'text-gray-600';

  return (
    <div
      className={`
        relative rounded-2xl overflow-hidden
        ${fullHeight ? 'min-h-80' : 'h-64'}
        ${className}
      `}
      style={{
        backgroundImage: backgroundImage?.includes('url') ? backgroundImage : `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Dark overlay */}
      <div className={`
        absolute inset-0 
        ${variant === 'light' ? 'bg-black/40' : 'bg-black/20'}
      `} />

      {/* Content */}
      <div className="relative h-full flex flex-col justify-between p-6">
        {/* Icon corner */}
        {icon && (
          <div className="flex justify-end">
            <div className={`${variant === 'light' ? 'text-white' : 'text-[#1B5E20]'}`}>
              {icon}
            </div>
          </div>
        )}

        {/* Caption */}
        {caption && (
          <div>
            <h3 className={`text-2xl lg:text-3xl font-bold ${textColor} leading-tight mb-4`}>
              {caption}
            </h3>

            {/* Stats rows */}
            {stats.length > 0 && (
              <div className="space-y-2">
                {stats.map((stat, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-3">
                    <span className={`${statLabelColor} text-sm font-medium`}>
                      {stat.label}
                    </span>
                    <span className={`${textColor} font-bold text-base`}>
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageOverlayCard;
