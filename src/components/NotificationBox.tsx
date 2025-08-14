import React from 'react';

interface NotificationBoxProps {
  message: string;
  isVisible: boolean;
  position?: {
    left: string;
    top: string;
  };
  className?: string;
  bgColor?: string;
  borderColor?: string;
  textColor?: string;
}

export const NotificationBox: React.FC<NotificationBoxProps> = ({
  message,
  isVisible,
  position = { left: '50%', top: '50%' },
  className = '',
  bgColor = 'bg-yellow-400',
  borderColor = 'border-yellow-500',
  textColor = 'text-black'
}) => {
  if (!isVisible) return null;

  const baseClasses = "absolute w-48 h-24 border-2 rounded-lg flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 animate-scale-in z-10 shadow-lg";

  return (
    <div
      className={`${baseClasses} ${bgColor} ${borderColor} ${className}`}
      style={position}
    >
      <span className={`${textColor} font-bold text-2xl text-center leading-tight px-3`}>
        {message}
      </span>
    </div>
  );
};