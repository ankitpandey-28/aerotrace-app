import React, { useState, useMemo } from 'react';
import { useJourney } from '../context/JourneyContext';
import { getAllSavedDiscoveries } from '../services/journeyStorage';
import type { Discovery, DiscoveryCategory } from '../types';
import DiscoveryDetailPanel from '../components/discoveries/DiscoveryDetailPanel';
import DiscoveryFeaturedHero from '../components/discoveries/DiscoveryFeaturedHero';
import DiscoveryJournalCard from '../components/discoveries/DiscoveryJournalCard';
import { getJournalCardSize } from '../components/discoveries/discoveryPresentation';
import { motion } from 'framer-motion';

type SortOption = 'Newest' | 'Oldest' | 'Favorites' | 'Most Visited';
type FilterOption = 'All' | DiscoveryCategory;

export function DiscoverPage() {
  const { discoveries: activeDiscoveries } = useJourney();
  const [filter, setFilter] = useState<FilterOption>('All');
  const [sortBy, setSortBy] = useState<SortOption>('Newest');
  const [selectedDiscovery, setSelectedDiscovery] = useState<Discovery | null>(null);

  const allDiscoveries = useMemo(() => {
    const saved = getAllSavedDiscoveries();
    const merged = [...activeDiscoveries, ...saved];
    return Array.from(new Map(merged.map((d) => [d.id, d])).values());
  }, [activeDiscoveries]);

  const processedDiscoveries = useMemo(() => {
    let result = [...allDiscoveries];

    if (filter !== 'All') {
      result = result.filter((d) => d.category === filter);
    }

    result.sort((a, b) => {
      if (sortBy === 'Newest') {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }
      if (sortBy === 'Oldest') {
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      }
      if (sortBy === 'Most Visited') {
        return (b.visitCount || 0) - (a.visitCount || 0);
      }
      if (sortBy === 'Favorites') {
        if (a.isFavorite && !b.isFavorite) return -1;
        if (!a.isFavorite && b.isFavorite) return 1;
        return 0;
      }
      return 0;
    });

    return result;
  }, [allDiscoveries, filter, sortBy]);

  const featuredDiscovery = processedDiscoveries[0] ?? null;
  const collectionDiscoveries = featuredDiscovery
    ? processedDiscoveries.slice(1)
    : processedDiscoveries;

  const categories: FilterOption[] = [
    'All',
    'Food',
    'Cafe',
    'Nature',
    'Landmark',
    'Viewpoint',
    'Hidden Gem',
    'Activity',
    'Personal',
  ];
  const sortOptions: SortOption[] = ['Newest', 'Oldest', 'Favorites', 'Most Visited'];

  if (allDiscoveries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6 max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400/15 to-violet-500/15 flex items-center justify-center mb-10 border border-white/5"
        >
          <span className="text-4xl">✨</span>
        </motion.div>
        <h2 className="text-3xl sm:text-4xl font-serif italic text-white mb-5 leading-snug tracking-tight">
          Places worth returning to
        </h2>
        <p className="text-slate-400 font-light leading-relaxed mb-2">
          Start a journey. Capture a memory. Mark the moment as a discovery.
        </p>
        <p className="text-sm text-slate-500 font-light">
          Your personal collection of meaningful places will grow here — like pages in a travel journal.
        </p>
      </div>
    );
  }

  return (
    <div className="pb-24 max-w-6xl mx-auto">
      {/* Editorial header */}
      <header className="mb-12 sm:mb-16">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-[10px] font-semibold uppercase tracking-[0.32em] text-amber-200/60 mb-4"
        >
          Your collection
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight leading-[1.05] mb-5"
        >
          Discoveries
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="text-lg text-slate-400 font-light max-w-xl leading-relaxed"
        >
          Not a list of pins — a scrapbook of places that changed how you see the world.
        </motion.p>

        {/* Soft filters — journal tabs, not dashboard controls */}
        <div className="mt-10 space-y-5">
          <div className="flex overflow-x-auto custom-scrollbar gap-2 pb-1 -mx-1 px-1">
            {categories.map((cat) => {
              const isActive = filter === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFilter(cat)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-sm transition-all duration-300 ${
                    isActive
                      ? 'bg-amber-500/15 text-amber-100 border border-amber-400/25'
                      : 'text-slate-500 hover:text-slate-300 border border-transparent hover:border-white/10'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-3 text-xs">
            <span className="text-slate-600 self-center mr-1">Arrange by</span>
            {sortOptions.map((sort) => (
              <button
                key={sort}
                type="button"
                onClick={() => setSortBy(sort)}
                className={`px-3 py-1.5 rounded-full transition-colors ${
                  sortBy === sort
                    ? 'text-slate-200 underline decoration-amber-400/60 underline-offset-4'
                    : 'text-slate-600 hover:text-slate-400'
                }`}
              >
                {sort}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Featured hero */}
      {featuredDiscovery && (
        <section className="mb-14 sm:mb-20">
          <DiscoveryFeaturedHero
            discovery={featuredDiscovery}
            onOpen={setSelectedDiscovery}
          />
        </section>
      )}

      {/* Journal collection — masonry-style breathing layout */}
      {collectionDiscoveries.length > 0 && (
        <section>
          <div className="flex items-baseline justify-between mb-8 sm:mb-10 px-1">
            <h2 className="font-serif text-2xl text-white/90 italic">More chapters</h2>
            <span className="text-xs text-slate-600 font-light">
              {collectionDiscoveries.length} place
              {collectionDiscoveries.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-x-8 gap-y-12 sm:gap-x-10 sm:gap-y-14">
            {collectionDiscoveries.map((discovery, idx) => {
              const size = getJournalCardSize(idx);
              const gridClass =
                size === 'wide'
                  ? 'md:col-span-2 lg:col-span-12'
                  : size === 'tall'
                    ? 'lg:col-span-4'
                    : 'lg:col-span-6';

              return (
                <div key={discovery.id} className={gridClass}>
                  <DiscoveryJournalCard
                    discovery={discovery}
                    index={idx}
                    onOpen={setSelectedDiscovery}
                  />
                </div>
              );
            })}
          </div>
        </section>
      )}

      {processedDiscoveries.length === 0 && filter !== 'All' && (
        <p className="text-center text-slate-500 font-light py-16 font-serif italic">
          No discoveries in this chapter yet. Try another filter.
        </p>
      )}

      <DiscoveryDetailPanel
        discovery={selectedDiscovery}
        onClose={() => setSelectedDiscovery(null)}
      />
    </div>
  );
}

export default DiscoverPage;
