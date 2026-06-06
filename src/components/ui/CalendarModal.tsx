import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getJourneysByDate } from '../../services/journeyStorage';
import type { SavedJourney } from '../../services/journeyStorage';
import type { DailyJourney } from '../../types';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDay: string;
  dailyJourneys: DailyJourney[];
  onSelectDate: (dateStr: string, journeyId: string | null) => void;
}

export function CalendarModal({
  isOpen,
  onClose,
  selectedDay,
  dailyJourneys,
  onSelectDate,
}: CalendarModalProps) {
  // Initialize view month/year to today or selected day
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    if (selectedDay) {
      const parsed = new Date(selectedDay + 'T12:00:00');
      if (!isNaN(parsed.getTime())) return parsed;
    }
    return new Date();
  });

  // Track the date clicked for multiple journey selection
  const [multipleJourneysData, setMultipleJourneysData] = useState<{
    dateStr: string;
    journeys: SavedJourney[];
  } | null>(null);

  // Sync current month view when selectedDay changes
  useEffect(() => {
    if (isOpen && selectedDay) {
      const parsed = new Date(selectedDay + 'T12:00:00');
      if (!isNaN(parsed.getTime())) {
        setCurrentMonth(parsed);
      }
    }
  }, [isOpen, selectedDay]);

  // Reset multiple journeys selection state on modal close or month change
  useEffect(() => {
    setMultipleJourneysData(null);
  }, [isOpen, currentMonth]);

  // Handle keyboard listener (Escape to close)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth(); // 0-indexed

  // Month navigation handlers
  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  // Helper to format date as YYYY-MM-DD
  const formatDateStr = (y: number, m: number, d: number) => {
    const mm = String(m + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  };

  // Generate calendar grid days
  const calendarCells = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const cells: (number | null)[] = [];

    // Preceding spacer cells
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push(null);
    }

    // Days of the month
    for (let d = 1; d <= totalDays; d++) {
      cells.push(d);
    }

    return cells;
  }, [year, month]);

  const monthName = currentMonth.toLocaleString('default', { month: 'long' });

  // Handle cell click
  const handleDateClick = (dayNum: number) => {
    const dateStr = formatDateStr(year, month, dayNum);
    const journeys = getJourneysByDate(dateStr);

    if (journeys.length > 1) {
      // Show list of journeys for multiple journeys selection
      setMultipleJourneysData({ dateStr, journeys });
    } else {
      // 1 or 0 journeys: select and close
      onSelectDate(dateStr, null);
    }
  };

  const todayStr = useMemo(() => {
    const t = new Date();
    return formatDateStr(t.getFullYear(), t.getMonth(), t.getDate());
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[2000] flex items-center justify-center p-4"
        >
          {/* Backdrop Click Close */}
          <div
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm z-0"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', stiffness: 350, damping: 26 }}
            className="relative z-10 w-full max-w-md rounded-[28px] border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-6 shadow-2xl text-slate-800 dark:text-white"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-white transition-colors p-1"
              aria-label="Close Calendar"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Header */}
            <div className="mb-4 pr-6">
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-violet-500 dark:text-violet-400">
                Explore constellations
              </span>
              <h2 className="text-xl font-bold tracking-tight mt-0.5">Life Map Calendar</h2>
            </div>

            <AnimatePresence mode="wait">
              {!multipleJourneysData ? (
                <motion.div
                  key="calendar-view"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.15 }}
                >
                  {/* Month Navigation */}
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={handlePrevMonth}
                      className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 dark:hover:text-white transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <div className="font-semibold text-sm">
                      {monthName} {year}
                    </div>
                    <button
                      onClick={handleNextMonth}
                      className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 dark:hover:text-white transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>

                  {/* Weekdays Headers */}
                  <div className="grid grid-cols-7 gap-1 text-center mb-2">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                      <div key={day} className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider py-1">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Grid Cells */}
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {calendarCells.map((dayNum, index) => {
                      if (dayNum === null) {
                        return <div key={`spacer-${index}`} className="aspect-square" />;
                      }

                      const dateStr = formatDateStr(year, month, dayNum);
                      const isSelected = selectedDay === dateStr;
                      const isToday = todayStr === dateStr;

                      // Find if this date contains journeys
                      const dayJourneys = getJourneysByDate(dateStr);
                      const hasJourney = dayJourneys.length > 0;

                      return (
                        <button
                          key={dateStr}
                          onClick={() => handleDateClick(dayNum)}
                          className={`aspect-square rounded-xl text-xs font-semibold flex flex-col items-center justify-between p-1.5 transition-all relative group ${
                            isSelected
                              ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
                              : hasJourney
                              ? 'bg-violet-500/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-300 border border-violet-500/30 hover:bg-violet-500/20 dark:hover:bg-violet-500/30'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                          } ${isToday && !isSelected ? 'ring-2 ring-violet-500/30 dark:ring-violet-400/30' : ''}`}
                        >
                          <span className="mt-0.5">{dayNum}</span>
                          {/* Footprints dot indicator */}
                          {hasJourney && (
                            <span
                              className={`w-1 h-1 rounded-full mb-0.5 ${
                                isSelected ? 'bg-white' : 'bg-violet-500 dark:bg-violet-400'
                              }`}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="multiple-journeys-view"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs mb-1">
                    <button
                      onClick={() => setMultipleJourneysData(null)}
                      className="flex items-center gap-1 hover:text-slate-800 dark:hover:text-white transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                      </svg>
                      Back to Calendar
                    </button>
                  </div>

                  <div className="bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-white/5 rounded-2xl p-4">
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mb-2">
                      Multiple Explorations on
                    </div>
                    <div className="text-base font-bold text-slate-800 dark:text-white">
                      {new Date(multipleJourneysData.dateStr + 'T12:00:00').toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                    <div className="text-xs text-slate-400 mt-1 font-light">
                      We found {multipleJourneysData.journeys.length} journeys on this date. Select which one to view on your constellation, or view combined data.
                    </div>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {/* Combined option */}
                    <button
                      onClick={() => onSelectDate(multipleJourneysData.dateStr, null)}
                      className="w-full p-4 rounded-2xl border border-dashed border-violet-500/40 bg-violet-500/5 hover:bg-violet-500/10 text-left transition-all flex items-center justify-between group"
                    >
                      <div>
                        <div className="text-sm font-semibold text-violet-600 dark:text-violet-400">
                          🌌 Combined constellated path
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Merge all journeys for the day
                        </div>
                      </div>
                      <svg className="w-4 h-4 text-violet-500 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>

                    {/* Individual journey options */}
                    {multipleJourneysData.journeys.map((journey) => (
                      <button
                        key={journey.id}
                        onClick={() => onSelectDate(multipleJourneysData.dateStr, journey.id)}
                        className="w-full p-4 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/[0.05] text-left transition-all flex items-center justify-between group"
                      >
                        <div>
                          <div className="text-sm font-semibold text-slate-800 dark:text-white">
                            📍 {journey.journeyName || 'Walk'}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {journey.startTime} - {journey.endTime} · {journey.totalDistance} · {journey.totalLocations} stops
                          </div>
                        </div>
                        <svg className="w-4 h-4 text-slate-400 group-hover:text-white opacity-0 group-hover:opacity-100 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default CalendarModal;
