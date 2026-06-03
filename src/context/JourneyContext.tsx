import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { Journey, MemoryItem, Discovery, JourneyStatus, Memory } from '../types';
import { saveJourney, getSavedJourneys } from '../services/journeyStorage';
import { journeys as initialJourneys } from '../data';
import { useNavigation } from './NavigationContext';

interface User {
  name: string;
  email: string;
  avatar: string;
  homeCity: string;
}

export interface ActiveJourneyCoordinate {
  lat: number;
  lng: number;
  timestamp?: number;
  accuracy?: number;
}

export interface ActiveJourneyStop {
  name: string;
  lat: number;
  lng: number;
  time: string;
  timestamp: string;
}

interface ActiveJourneyState {
  id: string;
  title: string;
  mood: string;
  startPoint: string;
  destination: string;
  durationSec: number;
  distanceMeters: number;
  stops: ActiveJourneyStop[];
  coordinates: ActiveJourneyCoordinate[];
  color: string;
  isPaused: boolean;
  lastMovementTime: number;
}

interface JourneyContextType {
  user: User | null;
  journeys: Journey[];
  memories: MemoryItem[];
  discoveries: Discovery[];
  activeJourney: ActiveJourneyState | null;
  isTracking: boolean;
  sosActive: boolean;
  lastCompletedJourney: ActiveJourneyState | null;
  gpsError: string | null;
  isOffline: boolean;
  gpsStatus: 'Active' | 'Weak' | 'Denied' | 'Offline';
  gpsAccuracy: number | null;
  showInactivityWarning: boolean;
  setShowInactivityWarning: React.Dispatch<React.SetStateAction<boolean>>;
  pauseJourney: () => void;
  resumeJourney: () => void;
  cancelCurrentJourney: () => void;
  login: (email: string) => void;
  signup: (name: string, email: string) => void;
  logout: () => void;
  startNewJourney: (title: string, mood: string, startPoint: string, destination: string, initialLat?: number, initialLng?: number) => void;
  addCheckpoint: (name: string) => void;
  captureMemory: (title: string, caption: string, type: MemoryItem['type']) => void;
  endCurrentJourney: () => Journey;
  addDiscovery: (discovery: Discovery) => void;
  triggerSOS: () => void;
  resetSOS: () => void;
}

const JourneyContext = createContext<JourneyContextType | undefined>(undefined);

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in meters
}

export function JourneyProvider({ children }: { children: React.ReactNode }) {
  const { page } = useNavigation();

  // Mock active user session
  const [user, setUser] = useState<User | null>(null);

  // Lists of data
  // Load saved journeys from localStorage (real user data). Fall back to seeded initialJourneys only for dev.
  // Convert stored SavedJourney -> Journey shape used by the UI
  const mapSavedToJourney = (s: any): Journey => {
    return {
      id: s.id,
      title: s.journeyName || s.title || 'Journey',
      date: s.dateLabel || s.date || new Date(s.savedAt || Date.now()).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      status: 'Completed',
      duration: s.totalDuration || s.totalTime || '0m',
      distance: s.totalDistance || '0 km',
      mood: s.mood || 'Neutral',
      location: s.stops && s.stops[0] ? s.stops[0].name : (s.startPoint || 'Unknown'),
      narrative: s.storySummary || s.notes || '',
      color: s.mood ? 'from-cyan-400 to-indigo-500' : 'from-emerald-400 to-teal-500',
      stops: (s.stops || []).map((st: any) => st.name),
      tags: s.tags || [],
    } as Journey;
  };

  const [journeys, setJourneys] = useState<Journey[]>(() => {
    try {
      const saved = getSavedJourneys();
      if (saved.length > 0) return saved.map(mapSavedToJourney);
      return initialJourneys;
    } catch {
      return initialJourneys;
    }
  });

  // MemoryJournal should be driven by MemoryContext; keep legacy memory list empty to avoid demo data.
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [discoveries, setDiscoveries] = useState<Discovery[]>([]);

  // Active tracking state
  const [activeJourney, setActiveJourney] = useState<ActiveJourneyState | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [sosActive, setSosActive] = useState(false);
  const [lastCompletedJourney, setLastCompletedJourney] = useState<ActiveJourneyState | null>(null);

  // GPS specific states
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [showInactivityWarning, setShowInactivityWarning] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);

  // Monitor online/offline network state
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const gpsStatus = useMemo(() => {
    if (isOffline) return 'Offline';
    if (gpsError && gpsError.includes('Denied')) return 'Denied';
    if (gpsError || !gpsAccuracy || gpsAccuracy > 50) return 'Weak';
    return 'Active';
  }, [isOffline, gpsError, gpsAccuracy]);

  // Geolocation watchPosition continuous logging (Battery optimized: only runs while active & tracking & on live page)
  // NOTE: We deliberately do NOT include activeJourney in the dependency array to prevent the watcher
  // from being torn down and restarted on every GPS coordinate update. The watcher callback uses the
  // functional form of setActiveJourney so it always reads the latest state without needing the
  // dependency. Only isTracking, isPaused, and page changes should restart the watcher.
  const isPaused = activeJourney?.isPaused ?? false;
  useEffect(() => {
    let activeWatchId: number | null = null;

    if (isTracking && !isPaused && page === 'live-journey') {
      if ('geolocation' in navigator) {
        setGpsError(null);
        console.log('[GPS] watchPosition started — isTracking:', isTracking, 'isPaused:', isPaused, 'page:', page);
        
        activeWatchId = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude, accuracy } = position.coords;
            const timestamp = position.timestamp;

            setGpsAccuracy(accuracy);
            setGpsError(null);

            setActiveJourney((current) => {
              if (!current) return null;
              if (current.isPaused) return current;

              const lastCoord = current.coordinates[current.coordinates.length - 1];
              let distanceDelta = 0;
              let nextLastMovementTime = current.lastMovementTime;

              if (lastCoord) {
                distanceDelta = calculateDistance(
                  lastCoord.lat,
                  lastCoord.lng,
                  latitude,
                  longitude
                );
                
                // If they moved significantly (> 2 meters), reset inactivity timer
                if (distanceDelta > 2) {
                  nextLastMovementTime = Date.now();
                }
              } else {
                nextLastMovementTime = Date.now();
              }

              const newCount = current.coordinates.length + 1;
              console.log(`[GPS] Point #${newCount} recorded — lat: ${latitude.toFixed(6)}, lng: ${longitude.toFixed(6)}, accuracy: ±${accuracy.toFixed(1)}m`);

              return {
                ...current,
                distanceMeters: current.distanceMeters + distanceDelta,
                lastMovementTime: nextLastMovementTime,
                coordinates: [
                  ...current.coordinates,
                  { lat: latitude, lng: longitude, timestamp, accuracy }
                ]
              };
            });
          },
          (error) => {
            let msg = 'Weak Signal';
            if (error.code === error.PERMISSION_DENIED) {
              msg = 'GPS Permission Denied';
            } else if (error.code === error.POSITION_UNAVAILABLE) {
              msg = 'GPS Position Unavailable';
            } else if (error.code === error.TIMEOUT) {
              msg = 'GPS Signal Timeout';
            }
            console.warn('[GPS] watchPosition error:', msg, error);
            setGpsError(msg);
            setGpsAccuracy(null);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          }
        );
        
        setWatchId(activeWatchId);
        console.log('[GPS] watchPosition watchId assigned:', activeWatchId);
      } else {
        setGpsError('GPS Position Unavailable');
        console.warn('[GPS] navigator.geolocation not available');
      }
    } else {
      console.log('[GPS] watchPosition NOT started — isTracking:', isTracking, 'isPaused:', isPaused, 'page:', page);
    }

    return () => {
      if (activeWatchId !== null) {
        navigator.geolocation.clearWatch(activeWatchId);
        setWatchId(null);
        console.log('[GPS] watchPosition cleared — watchId:', activeWatchId);
      }
    };
  }, [isTracking, isPaused, page]);

  // Live duration ticker & Inactivity warning checker
  useEffect(() => {
    let tickInterval: ReturnType<typeof setInterval> | null = null;

    if (isTracking && activeJourney && !activeJourney.isPaused) {
      tickInterval = setInterval(() => {
        setActiveJourney((current) => {
          if (!current) return null;
          if (current.isPaused) return current;

          const nextSec = current.durationSec + 1;
          
          // Check for movement inactivity (5 minutes = 300 seconds)
          const timeSinceLastMovement = Date.now() - current.lastMovementTime;
          if (timeSinceLastMovement >= 5 * 60 * 1000 && !showInactivityWarning) {
            setShowInactivityWarning(true);
          }

          return {
            ...current,
            durationSec: nextSec,
          };
        });
      }, 1000);
    }

    return () => {
      if (tickInterval) clearInterval(tickInterval);
    };
  }, [isTracking, activeJourney?.isPaused, showInactivityWarning]);

  // Auth Operations
  const login = (email: string) => {
    setUser({
      name: 'Alex Morgan',
      email: email,
      avatar: 'AM',
      homeCity: '',
    });
  };

  const signup = (name: string, email: string) => {
    setUser({
      name: name,
      email: email,
      avatar: name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
      homeCity: '',
    });
  };

  const logout = () => {
    setUser(null);
    setActiveJourney(null);
    setIsTracking(false);
  };

  // Journey Operations
  const startNewJourney = (
    title: string,
    mood: string,
    startPoint: string,
    destination: string,
    initialLat?: number,
    initialLng?: number
  ) => {
    const randomColors = [
      'from-cyan-400 to-indigo-500',
      'from-emerald-400 to-teal-500',
      'from-fuchsia-400 to-violet-500',
      'from-amber-400 to-rose-500',
    ];
    const color = randomColors[Math.floor(Math.random() * randomColors.length)];

    const initialCoords = (initialLat !== undefined && initialLng !== undefined)
      ? [{ lat: initialLat, lng: initialLng, timestamp: Date.now(), accuracy: 10 }]
      : [];

    setActiveJourney({
      id: `j-${Date.now()}`,
      title: title || 'New Adventure Walk',
      mood: mood || 'Energetic',
      startPoint: startPoint || 'Starting Point',
      destination: destination || 'Destination',
      durationSec: 0,
      distanceMeters: 0,
      stops: [],
      coordinates: initialCoords,
      color,
      isPaused: false,
      lastMovementTime: Date.now(),
    });
    setIsTracking(true);
    setShowInactivityWarning(false);
  };

  const addCheckpoint = (name: string) => {
    if (!activeJourney) return;

    setActiveJourney((current) => {
      if (!current) return null;

      const lastCoord = current.coordinates[current.coordinates.length - 1];
      
      let lat = lastCoord?.lat;
      let lng = lastCoord?.lng;

      // Fallback: parse coordinates from startPoint if active coordinates are not yet logged
      if (lat === undefined || lng === undefined) {
        const match = current.startPoint.match(/Lat:\s*([\d.-]+),\s*Lng:\s*([\d.-]+)/);
        if (match) {
          lat = parseFloat(match[1]);
          lng = parseFloat(match[2]);
        } else {
          lat = 0;
          lng = 0;
        }
      }

      const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      const newStop = { 
        name, 
        lat, 
        lng, 
        time,
        timestamp: new Date().toISOString()
      };

      return {
        ...current,
        stops: [...current.stops, newStop],
      };
    });

    // No demo discovery generation: rely on real user-saved discoveries only
  };

  const captureMemory = (title: string, caption: string, type: MemoryItem['type']) => {
    if (!activeJourney) return;

    const lastCoord = activeJourney.coordinates[activeJourney.coordinates.length - 1];
    const lat = lastCoord?.lat;
    const lng = lastCoord?.lng;

    // Create a visual memory
    const newMemory: MemoryItem = {
      title: title || 'Captured Moment',
      location: activeJourney.stops[activeJourney.stops.length - 1]?.name || 'Along Route',
      caption: caption || 'No caption provided.',
      time: 'Just now',
      type,
      lat,
      lng,
      timestamp: new Date().toISOString(),
    };

    setMemories((prev) => [newMemory, ...prev]);
  };

  const endCurrentJourney = (): Journey => {
    if (!activeJourney) throw new Error('No active journey to end');

    setIsTracking(false);

    // ── GPS Diagnostics Logging ──────────────────────────────────────────────
    console.log('[Journey End] GPS Diagnostics:');
    console.log(`  coordinates.length  : ${activeJourney.coordinates.length}`);
    console.log(`  distanceMeters      : ${activeJourney.distanceMeters.toFixed(2)} m`);
    console.log(`  durationSec         : ${activeJourney.durationSec} s`);
    if (activeJourney.coordinates.length > 0) {
      const first = activeJourney.coordinates[0];
      const last  = activeJourney.coordinates[activeJourney.coordinates.length - 1];
      console.log(`  first coord         : lat ${first.lat.toFixed(6)}, lng ${first.lng.toFixed(6)}`);
      console.log(`  last  coord         : lat ${last.lat.toFixed(6)},  lng ${last.lng.toFixed(6)}`);
    }
    // ────────────────────────────────────────────────────────────────────────

    // Format final summary
    const formattedDuration = `${Math.floor(activeJourney.durationSec / 60)}m ${activeJourney.durationSec % 60}s`;
    const formattedDistance = `${(activeJourney.distanceMeters / 1000).toFixed(2)} km`;

    const stopsList = activeJourney.stops.map(s => s.name);

    const completedJourney: Journey = {
      id: activeJourney.id,
      title: activeJourney.title,
      date: new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      status: 'Completed' as JourneyStatus,
      duration: formattedDuration,
      distance: formattedDistance,
      mood: activeJourney.mood,
      location: activeJourney.startPoint,
      narrative: `An exploration that spanned from ${activeJourney.startPoint} to ${activeJourney.destination}, fueled by a ${activeJourney.mood.toLowerCase()} mindset and resulting in ${activeJourney.stops.length} custom checkpoints.`,
      color: activeJourney.color,
      stops: stopsList,
      tags: [activeJourney.mood, 'Fresh track', 'Explored'],
    };

    setJourneys((prev) => [completedJourney, ...prev]);
    setLastCompletedJourney(activeJourney);
    setActiveJourney(null);
    setShowInactivityWarning(false);

    return completedJourney;
  };

  const pauseJourney = () => {
    setActiveJourney(current => {
      if (!current) return null;
      return { ...current, isPaused: true };
    });
  };

  const resumeJourney = () => {
    setActiveJourney(current => {
      if (!current) return null;
      return { ...current, isPaused: false, lastMovementTime: Date.now() };
    });
    setShowInactivityWarning(false);
  };

  const cancelCurrentJourney = () => {
    setIsTracking(false);
    setActiveJourney(null);
    setShowInactivityWarning(false);
  };

  const addDiscovery = (discovery: Discovery) => {
    setDiscoveries(prev => [discovery, ...prev]);
  };

  // Safety controls
  const triggerSOS = () => {
    setSosActive(true);
  };

  const resetSOS = () => {
    setSosActive(false);
  };

  return (
    <JourneyContext.Provider value={{
      user,
      journeys,
      memories,
      discoveries,
      activeJourney,
      isTracking,
      sosActive,
      lastCompletedJourney,
      gpsError,
      isOffline,
      gpsStatus,
      gpsAccuracy,
      showInactivityWarning,
      setShowInactivityWarning,
      pauseJourney,
      resumeJourney,
      cancelCurrentJourney,
      login,
      signup,
      logout,
      startNewJourney,
      addCheckpoint,
      captureMemory,
      endCurrentJourney,
      addDiscovery,
      triggerSOS,
      resetSOS,
    }}>
      {children}
    </JourneyContext.Provider>
  );
}

export function useJourney() {
  const context = useContext(JourneyContext);
  if (!context) {
    throw new Error('useJourney must be used within a JourneyProvider');
  }
  return context;
}
