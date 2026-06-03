import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Discovery } from '../../types';
import {
  CATEGORY_EMOJI,
  formatDiscoveryDate,
  getDiscoveryPhoto,
  getStoryExcerpt,
} from './discoveryPresentation';

interface DiscoveryDetailPanelProps {
  discovery: Discovery | null;
  onClose: () => void;
}

export function DiscoveryDetailPanel({ discovery, onClose }: DiscoveryDetailPanelProps) {
  if (!discovery) return null;

  const photo = getDiscoveryPhoto(discovery);
  const emoji = CATEGORY_EMOJI[discovery.category] || '✨';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/85 backdrop-blur-xl"
        onClick={onClose}
      >
        <motion.article
          initial={{ opacity: 0, y: 48, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 32 }}
          transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full h-[94vh] sm:h-auto sm:max-h-[92vh] sm:max-w-3xl bg-[#0c0f14] sm:rounded-[32px] border border-white/[0.08] shadow-[0_0_120px_-20px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col"
          style={{ transform: 'rotate(0.3deg)' }}
        >
          {/* Immersive cover */}
          <div className="relative shrink-0 h-[52vh] sm:h-[min(58vh,520px)] w-full overflow-hidden">
            {photo ? (
              <img
                src={photo}
                alt={discovery.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 flex items-center justify-center">
                <span className="text-8xl opacity-25">{emoji}</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c0f14] via-[#0c0f14]/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent" />

            <button
              type="button"
              onClick={onClose}
              className="absolute top-5 right-5 z-20 rounded-full w-10 h-10 flex items-center justify-center bg-black/40 text-white/90 backdrop-blur-md border border-white/15 hover:bg-black/60 transition-colors text-lg"
              aria-label="Close"
            >
              ×
            </button>

            {/* Polaroid corner accent */}
            <div
              className="absolute top-8 left-6 w-16 h-4 rounded-sm opacity-60 pointer-events-none hidden sm:block"
              style={{
                background: 'linear-gradient(135deg, rgba(251,191,36,0.5), rgba(245,158,11,0.3))',
                transform: 'rotate(-4deg)',
              }}
            />

            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-200/70 mb-3">
                {emoji} {discovery.category}
                {discovery.isFavorite && (
                  <span className="ml-3 text-rose-300">· Loved</span>
                )}
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-[1.08] tracking-tight mb-4">
                {discovery.title}
              </h2>
              <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-4 text-sm">
                <span className="text-slate-200 font-medium flex items-center gap-2">
                  <span>📍</span>
                  {discovery.locationName || 'A place along your path'}
                </span>
                <time className="text-slate-400 font-light italic">
                  {formatDiscoveryDate(discovery.timestamp)}
                </time>
              </div>
            </div>
          </div>

          {/* Journal body */}
          <div className="flex-1 overflow-y-auto px-6 sm:px-10 py-8 sm:py-10 space-y-10 custom-scrollbar">
            <section>
              <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-slate-500 mb-4">
                From your journal
              </p>
              <p className="font-serif text-xl sm:text-2xl text-slate-200 leading-relaxed italic">
                {discovery.description?.trim()
                  ? discovery.description
                  : getStoryExcerpt('', 80)}
              </p>
            </section>

            {discovery.tags && discovery.tags.length > 0 && (
              <section className="flex flex-wrap gap-2">
                {discovery.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full text-xs text-slate-400 border border-white/10 bg-white/[0.03]"
                  >
                    {tag}
                  </span>
                ))}
              </section>
            )}

            {discovery.lat !== undefined && discovery.lng !== undefined && (
              <section className="pt-4 border-t border-white/[0.06]">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-600 mb-2">
                  Where you found it
                </p>
                <p className="text-xs text-slate-500 font-mono">
                  {discovery.lat.toFixed(5)}, {discovery.lng.toFixed(5)}
                </p>
              </section>
            )}

            {(discovery.visitCount ?? 0) > 1 && (
              <p className="text-xs text-slate-600 font-light italic pb-4">
                You&apos;ve returned here {discovery.visitCount} times — it&apos;s becoming part of your story.
              </p>
            )}
          </div>
        </motion.article>
      </motion.div>
    </AnimatePresence>
  );
}

export default DiscoveryDetailPanel;
