import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
}

export function Logo({ size = 44, className = '' }: LogoProps) {
  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-3xl ${className}`}
      style={{ width: size, height: size }}
    >
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#4F8CFF]/20 via-[#6F9DFF]/10 to-[#1B3EB0]/10" />
      <svg viewBox="0 0 100 100" className="relative h-3/4 w-3/4 text-white">
        <path
          d="M22 76 L50 18 L78 76 L63 76 L50 36 L37 76 Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}

export default Logo;
