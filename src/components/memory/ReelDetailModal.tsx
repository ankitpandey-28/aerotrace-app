import React from 'react';
import { motion } from 'framer-motion';
import Card from '../ui/Card';
import PolaroidPhoto from './PolaroidPhoto';
import type { Journey } from '../../types';

interface ReelDetailProps {
  journey: Journey | null;
  memories: { src: string; caption?: string }[];
  discoveries: { title: string; description?: string; coverPhoto?: string }[];
  onClose: () => void;
}

export function ReelDetailModal({ journey, memories, discoveries, onClose }: ReelDetailProps) {
  if (!journey) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        transition={{ duration: 0.35 }}
        className="relative max-w-4xl w-full"
      >
        <Card className="p-0 overflow-visible">
          {/* Hero cover */}
          <div className="h-56 w-full overflow-hidden bg-slate-800">
            <img src={memories[0]?.src || '/assets/screenshots/journey-cover.png'} alt={journey.title} className="w-full h-full object-cover" />
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white">{journey.title}</h2>
                <p className="text-sm text-slate-400 mt-1">{journey.date} • {journey.duration} • {journey.distance}</p>
              </div>
              <div className="text-sm text-slate-400">Mood: <span className="font-semibold text-white">{journey.mood}</span></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-3">
                <h3 className="text-sm font-semibold text-white">Story</h3>
                <p className="text-sm text-slate-300 leading-relaxed">{journey.narrative}</p>

                <h3 className="text-sm font-semibold text-white mt-4">Polaroid Stack</h3>
                <div className="flex flex-wrap gap-3 mt-2">
                  {memories.length > 0 ? memories.slice(0,6).map((m, i) => (
                    <PolaroidPhoto key={i} src={m.src} caption={m.caption} rotation={(i%5)-2} scale={0.95} />
                  )) : (
                    <div className="text-slate-500">No photos for this journey yet.</div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-white">Timeline</h3>
                <div className="text-sm text-slate-300">
                  {journey.stops && journey.stops.length > 0 ? (
                    <ol className="list-decimal list-inside space-y-2">
                      {journey.stops.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ol>
                  ) : (
                    <div className="text-slate-500">No detailed stops recorded.</div>
                  )}
                </div>

                <h3 className="text-sm font-semibold text-white mt-4">Discoveries</h3>
                <div className="space-y-2">
                  {discoveries.length > 0 ? discoveries.map((d, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-slate-800 rounded-md overflow-hidden">
                        {d.coverPhoto ? <img src={d.coverPhoto} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center">💡</div>}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">{d.title}</div>
                        <div className="text-xs text-slate-400">{d.description}</div>
                      </div>
                    </div>
                  )) : <div className="text-slate-500">No discoveries recorded for this journey.</div>}
                </div>

                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-white">Map Snapshot</h3>
                  <div className="mt-2 h-28 bg-slate-800 rounded-md flex items-center justify-center">Map snapshot</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button onClick={onClose} className="px-4 py-2 rounded-lg bg-white/5 text-sm text-slate-200">Close</button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

export default ReelDetailModal;
