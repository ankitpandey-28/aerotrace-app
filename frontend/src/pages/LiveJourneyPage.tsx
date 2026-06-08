import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useJourney } from '../context/JourneyContext';
import { useMemory } from '../context/MemoryContext';
import { useNavigation } from '../context/NavigationContext';
import LiveTrackingMap from '../components/maps/LiveTrackingMap';
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
    resetSOS,
    gpsError,
    isOffline,
    gpsStatus,
    gpsAccuracy,
    showInactivityWarning,
    pauseJourney,
    resumeJourney,
    cancelCurrentJourney
  } = useJourney();
  const { memories: enhancedMemories } = useMemory();

  // Recovery screen if no active tracking session is running
  if (!activeJourney) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="text-center max-w-md p-8 rounded-[32px] border border-white/10 bg-[#161A22]/65 backdrop-blur-md shadow-[0_24px_80px_-20px_rgba(0,0,0,0.8)]">
          <div className="text-5xl mb-6">🚶‍♂️</div>
          <h2 className="text-xl font-bold text-white mb-2">No Active Journey</h2>
          <p className="text-slate-400 text-sm font-light mb-8 leading-relaxed">
            It looks like there is no active GPS tracking session running right now. You can start a new journey from the tracking page.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="border" size="md" onClick={() => go('dashboard')}>
              Go to Dashboard
            </Button>
            <Button variant="primary" size="md" onClick={() => go('start-journey')}>
              Start Journey
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const journey = activeJourney;

  // State for Add Checkpoint
  const [stopName, setStopName] = useState('');
  
  // State for Enhanced Memory Modal
  const [showMemoryModal, setShowMemoryModal] = useState(false);

  // Slide-in Toasts
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastSub, setToastSub] = useState('');

  // Clean up GPS watcher if user leaves page (Battery optimization)
  useEffect(() => {
    return () => {
      // Clean up logic is automatically handled by JourneyContext's watchPosition useEffect cleanup on unmount
    };
  }, []);

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
    setToastSub(`"${stopName.trim()}" added to your live GPS trail.`);
    setShowToast(true);
    setStopName('');
  };

  const handleMemorySuccess = (memory: Memory) => {
    // Add visual mark to journey stops
    captureMemory(memory.title, memory.note, 'Photo');
    
    // Memory geotag confirmation
    const latStr = memory.lat ? memory.lat.toFixed(5) : 'GPS';
    const lngStr = memory.lng ? memory.lng.toFixed(5) : 'GPS';
    
    setToastMsg('Location attached successfully');
    setToastSub(`"${memory.title}" saved and geotagged at [${latStr}, ${lngStr}]`);
    setShowToast(true);
  };

  const handleEndJourney = () => {
    endCurrentJourney();
    go('journey-summary');
  };

  const handleCancelJourney = () => {
    if (window.confirm('Are you sure you want to cancel this journey? Your route and telemetry will not be saved.')) {
      cancelCurrentJourney();
      go('dashboard');
    }
  };

  // Count enhanced memories for current journey
  const currentJourneyMemories = activeJourney 
    ? enhancedMemories.filter(m => m.journeyId === activeJourney.id)
    : [];

  useEffect(() => {
    if (activeJourney) {
      console.log('[LiveJourneyPage] activeJourney memory count:', currentJourneyMemories.length, currentJourneyMemories);
    }
  }, [currentJourneyMemories.length, activeJourney?.id]);

  // GPS indicator badge details
  const getGpsBadgeDetails = () => {
    switch (gpsStatus) {
      case 'Active':
        return { color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10', label: '🟢 GPS Active', dot: 'bg-emerald-400' };
      case 'Weak':
        return { color: 'text-amber-400 border-amber-500/20 bg-amber-500/10', label: '🟡 Weak Signal', dot: 'bg-amber-400' };
      case 'Denied':
        return { color: 'text-rose-400 border-rose-500/20 bg-rose-500/10', label: '🔴 GPS Permission Denied', dot: 'bg-rose-400' };
      case 'Offline':
        return { color: 'text-slate-400 border-white/10 bg-white/5', label: '⚪ Offline Mode', dot: 'bg-slate-400' };
      default:
        return { color: 'text-slate-400 border-white/10 bg-white/5', label: '⚪ Offline Mode', dot: 'bg-slate-400' };
    }
  };
  const badge = getGpsBadgeDetails();

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
              
              {/* GPS status and accuracy telemetry */}
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold tracking-wider ${badge.color}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${badge.dot} ${gpsStatus === 'Active' ? 'animate-pulse' : ''}`} />
                  {badge.label}
                </span>
                {gpsAccuracy !== null && (
                  <span className="rounded-full bg-white/5 border border-white/5 px-2.5 py-0.5 text-[9px] font-mono text-slate-400">
                    Accuracy: ±{gpsAccuracy.toFixed(1)}m
                  </span>
                )}
                {gpsError && gpsStatus !== 'Denied' && (
                  <span className="text-[9px] text-amber-400">
                    {gpsError}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex gap-2 items-center flex-wrap">
              <Button variant="danger" size="sm" onClick={triggerSOS}>
                SOS
              </Button>
              {journey.isPaused ? (
                <Button variant="glass" size="sm" onClick={resumeJourney} className="text-emerald-400 border-emerald-500/20 bg-emerald-500/5">
                  ▶ Resume
                </Button>
              ) : (
                <Button variant="glass" size="sm" onClick={pauseJourney} className="text-amber-400 border-amber-500/20 bg-amber-500/5">
                  ⏸ Pause
                </Button>
              )}
              <Button variant="border" size="sm" onClick={handleCancelJourney} className="text-rose-400 hover:bg-rose-500/10">
                Cancel
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
              text={journey.isPaused ? "Paused" : "Ticking Live"}
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
              text="Geotagged Capsules"
            />
          </div>

          {/* Map canvas */}
          <div className="mt-6 h-[400px]">
            <LiveTrackingMap 
              coordinates={journey.coordinates as any} 
              stops={journey.stops as any}
              isPaused={journey.isPaused || false}
            />
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
            {journey.stops.length === 0 ? (
              <div className="text-xs text-slate-500 text-center py-4">No checkpoints logged yet.</div>
            ) : (
              journey.stops.map((stop: any, index: number) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="relative mt-1">
                    <div className="h-3 w-3 rounded-full bg-cyan-400 border border-slate-950 z-10 relative" />
                    {index < journey.stops.length - 1 && (
                      <div className="absolute top-3 left-[5px] bottom-[-22px] w-[2px] bg-cyan-500/20" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">{stop.name || stop}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {index === 0 ? 'Starting Location' : `Checkpoint logged at ${stop.time || 'Marker'}`}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Form to log a new stop */}
          <form onSubmit={handleAddStop} className="mt-6 border-t border-white/5 pt-4 flex gap-2">
            <Field
              value={stopName}
              onChange={(e) => setStopName(e.target.value)}
              placeholder="Log landmark name..."
              className="flex-1"
            />
            <Button type="submit" variant="border" size="sm" disabled={journey.isPaused}>
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
            disabled={journey.isPaused}
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

      {/* Inactivity Movement Safety Warning Modal */}
      <AnimatePresence>
        {showInactivityWarning && (
          <div className="fixed inset-0 z-[101] flex items-center justify-center bg-slate-950/80 p-6 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md text-center"
            >
              <Card className="border-amber-500/30 bg-slate-900" glowColor="bg-amber-500">
                <span className="text-5xl">🚶‍♂️💤</span>
                <h2 className="text-xl font-bold tracking-tight text-white mt-4">Inactivity Detected</h2>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Looks like you've stopped moving. Continue tracking?
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                  <Button variant="border" onClick={pauseJourney}>
                    Pause Tracking
                  </Button>
                  <Button variant="primary" onClick={resumeJourney}>
                    Continue
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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