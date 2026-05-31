import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { Journey, MemoryItem, DiscoveryItem, JourneyStatus, Memory } from '../types';
import { journeys as initialJourneys, memories as initialMemories, discoveries as initialDiscoveries } from '../data';

interface User {
  name: string;
  email: string;
  avatar: string;
  homeCity: string;
}

interface ActiveJourneyState {
  id: string;
  title: string;
  mood: string;
  startPoint: string;
  destination: string;
  durationSec: number;
  distanceMeters: number;
  stops: string[];
  coordinates: { x: number; y: number }[];
  color: string;
}

interface JourneyContextType {
  user: User | null;
  journeys: Journey[];
  memories: MemoryItem[];
  discoveries: DiscoveryItem[];
  activeJourney: ActiveJourneyState | null;
  isTracking: boolean;
  sosActive: boolean;
  login: (email: string) => void;
  signup: (name: string, email: string) => void;
  logout: () => void;
  startNewJourney: (title: string, mood: string, startPoint: string, destination: string) => void;
  addCheckpoint: (name: string) => void;
  captureMemory: (title: string, caption: string, type: MemoryItem['type']) => void;
  endCurrentJourney: () => Journey;
  toggleSaveDiscovery: (title: string) => void;
  triggerSOS: () => void;
  resetSOS: () => void;
}

const JourneyContext = createContext<JourneyContextType | undefined>(undefined);

export function JourneyProvider({ children }: { children: React.ReactNode }) {
  // Mock active user session
  const [user, setUser] = useState<User | null>(null);

  // Lists of data
  const [journeys, setJourneys] = useState<Journey[]>(initialJourneys);
  const [memories, setMemories] = useState<MemoryItem[]>(initialMemories);
  const [discoveries, setDiscoveries] = useState<DiscoveryItem[]>(initialDiscoveries);

  // Active tracking state
  const [activeJourney, setActiveJourney] = useState<ActiveJourneyState | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [sosActive, setSosActive] = useState(false);

  // Simulated live tracking tick
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isTracking && activeJourney) {
      interval = setInterval(() => {
        setActiveJourney((current) => {
          if (!current) return null;

          // Increment time
          const nextSec = current.durationSec + 1;
          
          // Increment distance by random walking speed (e.g. 1.2 to 2.2 meters per second)
          const deltaDistance = Math.random() * 1.5 + 1.1;
          const nextDistance = current.distanceMeters + deltaDistance;

          // Periodically generate simulated coordinates inside vector container
          const lastCoord = current.coordinates[current.coordinates.length - 1];
          let nextCoord = { ...lastCoord };
          
          // Gently push coordinate towards destination
          if (Math.random() > 0.4) {
            const angle = Math.random() * Math.PI * 2;
            nextCoord = {
              x: Math.max(10, Math.min(90, lastCoord.x + Math.cos(angle) * 1.2)),
              y: Math.max(10, Math.min(90, lastCoord.y + Math.sin(angle) * 1.2)),
            };
          }

          const coordinates = [...current.coordinates];
          if (nextSec % 8 === 0) {
            coordinates.push(nextCoord);
          }

          return {
            ...current,
            durationSec: nextSec,
            distanceMeters: nextDistance,
            coordinates,
          };
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTracking]);

  // Auth Operations
  const login = (email: string) => {
    setUser({
      name: 'Alex Morgan',
      email: email,
      avatar: 'AM',
      homeCity: 'San Francisco',
    });
  };

  const signup = (name: string, email: string) => {
    setUser({
      name: name,
      email: email,
      avatar: name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
      homeCity: 'San Francisco',
    });
  };

  const logout = () => {
    setUser(null);
    setActiveJourney(null);
    setIsTracking(false);
  };

  // Journey Operations
  const startNewJourney = (title: string, mood: string, startPoint: string, destination: string) => {
    const randomColors = [
      'from-cyan-400 to-indigo-500',
      'from-emerald-400 to-teal-500',
      'from-fuchsia-400 to-violet-500',
      'from-amber-400 to-rose-500',
    ];
    const color = randomColors[Math.floor(Math.random() * randomColors.length)];

    setActiveJourney({
      id: `j-${Date.now()}`,
      title: title || 'New Adventure Walk',
      mood: mood || 'Energetic',
      startPoint: startPoint || 'Current Location',
      destination: destination || 'Unexplored Territory',
      durationSec: 0,
      distanceMeters: 0,
      stops: [startPoint || 'Start Point'],
      coordinates: [{ x: 30 + Math.random() * 20, y: 40 + Math.random() * 20 }],
      color,
    });
    setIsTracking(true);
  };

  const addCheckpoint = (name: string) => {
    if (!activeJourney) return;
    setActiveJourney((current) => {
      if (!current) return null;
      return {
        ...current,
        stops: [...current.stops, name],
      };
    });

    // Also trigger a random discovery occasionally when stop is added
    const newDiscovery: DiscoveryItem = {
      title: `Scenic Spot near ${name}`,
      detail: 'Surfaced via AeroTrace routine-breaking suggestions.',
      category: 'Place',
      saved: false,
    };
    setDiscoveries(prev => [newDiscovery, ...prev]);
  };

  const captureMemory = (title: string, caption: string, type: MemoryItem['type']) => {
    if (!activeJourney) return;

    // Create a visual memory
    const newMemory: MemoryItem = {
      title: title || 'Captured Moment',
      location: activeJourney.stops[activeJourney.stops.length - 1] || 'Along Route',
      caption: caption || 'No caption provided.',
      time: 'Just now',
      type,
    };

    setMemories((prev) => [newMemory, ...prev]);

    // Add visual mark to active journey stops
    setActiveJourney(current => {
      if (!current) return null;
      return {
        ...current,
        stops: [...current.stops, title || 'Photo Pin']
      };
    });
  };

  const endCurrentJourney = (): Journey => {
    if (!activeJourney) throw new Error('No active journey to end');

    setIsTracking(false);

    // Format final summary
    const formattedDuration = `${Math.floor(activeJourney.durationSec / 60)}m ${activeJourney.durationSec % 60}s`;
    const formattedDistance = `${(activeJourney.distanceMeters / 1000).toFixed(2)} km`;

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
      stops: activeJourney.stops,
      tags: [activeJourney.mood, 'Fresh track', 'Explored'],
    };

    setJourneys((prev) => [completedJourney, ...prev]);
    setActiveJourney(null);

    return completedJourney;
  };

  const toggleSaveDiscovery = (title: string) => {
    setDiscoveries(prev => prev.map(item => 
      item.title === title ? { ...item, saved: !item.saved } : item
    ));
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
      login,
      signup,
      logout,
      startNewJourney,
      addCheckpoint,
      captureMemory,
      endCurrentJourney,
      toggleSaveDiscovery,
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
