import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigation } from '../context/NavigationContext';
const InteractiveMap = React.lazy(() => import('../components/maps/InteractiveMap'));
const MemoryDrawer = React.lazy(() => import('../components/maps/MemoryDrawer'));
import { useMemory } from '../context/MemoryContext';
import type { MapNode, DailyJourney } from '../types';
import { getAllDailyJourneys, getJourneysByDate } from '../services/journeyStorage';
import CalendarModal from '../components/ui/CalendarModal';

// ============================================
// LIFE MAP PAGE - Personal Memory Journal
// Google Maps Timeline + Apple Photos Memories + Personal Travel Journal
//
// Experience:
// 1. Top: Date selector strip (Today, Yesterday, previous days, calendar)
// 2. Center: Large full-width interactive map with routes and markers
// 3. Right: Persistent memory drawer with polaroid gallery
// ============================================

export function LifeMapPage() {
  const { go } = useNavigation();
  const [selectedNode, setSelectedNode] = useState<MapNode | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string>(() => {
    return localStorage.getItem('aerotrace_lifemap_selected_day') || '';
  });
  const [selectedJourneyId, setSelectedJourneyId] = useState<string | null>(() => {
    return localStorage.getItem('aerotrace_lifemap_selected_journey_id');
  });
  const [showCalendar, setShowCalendar] = useState(false);
  const [dailyJourneys, setDailyJourneys] = React.useState<DailyJourney[]>([]);

  const initialLoadDone = React.useRef(false);

  // Get all saved journeys for this date
  const daySavedJourneys = useMemo(() => {
    if (!selectedDay) return [];
    return getJourneysByDate(selectedDay);
  }, [selectedDay]);

  // Get current journey data based on selected day & selected journey ID
  const currentJourney = useMemo(() => {
    if (!selectedDay) return null;

    if (selectedJourneyId) {
      const specific = daySavedJourneys.find(j => j.id === selectedJourneyId);
      if (specific) {
        return {
          date: specific.date,
          dayLabel: specific.journeyName || specific.dateLabel,
          nodes: specific.nodes || [],
          routes: specific.routes || [],
          storySummary: specific.storySummary || undefined,
          summary: {
            totalDistance: specific.totalDistance,
            totalTime: specific.totalDuration,
            locationsVisited: specific.totalLocations,
            mood: specific.mood,
          }
        };
      }
    }

    return dailyJourneys.find((j) => j.date === selectedDay) || null;
  }, [selectedDay, selectedJourneyId, dailyJourneys, daySavedJourneys]);

  // Merge enhanced (in-memory) memories into the journey nodes so UI shows photos/polaroids
  const { memories: enhancedMemories } = useMemory();

  const displayJourney = useMemo(() => {
    if (!currentJourney) return null;

    // Find enhanced memories that fall on the same day as the journey
    const dayMemories = enhancedMemories.filter((m) => {
      try {
        return new Date(m.timestamp).toISOString().split('T')[0] === currentJourney.date;
      } catch {
        return false;
      }
    });

    const nodes = currentJourney.nodes.map((node) => {
      // Match enhanced memories to node by location name (case-insensitive, substring match)
      const nodeName = (node.name || '').toLowerCase().trim();
      const matchedByLocation = dayMemories.filter((m) => {
        const mLoc = (m.location || '').toLowerCase().trim();
        if (!mLoc) return false;
        return mLoc === nodeName || mLoc.includes(nodeName) || nodeName.includes(mLoc);
      });

      // If none matched by location, attempt a looser fallback: match memories that have empty location to the first node only
      let matched = matchedByLocation;
      if (matched.length === 0) {
        matched = dayMemories.filter(m => !m.location || m.location.trim() === '');
      }

      const extraPhotos = matched.flatMap((m) => (m.photos && m.photos.length > 0 ? m.photos : []));

      const photos = [...(node.photos || []), ...extraPhotos];

      const connected = [
        ...(node.connectedItems || []),
        ...matched.map((m) => ({ type: 'memory' as const, title: m.title, icon: '📸', preview: (m.note || '').substring(0, 50) })),
      ];

      return {
        ...node,
        photos: photos.length > 0 ? photos : node.photos,
        photo: (photos.length > 0 ? photos[0] : node.photo) || node.photo,
        description: node.description || matched.map((m) => m.note).join(' ' ) || node.description,
        connectedItems: connected,
      };
    });

    const memoryNodeCount = nodes.filter(n => n.kind === 'memory').length;
    console.log('[LifeMapPage] Life Map memory node count:', memoryNodeCount, nodes.filter(n => n.kind === 'memory'));

    return {
      ...currentJourney,
      nodes,
    };
  }, [currentJourney, enhancedMemories]);

  const journeyToShow = displayJourney || currentJourney;

  React.useEffect(() => {
    const saved = getAllDailyJourneys();
    setDailyJourneys(saved);

    const persistedDay = localStorage.getItem('aerotrace_lifemap_selected_day');
    const persistedJourneyId = localStorage.getItem('aerotrace_lifemap_selected_journey_id');

    if (saved.length > 0) {
      const hasPersistedDay = persistedDay && saved.some(j => j.date === persistedDay);
      const initialDay = hasPersistedDay ? persistedDay : saved[0].date;
      setSelectedDay(initialDay);

      if (hasPersistedDay && persistedJourneyId) {
        setSelectedJourneyId(persistedJourneyId);
      } else {
        setSelectedJourneyId(null);
      }
    }
    initialLoadDone.current = true;
  }, []);

  React.useEffect(() => {
    if (selectedDay) {
      localStorage.setItem('aerotrace_lifemap_selected_day', selectedDay);
    } else {
      localStorage.removeItem('aerotrace_lifemap_selected_day');
    }
  }, [selectedDay]);

  React.useEffect(() => {
    if (selectedJourneyId !== null) {
      localStorage.setItem('aerotrace_lifemap_selected_journey_id', selectedJourneyId);
    } else {
      localStorage.removeItem('aerotrace_lifemap_selected_journey_id');
    }
  }, [selectedJourneyId]);

  React.useEffect(() => {
    if (!initialLoadDone.current || !selectedDay) return;

    const journey = journeyToShow;
    if (!journey || journey.nodes.length === 0) {
      setIsDrawerOpen(false);
      setSelectedNode(null);
      return;
    }

    const preferred =
      journey.nodes.find((n) => n.kind === 'memory') || journey.nodes[0];
    setSelectedNode(preferred);
    setIsDrawerOpen(true);
  }, [selectedDay, selectedJourneyId, dailyJourneys]);

  // Handle opening the drawer when a node is selected
  const handleOpenDrawer = (node: MapNode) => {
    setSelectedNode(node);
    setIsDrawerOpen(true);
  };

  // Handle closing the drawer
  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setTimeout(() => setSelectedNode(null), 300);
  };

  // Handle selecting a node from the map (without opening drawer)
  const handleSelectNode = (node: MapNode) => {
    setSelectedNode(node);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col">
      {/* ===== PAGE HEADER ===== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-4"
      >
        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">
          Memory Journal
        </span>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Your Life Map
        </h1>
        <p className="mt-2 text-sm text-slate-400 font-light leading-relaxed max-w-xl">
          Where have you been? Click any location to discover the memories made there.
        </p>
      </motion.div>

      {/* ===== DATE SELECTOR STRIP ===== */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-5"
      >
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {dailyJourneys.map((journey) => {
            const isSelected = selectedDay === journey.date;
            return (
              <button
                key={journey.date}
                onClick={() => {
                  setSelectedDay(journey.date);
                  setSelectedJourneyId(null);
                }}
                className={`flex-shrink-0 px-4 py-2.5 rounded-xl border transition-all duration-200 ${
                  isSelected
                    ? 'bg-violet-500/20 border-violet-500/50 text-slate-800 dark:text-white shadow-lg shadow-violet-500/10 shadow-violet-500/5'
                    : 'bg-white/5 border-white/10 text-slate-500 dark:text-slate-400 hover:bg-white/10 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                <div className="text-sm font-medium">{journey.dayLabel}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-500 mt-0.5">
                  {journey.summary.locationsVisited} stops · {journey.summary.totalDistance}
                </div>
              </button>
            );
          })}

          {/* Divider if we have journeys */}
          {dailyJourneys.length > 0 && (
            <div className="w-px h-6 bg-white/10 flex-shrink-0 mx-1" />
          )}

          {/* Calendar Picker */}
          <div className="relative">
            <button
              onClick={() => setShowCalendar(true)}
              className={`flex-shrink-0 px-4 py-2.5 rounded-xl border transition-all duration-200 ${
                showCalendar
                  ? 'bg-violet-500/20 border-violet-500/50 text-slate-800 dark:text-white'
                  : 'bg-white/5 border-white/10 text-slate-500 dark:text-slate-400 hover:bg-white/10 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-sm font-medium">Calendar</span>
              </div>
            </button>
          </div>
        </div>
      </motion.div>

      {/* ===== SPECIFIC JOURNEY SELECTOR (if multiple journeys exist for the day) ===== */}
      {daySavedJourneys.length > 1 && (
        <div className="mb-4 p-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-2 mr-2">
            Explorations on this day:
          </span>
          <button
            onClick={() => setSelectedJourneyId(null)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
              selectedJourneyId === null
                ? 'bg-violet-500/20 border-violet-500/50 text-violet-600 dark:text-white shadow-lg shadow-violet-500/10'
                : 'bg-white/5 border-transparent text-slate-500 dark:text-slate-400 hover:bg-white/10 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            🌌 Combined constellation
          </button>
          {daySavedJourneys.map((j) => (
            <button
              key={j.id}
              onClick={() => setSelectedJourneyId(j.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                selectedJourneyId === j.id
                  ? 'bg-violet-500/20 border-violet-500/50 text-violet-600 dark:text-white shadow-lg shadow-violet-500/10'
                  : 'bg-white/5 border-transparent text-slate-500 dark:text-slate-400 hover:bg-white/10 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              📍 {j.journeyName || 'Walk'} ({j.startTime})
            </button>
          ))}
        </div>
      )}

      {/* ===== MAIN CONTENT: Map + Drawer ===== */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Map Section - Takes remaining space */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex-1 min-w-0"
        >
          <React.Suspense fallback={<div className="h-full w-full">Loading map...</div>}>
            <InteractiveMap
              selectedNode={selectedNode}
              onSelectNode={handleSelectNode}
              onOpenDrawer={handleOpenDrawer}
              selectedDay={selectedDay}
              dayLabel={journeyToShow?.dayLabel}
              nodes={journeyToShow?.nodes || []}
              routes={journeyToShow?.routes || []}
            />
          </React.Suspense>
        </motion.div>

        {/* Right Memory Drawer */}
        <AnimatePresence mode="wait">
          {isDrawerOpen && selectedNode && (
            <motion.div
              initial={{ opacity: 0, x: 50, width: 0 }}
              animate={{ opacity: 1, x: 0, width: 400 }}
              exit={{ opacity: 0, x: 50, width: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="flex-shrink-0 h-[650px]"
            >
              <React.Suspense fallback={<div className="h-full w-full">Loading...</div>}>
                <MemoryDrawer
                  node={selectedNode}
                  isOpen={isDrawerOpen}
                  onClose={handleCloseDrawer}
                  journeyStorySummary={journeyToShow?.storySummary}
                />
              </React.Suspense>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ===== DAY SUMMARY (when no location selected) ===== */}
      {!selectedNode && !isDrawerOpen && (
        journeyToShow ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                {journeyToShow.dayLabel} Summary
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-slate-700 to-transparent" />
            </div>
            
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {/* Distance Card */}
              <div className="rounded-xl border border-white/5 bg-white/5 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-violet-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Distance
                  </span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {journeyToShow.summary.totalDistance}
                </div>
              </div>

              {/* Time Card */}
              <div className="rounded-xl border border-white/5 bg-white/5 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Active Time
                  </span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {journeyToShow.summary.totalTime}
                </div>
              </div>

              {/* Locations Card */}
              <div className="rounded-xl border border-white/5 bg-white/5 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Places
                  </span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {journeyToShow.summary.locationsVisited}
                </div>
              </div>

              {/* Mood Card */}
              <div className="rounded-xl border border-white/5 bg-white/5 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Mood
                  </span>
                </div>
                <div className="text-xl font-bold text-white">
                  {journeyToShow.summary.mood || '—'}
                </div>
              </div>
            </div>

            {/* Journey Timeline */}
            <div className="mt-4 rounded-xl border border-white/5 bg-white/5 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                  Timeline
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-slate-700 to-transparent" />
              </div>

              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-3 top-0 bottom-0 w-px bg-gradient-to-b from-violet-500/50 via-cyan-500/50 to-emerald-500/50" />

                {/* Timeline items */}
                <div className="space-y-2">
                  {journeyToShow.nodes.map((node, index) => {
                    const route = journeyToShow.routes[index];

                    return (
                      <div key={node.name} className="relative pl-8">
                        {/* Timeline dot */}
                        <div
                          className={`absolute left-1.5 top-1.5 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${
                            node.kind === 'home'
                              ? 'bg-slate-500'
                              : node.kind === 'journey'
                              ? 'bg-violet-500'
                              : node.kind === 'memory'
                              ? 'bg-cyan-500'
                              : node.kind === 'discovery'
                              ? 'bg-emerald-500'
                              : 'bg-amber-500'
                          }`}
                        />

                        {/* Content */}
                        <button
                          onClick={() => handleOpenDrawer(node)}
                          className="w-full text-left p-2.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div>
                              <div className="text-sm font-medium text-white">
                                {node.name}
                              </div>
                              <div className="text-xs text-slate-400">
                                {node.label} {node.time && `· ${node.time}`}
                              </div>
                            </div>
                          </div>
                          {route && (
                            <div className="text-[10px] text-slate-500 flex items-center gap-2">
                              <span>{route.distance}</span>
                              <svg className="w-3 h-3 text-slate-600 group-hover:text-violet-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 rounded-[24px] border border-dashed border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-8 text-center backdrop-blur-sm"
          >
            <div className="text-4xl mb-3">📍</div>
            <h3 className="text-base font-semibold text-slate-800 dark:text-white">
              No Journey Archive for {selectedDay ? new Date(selectedDay + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'this date'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
              You didn't track any exploration on this day. Walk, explore, and record your path to see your footprints light up the constellation!
            </p>
          </motion.div>
        )
      )}

      {/* Calendar modal component overlay */}
      <CalendarModal
        isOpen={showCalendar}
        onClose={() => setShowCalendar(false)}
        selectedDay={selectedDay}
        dailyJourneys={dailyJourneys}
        onSelectDate={(dateStr, journeyId) => {
          setSelectedDay(dateStr);
          setSelectedJourneyId(journeyId);
          setShowCalendar(false);
        }}
      />
    </div>
  );
}

export default LifeMapPage;