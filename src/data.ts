import type {
  DiscoveryItem,
  Journey,
  MapNode,
  MapRoute,
  MemoryItem,
  DailyJourney,
} from './types';

export const journeys: Journey[] = [
  {
    id: 'j-101',
    title: 'Midnight Market Loop',
    date: 'Tue, May 28',
    status: 'Live',
    duration: '2h 14m',
    distance: '6.8 km',
    mood: 'Curious',
    location: 'Shoreline District',
    narrative:
      'A slow city loop through food stalls, neon alleys, and an unexpected jazz set under the station bridge.',
    color: 'from-cyan-400 to-indigo-500',
    stops: ['Station Steps', 'Tea Stall Row', 'Bridge Stage', 'Night Tram'],
    tags: ['Night walk', 'Soundtracked', 'Spontaneous'],
  },
  {
    id: 'j-102',
    title: 'Rain Archive Walk',
    date: 'Sun, May 26',
    status: 'Completed',
    duration: '1h 42m',
    distance: '4.2 km',
    mood: 'Reflective',
    location: 'Old Quarter',
    narrative:
      'Collected storefront reflections, handwritten menus, and the kind of quiet that makes a city feel personal.',
    color: 'from-emerald-400 to-teal-500',
    stops: ['Book Arcade', 'Cobbled Lane', 'Back Courtyard', 'Cafe Glasshouse'],
    tags: ['Rain', 'Story-rich', 'Urban'],
  },
  {
    id: 'j-103',
    title: 'Gallery Detour',
    date: 'Fri, May 24',
    status: 'Planned',
    duration: '3h 00m',
    distance: '9.1 km',
    mood: 'Intentional',
    location: 'Museum Belt',
    narrative:
      'A planned route for the week ahead with a film screening, museum stop, and a quiet train ride home.',
    color: 'from-fuchsia-400 to-violet-500',
    stops: ['River Platform', 'Modern Art Hall', 'Cinema District', 'Home Line'],
    tags: ['Culture', 'Planned', 'Transit'],
  },
];

export const memories: MemoryItem[] = [
  {
    title: 'Steam from the cart',
    location: 'Tea Stall Row',
    caption: 'The air smelled like cardamom and wet asphalt.',
    time: '18 min ago',
    type: 'Photo',
  },
  {
    title: 'Bridge jazz note',
    location: 'Bridge Stage',
    caption: 'A saxophone line matched the train rhythm below.',
    time: '43 min ago',
    type: 'Clip',
  },
  {
    title: 'Menu tucked in pocket',
    location: 'Book Arcade',
    caption: 'Paper receipt, handwritten prices, and a memory worth keeping.',
    time: 'Yesterday',
    type: 'Artifact',
  },
  {
    title: 'Window reflection',
    location: 'Night Tram',
    caption: 'City lights layered over a half-finished thought.',
    time: '2 days ago',
    type: 'Note',
  },
];

export const discoveries: DiscoveryItem[] = [
  {
    title: 'Late-hour tea cart',
    detail: 'Open until 1:30 AM. Better after rain.',
    category: 'Place',
    saved: true,
  },
  {
    title: 'Bridge Session Series',
    detail: 'Weekly live jazz under the south viaduct.',
    category: 'Event',
    saved: true,
  },
  {
    title: 'New walking corridor',
    detail: 'A quieter route between the station and riverfront.',
    category: 'Route',
    saved: false,
  },
  {
    title: 'Cafe with archive wall',
    detail: 'Local zines, neighborhood photos, and excellent espresso.',
    category: 'Place',
    saved: true,
  },
];

// ============================================
// LIFE MAP - Real Map Data with Geographic Coordinates
// ============================================

// Center point for the map (example city - can be customized)
export const MAP_CENTER: [number, number] = [40.758, -73.9855]; // Times Square, NYC area
export const MAP_ZOOM = 13;

// ============================================
// TODAY'S JOURNEY - May 31
// ============================================

export const todayNodes: MapNode[] = [
  {
    name: 'Home',
    label: 'Apartment 12B',
    lat: 40.7484,
    lng: -73.9857,
    kind: 'home',
    date: 'May 31, 2024',
    time: '5:30 AM',
    timestamp: 'Today, 5:30 AM',
    mood: 'Rested',
    photo:
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop',
    photos: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop',
    ],
    description:
      'Your sanctuary. Where every journey begins and ends. The constant in a life of motion.',
    tags: ['Home', 'Sanctuary', 'Base'],
    connectedItems: [
      {
        type: 'note',
        title: 'Morning thought',
        icon: '💭',
        preview: 'Another day begins...',
      },
    ],
  },
  {
    name: 'Riverside Park',
    label: 'Morning Run',
    lat: 40.7527,
    lng: -73.9772,
    kind: 'journey',
    date: 'May 31, 2024',
    time: '5:45 AM',
    timestamp: 'Today, 5:45 AM',
    mood: 'Energized',
    photo:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    photos: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    ],
    description:
      'The familiar riverside loop. 3.2km of meditation in motion. The water catches the first light.',
    tags: ['Running', 'Routine', 'River'],
    routeDetails: {
      distance: '3.2 km',
      duration: '18 min',
      elevation: '+12m',
    },
    connectedItems: [
      { type: 'memory', title: 'Heart rate', icon: '💓', preview: '142 bpm avg' },
      { type: 'note', title: 'Felt strong', icon: '💪', preview: 'Best pace in weeks' },
    ],
  },
  {
    name: 'Sunrise Overlook',
    label: 'Sunrise Photo',
    lat: 40.758,
    lng: -73.969,
    kind: 'memory',
    date: 'May 31, 2024',
    time: '6:05 AM',
    timestamp: 'Today, 6:05 AM',
    mood: 'Awestruck',
    photo:
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=300&fit=crop',
    photos: [
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=300&fit=crop',
    ],
    description:
      'Stopped to capture the moment the sun broke through the clouds. The river turned to gold.',
    tags: ['Photography', 'Sunrise', 'Golden Hour'],
    connectedItems: [
      { type: 'memory', title: 'Photo captured', icon: '📸', preview: 'ISO 200, f/2.8' },
    ],
  },
  {
    name: 'Hidden Cafe',
    label: 'Cafe Discovery',
    lat: 40.7614,
    lng: -73.9776,
    kind: 'discovery',
    date: 'May 31, 2024',
    time: '6:30 AM',
    timestamp: 'Today, 6:30 AM',
    mood: 'Delighted',
    photo:
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=300&fit=crop',
    photos: [
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=300&fit=crop',
    ],
    description:
      'Tucked behind an old bookstore. The barista recommended a single-origin Ethiopian. Perfect post-run ritual.',
    tags: ['Coffee', 'Discovery', 'Hidden Gem'],
    connectedItems: [
      {
        type: 'discovery',
        title: 'Ethiopian Yirgacheffe',
        icon: '☕',
        preview: 'Floral, citrus notes',
      },
      { type: 'note', title: 'Must return', icon: '⭐', preview: 'Ask for Maria' },
    ],
  },
  {
    name: 'City Center',
    label: 'Work Hub',
    lat: 40.758,
    lng: -73.9855,
    kind: 'journey',
    date: 'May 31, 2024',
    time: '8:30 AM',
    timestamp: 'Today, 8:30 AM',
    mood: 'Focused',
    photo:
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=300&fit=crop',
    photos: [
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=300&fit=crop',
    ],
    description:
      'The daily commute. A 15-minute walk through the bustling city center. Always something new to observe.',
    tags: ['Work', 'Commute', 'Urban'],
    routeDetails: {
      distance: '1.2 km',
      duration: '15 min',
      elevation: '+5m',
    },
    connectedItems: [
      { type: 'memory', title: 'Street musician', icon: '🎵', preview: 'Jazz on saxophone' },
    ],
  },
  {
    name: 'Central Park Bench',
    label: 'Lunch Break',
    lat: 40.7644,
    lng: -73.9734,
    kind: 'memory',
    date: 'May 31, 2024',
    time: '12:30 PM',
    timestamp: 'Today, 12:30 PM',
    mood: 'Peaceful',
    photo:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
    photos: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
    ],
    description:
      'The quiet corner of Central Park. Where I read, think, and watch the world go by.',
    tags: ['Reading', 'Nature', 'Break'],
    connectedItems: [
      { type: 'note', title: 'Reading: Sapiens', icon: '📖', preview: 'Page 142' },
      { type: 'memory', title: 'Squirrel visitor', icon: '🐿️', preview: 'Bold little guy' },
    ],
  },
  {
    name: 'Evening Market',
    label: 'Street Food',
    lat: 40.7527,
    lng: -73.9912,
    kind: 'discovery',
    date: 'May 31, 2024',
    time: '6:00 PM',
    timestamp: 'Today, 6:00 PM',
    mood: 'Excited',
    photo:
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop',
    photos: [
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop',
    ],
    description:
      'A new vendor set up today. Amazing Thai fusion tacos. The kind of find that makes you want to come back every week.',
    tags: ['Food', 'Market', 'Evening'],
    connectedItems: [
      { type: 'discovery', title: 'Pad Thai Taco', icon: '🌮', preview: 'Best new find!' },
      { type: 'note', title: 'Bring friends', icon: '👥', preview: 'Next Friday?' },
    ],
  },
];

export const todayRoutes: MapRoute[] = [
  {
    id: 'route-t1',
    from: 'Home',
    to: 'Riverside Park',
    pathCoords: [
      [-73.9857, 40.7484],
      [-73.984, 40.7495],
      [-73.981, 40.751],
      [-73.9772, 40.7527],
    ],
    label: 'Morning Start',
    distance: '1.8 km',
    duration: '10 min',
  },
  {
    id: 'route-t2',
    from: 'Riverside Park',
    to: 'Sunrise Overlook',
    pathCoords: [
      [-73.9772, 40.7527],
      [-73.975, 40.754],
      [-73.972, 40.756],
      [-73.969, 40.758],
    ],
    label: 'Run Continues',
    distance: '0.8 km',
    duration: '5 min',
  },
  {
    id: 'route-t3',
    from: 'Sunrise Overlook',
    to: 'Hidden Cafe',
    pathCoords: [
      [-73.969, 40.758],
      [-73.971, 40.759],
      [-73.974, 40.76],
      [-73.9776, 40.7614],
    ],
    label: 'Discovery Path',
    distance: '0.6 km',
    duration: '8 min',
  },
  {
    id: 'route-t4',
    from: 'Hidden Cafe',
    to: 'City Center',
    pathCoords: [
      [-73.9776, 40.7614],
      [-73.98, 40.7605],
      [-73.983, 40.759],
      [-73.9855, 40.758],
    ],
    label: 'Commute',
    distance: '2.1 km',
    duration: '12 min',
  },
  {
    id: 'route-t5',
    from: 'City Center',
    to: 'Central Park Bench',
    pathCoords: [
      [-73.9855, 40.758],
      [-73.982, 40.76],
      [-73.978, 40.762],
      [-73.9734, 40.7644],
    ],
    label: 'Lunch Walk',
    distance: '0.5 km',
    duration: '6 min',
  },
  {
    id: 'route-t6',
    from: 'Central Park Bench',
    to: 'Evening Market',
    pathCoords: [
      [-73.9734, 40.7644],
      [-73.978, 40.761],
      [-73.985, 40.757],
      [-73.9912, 40.7527],
    ],
    label: 'Evening Explore',
    distance: '1.3 km',
    duration: '15 min',
  },
];

// ============================================
// YESTERDAY'S JOURNEY - May 30
// ============================================

export const yesterdayNodes: MapNode[] = [
  {
    name: 'Home',
    label: 'Apartment 12B',
    lat: 40.7484,
    lng: -73.9857,
    kind: 'home',
    date: 'May 30, 2024',
    time: '6:00 AM',
    timestamp: 'Yesterday, 6:00 AM',
    mood: 'Rested',
    photo:
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop',
    description: 'Starting point for yesterday adventures.',
    tags: ['Home', 'Base'],
  },
  {
    name: 'Gym',
    label: 'Morning Workout',
    lat: 40.7505,
    lng: -73.9934,
    kind: 'journey',
    date: 'May 30, 2024',
    time: '6:30 AM',
    timestamp: 'Yesterday, 6:30 AM',
    mood: 'Energized',
    photo:
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop',
    description: 'Leg day. Pushed through the last set.',
    tags: ['Fitness', 'Workout'],
    routeDetails: {
      distance: '0.8 km',
      duration: '10 min',
      elevation: '+3m',
    },
  },
  {
    name: 'Farmer Market',
    label: 'Fresh Produce',
    lat: 40.7558,
    lng: -73.9903,
    kind: 'discovery',
    date: 'May 30, 2024',
    time: '9:00 AM',
    timestamp: 'Yesterday, 9:00 AM',
    mood: 'Delighted',
    photo:
      'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400&h=300&fit=crop',
    description:
      'Found amazing heirloom tomatoes and fresh basil. Made pesto for dinner.',
    tags: ['Market', 'Food', 'Fresh'],
    connectedItems: [
      {
        type: 'discovery',
        title: 'Heirloom Tomatoes',
        icon: '🍅',
        preview: 'Best in season',
      },
    ],
  },
  {
    name: 'Bookstore',
    label: 'Afternoon Reading',
    lat: 40.759,
    lng: -73.9845,
    kind: 'memory',
    date: 'May 30, 2024',
    time: '2:00 PM',
    timestamp: 'Yesterday, 2:00 PM',
    mood: 'Peaceful',
    photo:
      'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=400&h=300&fit=crop',
    description: 'Spent hours browsing the travel section. Found a rare photography book.',
    tags: ['Books', 'Reading', 'Discovery'],
  },
];

export const yesterdayRoutes: MapRoute[] = [
  {
    id: 'route-y1',
    from: 'Home',
    to: 'Gym',
    pathCoords: [
      [-73.9857, 40.7484],
      [-73.988, 40.749],
      [-73.991, 40.75],
      [-73.9934, 40.7505],
    ],
    label: 'Morning Walk',
    distance: '0.8 km',
    duration: '10 min',
  },
  {
    id: 'route-y2',
    from: 'Gym',
    to: 'Farmer Market',
    pathCoords: [
      [-73.9934, 40.7505],
      [-73.992, 40.752],
      [-73.991, 40.754],
      [-73.9903, 40.7558],
    ],
    label: 'To Market',
    distance: '0.6 km',
    duration: '8 min',
  },
  {
    id: 'route-y3',
    from: 'Farmer Market',
    to: 'Bookstore',
    pathCoords: [
      [-73.9903, 40.7558],
      [-73.988, 40.757],
      [-73.986, 40.758],
      [-73.9845, 40.759],
    ],
    label: 'Afternoon Stroll',
    distance: '0.5 km',
    duration: '7 min',
  },
];

// ============================================
// COMBINED DATA FOR MAP
// ============================================

export const lifeNodes: MapNode[] = [...todayNodes, ...yesterdayNodes];
export const lifeRoutes: MapRoute[] = [...todayRoutes, ...yesterdayRoutes];

// ============================================
// DAILY JOURNEYS ORGANIZATION
// ============================================

export const dailyJourneys: DailyJourney[] = [
  {
    date: '2024-05-31',
    dayLabel: 'Today',
    nodes: todayNodes,
    routes: todayRoutes,
    summary: {
      totalDistance: '8.3 km',
      totalTime: '1h 16m',
      locationsVisited: todayNodes.length,
      mood: 'Adventurous',
    },
  },
  {
    date: '2024-05-30',
    dayLabel: 'Yesterday',
    nodes: yesterdayNodes,
    routes: yesterdayRoutes,
    summary: {
      totalDistance: '5.1 km',
      totalTime: '45m',
      locationsVisited: yesterdayNodes.length,
      mood: 'Active',
    },
  },
];