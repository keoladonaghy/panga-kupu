import React from 'react';

interface NotificationBoxProps {
  message: string;
  isVisible: boolean;
  position?: {
    left: string;
    top: string;
  };
  className?: string;
  variant?: 'warning' | 'success';
}

export const NotificationBox: React.FC<NotificationBoxProps> = ({
  message,
  isVisible,
  position = { left: '50%', top: '50%' },
  className = '',
  variant = 'warning'
}) => {
  if (!isVisible) return null;

  const baseClasses = "absolute w-48 h-24 border-2 rounded-lg flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 animate-scale-in z-10 shadow-lg";
  const variantClasses = variant === 'success' 
    ? "bg-green-800 border-green-700" 
    : "bg-yellow-400 border-yellow-500";
  const textClasses = variant === 'success' 
    ? "text-white" 
    : "text-black";

  return (
    <div
      className={`${baseClasses} ${variantClasses} ${className}`}
      style={position}
    >
      <span className={`${textClasses} font-bold text-2xl text-center leading-tight px-3`}>
        {message}
      </span>
    </div>
  );
};