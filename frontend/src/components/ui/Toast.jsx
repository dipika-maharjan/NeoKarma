'use client';

import React, { useEffect, useState } from 'react';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';

const typeStyles = {
  success: {
    bg: 'bg-[#1E5F32]',
    icon: 'text-white',
    border: 'border-[#0A3D25]'
  },
  error: {
    bg: 'bg-[#C41C3B]',
    icon: 'text-white',
    border: 'border-[#8F1F1A]'
  },
  warning: {
    bg: 'bg-[#F57C00]',
    icon: 'text-white',
    border: 'border-[#A15B00]'
  },
  info: {
    bg: 'bg-[#0F4C8A]',
    icon: 'text-white',
    border: 'border-[#003A70]'
  }
};

const typeIcons = {
  success: <CheckCircle2 size={18} />,
  error: <AlertCircle size={18} />,
  warning: <AlertCircle size={18} />,
  info: <Info size={18} />
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
      className={`fixed top-6 left-4 right-4 md:left-auto md:right-6 md:max-w-md rounded-lg ${style.bg} border ${style.border} text-white p-4 shadow-lg animate-pulse z-50`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <div className={`flex-shrink-0 mt-0.5 ${style.icon}`}>
            {typeIcons[type]}
          </div>
          <p className="text-sm font-medium leading-relaxed">{message}</p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => onClose?.(), 300);
          }}
          className="flex-shrink-0 text-white/70 hover:text-white transition"
          aria-label="Close notification"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default Toast;
