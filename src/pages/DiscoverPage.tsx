import React, { useState } from 'react';
import { useJourney } from '../context/JourneyContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Toast from '../components/ui/Toast';
import MapRibbon from '../components/maps/MapRibbon';

export function DiscoverPage() {
  const { discoveries, toggleSaveDiscovery } = useJourney();
  const [filter, setFilter] = useState<'All' | 'Place' | 'Event' | 'Route'>('All');

  // Slide-in Toast states
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastSub, setToastSub] = useState('');

  const handleToggleSave = (title: string, currentlySaved: boolean) => {
    toggleSaveDiscovery(title);
    setToastMsg(currentlySaved ? 'Removed from Life Map' : 'Saved to Life Map');
    setToastSub(
      currentlySaved 
        ? `"${title}" has been unpinned from your custom discovery dashboard.` 
        : `"${title}" pinned as a custom coordinate anchor node.`
    );
    setShowToast(true);
  };

  const filteredDiscoveries = filter === 'All'
    ? discoveries
    : discoveries.filter(d => d.category === filter);

  return (
    <div className="space-y-6">
      
      {/* Header Panel */}
      <section className="rounded-[28px] border border-white/5 bg-slate-900/40 p-6 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500 font-medium">
              ROUTINE BREAKER DETECTOR
            </span>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Discoveries Console
            </h2>
            <p className="mt-2 text-xs text-slate-400 font-light leading-5 max-w-xl">
              AeroTrace cross-references your wander corridors and repeated coordinates to highlight patterns you may have overlooked. These are suggestions surfaced dynamically.
            </p>
          </div>
        </div>

        {/* Category Toggles */}
        <div className="mt-6 flex flex-wrap gap-2 border-t border-white/5 pt-4">
          {(['All', 'Place', 'Event', 'Route'] as const).map((cat) => {
            const isActive = filter === cat;
            return (
              <Button
                key={cat}
                type="button"
                variant={isActive ? 'primary' : 'glass'}
                size="sm"
                onClick={() => setFilter(cat)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold ${isActive ? 'text-slate-950' : 'text-slate-400'} ${
                  isActive ? 'shadow-md shadow-white/5' : 'hover:bg-white/5 hover:text-white'
                }`}
              >
                {cat === 'All' ? 'All Surfaced' : `${cat}s`}
              </Button>
            );
          })}
        </div>
      </section>

      {/* Discoveries list */}
      <div className="grid gap-6 md:grid-cols-2">
        {filteredDiscoveries.map((item, idx) => (
          <Card key={idx} className="flex flex-col justify-between min-h-[220px]" glowColor={item.saved ? 'bg-cyan-400' : ''}>
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/5 text-xs">
                <span className="font-bold text-white uppercase tracking-wider">{item.title}</span>
                <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] uppercase tracking-wider text-slate-400 font-light">
                  {item.category}
                </span>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-300 font-light">
                {item.detail}
              </p>
              
              <div className="mt-3 text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                {item.saved ? '⚡ Constellation Anchor' : '⚡ Unsaved suggestion'}
              </div>
            </div>

            <div className="mt-6 border-t border-white/5 pt-4 flex justify-between items-center">
              <Button
                variant={item.saved ? 'primary' : 'glass'}
                size="sm"
                onClick={() => handleToggleSave(item.title, item.saved)}
              >
                {item.saved ? 'Saved to Constellation ✓' : 'Save Anchor Node'}
              </Button>
              
              <span className="text-[10px] text-slate-600 font-light">Surfaced via trace index</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Grid Canvas Preview */}
      <section className="rounded-[28px] border border-white/5 bg-slate-900/40 p-6 backdrop-blur-xl max-w-3xl">
        <h3 className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
          Discovery radar area
        </h3>
        <p className="mt-2 text-xs text-slate-400 font-light leading-5 max-w-xl">
          A visual chart showing memory coordinate corridors currently scanning for anomalies:
        </p>
        <div className="mt-6">
          <MapRibbon />
        </div>
      </section>

      {/* Slide-in Notifications */}
      <Toast
        show={showToast}
        message={toastMsg}
        subtitle={toastSub}
        onClose={() => setShowToast(false)}
      />

    </div>
  );
}
export default DiscoverPage;
