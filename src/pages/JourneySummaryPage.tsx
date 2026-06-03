import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigation } from '../context/NavigationContext';
import { useJourney } from '../context/JourneyContext';
import { useMemory } from '../context/MemoryContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import MetricCard from '../components/ui/MetricCard';
import Toast from '../components/ui/Toast';
import { saveJourney } from '../services/journeyStorage';
import type { SavedJourney } from '../services/journeyStorage';
import { buildGpsRoute, buildLifeMapNodes } from '../services/buildLifeMapNodes';
import type { MoodType, Discovery, DiscoveryCategory } from '../types';

// ============================================
// JOURNEY SUMMARY PAGE - Complete Experience
// ============================================

// Mock data for enhanced journey summary (simulates what would come from context)
const MOCK_JOURNEY_SUMMARY = {
  journeyName: 'Campus to Cafe Discovery',
  date: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
  startTime: '2:30 PM',
  endTime: '6:45 PM',
  totalDuration: '4h 15m',
  totalDistance: '5.8 km',
  totalLocations: 5,
  totalMemories: 4,
  totalDiscoveries: 3,
  mood: 'Curious' as MoodType,
  stops: [
    { name: 'Home', time: '2:30 PM', memoryCount: 0 },
    { name: 'College', time: '3:15 PM', memoryCount: 1 },
    { name: 'Hidden Coffee Shop', time: '4:30 PM', memoryCount: 2 },
    { name: 'Bookstore Alley', time: '5:45 PM', memoryCount: 0 },
    { name: 'Riverside Park', time: '6:30 PM', memoryCount: 1 },
  ],
  memories: [
    {
      id: 'm1',
      title: 'Campus Garden Bloom',
      note: 'The cherry blossoms were in full bloom near the library steps.',
      photo: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
      timestamp: '3:20 PM',
      location: 'College',
    },
    {
      id: 'm2',
      title: 'Latte Art Masterpiece',
      note: 'The barista created a perfect rosetta pattern. Almost too beautiful to drink.',
      photo: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=300&fit=crop',
      timestamp: '4:35 PM',
      location: 'Hidden Coffee Shop',
    },
    {
      id: 'm3',
      title: 'Vintage Book Find',
      note: 'Found a first edition photography book tucked in the back corner.',
      photo: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=400&h=300&fit=crop',
      timestamp: '5:50 PM',
      location: 'Bookstore Alley',
    },
    {
      id: 'm4',
      title: 'Golden Hour Reflection',
      note: 'The river caught the sunset perfectly. Everything glowed gold.',
      photo: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=300&fit=crop',
      timestamp: '6:35 PM',
      location: 'Riverside Park',
    },
  ],
  discoveries: [
    { emoji: '☕', title: 'Hidden Coffee Shop', detail: 'Behind campus, through the archway' },
    { emoji: '🌳', title: 'Quiet Park Corner', detail: 'Perfect spot for reading, hidden behind the oak trees' },
    { emoji: '📚', title: 'Bookstore Basement Cafe', detail: 'Rare books and excellent espresso' },
  ] as unknown as Discovery[],
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 20,
    },
  },
};

const polaroidVariants = {
  hidden: { opacity: 0, scale: 0.8, rotate: -5 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    rotate: (i % 2 === 0 ? 1 : -1) * (2 + Math.random() * 3),
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
      delay: i * 0.15,
    },
  }),
};

export function JourneySummaryPage() {
  const { go } = useNavigation();
  const { lastCompletedJourney, discoveries: allDiscoveries } = useJourney();
  const { memories: enhancedMemories } = useMemory();

  // State for determining which journey to show
  const [journeyData, setJourneyData] = useState<typeof MOCK_JOURNEY_SUMMARY | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastSub, setToastSub] = useState('');
  // GPS diagnostics state — populated when saving to Life Map
  const [gpsPointCount, setGpsPointCount] = useState<number | null>(null);
  const [routePathCoordsCount, setRoutePathCoordsCount] = useState<number | null>(null);
  const [gpsWarning, setGpsWarning] = useState<string | null>(null);

  // On mount, check if we just ended a journey or use mock data
  useEffect(() => {
    if (lastCompletedJourney) {
      // Find memories that belong to this journey
      const journeyMemories = enhancedMemories.filter(
        (m) => m.journeyId === lastCompletedJourney.id
      );

      console.log('[JourneySummaryPage] Journey Summary memory count:', journeyMemories.length, journeyMemories);

      // Filter discoveries that might match this journey's stops
      const journeyDiscoveries = allDiscoveries.filter((d) =>
        lastCompletedJourney.stops.some(
          (stop) =>
            d.title.toLowerCase().includes(stop.name.toLowerCase()) ||
            stop.name.toLowerCase().includes(d.title.toLowerCase())
        )
      );

      // Convert durationSec to format like "4h 15m" or "15m"
      const hours = Math.floor(lastCompletedJourney.durationSec / 3600);
      const minutes = Math.floor((lastCompletedJourney.durationSec % 3600) / 60);
      const formattedDuration = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

      // Convert distanceMeters to km format
      const formattedDistance = `${(lastCompletedJourney.distanceMeters / 1000).toFixed(2)} km`;

      // Formulate stops
      let displayStops: { name: string; time: string; memoryCount: number }[] = lastCompletedJourney.stops.map((stop, idx) => {
        const stopMemories = journeyMemories.filter((m) => m.location === stop.name);
        return {
          name: stop.name,
          time: stop.time || new Date(Date.now() - (lastCompletedJourney.stops.length - idx) * 5 * 60 * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          memoryCount: stopMemories.length,
        };
      });

      if (displayStops.length === 0) {
        displayStops = [
          { name: lastCompletedJourney.startPoint, time: 'Start', memoryCount: 0 },
          { name: lastCompletedJourney.destination, time: 'End', memoryCount: 0 },
        ];
      }

      // Show GPS diagnostics immediately on page load (before saving)
      const coordCount = lastCompletedJourney.coordinates.length;
      setGpsPointCount(coordCount);

      setJourneyData({
        journeyName: lastCompletedJourney.title,
        date: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
        startTime: new Date(Date.now() - lastCompletedJourney.durationSec * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        endTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        totalDuration: formattedDuration,
        totalDistance: formattedDistance,
        totalLocations: displayStops.length,
        totalMemories: journeyMemories.length,
        totalDiscoveries: journeyDiscoveries.length,
        mood: lastCompletedJourney.mood as any,
        stops: displayStops,
        memories: journeyMemories.map((m) => ({
          id: m.id,
          title: m.title,
          note: m.note,
          photo: m.photos[0] || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
          timestamp: new Date(m.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          location: m.location,
        })),
        discoveries: journeyDiscoveries.map((d) => ({
          ...d,
          category: (d.category || 'Personal') as DiscoveryCategory
        })),
      });
    } else {
      // Fallback to mock data for demo purposes
      setJourneyData(MOCK_JOURNEY_SUMMARY);
    }
  }, [lastCompletedJourney, enhancedMemories, allDiscoveries]);

  // ============================================
  // BUILD & SAVE JOURNEY TO LIFE MAP
  // ============================================
  const handleSaveToLifeMap = () => {
    if (!journeyData) return;
    setIsSaving(true);

    // Build map nodes from stops using real GPS coordinates when available.
    const getCoordsForStop = (idx: number) => {
      const realStop = lastCompletedJourney?.stops.find(s => s.name === journeyData.stops[idx].name);
      if (realStop && realStop.lat !== undefined && realStop.lng !== undefined) {
        return { lat: realStop.lat, lng: realStop.lng, timestamp: (realStop as any).timestamp };
      }
      const coords = lastCompletedJourney?.coordinates || [];
      if (coords.length > 0) {
        const coordIndex = Math.floor((idx / Math.max(1, journeyData.stops.length - 1)) * (coords.length - 1));
        const c = coords[Math.max(0, Math.min(coordIndex, coords.length - 1))];
        return { lat: c.lat, lng: c.lng, timestamp: c.timestamp ? new Date(c.timestamp).toISOString() : undefined };
      }
      return { lat: undefined, lng: undefined, timestamp: undefined };
    };

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];

    const journeyMemories = enhancedMemories.filter(
      (m) => m.journeyId === lastCompletedJourney?.id
    );

    const savedMemories = journeyMemories.map((m) => ({
      id: m.id,
      title: m.title,
      note: m.note,
      photo: m.photos?.[0] || '',
      timestamp: m.timestamp,
      location: m.location,
      lat: m.lat,
      lng: m.lng,
      mood: m.mood,
      discovery: m.discovery,
      tags: m.tags,
    }));

    const memoryDiscoveries: Discovery[] = journeyMemories
      .filter((m) => m.discovery?.trim())
      .map((m) => ({
        id: `discovery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: m.discovery as string,
        category: 'Personal' as DiscoveryCategory,
        description: m.note?.substring(0, 120) || (m.discovery as string),
        timestamp: new Date().toISOString(),
        locationName: m.location,
        lat: m.lat,
        lng: m.lng,
        sourceMemoryId: m.id,
        sourceJourneyId: lastCompletedJourney?.id,
        creationSource: 'discovery-field',
      }));

    const mergedDiscoveries = [
      ...journeyData.discoveries,
      ...memoryDiscoveries.filter(
        (md) => !journeyData.discoveries.some((d) => d.title === md.title)
      ),
    ];

    const storySummary = generateStorySummary();

    const nodes = buildLifeMapNodes({
      journeyName: journeyData.journeyName,
      dateLabel: journeyData.date,
      mood: journeyData.mood,
      storySummary,
      totalDistance: journeyData.totalDistance,
      totalDuration: journeyData.totalDuration,
      stops: journeyData.stops,
      memories: savedMemories,
      discoveries: mergedDiscoveries,
      getCoordsForStop,
    });

    const memoryNodeCount = nodes.filter(n => n.kind === 'memory').length;
    console.log('[JourneySummaryPage] Life Map memory node count (before save):', memoryNodeCount, nodes.filter(n => n.kind === 'memory'));

    const gpsCoords = lastCompletedJourney?.coordinates ?? [];

    // Destructure the new BuildGpsRouteResult — routes is MapRoute[], warning is string|null
    const { routes, warning } = buildGpsRoute(
      nodes,
      gpsCoords,
      journeyData.journeyName,
      journeyData.totalDistance,
      journeyData.totalDuration
    );

    // ── GPS Diagnostics ──────────────────────────────────────────────────────
    const pointCount = gpsCoords.length;
    const pathCount = routes[0]?.pathCoords?.length ?? 0;
    console.log('[JourneySummary] GPS point count (coordinates.length):', pointCount);
    console.log('[JourneySummary] Route pathCoords count:', pathCount);
    if (warning) {
      console.warn('[JourneySummary] GPS route warning:', warning);
    }
    // ────────────────────────────────────────────────────────────────────────

    // Surface diagnostics in the UI
    setGpsPointCount(pointCount);
    setRoutePathCoordsCount(pathCount);
    setGpsWarning(warning);

    const savedJourney: SavedJourney = {
      id: `journey-${Date.now()}`,
      journeyName: journeyData.journeyName,
      date: dateStr,
      dateLabel: journeyData.date,
      startTime: journeyData.startTime,
      endTime: journeyData.endTime,
      totalDuration: journeyData.totalDuration,
      totalDistance: journeyData.totalDistance,
      totalLocations: journeyData.totalLocations,
      totalMemories: journeyData.totalMemories,
      totalDiscoveries: journeyData.totalDiscoveries,
      mood: journeyData.mood,
      stops: journeyData.stops.map((s, idx) => ({
        name: s.name,
        time: s.time,
        memoryCount: s.memoryCount,
        lat: nodes[idx]?.lat,
        lng: nodes[idx]?.lng,
        timestamp: nodes[idx]?.timestamp,
      })),
      memories: savedMemories,
      discoveries: mergedDiscoveries,
      notes: '',
      storySummary,
      nodes,
      routes,
      savedAt: now.toISOString(),
    };

    saveJourney(savedJourney);

    setToastMsg('Journey Saved to Life Map');
    setToastSub('All memories, routes, and discoveries have been archived to your constellation.');
    setShowToast(true);
    setIsSaving(false);

    setTimeout(() => {
      go('life-map');
    }, 2000);
  };

  if (!journeyData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-4xl mb-4">🗺️</div>
          <h2 className="text-xl font-bold text-white">Loading Journey Summary...</h2>
        </div>
      </div>
    );
  }

  const {
    journeyName,
    date,
    startTime,
    endTime,
    totalDuration,
    totalDistance,
    totalLocations,
    totalMemories,
    totalDiscoveries,
    mood,
    stops,
    memories,
    discoveries,
  } = journeyData;

  const getMoodEmoji = (moodValue: string) => {
    const moodMap: Record<string, string> = {
      Curious: '🔍',
      Happy: '😊',
      Excited: '🤩',
      Peaceful: '😌',
      Reflective: '🤔',
      Adventurous: '🗺️',
      Nostalgic: '🌅',
    };
    return moodMap[moodValue] || '✨';
  };

  const generateStorySummary = () => {
    const firstStop = stops[0]?.name || 'home';
    const lastStop = stops[stops.length - 1]?.name || 'the destination';
    const middleStops = stops.slice(1, -1).map(s => s.name).join(', ');
    return `Your journey began at ${firstStop.toLowerCase()}, setting out with a ${mood.toLowerCase()} spirit. 
    ${middleStops ? `Along the way, you explored ${middleStops}, collecting moments and discoveries.` : 'You ventured forth into the unknown.'} 
    The path led you through ${totalDistance} of exploration over ${totalDuration}, 
    capturing ${totalMemories} memories and uncovering ${totalDiscoveries} hidden gems. 
    Your adventure concluded at ${lastStop.toLowerCase()}, another chapter written in your life's map.`;
  };

  const getMoodSummary = () => {
    const summaries: Record<string, string> = {
      Curious: `You spent the day exploring new places and capturing unexpected discoveries. Your curiosity led you to ${totalLocations} unique locations.`,
      Happy: `Joy filled your journey today. Every step was infused with positivity as you visited ${totalLocations} special places.`,
      Excited: `What an exhilarating adventure! Your energy carried you through ${totalDistance} of pure excitement and ${totalMemories} captured moments.`,
      Peaceful: `A serene journey unfolded today. You moved mindfully through ${totalLocations} locations, savoring each moment of tranquility.`,
      Reflective: `A contemplative exploration marked your day. Through ${totalDuration} of introspection, you discovered both external places and internal insights.`,
      Adventurous: `Bold steps defined your journey. You pushed boundaries across ${totalDistance}, turning the ordinary into the extraordinary.`,
      Nostalgic: `Yesterday's echoes guided today's steps. Your nostalgic walk through ${totalLocations} locations wove memories past and present.`,
    };
    return summaries[mood] || `A memorable journey through ${totalLocations} locations and countless moments.`;
  };

  // Determine GPS health status for the diagnostics panel
  const gpsHealthColor = gpsPointCount === null
    ? 'text-slate-400'
    : gpsPointCount > 10
    ? 'text-emerald-400'
    : gpsPointCount > 1
    ? 'text-amber-400'
    : 'text-rose-400';

  const gpsHealthLabel = gpsPointCount === null
    ? '—'
    : gpsPointCount > 10
    ? 'Good'
    : gpsPointCount > 1
    ? 'Sparse'
    : 'Insufficient';

  return (
    <div className="min-h-screen pb-20">
      {/* HERO SECTION */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative mb-8"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 blur-3xl -z-10" />
        <div className="text-center py-12 px-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 100 }}
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-400">
              Journey Complete
            </span>
          </motion.div>
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-4xl md:text-5xl font-bold text-white mt-3 tracking-tight"
          >
            {journeyName}
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-slate-400 mt-3 text-sm font-light"
          >
            {date} • {startTime} — {endTime}
          </motion.p>
        </div>
      </motion.section>

      {/* GPS WARNING BANNER — shown when route data is insufficient */}
      {gpsWarning && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-start gap-3"
        >
          <span className="text-xl flex-shrink-0">⚠️</span>
          <div>
            <p className="text-xs font-semibold text-amber-300 uppercase tracking-wider mb-1">GPS Route Warning</p>
            <p className="text-xs text-amber-200/80 leading-relaxed">{gpsWarning}</p>
          </div>
        </motion.div>
      )}

      {/* MAIN CONTENT GRID */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-6 lg:grid-cols-3"
      >
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6">

          {/* Quick Stats Row */}
          <motion.div variants={itemVariants}>
            <Card>
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
                Journey Statistics
              </span>
              <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <MetricCard label="Duration" value={totalDuration} text="Total Time" />
                <MetricCard label="Distance" value={totalDistance} text="Explored" />
                <MetricCard label="Locations" value={totalLocations.toString()} text="Visited" />
                <MetricCard label="Memories" value={totalMemories.toString()} text="Captured" />
              </div>
            </Card>
          </motion.div>

          {/* GPS Diagnostics Panel — only shown for real journeys */}
          {lastCompletedJourney && (
            <motion.div variants={itemVariants}>
              <Card glowColor="bg-cyan-400">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
                    GPS Diagnostics
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                    gpsPointCount !== null && gpsPointCount > 10
                      ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                      : gpsPointCount !== null && gpsPointCount > 1
                      ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
                      : 'text-rose-400 border-rose-500/30 bg-rose-500/10'
                  }`}>
                    {gpsHealthLabel}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {/* GPS Points Recorded */}
                  <div className="rounded-xl bg-white/5 border border-white/5 p-4">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      GPS Points Recorded
                    </div>
                    <div className={`text-2xl font-bold font-mono ${gpsHealthColor}`}>
                      {gpsPointCount ?? '—'}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      coordinates.length
                    </div>
                  </div>
                  {/* Route Path Coords */}
                  <div className="rounded-xl bg-white/5 border border-white/5 p-4">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Route Path Coords
                    </div>
                    <div className={`text-2xl font-bold font-mono ${
                      routePathCoordsCount === null
                        ? 'text-slate-400'
                        : routePathCoordsCount > 10
                        ? 'text-emerald-400'
                        : routePathCoordsCount > 1
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}>
                      {routePathCoordsCount ?? '—'}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      routes[0].pathCoords.length
                    </div>
                  </div>
                </div>
                {gpsPointCount !== null && gpsPointCount <= 1 && (
                  <div className="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                    <p className="text-[11px] text-rose-300 leading-relaxed">
                      <strong>Insufficient GPS data.</strong> Only {gpsPointCount} point{gpsPointCount === 1 ? ' was' : 's were'} recorded.
                      Ensure GPS permission is granted and keep the app on the Live Journey screen throughout your journey.
                    </p>
                  </div>
                )}
                {gpsPointCount !== null && gpsPointCount > 1 && gpsPointCount <= 10 && (
                  <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <p className="text-[11px] text-amber-300 leading-relaxed">
                      <strong>Sparse GPS data.</strong> Only {gpsPointCount} points were recorded for this journey.
                      The route polyline may appear jagged. For better accuracy, keep the screen active during tracking.
                    </p>
                  </div>
                )}
                {gpsPointCount !== null && gpsPointCount > 10 && (
                  <div className="mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <p className="text-[11px] text-emerald-300 leading-relaxed">
                      GPS tracking captured {gpsPointCount} points — sufficient for a smooth route polyline on the Life Map.
                    </p>
                  </div>
                )}
              </Card>
            </motion.div>
          )}

          {/* Journey Timeline */}
          <motion.div variants={itemVariants}>
            <Card>
              <div className="flex items-center justify-between mb-6">
                <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
                  Journey Timeline
                </span>
                <span className="text-xs text-slate-400">{stops.length} stops</span>
              </div>
              <div className="relative">
                {stops.map((stop, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="relative flex items-start gap-4 pb-6 last:pb-0"
                  >
                    <div className="relative flex flex-col items-center">
                      <div
                        className={`w-3 h-3 rounded-full z-10 ${
                          index === 0
                            ? 'bg-emerald-400'
                            : index === stops.length - 1
                            ? 'bg-rose-400'
                            : 'bg-cyan-400'
                        }`}
                      />
                      {index < stops.length - 1 && (
                        <div className="w-0.5 flex-1 bg-gradient-to-b from-cyan-400/50 to-transparent ml-[5px] mt-1" />
                      )}
                    </div>
                    <div className="flex-1 pt-[-2px]">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-white">
                          {index === 0 && '🏁 '}
                          {index === stops.length - 1 && '🏁 '}
                          {stop.name}
                        </h3>
                        <span className="text-[10px] text-slate-500 font-mono">{stop.time}</span>
                      </div>
                      {stop.memoryCount > 0 && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                            📸 {stop.memoryCount} memor{stop.memoryCount === 1 ? 'y' : 'ies'}
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-white/5 flex gap-4 text-[10px] text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" /> Start
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" /> Checkpoint
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-400" /> End
                </span>
              </div>
            </Card>
          </motion.div>

          {/* Story Summary */}
          <motion.div variants={itemVariants}>
            <Card glowColor="bg-purple-400">
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
                Chapter Story
              </span>
              <div className="mt-4 relative">
                <span className="absolute -top-4 -left-2 text-6xl text-white/5 font-serif">"</span>
                <p className="text-sm text-slate-300 font-light leading-7 italic pl-4 border-l-2 border-cyan-500/30">
                  {generateStorySummary()}
                </p>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          {/* Memory Highlights */}
          <motion.div variants={itemVariants}>
            <Card>
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
                Memory Highlights
              </span>
              <div className="mt-5 space-y-4">
                {memories.map((memory, index) => (
                  <motion.div key={memory.id} custom={index} variants={polaroidVariants} className="relative">
                    <div className="bg-white/95 p-2 pb-3 rounded-sm shadow-lg hover:rotate-0 transition-transform duration-300 hover:shadow-xl hover:scale-105">
                      <div className="relative overflow-hidden rounded-sm">
                        <img src={memory.photo} alt={memory.title} className="w-full h-32 object-cover" />
                      </div>
                      <div className="mt-2 px-1">
                        <h4 className="text-xs font-semibold text-slate-800 line-clamp-1">{memory.title}</h4>
                        <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5">{memory.note}</p>
                        <p className="text-[9px] text-slate-400 mt-1 font-mono">{memory.timestamp}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Discovery Highlights */}
          <motion.div variants={itemVariants}>
            <Card glowColor="bg-amber-400">
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
                Discoveries ({discoveries.length})
              </span>
              <div className="mt-4 space-y-3">
                {discoveries.map((discovery, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
                  >
                    <span className="text-xl">{discovery.category === 'Food' || discovery.category === 'Cafe' ? '☕' : '✨'}</span>
                    <div>
                      <h4 className="text-sm font-semibold text-white">{discovery.title}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">{discovery.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Mood Analysis */}
          <motion.div variants={itemVariants}>
            <Card glowColor="bg-emerald-400">
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
                Journey Mood
              </span>
              <div className="mt-4 flex items-center gap-3">
                <span className="text-4xl">{getMoodEmoji(mood)}</span>
                <div>
                  <h3 className="text-lg font-bold text-white">{mood}</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Primary emotional tone</p>
                </div>
              </div>
              <div className="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-xs text-emerald-200/80 font-light leading-6">{getMoodSummary()}</p>
              </div>
            </Card>
          </motion.div>
        </div>
      </motion.div>

      {/* BOTTOM ACTION BAR */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="mt-8"
      >
        <Card className="!rounded-[24px]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
                <span className="text-xl">📖</span>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Ready to Archive This Chapter?</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Save your journey to the Life Map constellation
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="border" size="md" onClick={() => go('dashboard')}>
                Back to Dashboard
              </Button>
              <Button variant="primary" size="md" onClick={handleSaveToLifeMap} disabled={isSaving}>
                {isSaving ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </span>
                ) : (
                  'Save To Life Map'
                )}
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Toast Notification */}
      <Toast show={showToast} message={toastMsg} subtitle={toastSub} onClose={() => setShowToast(false)} />
    </div>
  );
}

export default JourneySummaryPage;
