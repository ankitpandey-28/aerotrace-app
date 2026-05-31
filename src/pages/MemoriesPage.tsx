import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useJourney } from '../context/JourneyContext';
import { useMemory } from '../context/MemoryContext';
import { MOOD_OPTIONS } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import PolaroidPhoto from '../components/memory/PolaroidPhoto';
import type { MemoryItem, Memory } from '../types';

export function MemoriesPage() {
  const { memories: legacyMemories } = useJourney();
  const { memories: enhancedMemories, deleteMemory } = useMemory();
  const [filter, setFilter] = useState<'All' | MemoryItem['type'] | 'Journal'>('All');
  const [moodFilter, setMoodFilter] = useState<string>('All');

  // Combine legacy and enhanced memories for display
  // Enhanced memories take precedence with richer display
  const filteredMemories = enhancedMemories.filter(m => {
    if (moodFilter !== 'All' && m.mood !== moodFilter) return false;
    return true;
  });

  const hasEnhancedMemories = enhancedMemories.length > 0;
  const hasLegacyMemories = legacyMemories.length > 0;

  // Format timestamp for display
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Header Panel */}
      <section className="rounded-[28px] border border-white/5 bg-slate-900/40 p-6 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500 font-medium">
              MEMORY JOURNAL
            </span>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Your Story, Captured
            </h2>
            <p className="mt-2 text-xs text-slate-400 font-light leading-5 max-w-xl">
              Every journey leaves traces — a photo, a feeling, a discovery. These are the moments that make your exploration uniquely yours.
            </p>
          </div>
        </div>

        {/* Filter categories bar */}
        <div className="mt-6 flex flex-wrap gap-2 border-t border-white/5 pt-4">
          <Button
            type="button"
            variant={filter === 'All' ? 'primary' : 'glass'}
            size="sm"
            onClick={() => { setFilter('All'); setMoodFilter('All'); }}
            className="rounded-full px-4 py-1.5 text-xs font-semibold"
          >
            All Memories
          </Button>
          <Button
            type="button"
            variant={filter === 'Journal' ? 'primary' : 'glass'}
            size="sm"
            onClick={() => setFilter('Journal')}
            className="rounded-full px-4 py-1.5 text-xs font-semibold"
          >
            Journal Entries
          </Button>
          {(['Photo', 'Note', 'Clip', 'Artifact'] as const).map((cat) => (
            <Button
              key={cat}
              type="button"
              variant={filter === cat ? 'primary' : 'glass'}
              size="sm"
              onClick={() => setFilter(cat)}
              className="rounded-full px-4 py-1.5 text-xs font-semibold"
            >
              {cat}s
            </Button>
          ))}
        </div>

        {/* Mood filter for journal entries */}
        {filter === 'Journal' || filter === 'All' ? (
          <div className="mt-4 flex flex-wrap gap-2 border-t border-white/5 pt-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500 self-center mr-2">
              Filter by Mood:
            </span>
            <Button
              type="button"
              variant={moodFilter === 'All' ? 'primary' : 'glass'}
              size="sm"
              onClick={() => setMoodFilter('All')}
              className="rounded-full px-3 py-1 text-[10px] font-semibold"
            >
              All
            </Button>
            {MOOD_OPTIONS.map(({ value, emoji, color }) => (
              <Button
                key={value}
                type="button"
                variant={moodFilter === value ? 'primary' : 'glass'}
                size="sm"
                onClick={() => setMoodFilter(value)}
                className={`rounded-full px-3 py-1 text-[10px] font-semibold ${
                  moodFilter === value ? `bg-gradient-to-br ${color} text-white` : ''
                }`}
              >
                {emoji} {value}
              </Button>
            ))}
          </div>
        ) : null}
      </section>

      {/* Enhanced Journal Memories Grid */}
      {filteredMemories.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {filteredMemories.map((memory) => {
              const moodInfo = MOOD_OPTIONS.find(m => m.value === memory.mood);
              
              return (
                <motion.div
                  key={memory.id}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Card className="flex flex-col h-full relative group">
                    {/* Photos Section */}
                    {memory.photos.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4 justify-center p-3 bg-white/5 rounded-xl">
                        {memory.photos.slice(0, 4).map((photo, idx) => (
                          <PolaroidPhoto
                            key={idx}
                            src={photo}
                            rotation={[-2, 1, -1, 2][idx] || 0}
                            scale={0.85}
                          />
                        ))}
                        {memory.photos.length > 4 && (
                          <div className="w-20 h-24 bg-white/10 rounded-sm flex items-center justify-center text-white text-sm font-semibold">
                            +{memory.photos.length - 4}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-white leading-tight">{memory.title}</h4>
                        <p className="text-[10px] text-slate-500 mt-1">
                          📍 {memory.location}
                        </p>
                      </div>
                      {moodInfo && (
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold bg-gradient-to-br ${moodInfo.color} text-white`}>
                          {moodInfo.emoji}
                        </span>
                      )}
                    </div>

                    {/* Personal Note */}
                    {memory.note && (
                      <div className="mt-3 p-3 rounded-xl bg-white/5 border border-white/5">
                        <p className="text-xs text-slate-300 font-light leading-relaxed line-clamp-3">
                          {memory.note}
                        </p>
                      </div>
                    )}

                    {/* Discovery */}
                    {memory.discovery && (
                      <div className="mt-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400 mb-1">
                          💡 Discovery
                        </p>
                        <p className="text-xs text-amber-200/80 font-light">
                          {memory.discovery}
                        </p>
                      </div>
                    )}

                    {/* Tags */}
                    {memory.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {memory.tags.map(tag => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-full bg-cyan-400/10 text-cyan-300 text-[10px] font-semibold"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500">
                        {formatTimestamp(memory.timestamp)}
                      </span>
                      <button
                        onClick={() => deleteMemory(memory.id)}
                        className="text-[10px] text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Empty State */}
      {!hasEnhancedMemories && filter === 'Journal' && (
        <div className="text-center py-16">
          <span className="text-5xl mb-4 block">📖</span>
          <h3 className="text-lg font-semibold text-white">No Journal Entries Yet</h3>
          <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
            Start capturing your memories during your journeys. Add photos, notes, discoveries, and tag your feelings.
          </p>
        </div>
      )}

      {/* Legacy Memories (for backward compatibility) */}
      {filter !== 'Journal' && hasLegacyMemories && (
        <>
          <div className="border-t border-white/10 pt-6">
            <h3 className="text-sm font-semibold text-slate-400 mb-4">
              Legacy Memory Capsules ({legacyMemories.length})
            </h3>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {legacyMemories.map((m, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Card className="flex flex-col justify-between h-full min-h-[260px] relative">
                    {/* Header Tag */}
                    <div className="flex items-center justify-between pb-3 border-b border-white/5 text-xs">
                      <span className="font-semibold text-white">{m.location}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase font-bold tracking-wider ${
                        m.type === 'Photo' ? 'bg-cyan-500/10 text-cyan-300' :
                        m.type === 'Clip' ? 'bg-violet-500/10 text-violet-300' :
                        m.type === 'Note' ? 'bg-amber-500/10 text-amber-300' :
                        'bg-emerald-500/10 text-emerald-300'
                      }`}>
                        {m.type}
                      </span>
                    </div>

                    {/* Core content body */}
                    <div className="mt-4 flex-1">
                      {m.type === 'Photo' && (
                        <div className="space-y-3">
                          <div className="h-28 w-full bg-slate-950 border border-white/5 rounded-xl flex items-center justify-center text-3xl opacity-80">
                            🖼️
                          </div>
                          <h4 className="text-sm font-semibold text-white leading-tight">{m.title}</h4>
                          <p className="text-xs text-slate-400 font-light italic">"{m.caption}"</p>
                        </div>
                      )}

                      {m.type === 'Clip' && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-violet-400/10 text-violet-300 border border-violet-400/20 rounded-xl flex items-center justify-center text-lg">
                              🎙️
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold text-white leading-tight">{m.title}</h4>
                              <span className="text-[10px] text-slate-500 font-light">Voice Capsule • 0:14 Sec</span>
                            </div>
                          </div>
                          <div className="h-8 flex items-end gap-[3px] bg-slate-950/40 p-2 rounded-lg border border-white/5">
                            {[4,8,12,6,16,10,22,14,8,18,24,12,6,10,4,8,16,12,4,2].map((h, i) => (
                              <div key={i} className="flex-1 bg-violet-400 rounded-full" style={{ height: `${h}%` }} />
                            ))}
                          </div>
                          <p className="text-xs text-slate-400 font-light leading-5">{m.caption}</p>
                        </div>
                      )}

                      {m.type === 'Note' && (
                        <div className="space-y-3 p-3 rounded-xl border border-amber-500/10 bg-amber-500/[0.02]">
                          <h4 className="text-sm font-semibold text-amber-300 leading-tight">{m.title}</h4>
                          <p className="text-xs text-slate-300 leading-relaxed font-light font-serif">
                            "{m.caption}"
                          </p>
                        </div>
                      )}

                      {m.type === 'Artifact' && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-emerald-400/10 text-emerald-300 border border-emerald-400/20 rounded-xl flex items-center justify-center text-lg">
                              🎟️
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold text-white leading-tight">{m.title}</h4>
                              <span className="text-[10px] text-slate-500 font-light">Physical Scan</span>
                            </div>
                          </div>
                          <p className="text-xs text-slate-400 font-light leading-5">{m.caption}</p>
                        </div>
                      )}
                    </div>

                    {/* Footer time stamp */}
                    <div className="mt-6 border-t border-white/5 pt-3 text-[10px] uppercase font-bold tracking-wider text-slate-600">
                      {m.time}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </>
      )}
    </div>
  );
}
export default MemoriesPage;