import React, { useMemo, useState } from 'react';
import { useJourney } from '../context/JourneyContext';
import ReelCard from '../components/memory/ReelCard';
import ReelDetailModal from '../components/memory/ReelDetailModal';
import Card from '../components/ui/Card';

function monthLabelFromDateStr(dateStr: string) {
  // dateStr like 'Sun, May 26' or 'May 31, 2024'
  try {
    const year = new Date().getFullYear();
    const parsed = new Date(dateStr.includes(',') ? `${dateStr}, ${year}` : `${dateStr} ${year}`);
    const month = parsed.toLocaleString('default', { month: 'long' });
    const yearLabel = parsed.getFullYear();
    return `${month} ${yearLabel}`;
  } catch (e) {
    return dateStr;
  }
}

export function MemoriesReelPage() {
  const { journeys, discoveries } = useJourney();
  const completed = journeys.filter(j => j.status === 'Completed');

  const grouped = useMemo(() => {
    const map: Record<string, typeof completed> = {};
    completed.forEach(j => {
      const label = monthLabelFromDateStr(j.date);
      if (!map[label]) map[label] = [] as any;
      map[label].push(j);
    });
    // Sort months newest first by parsing month
    const orderedKeys = Object.keys(map).sort((a, b) => {
      return new Date(b).getTime() - new Date(a).getTime();
    });
    return { map, orderedKeys };
  }, [completed]);

  const [openJourneyId, setOpenJourneyId] = useState<string | null>(null);
  const [openJourney, setOpenJourney] = useState<any | null>(null);

  const openDetail = (id: string) => {
    const j = journeys.find(x => x.id === id) || null;
    setOpenJourney(j);
    setOpenJourneyId(id);
  };
  const closeDetail = () => { setOpenJourney(null); setOpenJourneyId(null); };

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-white/5 bg-slate-900/40 p-6 backdrop-blur-xl">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">MEMORY JOURNAL</span>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">Your Memory Journal</h2>
          <p className="mt-2 text-xs text-slate-400 font-light leading-5 max-w-xl">A story-first view of your completed journeys and saved moments. Tap an entry to open the full narrative.</p>
        </div>
      </section>

      {grouped.orderedKeys.length === 0 && (
        <Card className="p-8 text-center">
          <h3 className="text-lg font-semibold text-white">No completed journeys yet</h3>
          <p className="text-sm text-slate-400 mt-2">Complete a journey to see it appear in your Memories Reel.</p>
        </Card>
      )}

      {grouped.orderedKeys.map(month => (
        <div key={month}>
          <h3 className="text-sm font-semibold text-slate-400 mb-4">{month}</h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {grouped.map[month].map((j: any) => {
              const covers = discoveries.filter(d => d.sourceJourneyId === j.id && d.coverPhoto).map(d => d.coverPhoto);
              const cover = covers[0] || `/assets/screenshots/journey-cover.png`;
              return (
                <ReelCard
                  key={j.id}
                  id={j.id}
                  cover={cover}
                  title={j.title}
                  date={j.date}
                  summary={j.narrative}
                  duration={j.duration}
                  distance={j.distance}
                  onOpen={openDetail}
                />
              );
            })}
          </div>
        </div>
      ))}

      {openJourney && (
        <ReelDetailModal
          journey={openJourney}
          discoveries={discoveries.filter(d => d.sourceJourneyId === openJourney.id)}
          onClose={closeDetail}
        />
      )}
    </div>
  );
}

export default MemoriesReelPage;
