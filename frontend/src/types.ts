export type Page =
  | 'landing'
  | 'login'
  | 'signup'
  | 'dashboard'
  | 'start-journey'
  | 'live-journey'
  | 'journey-summary'
  | 'journey-details'
  | 'memories'
  | 'memories-reel'
  | 'discover'
  | 'life-map'
  | 'safety'
  | 'profile';

export type JourneyStatus = 'Live' | 'Completed' | 'Planned';

export interface Journey {
  id: string;
  title: string;
  date: string;
  status: JourneyStatus;
  duration: string;
  distance: string;
  mood: string;
  location: string;
  narrative: string;
  color: string;
  stops: string[];
  tags: string[];
}

export interface MemoryItem {
  title: string;
  location: string;
  caption: string;
  time: string;
  type: 'Photo' | 'Note' | 'Clip' | 'Artifact';
  lat?: number;
  lng?: number;
  timestamp?: string;
}

// ============================================
// MEMORY JOURNAL - Enhanced Memory Types
// ============================================

export type MoodType = 
  | 'Curious' 
  | 'Happy' 
  | 'Excited' 
  | 'Peaceful' 
  | 'Reflective' 
  | 'Adventurous' 
  | 'Nostalgic';

export interface Memory {
  id: string;
  title: string;
  note: string;
  discovery: string;
  mood: MoodType;
  tags: string[];
  photos: string[];
  location: string;
  timestamp: string;
  journeyId?: string;
  lat?: number;
  lng?: number;
}

// Suggested tags for quick selection
export const SUGGESTED_TAGS = [
  'Cafe',
  'Friends',
  'Travel',
  'Food',
  'Study',
  'Nature',
  'Music',
  'Art',
  'Shopping',
  'Exercise',
  'Family',
  'Work',
  'Sunset',
  'City',
  'Beach',
  'Mountain'
] as const;

export const MOOD_OPTIONS: { value: MoodType; emoji: string; color: string }[] = [
  { value: 'Curious', emoji: '🔍', color: 'from-purple-400 to-indigo-500' },
  { value: 'Happy', emoji: '😊', color: 'from-yellow-400 to-amber-500' },
  { value: 'Excited', emoji: '🤩', color: 'from-orange-400 to-red-500' },
  { value: 'Peaceful', emoji: '😌', color: 'from-green-400 to-emerald-500' },
  { value: 'Reflective', emoji: '🤔', color: 'from-blue-400 to-cyan-500' },
  { value: 'Adventurous', emoji: '🗺️', color: 'from-rose-400 to-pink-500' },
  { value: 'Nostalgic', emoji: '🌅', color: 'from-violet-400 to-purple-500' },
];

export type DiscoveryCategory = 
  | 'Food' 
  | 'Cafe' 
  | 'Nature' 
  | 'Landmark' 
  | 'Viewpoint' 
  | 'Hidden Gem' 
  | 'Activity' 
  | 'Personal';

export type DiscoveryCreationSource = 'manual' | 'discovery-field' | 'suggested';

export interface Discovery {
  id: string;
  title: string;
  category: DiscoveryCategory;
  description: string;
  lat?: number;
  lng?: number;
  timestamp: string;
  
  // Core Media & Organization
  coverPhoto?: string;
  photo?: string;
  tags?: string[];
  
  // Relations
  sourceMemoryId?: string;
  sourceJourneyId?: string;
  locationName: string;
  
  // Engagement Metadata
  isFavorite?: boolean;
  visitCount?: number;
  lastVisited?: string;
  
  // Analytics & Telemetry
  creationSource: DiscoveryCreationSource;
  
  // Future Compatibility (Community)
  visibility?: 'private' | 'public';
  authorId?: string;
  likes?: number;
  commentsCount?: number;
}

// ============================================
// LIFE MAP - Real Map Types
// ============================================

export type NodeKind = 'home' | 'journey' | 'memory' | 'discovery' | 'story';

export interface MapNode {
  name: string;
  label: string;
  // Geographic coordinates (replaces x/y)
  lat: number;
  lng: number;
  kind: NodeKind;
  // Rich content for the node
  photo?: string;
  photos?: string[]; // Multiple photos for gallery
  description?: string;
  timestamp?: string;
  date?: string; // Full date for organization
  time?: string; // Time of visit
  mood?: string;
  tags?: string[];
  // For journey nodes, the route details
  routeDetails?: {
    distance: string;
    duration: string;
    elevation: string;
  };
  // For story nodes
  storyContent?: string;
  // Connected memories/discoveries
  connectedItems?: Array<{
    type: 'memory' | 'discovery' | 'note';
    title: string;
    icon: string;
    preview: string;
  }>;
}

export interface MapRoute {
  id: string;
  from: string; // node name
  to: string; // node name
  // Geographic path (array of lat/lng points)
  pathCoords: Array<[number, number]>;
  label?: string;
  distance?: string;
  duration?: string;
}

// ============================================
// Daily Journey Organization
// ============================================

export interface DailyJourney {
  date: string;
  dayLabel: string; // e.g., "Today", "Yesterday", "May 29"
  nodes: MapNode[];
  routes: MapRoute[];
  storySummary?: string;
  summary: {
    totalDistance: string;
    totalTime: string;
    locationsVisited: number;
    mood?: string;
  };
}

// Legacy types for backward compatibility (deprecated)
export interface LegacyMapNode {
  name: string;
  label: string;
  x: number; // Deprecated - use lat/lng
  y: number; // Deprecated - use lat/lng
  kind: NodeKind;
  photo?: string;
  description?: string;
  timestamp?: string;
  mood?: string;
  tags?: string[];
  routeDetails?: {
    distance: string;
    duration: string;
    elevation: string;
  };
  storyContent?: string;
  thumbnailRotation?: number;
  thumbnailScale?: number;
  connectedItems?: Array<{
    type: 'memory' | 'discovery' | 'note';
    title: string;
    icon: string;
    preview: string;
  }>;
}

export interface LegacyMapRoute {
  id: string;
  from: string;
  to: string;
  path: string; // SVG path - deprecated
  label?: string;
  distance?: string;
  duration?: string;
  journeyStyle?: {
    strokePattern: 'solid' | 'dashed' | 'dotted' | 'hand-drawn';
    animated: boolean;
    showMarkers: boolean;
  };
}