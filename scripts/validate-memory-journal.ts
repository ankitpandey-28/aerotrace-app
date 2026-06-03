/**
 * Memory Journal validation — simulates a Bihar test journey save/load cycle.
 * Run: npx tsx scripts/validate-memory-journal.ts
 */
import { buildGpsRoute, buildLifeMapNodes } from '../src/services/buildLifeMapNodes';
import { toDailyJourney } from '../src/services/journeyStorage';
import type { SavedJourney } from '../src/services/journeyStorage';

const BIHAR = { lat: 25.5941, lng: 85.1376 };
const TEST_DATE = '2026-06-01';

const testJourney: SavedJourney = {
  id: 'journey-validation-test',
  journeyName: 'Patna Memory Journal Test',
  date: TEST_DATE,
  dateLabel: 'Sunday, June 1, 2026',
  startTime: '08:00 AM',
  endTime: '10:30 AM',
  totalDuration: '2h 30m',
  totalDistance: '4.2 km',
  totalLocations: 4,
  totalMemories: 2,
  totalDiscoveries: 2,
  mood: 'Curious',
  stops: [
    { name: 'Gandhi Maidan', time: '08:15 AM', memoryCount: 0 },
    { name: 'River Ghat', time: '09:00 AM', memoryCount: 0 },
  ],
  memories: [
    {
      id: 'mem-1',
      title: 'Morning Chai at Maidan',
      note: 'Shared tea with friends before the walk along the river.',
      photo: 'data:image/png;base64,test1',
      timestamp: '2026-06-01T08:20:00.000Z',
      location: 'Gandhi Maidan',
      lat: 25.609,
      lng: 85.142,
      mood: 'Happy',
      discovery: 'Street chai cart',
      tags: ['Food'],
    },
    {
      id: 'mem-2',
      title: 'Ghat Sunrise',
      note: 'Golden light on the Ganges — quiet and reflective.',
      photo: 'data:image/png;base64,test2',
      timestamp: '2026-06-01T09:05:00.000Z',
      location: 'River Ghat',
      lat: 25.588,
      lng: 85.128,
      mood: 'Peaceful',
      discovery: 'Hidden ghat steps',
      tags: ['Nature'],
    },
  ],
  discoveries: [
    { emoji: '☕', title: 'Street chai cart', detail: 'Best masala chai near the maidan' },
    { emoji: '🌅', title: 'Hidden ghat steps', detail: 'Quiet viewpoint below the main road' },
  ],
  notes: '',
  storySummary:
    'Your journey began at gandhi maidan, collecting moments along the Ganges. Two memories captured with real GPS.',
  nodes: [],
  routes: [],
  savedAt: new Date().toISOString(),
};

const getCoordsForStop = (idx: number) => ({
  lat: idx === 0 ? BIHAR.lat : BIHAR.lat - 0.006,
  lng: idx === 0 ? BIHAR.lng : BIHAR.lng - 0.009,
  timestamp: testJourney.memories[idx]?.timestamp,
});

testJourney.nodes = buildLifeMapNodes({
  journeyName: testJourney.journeyName,
  dateLabel: testJourney.dateLabel,
  mood: testJourney.mood,
  storySummary: testJourney.storySummary,
  totalDistance: testJourney.totalDistance,
  totalDuration: testJourney.totalDuration,
  stops: testJourney.stops,
  memories: testJourney.memories,
  discoveries: testJourney.discoveries,
  getCoordsForStop,
});

testJourney.routes = buildGpsRoute(
  testJourney.nodes,
  [
    { lat: BIHAR.lat, lng: BIHAR.lng },
    { lat: BIHAR.lat - 0.003, lng: BIHAR.lng - 0.004 },
    { lat: BIHAR.lat - 0.006, lng: BIHAR.lng - 0.009 },
  ],
  testJourney.journeyName,
  testJourney.totalDistance,
  testJourney.totalDuration
);

// Simulate localStorage round-trip
const storage = new Map<string, string>();
storage.set('aerotrace_saved_journeys', JSON.stringify([testJourney]));

(globalThis as unknown as { localStorage: Storage }).localStorage = {
  getItem: (k: string) => storage.get(k) ?? null,
  setItem: (k: string, v: string) => storage.set(k, v),
  removeItem: (k: string) => storage.delete(k),
  clear: () => storage.clear(),
  key: () => null,
  length: 0,
};

const daily = toDailyJourney(TEST_DATE);
const memoryNode = daily?.nodes.find((n) => n.kind === 'memory' && n.name === 'Morning Chai at Maidan');
const checkpointNode = daily?.nodes.find((n) => n.kind === 'journey');
const discoveryItems = memoryNode?.connectedItems?.filter((i) => i.type === 'discovery');

type Check = { id: string; pass: boolean; detail: string };

const checks: Check[] = [
  {
    id: 'A',
    pass: !!memoryNode,
    detail: 'Memory marker node exists in saved → daily journey pipeline',
  },
  {
    id: 'B',
    pass: !!(memoryNode?.photos?.length || memoryNode?.photo),
    detail: 'Polaroid gallery data (photo URLs) present on memory node',
  },
  {
    id: 'C',
    pass: !!memoryNode?.description?.includes('tea'),
    detail: 'Personal note renders from saved memory.note',
  },
  {
    id: 'D',
    pass: !!memoryNode?.connectedItems?.some((i) => i.type === 'discovery'),
    detail: 'Discovery items attached from saved memory.discovery',
  },
  {
    id: 'E',
    pass: !!daily?.storySummary?.includes('journey began'),
    detail: 'Story summary on DailyJourney from saved journey.storySummary',
  },
  {
    id: 'E2',
    pass: (discoveryItems?.length ?? 0) > 0,
    detail: 'Discoveries section filters discovery-type connectedItems only',
  },
  {
    id: 'F',
    pass: memoryNode?.timestamp === '2026-06-01T08:20:00.000Z',
    detail: 'ISO timestamp preserved from saved memory object',
  },
  {
    id: 'G',
    pass:
      memoryNode?.lat === 25.609 &&
      memoryNode?.lng === 85.142 &&
      !memoryNode.name.includes('Riverside'),
    detail: 'GPS coords from saved memory (Bihar), not hardcoded demo NYC data',
  },
  {
    id: 'H',
    pass: checkpointNode?.kind === 'journey',
    detail: 'Checkpoint markers use journey kind (checkpoint info)',
  },
  {
    id: 'I',
    pass: memoryNode?.kind === 'memory',
    detail: 'Memory markers use memory kind (memory content)',
  },
  {
    id: 'J',
    pass: memoryNode?.mood === 'Happy',
    detail: 'Per-memory mood preserved (not only journey-level mood)',
  },
];

console.log('\n=== AeroTrace Memory Journal Validation ===\n');
console.log(`Test journey: ${testJourney.journeyName}`);
console.log(`Region: Patna, Bihar (${BIHAR.lat}, ${BIHAR.lng})`);
console.log(`Nodes: ${daily?.nodes.length} | Routes: ${daily?.routes.length}\n`);

let allPass = true;
for (const c of checks) {
  const status = c.pass ? 'PASS' : 'FAIL';
  if (!c.pass) allPass = false;
  console.log(`[${status}] ${c.id}. ${c.detail}`);
}

console.log('\n--- Drawer field simulation (memory node) ---');
if (memoryNode) {
  console.log(`  Location: ${memoryNode.name}`);
  console.log(`  Date: ${memoryNode.date}`);
  console.log(`  Time/TS: ${memoryNode.timestamp}`);
  console.log(`  Mood: ${memoryNode.mood}`);
  console.log(`  Photos: ${memoryNode.photos?.length ?? 0}`);
  console.log(`  Note: ${memoryNode.description?.slice(0, 50)}...`);
  console.log(`  Discoveries: ${discoveryItems?.map((i) => i.title).join(', ')}`);
}
console.log('\n--- Drawer lower sections (scroll target) ---');
console.log(`  Discoveries render: ${(discoveryItems?.length ?? 0) > 0 ? 'YES' : 'NO'}`);
console.log(`  Story Summary render: ${daily?.storySummary ? 'YES' : 'NO'}`);
if (daily?.storySummary) {
  console.log(`  Story preview: ${daily.storySummary.slice(0, 80)}...`);
}

console.log(
  allPass
    ? '\n✅ ALL CHECKS PASSED — Life Map memory journal ready for Discoveries phase.\n'
    : '\n❌ SOME CHECKS FAILED — see details above.\n'
);

process.exit(allPass ? 0 : 1);
