import type {
  Discovery,
  Journey,
  MapNode,
  MapRoute,
  MemoryItem,
  DailyJourney,
} from './types';

export const journeys: Journey[] = [];

export const memories: MemoryItem[] = [];

export const discoveries: Discovery[] = [];

// ============================================
// LIFE MAP - Real Map Data with Geographic Coordinates
// ============================================

// Center point for the map (example city - can be customized)
// Neutral default center — map will fit to journey bounds when real data exists
export const MAP_CENTER: [number, number] = [0, 0];
export const MAP_ZOOM = 2;

// ============================================
// TODAY'S JOURNEY - May 31
// ============================================

export const todayNodes: MapNode[] = [];

export const todayRoutes: MapRoute[] = [];

// ============================================
// YESTERDAY'S JOURNEY - May 30
// ============================================

export const yesterdayNodes: MapNode[] = [];

export const yesterdayRoutes: MapRoute[] = [];

// ============================================
// COMBINED DATA FOR MAP
// ============================================

export const lifeNodes: MapNode[] = [];
export const lifeRoutes: MapRoute[] = [];

// ============================================
// DAILY JOURNEYS ORGANIZATION
// ============================================

export const dailyJourneys: DailyJourney[] = [];