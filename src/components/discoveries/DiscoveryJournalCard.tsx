import React from 'react';
import { motion } from 'framer-motion';
import type { Discovery } from '../../types';
import {
  CATEGORY_EMOJI,
  formatDiscoveryDateShort,
  getDiscoveryPhoto,
  getJournalCardSize,
  getPolaroidRotation,
  getStoryExcerpt,
  type JournalCardSize,
} from './discoveryPresentation';

interface DiscoveryJournalCardProps {
  discovery: Discovery;
  index: number;
  onOpen: (discovery: Discovery) => void;
}

const sizeStyles: Record<
  JournalCardSize,
  { frame: string; image: string; padding: string; title: string }
> = {
  wide: {
    frame: 'p-3 sm:p-4 pb-10 sm:pb-12',
    image: 'aspect-[16/10] sm:aspect-[2/1]',
    padding: 'px-1 sm:px-2',
    title: 'text-xl sm:text-2xl',
  },
  tall: {
    frame: 'p-3 pb-11',
    image: 'aspect-[3/4]',
    padding: 'px-1',
    title: 'text-lg sm:text-xl',
  },
  standard: {
    frame: 'p-2.5 sm:p-3 pb-9 sm:pb-10',
    image: 'aspect-[4/5]',
    padding: 'px-1',
    title: 'text-lg',
  },
};

export function DiscoveryJournalCard({ discovery, index, onOpen }: DiscoveryJournalCardProps) {
  const photo = getDiscoveryPhoto(discovery);
  const size = getJournalCardSize(index);
  const styles = sizeStyles[size];
  const rotation = getPolaroidRotation(index);
  const emoji = CATEGORY_EMOJI[discovery.category] || '✨';

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.06, 0.35) }}
      onClick={() => onOpen(discovery)}
      className={`group relative w-full text-left bg-[#fcfcf9] rounded-sm shadow-[0_12px_40px_-12px_rgba(0,0,0,0.45)] hover:shadow-[0_24px_56px_-16px_rgba(0,0,0,0.55)] transition-shadow duration-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 ${styles.frame}`}
      style={{
        transform: `rotate(${rotation}deg)`,
        transition: 'transform 0.45s ease, box-shadow 0.45s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'rotate(0deg) translateY(-6px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = `rotate(${rotation}deg)`;
      }}
    >
      {/* Washi tape */}
      <div
        className="absolute left-1/2 -translate-x-1/2 -top-2 w-14 h-3.5 rounded-sm opacity-75 pointer-events-none z-10"
        style={{
          background: 'linear-gradient(135deg, rgba(251,191,36,0.55), rgba(245,158,11,0.35))',
          transform: `translateX(-50%) rotate(${rotation > 0 ? -3 : 2}deg)`,
        }}
      />

      <div className={`relative overflow-hidden bg-slate-200 ${styles.image} mb-4`}>
        {photo ? (
          <img
            src={photo}
            alt={discovery.title}
            className="w-full h-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-amber-50 via-slate-100 to-cyan-50 flex items-center justify-center">
            <span className="text-5xl opacity-35">{emoji}</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {discovery.isFavorite && (
          <span className="absolute top-3 right-3 text-lg drop-shadow-md">❤️</span>
        )}
      </div>

      <div className={styles.padding}>
        <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-amber-700/80 mb-1.5">
          {emoji} {discovery.category}
        </p>
        <h3
          className={`font-serif font-bold text-slate-900 leading-tight mb-2 ${styles.title}`}
        >
          {discovery.title}
        </h3>

        <div className="space-y-1 mb-3">
          <p className="text-sm font-medium text-slate-700 flex items-start gap-1.5">
            <span className="shrink-0 opacity-70">📍</span>
            <span className="line-clamp-1">{discovery.locationName || 'Along the way'}</span>
          </p>
          <time className="block text-xs text-slate-500 font-light tracking-wide">
            {formatDiscoveryDateShort(discovery.timestamp)}
          </time>
        </div>

        <p className="text-sm text-slate-600 font-serif italic leading-relaxed line-clamp-3">
          {getStoryExcerpt(discovery.description, size === 'wide' ? 140 : 100)}
        </p>
      </div>
    </motion.button>
  );
}

export default DiscoveryJournalCard;
