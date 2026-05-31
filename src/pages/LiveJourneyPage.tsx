import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useJourney } from '../context/JourneyContext';
import { useMemory } from '../context/MemoryContext';
import { useNavigation } from '../context/NavigationContext';
import RouteCanvas from '../components/maps/RouteCanvas';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import MetricCard from '../components/ui/MetricCard';
import Field from '../components/ui/Field';
import Toast from '../components/ui/Toast';
import MemoryModal from '../components/memory/MemoryModal';
import type { Memory } from '../types';

export function LiveJourneyPage() {
  const { go } = useNavigation();
  const { 
    activeJourney, 
    isTracking, 
    addCheckpoint, 
    captureMemory, 
    endCurrentJourney,
    triggerSOS,
    sosActive,
    resetSOS
  } = useJourney();
  const { memories: enhancedMemories } = useMemory();

  // If there's no active journey, create a quick mock one so the page doesn't break
  const journey = activeJourney || {
    id: 'mock-live',
    title: 'Midnight Market Loop',
    mood: 'Curious, Observant',
    startPoint: 'Viaduct Steps',
    destination: 'Night Tram',
    durationSec: 134,
    distanceMeters: 420,
    stops: ['Viaduct Steps', 'Tea Stall Row'],
    coordinates: [{ x: 30, y: 70 }, { x: 45, y: 55 }],
    color: 'from-cyan-400 to-indigo-500'
  };

  // State for Add Checkpoint
  const [stopName, setStopName] = useState('');
  
  // State for Enhanced Memory Modal
  const [showMemoryModal, setShowMemoryModal] = useState(false);

  // Slide-in Toasts
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastSub, setToastSub] = useState('');

  // Ticking time formatting
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return [
      hours > 0 ? String(hours).padStart(2, '0') : null,
      String(minutes).padStart(2, '0'),
      String(seconds).padStart(2, '0')
    ].filter(Boolean).join(':');
  };

  const handleAddStop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stopName.trim()) return;
    addCheckpoint(stopName.trim());
    setToastMsg('New Checkpoint Logged');
    setToastSub(`"${stopName.trim()}" added to your live coordinate chain.`);
    setShowToast(true);
    setStopName('');
  };

  const handleMemorySuccess = (memory: Memory) => {
    // Add visual mark to journey stops
    captureMemory(memory.title, memory.note, 'Photo');
    
    setToastMsg('Memory Pinned to Coordinates');
    setToastSub(`"${memory.title}" saved with ${memory.photos.length} photo(s) and ${memory.tags.length} tag(s).`);
    setShowToast(true);
  };

  const handleEndJourney = () => {
    endCurrentJourney();
    go('journey-summary');
  };

  // Count enhanced memories for current journey
  const currentJourneyMemories = activeJourney 
    ? enhancedMemories.filter(m => m.journeyId === activeJourney.id)
    : [];

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
      {/* Visual Canvas Panel */}
      <div className="space-y-5">
        <section className="rounded-[28px] border border-white/5 bg-slate-900/40 p-6 backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500 font-medium">
                  EXPLORATION COCKPIT
                </span>
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[9px] font-bold uppercase text-emerald-400 tracking-wider">LIVE</span>
              </div>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {journey.title}
              </h2>
            </div>
            
            <div className="flex gap-2">
              <Button variant="danger" size="sm" onClick={triggerSOS}>
                SOS Emergency
              </Button>
              <Button variant="primary" size="sm" onClick={handleEndJourney}>
                End Journey
              </Button>
            </div>
          </div>

          {/* Telemetry Metric Row */}
          <div className="mt-6 grid gap-4 sm:grid-cols-4">
            <MetricCard
              label="Elapsed Duration"
              value={formatTime(journey.durationSec)}
              text="Simulated Ticking"
            />
            <MetricCard
              label="Accrued Distance"
              value={`${(journey.distanceMeters / 1000).toFixed(3)} km`}
              text="GPS Calculations"
            />
            <MetricCard
              label="Logged Stops"
              value={journey.stops.length}
              text="Telemetry Pins"
            />
            <MetricCard
              label="Captured Memories"
              value={currentJourneyMemories.length}
              text="Journal Entries"
            />
          </div>

          {/* Map canvas */}
          <div className="mt-6 h-[400px]">
            <RouteCanvas coordinates={journey.coordinates} color="rgba(34,211,238,0.95)" />
          </div>
        </section>
      </div>

      {/* Checklist and Action Drawer */}
      <div className="space-y-6">
        
        {/* Dynamic Timeline Checkpoints */}
        <Card>
          <div className="pb-3 border-b border-white/5 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
              PATH CHECKPOINTS ({journey.stops.length})
            </span>
          </div>

          <div className="mt-4 space-y-4 max-h-[220px] overflow-y-auto pr-1">
            {journey.stops.map((stop, index) => (
              <div key={index} className="flex items-start gap-3">
                {/* Timeline connector circle */}
                <div className="relative mt-1">
                  <div className="h-3 w-3 rounded-full bg-cyan-400 border border-slate-950 z-10 relative" />
                  {index < journey.stops.length - 1 && (
                    <div className="absolute top-3 left-[5px] bottom-[-22px] w-[2px] bg-cyan-500/20" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">{stop}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {index === 0 ? 'Starting Location' : `Checkpoint Marker ${index}`}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Form to log a new stop */}
          <form onSubmit={handleAddStop} className="mt-6 border-t border-white/5 pt-4 flex gap-2">
            <Field
              value={stopName}
              onChange={(e) => setStopName(e.target.value)}
              placeholder="Log landmark name..."
              className="flex-1"
            />
            <Button type="submit" variant="border" size="sm">
              Add stop
            </Button>
          </form>
        </Card>

        {/* Capture Memory Capsule Action */}
        <Card className="text-center py-6">
          <span className="text-2xl">📸</span>
          <h3 className="text-sm font-bold text-white mt-2">Pin a Memory Capsule</h3>
          <p className="text-[11px] text-slate-400 mt-1 font-light leading-4 max-w-xs mx-auto">
            Stumbled into an interesting sight, menu receipt, or quiet lane soundscape? Lock it into your active GPS trail coordinates.
          </p>
          <Button 
            variant="glass" 
            size="sm" 
            className="w-full mt-4"
            onClick={() => setShowMemoryModal(true)}
          >
            Drop Capsule Pin
          </Button>
          
          {/* Show recent memories count */}
          {currentJourneyMemories.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/5">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                {currentJourneyMemories.length} memor{currentJourneyMemories.length === 1 ? 'y' : 'ies'} captured on this journey
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Enhanced Memory Journal Modal */}
      <MemoryModal
        isOpen={showMemoryModal}
        onClose={() => setShowMemoryModal(false)}
        onSuccess={handleMemorySuccess}
      />

      {/* Dynamic Emergency SOS flashing overlay */}
      <AnimatePresence>
        {sosActive && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-rose-950/80 p-6 backdrop-blur-md animate-pulse">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md text-center"
            >
              <Card className="border-rose-500/50 bg-rose-950/95" glowColor="bg-rose-500">
                <span className="text-5xl">🚨</span>
                <h2 className="text-2xl font-bold tracking-tight text-white mt-4 uppercase">SOS Emergency Active</h2>
                <p className="text-xs text-rose-200 mt-2 leading-relaxed">
                  Your live coordinates, ETA check-ins, and ambient sound clips are actively broadcasting to your **3 Trusted Contacts** (Maya, Jordan, Priya).
                </p>
                <div className="mt-8 flex flex-col gap-3">
                  <Button variant="primary" className="text-rose-950 bg-white font-bold" onClick={resetSOS}>
                    Deactivate SOS Alert
                  </Button>
                  <Button
                    type="button"
                    variant="glass"
                    size="sm"
                    className="text-xs text-rose-300 hover:text-white underline px-0 py-0"
                    onClick={() => {
                      resetSOS();
                      go('safety');
                    }}
                  >
                    Open Safety Center
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* System Toast Notifications */}
      <Toast 
        show={showToast} 
        message={toastMsg} 
        subtitle={toastSub} 
        onClose={() => setShowToast(false)} 
      />
    </div>
  );
}
export default LiveJourneyPage;