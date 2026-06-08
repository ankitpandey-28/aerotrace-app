import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'glass' | 'border' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyle =
    'inline-flex items-center justify-center font-semibold rounded-full transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#4F8CFF]/30 select-none';

  const variants = {
    primary:
      'bg-[#4F8CFF] text-white hover:bg-[#78A8FF] shadow-[0_18px_60px_-32px_rgba(79,140,255,0.55)]',
    glass:
      'bg-white/10 text-white backdrop-blur-xl border border-white/10 hover:bg-white/15 hover:text-white',
    border:
      'border border-white/10 bg-[#0F1115] text-white hover:bg-white/10',
    danger:
      'bg-[#FF5A79]/15 border border-[#FF5A79]/20 text-[#FF9CB3] hover:bg-[#FF5A79]/25',
    success:
      'bg-[#22C55E]/15 border border-[#22C55E]/20 text-[#A7F3D0] hover:bg-[#22C55E]/25',
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-3.5 text-base',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.03, y: -1 }}
      whileTap={{ scale: 0.96, y: 0 }}
      transition={{ type: 'spring', stiffness: 450, damping: 28 }}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
export default Button;
