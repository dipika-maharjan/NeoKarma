import React from 'react';

const Card = ({ children, className = '', variant = 'default', ...props }) => {
  const variants = {
    default: 'bg-white border border-gray-100 shadow-sm',
    elevated: 'bg-white border border-gray-100 shadow-md',
    highlight: 'bg-gradient-to-br from-[#E8F5E9] to-white border border-[#C8E6C9]'
  };

  return (
    <div 
      className={`min-w-0 rounded-xl p-5 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
