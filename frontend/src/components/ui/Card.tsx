import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  animate?: boolean;
}

export function Card({
  children,
  className = '',
  glowColor = '',
  animate = false,
}: CardProps) {
  const cardContent = (
    <div
      className={`relative overflow-hidden rounded-[32px] border border-white/10 bg-[#161A22]/95 p-6 shadow-[0_35px_100px_-40px_rgba(0,0,0,0.55)] backdrop-blur-2xl ${className}`}
    >
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />

      {glowColor && (
        <div
          className={`absolute -right-24 -top-24 h-48 w-48 rounded-full blur-3xl opacity-20 pointer-events-none ${glowColor}`}
        />
      )}

      {children}
    </div>
  );

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-20px' }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      >
        {cardContent}
      </motion.div>
    );
  }

  return cardContent;
}
export default Card;
