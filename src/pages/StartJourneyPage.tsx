import React, { useState, useEffect, useRef } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { useJourney } from '../context/JourneyContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Field from '../components/ui/Field';
import { motion, AnimatePresence } from 'framer-motion';

// Mood options for the journey
const moodOptions = [
  { id: 'curious', label: 'Curious', icon: '🔍', color: 'from-cyan-400 to-blue-500' },
  { id: 'peaceful', label: 'Peaceful', icon: '🌿', color: 'from-emerald-400 to-teal-500' },
  { id: 'energetic', label: 'Energetic', icon: '⚡', color: 'from-amber-400 to-orange-500' },
  { id: 'reflective', label: 'Reflective', icon: '🌙', color: 'from-violet-400 to-purple-500' },
  { id: 'adventurous', label: 'Adventurous', icon: '🧭', color: 'from-rose-400 to-pink-500' },
  { id: 'nostalgic', label: 'Nostalgic', icon: '📸', color: 'from-amber-600 to-red-500' },
];

// Privacy options
const privacyOptions = [
  { id: 'private', label: 'Private', description: 'Only you can see this journey', icon: '🔒' },
  { id: 'contacts', label: 'Trusted Contacts', description: 'Shared with emergency contacts', icon: '👥' },
  { id: 'public', label: 'Public', description: 'Visible on your life map', icon: '🌍' },
];

// Format time helper
const formatTime = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${mins}:${String(secs).padStart(2, '0')}`;
};

// Format distance helper
const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(2)} km`;
};

// GPS Status indicator component
const GPSStatusIndicator: React.FC<{ status: 'connected' | 'searching' | 'lost' }> = ({ status }) => {
  const statusConfig = {
    connected: { color: 'bg-emerald-500', label: 'GPS Connected', pulse: true },
    searching: { color: 'bg-amber-500', label: 'Searching Signal...', pulse: true },
    lost: { color: 'bg-red-500', label: 'GPS Lost', pulse: false },
  };

  const config = statusConfig[status];

  return (
    <div className="flex items-center gap-2">
      <span className={`relative flex h-2.5 w-2.5`}>
        {config.pulse && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.color} opacity-75`} />
        )}
        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${config.color}`} />
      </span>
      <span className="text-xs font-medium text-slate-400">{config.label}</span>
    </div>
  );
};

// Memory modal component
const MemoryModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, caption: string, type: 'Photo' | 'Note') => void;
}> = ({ isOpen, onClose, onSave }) => {
  const [memoryTitle, setMemoryTitle] = useState('');
  const [memoryCaption, setMemoryCaption] = useState('');
  const [memoryType, setMemoryType] = useState<'Photo' | 'Note'>('Note');

  const handleSave = () => {
    if (memoryTitle.trim() || memoryCaption.trim()) {
      onSave(memoryTitle, memoryCaption, memoryType);
      setMemoryTitle('');
      setMemoryCaption('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md rounded-[28px] border border-white/10 bg-[#161A22] p-6 shadow-2xl"
      >
        <h3 className="text-lg font-semibold text-white">Add Memory</h3>
        <p className="mt-1 text-xs text-slate-400">Capture this moment in your journey</p>

        <div className="mt-4 space-y-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMemoryType('Photo')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium transition-all ${
                memoryType === 'Photo'
                  ? 'bg-[#4F8CFF]/20 text-[#4F8CFF] border border-[#4F8CFF]/30'
                  : 'bg-white/5 text-slate-400 border border-white/5'
              }`}
            >
              📷 Photo Note
            </button>
            <button
              type="button"
              onClick={() => setMemoryType('Note')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium transition-all ${
                memoryType === 'Note'
                  ? 'bg-[#4F8CFF]/20 text-[#4F8CFF] border border-[#4F8CFF]/30'
                  : 'bg-white/5 text-slate-400 border border-white/5'
              }`}
            >
              📝 Text Note
            </button>
          </div>

          <Field
            label="Memory Title"
            value={memoryTitle}
            onChange={(e) => setMemoryTitle(e.target.value)}
            placeholder="What caught your attention?"
          />

          <div>
            <label className="block mb-2 text-[10px] font-bold uppercase tracking-[0.24em] text-[#A0A8B8]">
              Description
            </label>
            <textarea
              value={memoryCaption}
              onChange={(e) => setMemoryCaption(e.target.value)}
              placeholder="Describe this moment..."
              rows={3}
              className="w-full rounded-[20px] border border-white/10 bg-[#161A22] px-4 py-3 text-sm text-white placeholder-[#A0A8B8] shadow-[0_12px_40px_-24px_rgba(0,0,0,0.85)] transition-all duration-200 focus:border-[#4F8CFF]/20 focus:outline-none focus:ring-2 focus:ring-[#4F8CFF]/20 resize-none"
            />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Button variant="primary" size="md" onClick={handleSave} className="flex-1">
            Save Memory
          </Button>
          <Button variant="glass" size="md" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export function StartJourneyPage() {
  const { go } = useNavigation();
  const { startNewJourney, activeJourney, isTracking, addCheckpoint, captureMemory } = useJourney();

  // Pre-journey form state
  const [journeyName, setJourneyName] = useState('');
  const [currentLocation, setCurrentLocation] = useState('Detecting location...');
  const [selectedMood, setSelectedMood] = useState(moodOptions[0]);
  const [selectedPrivacy, setSelectedPrivacy] = useState(privacyOptions[0]);
  const [gpsStatus, setGpsStatus] = useState<'connected' | 'searching' | 'lost'>('searching');
  const [initialLat, setInitialLat] = useState<number | undefined>(undefined);
  const [initialLng, setInitialLng] = useState<number | undefined>(undefined);

  // Tracking state
  const [elapsedTime, setElapsedTime] = useState(0);
  const [distanceTravelled, setDistanceTravelled] = useState(0);
  const [locationsVisited, setLocationsVisited] = useState<string[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [showMemoryModal, setShowMemoryModal] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Request real GPS location
  const requestGPSLocation = () => {
    if ('geolocation' in navigator) {
      setGpsStatus('searching');
      setCurrentLocation('Detecting location...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGpsStatus('connected');
          const { latitude, longitude } = position.coords;
          setInitialLat(latitude);
          setInitialLng(longitude);
          setCurrentLocation(`Lat: ${latitude.toFixed(5)}, Lng: ${longitude.toFixed(5)}`);
        },
        (error) => {
          setGpsStatus('lost');
          if (error.code === error.PERMISSION_DENIED) {
            setCurrentLocation('GPS Permission Denied');
          } else {
            setCurrentLocation('GPS Signal Lost / Unavailable');
          }
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setGpsStatus('lost');
      setCurrentLocation('GPS Geolocation not supported');
    }
  };

  // Run on mount
  useEffect(() => {
    requestGPSLocation();
  }, []);

  // Redirect to live journey page if already tracking
  useEffect(() => {
    if (isTracking && activeJourney) {
      go('live-journey');
    }
  }, [isTracking, activeJourney, go]);

  // Handle tracking timer
  useEffect(() => {
    if (isTracking && !isPaused && activeJourney) {
      timerRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
        // Simulate distance accumulation (average walking speed ~1.4 m/s)
        setDistanceTravelled((prev) => prev + 1.4 + Math.random() * 0.5);
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTracking, isPaused, activeJourney]);

  // Start a new journey
  const handleStartJourney = () => {
    const moodLabel = selectedMood.label;
    startNewJourney(
      journeyName || `${selectedMood.label} Walk`,
      moodLabel,
      currentLocation,
      '',
      initialLat,
      initialLng
    );
    setElapsedTime(0);
    setDistanceTravelled(0);
    setLocationsVisited([currentLocation]);
    setIsPaused(false);
  };

  // Add a location/memory checkpoint
  const handleAddLocation = () => {
    const locationName = prompt('Name this location:');
    if (locationName && locationName.trim()) {
      setLocationsVisited((prev) => [...prev, locationName.trim()]);
      addCheckpoint(locationName.trim());
    }
  };

  // Handle memory capture
  const handleSaveMemory = (title: string, caption: string, type: 'Photo' | 'Note') => {
    captureMemory(title || 'Untitled Memory', caption, type);
  };

  // Pause tracking
  const handlePause = () => {
    setIsPaused(true);
  };

  // Resume tracking
  const handleResume = () => {
    setIsPaused(false);
  };

  // Finish journey
  const handleFinish = () => {
    go('dashboard');
  };

  // If actively tracking, show tracking dashboard
  if (isTracking && activeJourney) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
              LIVE TRACKING
            </span>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-white">
              {activeJourney.title}
            </h2>
          </div>
          <GPSStatusIndicator status={gpsStatus} />
        </div>

        {/* Main tracking dashboard */}
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          {/* Left column - Stats and controls */}
          <div className="space-y-6">
            {/* Stats cards */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                    <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" />
                  </svg>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
                  Elapsed Time
                </span>
                <div className="mt-2 text-4xl font-mono font-bold text-white tracking-tight">
                  {formatTime(elapsedTime)}
                </div>
                {isPaused && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-amber-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                    </span>
                    <span className="text-xs text-amber-500 font-medium">Paused</span>
                  </div>
                )}
              </Card>

              <Card className="relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                    <circle cx="12" cy="9" r="2.5" />
                  </svg>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
                  Distance
                </span>
                <div className="mt-2 text-4xl font-mono font-bold text-white tracking-tight">
                  {formatDistance(distanceTravelled)}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  ~{(distanceTravelled / Math.max(elapsedTime, 1) * 3.6).toFixed(1)} km/h avg
                </div>
              </Card>
            </div>

            {/* Current location */}
            <Card>
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
                Current Location
              </span>
              <div className="mt-2 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#4F8CFF]/20">
                  <svg className="w-5 h-5 text-[#4F8CFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-medium text-white">{currentLocation}</div>
                  <div className="text-xs text-slate-500">GPS accuracy: ±3m</div>
                </div>
              </div>
            </Card>

            {/* Locations visited */}
            <Card>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
                  Locations Visited ({locationsVisited.length})
                </span>
                <Button variant="glass" size="sm" onClick={handleAddLocation}>
                  + Add Location
                </Button>
              </div>
              <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
                {locationsVisited.map((loc, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#4F8CFF]/20 text-xs font-bold text-[#4F8CFF]">
                      {index + 1}
                    </div>
                    <span className="text-sm text-white flex-1">{loc}</span>
                    <span className="text-xs text-slate-500">
                      {index === 0 ? 'Start' : `+${Math.round(distanceTravelled * (index / locationsVisited.length))}m`}
                    </span>
                  </motion.div>
                ))}
                {locationsVisited.length === 0 && (
                  <div className="text-sm text-slate-500 text-center py-4">
                    No locations added yet
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Right column - Controls */}
          <div className="space-y-4">
            <Card className="sticky top-6">
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
                Tracking Controls
              </span>

              <div className="mt-4 space-y-3">
                {/* Add Memory button */}
                <Button
                  variant="glass"
                  size="lg"
                  onClick={() => setShowMemoryModal(true)}
                  className="w-full justify-start gap-3"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Add Memory
                </Button>

                {/* Pause/Resume button */}
                {!isPaused ? (
                  <Button
                    variant="border"
                    size="lg"
                    onClick={handlePause}
                    className="w-full justify-start gap-3"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Pause Tracking
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleResume}
                    className="w-full justify-start gap-3"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Resume Tracking
                  </Button>
                )}

                {/* Finish button */}
                <Button
                  variant="success"
                  size="lg"
                  onClick={handleFinish}
                  className="w-full justify-start gap-3"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Finish Journey
                </Button>
              </div>

              {/* Journey info */}
              <div className="mt-6 pt-6 border-t border-white/5">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-medium">Mood:</span>
                  <span>{activeJourney.mood}</span>
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-medium">Privacy:</span>
                  <span>{selectedPrivacy.label}</span>
                </div>
              </div>
            </Card>

            {/* Quick stats */}
            <Card className="bg-gradient-to-br from-[#4F8CFF]/10 to-transparent">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">
                  {locationsVisited.length}
                </div>
                <div className="mt-1 text-xs text-slate-400">Checkpoints</div>
              </div>
            </Card>
          </div>
        </div>

        {/* Memory Modal */}
        <AnimatePresence>
          {showMemoryModal && (
            <MemoryModal
              isOpen={showMemoryModal}
              onClose={() => setShowMemoryModal(false)}
              onSave={handleSaveMemory}
            />
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Pre-journey setup screen
  return (
    <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
      {/* Form Column */}
      <div className="space-y-6">
        <section className="rounded-[28px] border border-white/5 bg-slate-900/40 p-6 backdrop-blur-xl">
          <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
            NEW JOURNEY
          </span>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Start Your Journey
          </h2>
          <p className="mt-2 text-xs text-slate-400 font-light leading-5">
            Begin tracking your real-world exploration. AeroTrace will record your path, locations, and memories as you move through the world.
          </p>

          {/* Journey Name */}
          <div className="mt-8">
            <Field
              label="Journey Name (optional)"
              value={journeyName}
              onChange={(e) => setJourneyName(e.target.value)}
              placeholder="Morning Walk, City Exploration..."
            />
          </div>

          {/* Current Location & GPS Status */}
          <div className="mt-4">
            <label className="block mb-2 text-[10px] font-bold uppercase tracking-[0.24em] text-[#A0A8B8]">
              Current Location
            </label>
            <div className="flex items-center gap-3 p-4 rounded-[20px] border border-white/10 bg-[#161A22]">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#4F8CFF]/20 flex-shrink-0">
                {gpsStatus === 'connected' ? (
                  <svg className="w-5 h-5 text-[#4F8CFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-amber-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">
                  {currentLocation}
                </div>
                <div className="mt-1">
                  <GPSStatusIndicator status={gpsStatus} />
                </div>
              </div>
              <Button variant="glass" size="sm" onClick={requestGPSLocation}>
                Update
              </Button>
            </div>
          </div>

          {/* Mood Selector */}
          <div className="mt-6">
            <label className="block mb-3 text-[10px] font-bold uppercase tracking-[0.24em] text-[#A0A8B8]">
              How are you feeling?
            </label>
            <div className="grid grid-cols-3 gap-3">
              {moodOptions.map((mood) => (
                <button
                  key={mood.id}
                  type="button"
                  onClick={() => setSelectedMood(mood)}
                  className={`relative p-4 rounded-2xl border transition-all duration-300 text-center ${
                    selectedMood.id === mood.id
                      ? `border-[#4F8CFF]/30 bg-[#4F8CFF]/10 shadow-lg shadow-[#4F8CFF]/10`
                      : 'border-white/5 bg-white/[0.01] hover:bg-white/[0.03]'
                  }`}
                >
                  <div className="text-2xl mb-2">{mood.icon}</div>
                  <div className={`text-sm font-semibold ${
                    selectedMood.id === mood.id ? 'text-white' : 'text-slate-300'
                  }`}>
                    {mood.label}
                  </div>
                  {selectedMood.id === mood.id && (
                    <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full border border-[#4F8CFF] bg-[#4F8CFF]" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Privacy Selector */}
          <div className="mt-6">
            <label className="block mb-3 text-[10px] font-bold uppercase tracking-[0.24em] text-[#A0A8B8]">
              Privacy Setting
            </label>
            <div className="space-y-2">
              {privacyOptions.map((privacy) => (
                <button
                  key={privacy.id}
                  type="button"
                  onClick={() => setSelectedPrivacy(privacy)}
                  className={`w-full p-4 rounded-2xl border transition-all duration-300 flex items-center gap-4 text-left ${
                    selectedPrivacy.id === privacy.id
                      ? 'border-[#4F8CFF]/30 bg-[#4F8CFF]/10'
                      : 'border-white/5 bg-white/[0.01] hover:bg-white/[0.03]'
                  }`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 flex-shrink-0">
                    <span className="text-xl">{privacy.icon}</span>
                  </div>
                  <div className="flex-1">
                    <div className={`text-sm font-semibold ${
                      selectedPrivacy.id === privacy.id ? 'text-white' : 'text-slate-300'
                    }`}>
                      {privacy.label}
                    </div>
                    <div className="text-xs text-slate-500">{privacy.description}</div>
                  </div>
                  {selectedPrivacy.id === privacy.id && (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full border border-[#4F8CFF] bg-[#4F8CFF]">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 border-t border-white/5 pt-6 flex flex-wrap gap-3">
            <Button
              variant="primary"
              size="lg"
              onClick={handleStartJourney}
              disabled={gpsStatus !== 'connected'}
              className="min-w-[200px]"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Start Tracking
            </Button>
            <Button variant="glass" size="lg" onClick={() => go('dashboard')}>
              Cancel
            </Button>
          </div>
        </section>
      </div>

      {/* Preview Column */}
      <div className="space-y-6">
        <Card className="min-h-[300px] flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
              TRACKING OVERVIEW
            </span>
            <h3 className="mt-3 text-lg font-semibold text-white">What Gets Recorded</h3>
            <p className="mt-2 text-xs text-slate-400 font-light leading-5">
              Your journey will be privately tracked with real-time GPS data. Every step, location, and memory becomes part of your personal life map.
            </p>

            {/* Feature list */}
            <div className="mt-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 flex-shrink-0">
                  <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-medium text-white">Real-time GPS Tracking</div>
                  <div className="text-xs text-slate-500">Your path is recorded as you move</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/20 flex-shrink-0">
                  <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-medium text-white">Location Checkpoints</div>
                  <div className="text-xs text-slate-500">Mark places that matter to you</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/20 flex-shrink-0">
                  <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-medium text-white">Memory Capture</div>
                  <div className="text-xs text-slate-500">Add photos and notes along the way</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/20 flex-shrink-0">
                  <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-medium text-white">Private by Default</div>
                  <div className="text-xs text-slate-500">You control who sees your journeys</div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary stats preview */}
          <div className="mt-8 pt-6 border-t border-white/5">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-white">—</div>
                <div className="mt-1 text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
                  Distance
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">—</div>
                <div className="mt-1 text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
                  Duration
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Safety note */}
        <Card className="bg-gradient-to-br from-amber-500/5 to-transparent border-amber-500/20">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/20 flex-shrink-0">
              <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-medium text-amber-500">Safety Tip</div>
              <div className="mt-1 text-xs text-slate-400">
                Keep your phone charged and be aware of your surroundings while tracking.
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
export default StartJourneyPage;