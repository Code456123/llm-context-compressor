import React from 'react';

interface LightningLogoProps {
  className?: string;
}

export const LightningLogo: React.FC<LightningLogoProps> = ({ className = "h-5 w-5" }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer glow effect */}
      <defs>
        <filter id="lightningGlow">
          <feGaussianBlur stdDeviation="0.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Main lightning bolt - jagged and realistic */}
      <path
        d="M 12 2 L 9 10 L 14 10 L 6 22 L 8 13 L 3 13 L 12 2 Z"
        fill="currentColor"
        filter="url(#lightningGlow)"
      />

      {/* Inner bright core for electric effect */}
      <path
        d="M 12 3 L 10 9 L 13 9 L 8 20 L 9 13 L 5 13 L 12 3 Z"
        fill="currentColor"
        opacity="0.8"
      />
    </svg>
  );
};
