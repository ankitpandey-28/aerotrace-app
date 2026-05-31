import React from 'react';
import { motion } from 'framer-motion';

interface AeroTraceLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  className?: string;
  showText?: boolean;
  glowIntensity?: 'none' | 'subtle' | 'medium' | 'strong';
}

export function AeroTraceLogo({
  size = 'md',
  animated = false,
  className = '',
  showText = true,
  glowIntensity = 'subtle',
}: AeroTraceLogoProps) {
  const sizeClasses = {
    sm: { icon: 'h-8 w-8', text: 'text-sm', gap: 'gap-2' },
    md: { icon: 'h-10 w-10', text: 'text-base', gap: 'gap-3' },
    lg: { icon: 'h-12 w-12', text: 'text-lg', gap: 'gap-3' },
    xl: { icon: 'h-16 w-16', text: 'text-xl', gap: 'gap-4' },
  };

  const glowEffects = {
    none: '',
    subtle: 'drop-shadow-[0_0_8px_rgba(79,140,255,0.3)]',
    medium: 'drop-shadow-[0_0_15px_rgba(79,140,255,0.5)]',
    strong: 'drop-shadow-[0_0_25px_rgba(79,140,255,0.7)]',
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
        staggerChildren: 0.15,
      },
    },
  };

  const iconVariants = {
    hidden: { opacity: 0, scale: 0.8, rotate: -10 },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
        delay: 0.2,
      },
    },
  };

  const textVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
      },
    },
  };

  const taglineVariants = {
    hidden: { opacity: 0, y: 5 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.3,
        duration: 0.5,
      },
    },
  };

  const LogoIcon = () => (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${sizeClasses[size].icon} ${glowEffects[glowIntensity]} ${animated ? '' : ''}`}
    >
      {/* Outer ring - representing the journey/trail */}
      <motion.circle
        cx="20"
        cy="20"
        r="18"
        stroke="url(#metallicOuterGradient)"
        strokeWidth="1.5"
        fill="none"
        initial={animated ? { pathLength: 0, opacity: 0 } : undefined}
        animate={animated ? { pathLength: 1, opacity: 1 } : undefined}
        transition={{ duration: 1.2, delay: 0.3, ease: 'easeInOut' }}
      />

      {/* Inner swoosh - representing movement/wind */}
      <motion.path
        d="M12 20 Q16 14, 22 16 Q28 18, 26 24 Q24 30, 18 28 Q14 26, 14 22"
        stroke="url(#metallicInnerGradient)"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        initial={animated ? { pathLength: 0, opacity: 0 } : undefined}
        animate={animated ? { pathLength: 1, opacity: 1 } : undefined}
        transition={{ duration: 1, delay: 0.6, ease: 'easeInOut' }}
      />

      {/* Dot - representing the current location/memory point */}
      <motion.circle
        cx="22"
        cy="20"
        r="2.5"
        fill="url(#metallicDotGradient)"
        initial={animated ? { scale: 0, opacity: 0 } : undefined}
        animate={animated ? { scale: 1, opacity: 1 } : undefined}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 1 }}
      />

      {/* Pulse ring around dot */}
      <motion.circle
        cx="22"
        cy="20"
        r="5"
        stroke="url(#metallicPulseGradient)"
        strokeWidth="0.5"
        fill="none"
        initial={animated ? { scale: 0.5, opacity: 0 } : undefined}
        animate={
          animated
            ? {
                scale: [0.5, 1.5, 1],
                opacity: [0, 0.6, 0.3],
              }
            : undefined
        }
        transition={{
          duration: 2,
          delay: 1.2,
          repeat: Infinity,
          repeatDelay: 2,
          ease: 'easeInOut',
        }}
      />

      {/* Metallic sheen overlay */}
      <motion.ellipse
        cx="20"
        cy="15"
        rx="12"
        ry="6"
        fill="url(#metallicSheen)"
        opacity="0.15"
        initial={animated ? { opacity: 0 } : undefined}
        animate={animated ? { opacity: [0.1, 0.2, 0.1] } : undefined}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Gradient definitions - Metallic version */}
      <defs>
        {/* Metallic outer ring gradient - brushed metal effect */}
        <linearGradient id="metallicOuterGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#B8C9E4">
            <animate attributeName="stop-color" values="#B8C9E4;#7ECBFF;#B8C9E4" dur="4s" repeatCount="indefinite" />
          </stop>
          <stop offset="25%" stopColor="#4F8CFF" />
          <stop offset="50%" stopColor="#A8D8FF">
            <animate attributeName="stop-color" values="#A8D8FF;#7ECBFF;#A8D8FF" dur="4s" repeatCount="indefinite" />
          </stop>
          <stop offset="75%" stopColor="#6BB3FF" />
          <stop offset="100%" stopColor="#22C55E" />
        </linearGradient>

        {/* Metallic inner gradient - polished metal */}
        <linearGradient id="metallicInnerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#89C4FF">
            <animate attributeName="stop-color" values="#89C4FF;#6BB3FF;#89C4FF" dur="3s" repeatCount="indefinite" />
          </stop>
          <stop offset="30%" stopColor="#4F8CFF" />
          <stop offset="50%" stopColor="#C8E4FF">
            <animate attributeName="stop-color" values="#C8E4FF;#9DD8FF;#C8E4FF" dur="3s" repeatCount="indefinite" />
          </stop>
          <stop offset="70%" stopColor="#3BA0E8" />
          <stop offset="100%" stopColor="#4ADE80">
            <animate attributeName="stop-color" values="#4ADE80;#6EE78B;#4ADE80" dur="3s" repeatCount="indefinite" />
          </stop>
        </linearGradient>

        {/* Metallic dot gradient - chrome/silver effect */}
        <radialGradient id="metallicDotGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#E8F4FF">
            <animate attributeName="stop-color" values="#E8F4FF;#FFFFFF;#E8F4FF" dur="2s" repeatCount="indefinite" />
          </stop>
          <stop offset="40%" stopColor="#7ECBFF" />
          <stop offset="100%" stopColor="#3B82F6" />
        </radialGradient>

        {/* Metallic pulse gradient */}
        <radialGradient id="metallicPulseGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#6BB3FF" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#4F8CFF" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#4F8CFF" stopOpacity="0" />
        </radialGradient>

        {/* Metallic sheen effect */}
        <linearGradient id="metallicSheen" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
          <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.1" />
        </linearGradient>
      </defs>
    </svg>
  );

  if (animated) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={`flex items-center ${sizeClasses[size].gap} ${className}`}
      >
        <motion.div variants={iconVariants}>
          <LogoIcon />
        </motion.div>
        {showText && (
          <motion.div variants={textVariants} className="flex flex-col">
            <span className={`font-bold text-white ${sizeClasses[size].text}`}>
              AeroTrace
            </span>
            <motion.span
              variants={taglineVariants}
              className="text-[9px] text-slate-500 uppercase tracking-widest"
            >
              Journey Platform
            </motion.span>
          </motion.div>
        )}
      </motion.div>
    );
  }

  return (
    <div className={`flex items-center ${sizeClasses[size].gap} ${className}`}>
      <LogoIcon />
      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold text-white ${sizeClasses[size].text}`}>
            AeroTrace
          </span>
          <span className="text-[9px] text-slate-500 uppercase tracking-widest">
            Journey Platform
          </span>
        </div>
      )}
    </div>
  );
}

// Simple icon-only version for places where space is limited - Metallic version
export function AeroTraceIcon({
  size = 'md',
  className = '',
  glowIntensity = 'subtle',
}: {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  glowIntensity?: 'none' | 'subtle' | 'medium' | 'strong';
}) {
  const sizeMap = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  const glowEffectsLocal = {
    none: '',
    subtle: 'drop-shadow-[0_0_8px_rgba(79,140,255,0.3)]',
    medium: 'drop-shadow-[0_0_15px_rgba(79,140,255,0.5)]',
    strong: 'drop-shadow-[0_0_25px_rgba(79,140,255,0.7)]',
  };

  return (
    <div className={`${sizeMap[size]} ${className}`}>
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`h-full w-full ${glowEffectsLocal[glowIntensity]}`}
      >
        <circle cx="20" cy="20" r="18" stroke="url(#metallicOuterGradient2)" strokeWidth="1.5" fill="none" />
        <path
          d="M12 20 Q16 14, 22 16 Q28 18, 26 24 Q24 30, 18 28 Q14 26, 14 22"
          stroke="url(#metallicInnerGradient2)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="22" cy="20" r="2.5" fill="url(#metallicDotGradient2)" />
        <defs>
          {/* Metallic outer ring gradient */}
          <linearGradient id="metallicOuterGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#B8C9E4" />
            <stop offset="25%" stopColor="#4F8CFF" />
            <stop offset="50%" stopColor="#A8D8FF" />
            <stop offset="75%" stopColor="#6BB3FF" />
            <stop offset="100%" stopColor="#22C55E" />
          </linearGradient>
          {/* Metallic inner gradient */}
          <linearGradient id="metallicInnerGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#89C4FF" />
            <stop offset="30%" stopColor="#4F8CFF" />
            <stop offset="50%" stopColor="#C8E4FF" />
            <stop offset="70%" stopColor="#3BA0E8" />
            <stop offset="100%" stopColor="#4ADE80" />
          </linearGradient>
          {/* Metallic dot gradient - chrome effect */}
          <radialGradient id="metallicDotGradient2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#E8F4FF" />
            <stop offset="40%" stopColor="#7ECBFF" />
            <stop offset="100%" stopColor="#3B82F6" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
}

export default AeroTraceLogo;