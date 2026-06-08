import React from 'react';
import { motion } from 'framer-motion';
import type { Discovery } from '../../types';
import {
  CATEGORY_EMOJI,
  formatDiscoveryDateShort,
  getDiscoveryPhoto,
  getStoryExcerpt,
} from './discoveryPresentation';

interface DiscoveryFeaturedHeroProps {
  discovery: Discovery;
  onOpen: (discovery: Discovery) => void;
}

export function DiscoveryFeaturedHero({ discovery, onOpen }: DiscoveryFeaturedHeroProps) {
  const photo = getDiscoveryPhoto(discovery);
  const emoji = CATEGORY_EMOJI[discovery.category] || '✨';

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      onClick={() => onOpen(discovery)}
      className="group relative w-full text-left overflow-hidden rounded-[28px] border border-white/[0.08] shadow-[0_32px_80px_-24px_rgba(0,0,0,0.7)] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50"
      style={{ transform: 'rotate(-0.4deg)' }}
    >
      <div className="relative aspect-[21/10] sm:aspect-[2.4/1] min-h-[280px] sm:min-h-[340px]">
        {photo ? (
          <img
            src={photo}
            alt={discovery.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-indigo-950 to-slate-950 flex items-center justify-center">
            <span className="text-7xl opacity-30">{emoji}</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-slate-950/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/60 via-transparent to-transparent" />

        <div className="absolute top-5 left-5 sm:top-8 sm:left-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/90 backdrop-blur-md">
            <span>{emoji}</span>
            Featured place
          </span>
        </div>

        {discovery.isFavorite && (
          <div className="absolute top-5 right-5 sm:top-8 sm:right-8 text-2xl drop-shadow-lg">
            ❤️
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 sm:max-w-2xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-200/80 mb-3">
            {discovery.category}
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-[1.1] tracking-tight mb-4">
            {discovery.title}
          </h2>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-300/90 mb-4">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="text-base opacity-80">📍</span>
              {discovery.locationName || 'Somewhere meaningful'}
            </span>
            <span className="hidden sm:inline text-slate-600">·</span>
            <time className="text-slate-400 font-light italic">
              {formatDiscoveryDateShort(discovery.timestamp)}
            </time>
          </div>
          <p className="text-base sm:text-lg text-slate-300/95 font-light leading-relaxed line-clamp-3 font-serif italic">
            {getStoryExcerpt(discovery.description, 160)}
          </p>
          <p className="mt-5 text-xs font-medium text-amber-200/70 uppercase tracking-[0.2em] group-hover:text-amber-100 transition-colors">
            Open this chapter →
          </p>
        </div>
      </div>
    </motion.button>
  );
}

export default DiscoveryFeaturedHero;
