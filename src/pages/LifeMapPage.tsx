import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigation } from '../context/NavigationContext';
import InteractiveMap from '../components/maps/InteractiveMap';
import MemoryDrawer from '../components/maps/MemoryDrawer';
import type { MapNode, DailyJourney } from '../types';
import { dailyJourneys, MAP_CENTER } from '../data';

// ============================================
// LIFE MAP PAGE - Personal Memory Journal
// Google Maps Timeline + Apple Photos Memories + Personal Travel Journal
//
// Experience:
// 1. Top: Date selector strip (Today, Yesterday, previous days, calendar)
// 2. Center: Large full-width interactive map with routes and markers
// 3. Right: Persistent memory drawer with polaroid gallery
// ============================================

// Helper to format date for display
const formatDateLabel = (dateStr: string): string => {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Helper to get relative day label
const getRelativeLabel = (dateStr: string): string => {
  const date = new Date(dateStr);
  const today = new Date();
  const diffDays = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export function LifeMapPage() {
  const { go } = useNavigation();
  const [selectedNode, setSelectedNode] = useState<MapNode | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string>('2024-05-31'); // Default to today
  const [showCalendar, setShowCalendar] = useState(false);

  // Get current journey data based on selected day
  const currentJourney = useMemo(() => 
    dailyJourneys.find((j) => j.date === selectedDay),
    [selectedDay]
  );

  // Generate additional past dates for the date strip
  const pastDates = useMemo(() => {
    const dates: { date: string; label: string; journey?: DailyJourney }[] = [];
    const today = new Date('2024-05-31'); // Using the data's "today"
    
    for (let i = 2; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const journey = dailyJourneys.find(j => j.date === dateStr);
      
      dates.push({
        date: dateStr,
        label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        journey
      });
    }
    return dates;
  }, []);

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
          {/* Today */}
          <button
            onClick={() => setSelectedDay('2024-05-31')}
            className={`flex-shrink-0 px-4 py-2.5 rounded-xl border transition-all duration-200 ${
              selectedDay === '2024-05-31'
                ? 'bg-violet-500/20 border-violet-500/50 text-white shadow-lg shadow-violet-500/10'
                : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            <div className="text-sm font-medium">Today</div>
            <div className="text-[10px] text-slate-500 mt-0.5">May 31</div>
          </button>

          {/* Yesterday */}
          <button
            onClick={() => setSelectedDay('2024-05-30')}
            className={`flex-shrink-0 px-4 py-2.5 rounded-xl border transition-all duration-200 ${
              selectedDay === '2024-05-30'
                ? 'bg-violet-500/20 border-violet-500/50 text-white shadow-lg shadow-violet-500/10'
                : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            <div className="text-sm font-medium">Yesterday</div>
            <div className="text-[10px] text-slate-500 mt-0.5">May 30</div>
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-white/10 flex-shrink-0 mx-1" />

          {/* Past Days */}
          {pastDates.slice(0, 4).map(({ date, label, journey }) => (
            <button
              key={date}
              onClick={() => setSelectedDay(date)}
              className={`flex-shrink-0 px-4 py-2.5 rounded-xl border transition-all duration-200 ${
                selectedDay === date
                  ? 'bg-violet-500/20 border-violet-500/50 text-white shadow-lg shadow-violet-500/10'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
              } ${!journey ? 'opacity-50' : ''}`}
            >
              <div className="text-sm font-medium">{label}</div>
              {journey && (
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {journey.summary.locationsVisited} stops
                </div>
              )}
            </button>
          ))}

          {/* Calendar Picker */}
          <div className="relative">
            <button
              onClick={() => setShowCalendar(!showCalendar)}
              className={`flex-shrink-0 px-4 py-2.5 rounded-xl border transition-all duration-200 ${
                showCalendar
                  ? 'bg-violet-500/20 border-violet-500/50 text-white'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
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

            {/* Calendar Dropdown */}
            <AnimatePresence>
              {showCalendar && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 mt-2 z-50 rounded-2xl border border-white/10 bg-slate-900 p-4 shadow-2xl backdrop-blur-xl"
                >
                  <div className="text-xs text-slate-400 mb-3">
                    Select a date to explore memories
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {dailyJourneys.map((journey) => (
                      <button
                        key={journey.date}
                        onClick={() => {
                          setSelectedDay(journey.date);
                          setShowCalendar(false);
                        }}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          selectedDay === journey.date
                            ? 'bg-violet-500/20 border-violet-500/50 text-white'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                        }`}
                      >
                        <div className="text-sm font-medium">{journey.dayLabel}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {journey.summary.totalDistance} · {journey.summary.locationsVisited} places
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* ===== MAIN CONTENT: Map + Drawer ===== */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Map Section - Takes remaining space */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex-1 min-w-0"
        >
          <InteractiveMap
            selectedNode={selectedNode}
            onSelectNode={handleSelectNode}
            onOpenDrawer={handleOpenDrawer}
            selectedDay={selectedDay}
          />
        </motion.div>

        {/* Right Memory Drawer - Persistent */}
        <AnimatePresence mode="wait">
          {isDrawerOpen && selectedNode && (
            <motion.div
              initial={{ opacity: 0, x: 50, width: 0 }}
              animate={{ opacity: 1, x: 0, width: 400 }}
              exit={{ opacity: 0, x: 50, width: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="flex-shrink-0 h-full"
            >
              <MemoryDrawer
                node={selectedNode}
                isOpen={isDrawerOpen}
                onClose={handleCloseDrawer}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ===== DAY SUMMARY (when no location selected) ===== */}
      {!selectedNode && !isDrawerOpen && currentJourney && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
              {currentJourney.dayLabel} Summary
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
                {currentJourney.summary.totalDistance}
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
                {currentJourney.summary.totalTime}
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
                {currentJourney.summary.locationsVisited}
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
                {currentJourney.summary.mood || '—'}
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
                {currentJourney.nodes.map((node, index) => {
                  const route = currentJourney.routes[index];

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
      )}
    </div>
  );
}

export default LifeMapPage;