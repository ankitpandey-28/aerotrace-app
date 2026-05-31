import React from 'react';
import { useNavigation } from '../context/NavigationContext';
import { useJourney } from '../context/JourneyContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import MetricCard from '../components/ui/MetricCard';
import RouteCanvas from '../components/maps/RouteCanvas';

export function JourneyDetailsPage() {
  const { go } = useNavigation();
  const { journeys, memories } = useJourney();

  // Pick Midnight Market Loop as the default details or fallback to first
  const journey = journeys.find(j => j.id === 'j-101') || journeys[0];

  // Find related memories
  const relatedMemories = memories.filter(
    (m) =>
      m.location.toLowerCase().includes(journey.title.toLowerCase()) ||
      journey.stops.some((s) => s.toLowerCase().includes(m.location.toLowerCase())) ||
      m.location.toLowerCase().includes(journey.location.toLowerCase())
  );

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
                {journey.title}
              </h2>
              <p className="mt-2 text-xs text-slate-400 font-light leading-5">
                Full telemetry tracking log, visual capsules, and coordinate path. Recorded on {journey.date}.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="border" size="sm" onClick={() => go('dashboard')}>
                Back to Chapters
              </Button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-4">
            <MetricCard label="Total Duration" value={journey.duration} text="Exploration Time" />
            <MetricCard label="Accrued Distance" value={journey.distance} text="Coordinate Length" />
            <MetricCard label="Mindset Focus" value={journey.mood} text="Mood Anchor" />
            <MetricCard label="Starting Location" value={journey.location} text="District Pin" />
          </div>

          {/* SVG Map of Completed Trail */}
          <div className="mt-6 h-[400px]">
            <RouteCanvas color="rgba(34,211,238,0.95)" />
          </div>
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
            {journey.stops.map((stop, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="relative mt-1">
                  <div className="h-3 w-3 rounded-full bg-cyan-400 border border-slate-950 z-10 relative" />
                  {i < journey.stops.length - 1 && (
                    <div className="absolute top-3 left-[5px] bottom-[-22px] w-[2px] bg-cyan-500/20" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">{stop}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {i === 0 ? 'Starting Point' : i === journey.stops.length - 1 ? 'Ending Point' : `Checkpoint ${i}`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Media Pins catalog */}
        <Card>
          <div className="pb-3 border-b border-white/5">
            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
              PINNED CAPSULES ({relatedMemories.length})
            </span>
          </div>

          {relatedMemories.length > 0 ? (
            <div className="mt-4 space-y-3">
              {relatedMemories.map((m, i) => (
                <div key={i} className="rounded-xl border border-white/5 bg-slate-950/40 p-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">{m.title}</span>
                    <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] uppercase text-slate-400 font-light">
                      {m.type}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-400 leading-relaxed font-light">
                    {m.caption}
                  </p>
                  <div className="mt-2 text-[9px] uppercase tracking-wider text-slate-500">
                    {m.location}
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
