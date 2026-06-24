import { CircleUserRound } from 'lucide-react';

const sizeClasses = {
  sm: 'h-9 w-9',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
};

const iconSizes = {
  sm: 22,
  md: 28,
  lg: 34,
};

export default function ProfileAvatar({ imageSrc, alt = 'User profile', size = 'md', className = '' }) {
  const hasImage = typeof imageSrc === 'string' && imageSrc.trim().length > 0;

  return (
    <span
      className={`${sizeClasses[size] || sizeClasses.md} inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#0A3D25] text-white ${className}`}
      aria-label={alt}
      role="img"
    >
      {hasImage ? (
        <span
          className="h-full w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${imageSrc})` }}
        />
      ) : (
        <CircleUserRound size={iconSizes[size] || iconSizes.md} strokeWidth={2.2} aria-hidden="true" />
      )}
    </span>
  );
}
