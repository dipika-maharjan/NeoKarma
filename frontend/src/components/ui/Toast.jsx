'use client';

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

const typeStyles = {
  success: {
    bg: 'bg-[#1E5F32]',
    border: 'border-[#0A3D25]'
  },
  error: {
    bg: 'bg-[#C41C3B]',
    border: 'border-[#8F1F1A]'
  },
  warning: {
    bg: 'bg-[#F57C00]',
    border: 'border-[#A15B00]'
  },
  info: {
    bg: 'bg-[#0F4C8A]',
    border: 'border-[#003A70]'
  }
};

const Toast = ({ message, type = 'info', duration = 4000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  const style = typeStyles[type] || typeStyles.info;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose?.(), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed top-24 left-4 right-4 md:left-auto md:right-6 md:max-w-md rounded-lg ${style.bg} bg-opacity-95 border ${style.border} text-white p-4 shadow-xl transition-opacity duration-200 z-40 backdrop-blur-sm`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium leading-relaxed">{message}</p>
      </div>
    </div>
  );
};

export default Toast;
