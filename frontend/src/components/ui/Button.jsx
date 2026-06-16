import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  isLoading = false,
  className = '',
  ...props 
}) => {
  const baseStyles = 'font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-[#1B5E20] text-white hover:bg-[#0D3D14] active:bg-[#0A2F0F]',
    secondary: 'bg-white border-2 border-[#1B5E20] text-[#1B5E20] hover:bg-[#E8F5E9]',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
    danger: 'bg-[#E53935] text-white hover:bg-[#C62828]',
    success: 'bg-[#43A047] text-white hover:bg-[#388E3C]'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading && (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
};

export default Button;
