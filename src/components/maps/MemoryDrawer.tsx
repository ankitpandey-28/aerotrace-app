import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MapNode, NodeKind } from '../../types';

// ============================================
// MEMORY DRAWER - Right-side persistent drawer
// Personal memory journal style with polaroid gallery
// Apple Photos Memories + Google Maps Timeline aesthetic
// ============================================

interface MemoryDrawerProps {
  node: MapNode | null;
  isOpen: boolean;
  onClose: () => void;
}

// Node type configurations
const nodeTypeConfig: Record<
  NodeKind,
  {
    label: string;
    color: string;
    bgColor: string;
    borderColor: string;
    icon: string;
  }
> = {
  home: {
    label: 'Home',
    color: 'text-slate-400',
    bgColor: 'bg-slate-500/10',
    borderColor: 'border-slate-500/20',
    icon: '🏠',
  },
  journey: {
    label: 'Journey',
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500/20',
    icon: '📍',
  },
  memory: {
    label: 'Memory',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/20',
    icon: '📸',
  },
  discovery: {
    label: 'Discovery',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    icon: '🧭',
  },
  story: {
    label: 'Story',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    icon: '📝',
  },
};

// Mood colors
const moodColors: Record<string, string> = {
  Rested: 'bg-blue-500',
  Energized: 'bg-orange-500',
  Awestruck: 'bg-amber-500',
  Delighted: 'bg-emerald-500',
  Content: 'bg-rose-500',
  Focused: 'bg-indigo-500',
  Peaceful: 'bg-green-500',
  Excited: 'bg-red-500',
};

// ============================================
// POLAROID GALLERY - Stacked overlapping cards
// ============================================
function PolaroidGallery({ photos }: { photos: string[] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!photos || photos.length === 0) return null;

  const rotations = [-2, 1, -1.5, 2, -0.5]; // Natural overlapping rotations

  return (
    <div className="mb-6">
      {/* Main Photo Display */}
      <div className="relative mb-4">
        <motion.div
          key={activeIndex}
          initial={{ opacity: 0, scale: 1.02, rotate: 0 }}
          animate={{ opacity: 1, scale: 1, rotate: rotations[activeIndex] || 0 }}
          transition={{ duration: 0.4, type: 'spring', stiffness: 100 }}
          className="relative"
        >
          {/* Polaroid Frame */}
          <div className="bg-[#fcfcf9] p-3 pb-10 rounded-sm shadow-2xl">
            {/* Photo */}
            <div className="relative aspect-square overflow-hidden rounded-[2px] bg-slate-100">
              <img
                src={photos[activeIndex]}
                alt={`Memory ${activeIndex + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Handwritten caption area */}
            <div className="mt-3 text-center">
              <p className="text-xs text-slate-500 font-handwriting italic" style={{ fontFamily: 'cursive' }}>
                {activeIndex === 0 ? 'The beginning...' : `Moment ${activeIndex + 1}`}
              </p>
            </div>
          </div>

          {/* Washi Tape Effect */}
          <div
            className="absolute -top-2 left-1/2 -translate-x-1/2 w-20 h-3 rounded-sm opacity-70"
            style={{
              background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.6), rgba(245, 158, 11, 0.4))',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          />
        </motion.div>
      </div>

      {/* Thumbnail Stack */}
      {photos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {photos.map((photo, index) => (
            <motion.button
              key={index}
              onClick={() => setActiveIndex(index)}
              whileHover={{ scale: 1.05, rotate: rotations[index] || 0 }}
              whileTap={{ scale: 0.95 }}
              className={`flex-shrink-0 w-14 h-14 rounded-sm overflow-hidden border-2 transition-all duration-200 ${
                activeIndex === index
                  ? 'border-amber-400 shadow-lg shadow-amber-400/20'
                  : 'border-white/20 opacity-60 hover:opacity-100'
              }`}
              style={{
                transform: `rotate(${rotations[index] || 0}deg)`,
              }}
            >
              <img
                src={photo}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// MEMORY DRAWER COMPONENT
// ============================================
export function MemoryDrawer({ node, isOpen, onClose }: MemoryDrawerProps) {
  if (!node) return null;

  const config = nodeTypeConfig[node.kind];
  const photos = node.photos || (node.photo ? [node.photo] : []);

  return (
    <div className="h-full rounded-2xl border border-white/10 bg-slate-900/95 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col">
      {/* Close Button */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={onClose}
          className="rounded-full p-1.5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-5">
        {/* ===== LOCATION HEADER ===== */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-5"
        >
          {/* Type Badge */}
          <div className="flex items-center gap-2 mb-3">
            <span
              className={`text-[10px] font-bold uppercase tracking-[0.2em] ${config.color}`}
            >
              {config.label}
            </span>
            {node.mood && (
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-2 h-2 rounded-full ${moodColors[node.mood] || 'bg-slate-500'}`}
                />
                <span className="text-[10px] text-slate-400 font-light">{node.mood}</span>
              </div>
            )}
          </div>

          {/* Location Name */}
          <h2 className="text-xl font-bold text-white tracking-tight mb-1">
            {node.name}
          </h2>
          <p className="text-sm text-slate-400 font-light">{node.label}</p>

          {/* Date & Time */}
          <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
            {node.date && (
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {node.date}
              </span>
            )}
            {node.time && (
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {node.time}
              </span>
            )}
          </div>
        </motion.div>

        {/* ===== POLAROID PHOTO GALLERY ===== */}
        {photos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">
                Photo Memories
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-slate-700 to-transparent" />
            </div>
            <PolaroidGallery photos={photos} />
          </motion.div>
        )}

        {/* ===== MEMORY NOTE ===== */}
        {node.description && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">
                Memory Note
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-slate-700 to-transparent" />
            </div>
            <div className="relative overflow-hidden rounded-xl border border-white/5 bg-white/5 p-4">
              <p className="text-sm text-slate-300 font-light leading-relaxed italic">
                "{node.description}"
              </p>
            </div>
          </motion.div>
        )}

        {/* ===== DISCOVERIES ===== */}
        {node.connectedItems && node.connectedItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mb-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">
                Discoveries
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-emerald-500/30 to-transparent" />
            </div>
            <div className="space-y-2">
              {node.connectedItems.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
                >
                  <span className="text-xl">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white">{item.title}</div>
                    <div className="text-[10px] text-slate-500">{item.preview}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ===== STORY SUMMARY ===== */}
        {node.storyContent && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">✦</span>
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-amber-400/80">
                Story
              </span>
            </div>
            <div className="relative overflow-hidden rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
              <p className="text-sm text-slate-300 font-light leading-loose">
                {node.storyContent}
              </p>
            </div>
          </motion.div>
        )}

        {/* ===== JOURNEY DETAILS ===== */}
        {node.routeDetails && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="mb-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">
                Journey Stats
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-slate-700 to-transparent" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-white/5 border border-white/5 p-3 text-center">
                <div className="text-lg font-bold text-white">{node.routeDetails.distance}</div>
                <div className="text-[9px] text-slate-500 uppercase tracking-wider mt-0.5">Distance</div>
              </div>
              <div className="rounded-xl bg-white/5 border border-white/5 p-3 text-center">
                <div className="text-lg font-bold text-white">{node.routeDetails.duration}</div>
                <div className="text-[9px] text-slate-500 uppercase tracking-wider mt-0.5">Duration</div>
              </div>
              <div className="rounded-xl bg-white/5 border border-white/5 p-3 text-center">
                <div className="text-lg font-bold text-white">{node.routeDetails.elevation}</div>
                <div className="text-[9px] text-slate-500 uppercase tracking-wider mt-0.5">Elevation</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ===== TAGS ===== */}
        {node.tags && node.tags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-4"
          >
            <div className="flex flex-wrap gap-1.5">
              {node.tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-full text-[9px] font-medium uppercase tracking-wider bg-white/5 border border-white/10 text-slate-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default MemoryDrawer;