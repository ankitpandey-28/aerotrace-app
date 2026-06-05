import React from 'react';
import { useNavigation } from '../context/NavigationContext';
import { useJourney } from '../context/JourneyContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import MetricCard from '../components/ui/MetricCard';
import RouteCanvas from '../components/maps/RouteCanvas';
import { getJourneyById } from '../services/journeyStorage';

function normalizeGpsCoordinates(pathCoords: Array<[number, number]>): { x: number; y: number }[] {
  if (!pathCoords || pathCoords.length === 0) return [];
  
  let minLng = Infinity;
  let maxLng = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;
  
  pathCoords.forEach(([lng, lat]) => {
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
  });
  
  const deltaLng = maxLng - minLng;
  const deltaLat = maxLat - minLat;
  
  if (deltaLng === 0 && deltaLat === 0) {
    return pathCoords.map(() => ({ x: 50, y: 50 }));
  }
  
  return pathCoords.map(([lng, lat]) => {
    const x = deltaLng > 0 ? 10 + ((lng - minLng) / deltaLng) * 80 : 50;
    const y = deltaLat > 0 ? 90 - ((lat - minLat) / deltaLat) * 80 : 50;
    return { x, y };
  });
}

export function JourneyDetailsPage() {
  const { go } = useNavigation();
  const { journeys } = useJourney();

  const [journeyId, setJourneyId] = React.useState<string | null>(() => {
    const query = new URLSearchParams(window.location.hash.split('?')[1]);
    return query.get('id');
  });

  React.useEffect(() => {
    const handleHashChange = () => {
      const query = new URLSearchParams(window.location.hash.split('?')[1]);
      setJourneyId(query.get('id'));
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const savedJourney = journeyId ? getJourneyById(journeyId) : undefined;
  const contextJourney = journeys.find(j => j.id === journeyId) || journeys[0];

  if (!contextJourney && !savedJourney) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-4xl mb-4">🗺️</div>
          <h2 className="text-xl font-bold text-white">No Journey Selected</h2>
          <p className="text-xs text-slate-400 mt-2">Could not find a valid journey to show details for.</p>
          <Button variant="primary" className="mt-6" onClick={() => go('dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const title = savedJourney ? savedJourney.journeyName : contextJourney.title;
  const date = savedJourney ? savedJourney.dateLabel : contextJourney.date;
  const duration = savedJourney ? savedJourney.totalDuration : contextJourney.duration;
  const distance = savedJourney ? savedJourney.totalDistance : contextJourney.distance;
  const mood = savedJourney ? savedJourney.mood : contextJourney.mood;
  const location = savedJourney ? (savedJourney.stops[0]?.name || savedJourney.journeyName) : contextJourney.location;
  const narrative = savedJourney ? savedJourney.storySummary : contextJourney.narrative;

  const displayStops = savedJourney 
    ? savedJourney.stops.map(s => s.name)
    : (contextJourney?.stops || []);

  const displayMemories = savedJourney
    ? savedJourney.memories.map(m => ({
        id: m.id,
        title: m.title,
        note: m.note || '',
        caption: m.note || '',
        photo: m.photo || '',
        photos: m.photo ? [m.photo] : [],
        timestamp: m.timestamp,
        location: m.location,
        type: (m.photo ? 'Photo' : 'Note') as any,
      }))
    : [];

  const normalizedCoords = savedJourney && savedJourney.routes && savedJourney.routes.length > 0
    ? normalizeGpsCoordinates(savedJourney.routes.flatMap(r => r.pathCoords))
    : undefined;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
      {/* Route & Canvas Details */}
      <div className="space-y-6">
        <section className="rounded-[28px] border border-white/5 bg-slate-900/40 p-6 backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500 font-medium">
                CHAPTER DETAILS
              </span>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {title}
              </h2>
              <p className="mt-2 text-xs text-slate-400 font-light leading-5">
                Full telemetry tracking log, visual capsules, and coordinate path. Recorded on {date}.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="border" size="sm" onClick={() => go('dashboard')}>
                Back to Chapters
              </Button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-4">
            <MetricCard label="Total Duration" value={duration} text="Exploration Time" />
            <MetricCard label="Accrued Distance" value={distance} text="Coordinate Length" />
            <MetricCard label="Mindset Focus" value={mood} text="Mood Anchor" />
            <MetricCard label="Starting Location" value={location} text="District Pin" />
          </div>

          {/* SVG Map of Completed Trail */}
          <div className="mt-6 h-[400px]">
            <RouteCanvas color="rgba(34,211,238,0.95)" coordinates={normalizedCoords} stopsCount={displayStops.length} />
          </div>

          {/* Narrative Summary */}
          {narrative && (
            <div className="mt-6 p-4 rounded-2xl bg-white/5 border border-white/5">
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500 block mb-2">
                Narrative Summary
              </span>
              <p className="text-xs text-slate-300 font-light leading-relaxed italic">
                "{narrative}"
              </p>
            </div>
          )}
        </section>
      </div>

      {/* Checklist Timeline and Media Pins */}
      <div className="space-y-6">
        
        {/* Checkpoint list */}
        <Card>
          <div className="pb-3 border-b border-white/5">
            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
              EXPLORATION TIMELINE
            </span>
          </div>

          <div className="mt-4 space-y-4">
            {displayStops.length > 0 ? (
              displayStops.map((stop, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="relative mt-1">
                    <div className="h-3 w-3 rounded-full bg-cyan-400 border border-slate-950 z-10 relative" />
                    {i < displayStops.length - 1 && (
                      <div className="absolute top-3 left-[5px] bottom-[-22px] w-[2px] bg-cyan-500/20" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">{stop}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {i === 0 ? 'Starting Point' : i === displayStops.length - 1 ? 'Ending Point' : `Checkpoint ${i}`}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-500 text-center py-2">No checkpoints logged.</div>
            )}
          </div>
        </Card>

        {/* Media Pins catalog */}
        <Card>
          <div className="pb-3 border-b border-white/5">
            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
              PINNED CAPSULES ({displayMemories.length})
            </span>
          </div>

          {displayMemories.length > 0 ? (
            <div className="mt-4 space-y-3">
              {displayMemories.map((m, i) => (
                <div key={i} className="rounded-xl border border-white/5 bg-slate-950/40 p-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">{m.title}</span>
                    <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] uppercase text-slate-400 font-light">
                      {m.type}
                    </span>
                  </div>
                  {m.photo && (
                    <div className="mt-2 overflow-hidden rounded-lg">
                      <img src={m.photo} alt={m.title} className="w-full h-32 object-cover" />
                    </div>
                  )}
                  <p className="mt-2 text-xs text-slate-400 leading-relaxed font-light">
                    {m.caption}
                  </p>
                  <div className="mt-2 text-[9px] uppercase tracking-wider text-slate-500">
                    {m.location} • {new Date(m.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6 text-center py-4 text-xs text-slate-500 font-light">
              No visual or note pins captured along this route.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export default JourneyDetailsPage;
