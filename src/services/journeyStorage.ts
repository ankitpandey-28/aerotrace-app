import type { MapNode, MapRoute, DailyJourney, MoodType } from '../types';

// ============================================
// JOURNEY STORAGE SERVICE
// Persists journey data to localStorage
// Connects Journey Summary → Life Map
// ============================================

const STORAGE_KEY = 'aerotrace_saved_journeys';

// ============================================
// SAVED JOURNEY - Complete journey record
// ============================================
export interface SavedJourneyStop {
  name: string;
  time: string;
  memoryCount: number;
  lat?: number;
  lng?: number;
}

export interface SavedJourneyMemory {
  id: string;
  title: string;
  note: string;
  photo: string;
  timestamp: string;
  location: string;
}

export interface SavedJourneyDiscovery {
  emoji: string;
  title: string;
  detail: string;
}

export interface SavedJourney {
  id: string;
  journeyName: string;
  date: string;           // ISO date string (YYYY-MM-DD)
  dateLabel: string;       // Human-readable: "Saturday, May 31"
  startTime: string;
  endTime: string;
  totalDuration: string;
  totalDistance: string;
  totalLocations: number;
  totalMemories: number;
  totalDiscoveries: number;
  mood: MoodType | string;
  stops: SavedJourneyStop[];
  memories: SavedJourneyMemory[];
  discoveries: SavedJourneyDiscovery[];
  notes: string;
  storySummary: string;
  // Map data
  nodes: MapNode[];
  routes: MapRoute[];
  savedAt: string;        // ISO timestamp
}

// ============================================
// STORAGE OPERATIONS
// ============================================

/** Get all saved journeys from localStorage */
export function getSavedJourneys(): SavedJourney[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Save a new journey to localStorage */
export function saveJourney(journey: SavedJourney): void {
  const existing = getSavedJourneys();
  // Replace if same ID exists, otherwise prepend
  const idx = existing.findIndex(j => j.id === journey.id);
  if (idx >= 0) {
    existing[idx] = journey;
  } else {
    existing.unshift(journey);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

/** Delete a saved journey */
export function deleteJourney(id: string): void {
  const existing = getSavedJourneys();
  const filtered = existing.filter(j => j.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

/** Get a single journey by ID */
export function getJourneyById(id: string): SavedJourney | undefined {
  return getSavedJourneys().find(j => j.id === id);
}

/** Get journeys for a specific date (YYYY-MM-DD) */
export function getJourneysByDate(date: string): SavedJourney[] {
  return getSavedJourneys().filter(j => j.date === date);
}

/** Get all unique dates that have journeys */
export function getJourneyDates(): string[] {
  const journeys = getSavedJourneys();
  const dates = [...new Set(journeys.map(j => j.date))];
  return dates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
}

// ============================================
// CONVERSION: SavedJourney → DailyJourney (for map)
// ============================================

/** Convert saved journeys for a date into a DailyJourney for the map */
export function toDailyJourney(date: string): DailyJourney | null {
  const journeys = getJourneysByDate(date);
  if (journeys.length === 0) return null;

  // Merge all journeys for the day
  const allNodes: MapNode[] = [];
  const allRoutes: MapRoute[] = [];
  let totalDistanceKm = 0;
  let totalTimeMin = 0;
  let overallMood = journeys[0].mood;

  journeys.forEach(journey => {
    // Use pre-built nodes if available, otherwise build from stops
    if (journey.nodes && journey.nodes.length > 0) {
      allNodes.push(...journey.nodes);
    } else {
      // Build MapNodes from stops
      journey.stops.forEach((stop, idx) => {
        const lat = stop.lat || (40.7484 + (idx * 0.004) + (Math.random() * 0.002));
        const lng = stop.lng || (-73.9857 + (idx * 0.003) + (Math.random() * 0.002));

        // Find memories at this location
        const locationMemories = journey.memories.filter(m => m.location === stop.name);
        const photos = locationMemories.map(m => m.photo).filter(Boolean);
        const notes = locationMemories.map(m => m.note).filter(Boolean).join(' ');

        // Find discoveries at this location
        const locationDiscoveries = journey.discoveries.filter(d =>
          d.title.toLowerCase().includes(stop.name.toLowerCase()) ||
          stop.name.toLowerCase().includes(d.title.toLowerCase())
        );

        const kind = idx === 0 ? 'home' as const :
                     locationMemories.length > 0 ? 'memory' as const :
                     locationDiscoveries.length > 0 ? 'discovery' as const :
                     'journey' as const;

        const node: MapNode = {
          name: stop.name,
          label: kind === 'home' ? 'Starting Point' :
                 kind === 'memory' ? `${locationMemories.length} memor${locationMemories.length === 1 ? 'y' : 'ies'}` :
                 kind === 'discovery' ? 'Discovery' :
                 'Checkpoint',
          lat,
          lng,
          kind,
          date: journey.dateLabel,
          time: stop.time,
          timestamp: `${stop.time}`,
          mood: journey.mood,
          photo: photos[0] || undefined,
          photos: photos.length > 0 ? photos : undefined,
          description: notes || undefined,
          tags: journey.memories
            .filter(m => m.location === stop.name)
            .map(m => m.title)
            .slice(0, 3),
          connectedItems: [
            ...locationMemories.map(m => ({
              type: 'memory' as const,
              title: m.title,
              icon: '📸',
              preview: m.note.substring(0, 50),
            })),
            ...locationDiscoveries.map(d => ({
              type: 'discovery' as const,
              title: d.title,
              icon: d.emoji,
              preview: d.detail.substring(0, 50),
            })),
          ],
          storyContent: idx === journey.stops.length - 1 ? journey.storySummary : undefined,
        };

        allNodes.push(node);
      });
    }

    // Use pre-built routes if available, otherwise build from stops
    if (journey.routes && journey.routes.length > 0) {
      allRoutes.push(...journey.routes);
    } else {
      // Build routes between consecutive stops
      for (let i = 0; i < allNodes.length - 1; i++) {
        const from = allNodes[i];
        const to = allNodes[i + 1];
        if (from && to) {
          const route: MapRoute = {
            id: `route-${journey.id}-${i}`,
            from: from.name,
            to: to.name,
            pathCoords: [
              [from.lng, from.lat],
              [(from.lng + to.lng) / 2 + (Math.random() * 0.002 - 0.001), (from.lat + to.lat) / 2 + (Math.random() * 0.002 - 0.001)],
              [to.lng, to.lat],
            ],
            distance: `${(Math.random() * 2 + 0.3).toFixed(1)} km`,
            duration: `${Math.floor(Math.random() * 15 + 5)} min`,
          };
          allRoutes.push(route);
        }
      }
    }

    // Parse distance
    const distMatch = journey.totalDistance.match(/([\d.]+)/);
    if (distMatch) totalDistanceKm += parseFloat(distMatch[1]);

    // Parse time
    const timeMatch = journey.totalDuration.match(/(\d+)h?\s*(\d+)?m?/);
    if (timeMatch) {
      totalTimeMin += parseInt(timeMatch[1] || '0') * 60 + parseInt(timeMatch[2] || '0');
    }
  });

  // Format day label
  const dateObj = new Date(date + 'T12:00:00');
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  let dayLabel: string;
  if (dateObj.toDateString() === today.toDateString()) {
    dayLabel = 'Today';
  } else if (dateObj.toDateString() === yesterday.toDateString()) {
    dayLabel = 'Yesterday';
  } else {
    dayLabel = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  const hours = Math.floor(totalTimeMin / 60);
  const mins = totalTimeMin % 60;
  const totalTime = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  return {
    date,
    dayLabel,
    nodes: allNodes,
    routes: allRoutes,
    summary: {
      totalDistance: `${totalDistanceKm.toFixed(1)} km`,
      totalTime,
      locationsVisited: allNodes.length,
      mood: overallMood,
    },
  };
}

/** Get all daily journeys from saved data */
export function getAllDailyJourneys(): DailyJourney[] {
  const dates = getJourneyDates();
  return dates
    .map(date => toDailyJourney(date))
    .filter((j): j is DailyJourney => j !== null);
}

/** Check if any journeys exist */
export function hasJourneys(): boolean {
  return getSavedJourneys().length > 0;
}

/** Get the most recent journey date */
export function getMostRecentDate(): string | null {
  const dates = getJourneyDates();
  return dates.length > 0 ? dates[0] : null;
}
