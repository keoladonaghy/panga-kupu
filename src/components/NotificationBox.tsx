import React from 'react';

interface NotificationBoxProps {
  message: string;
  isVisible: boolean;
  position?: {
    left: string;
    top: string;
  };
  className?: string;
}

export const NotificationBox: React.FC<NotificationBoxProps> = ({
  message,
  isVisible,
  position = { left: '50%', top: '50%' },
  className = ''
}) => {
  if (!isVisible) return null;

  return (
    <div
      className={`absolute w-48 h-24 bg-yellow-400 border-2 border-yellow-500 rounded-lg
                 flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2
                 animate-scale-in z-10 shadow-lg ${className}`}
      style={position}
    >
      <span className="text-black font-bold text-2xl text-center leading-tight px-3">
        {message}
      </span>
    </div>
  );
};