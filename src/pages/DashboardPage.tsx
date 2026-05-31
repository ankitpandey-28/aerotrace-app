import React from 'react';
import { useNavigation } from '../context/NavigationContext';
import { useJourney } from '../context/JourneyContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

export function DashboardPage() {
  const { go } = useNavigation();
  const { journeys, memories, discoveries, user } = useJourney();

  return (
    <div className="space-y-8">
      {/* Welcome Hero Section */}
      <div className="relative rounded-[32px] overflow-hidden border border-white/10 bg-gradient-to-br from-[#1a1f2e] to-[#0f1115] p-8 md:p-12">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -right-40 -top-40 h-80 w-80 bg-gradient-to-br from-[#4F8CFF] to-transparent rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            Welcome back, {user?.name || 'Explorer'}.
          </h1>
          <p className="text-lg text-[#A0A8B8] max-w-2xl">
            Your adventures shape your world. Every journey tells a story.
          </p>
          
          {/* Quick Stats */}
          <div className="mt-8 grid grid-cols-3 gap-4">
            <div>
              <div className="text-3xl font-bold text-white">{journeys.length}</div>
              <div className="text-sm text-[#A0A8B8] mt-1">Adventures</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">{memories.length}</div>
              <div className="text-sm text-[#A0A8B8] mt-1">Memories</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">{discoveries.filter(d => d.saved).length}</div>
              <div className="text-sm text-[#A0A8B8] mt-1">Saved Discoveries</div>
            </div>
          </div>

          {/* CTAs */}
          <div className="mt-8 flex gap-3 flex-wrap">
            <Button variant="primary" onClick={() => go('start-journey')}>
              Start a Journey
            </Button>
            <Button variant="border" onClick={() => go('life-map')}>
              View Life Map
            </Button>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        
        {/* Left Column: Recent Adventures & Stories */}
        <div className="space-y-8">
          
          {/* Recent Adventures */}
          <section>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white">Recent Adventures</h2>
              <p className="text-sm text-[#A0A8B8] mt-2">Your most recent journeys and explorations</p>
            </div>

            <div className="space-y-4">
              {journeys.slice(0, 3).map((journey) => (
                <button
                  key={journey.id}
                  onClick={() => go('journey-details')}
                  className="w-full text-left rounded-[28px] border border-white/10 bg-[#161A22]/80 p-6 hover:bg-[#161A22] transition-all duration-200 group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className={`h-3 w-3 rounded-full bg-gradient-to-r ${journey.color}`} />
                        <h3 className="text-lg font-bold text-white group-hover:text-[#4F8CFF] transition">
                          {journey.title}
                        </h3>
                      </div>
                      <div className="mt-2 text-sm text-[#A0A8B8]">
                        {journey.location} • {journey.date}
                      </div>
                      <p className="mt-3 text-sm text-[#C8D0DC] leading-relaxed">
                        {journey.narrative}
                      </p>
                      <div className="mt-4 flex gap-2 flex-wrap">
                        {journey.tags?.map((tag) => (
                          <span key={tag} className="px-2 py-1 rounded-full bg-white/5 text-[11px] text-[#A0A8B8] font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-2xl font-bold text-[#4F8CFF]">{journey.distance}</div>
                      <div className="text-xs text-[#A0A8B8] mt-1 uppercase tracking-wide">Distance</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Memories & Discoveries */}
        <div className="space-y-8">
          
          {/* Recent Memories */}
          <section>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white">Memories Captured</h2>
              <p className="text-sm text-[#A0A8B8] mt-2">Moments worth remembering</p>
            </div>

            <div className="space-y-3">
              {memories.slice(0, 3).map((memory, idx) => (
                <div
                  key={idx}
                  className="rounded-[24px] border border-white/10 bg-[#161A22]/80 p-4 hover:bg-[#161A22] transition-all duration-200"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl shrink-0">
                      {memory.type === 'Photo' && '📷'}
                      {memory.type === 'Clip' && '🎬'}
                      {memory.type === 'Artifact' && '📝'}
                      {memory.type === 'Note' && '✨'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-white text-sm">{memory.title}</h4>
                      <p className="text-xs text-[#A0A8B8] mt-1">{memory.location}</p>
                      <p className="text-xs text-[#C8D0DC] mt-2 leading-relaxed">{memory.caption}</p>
                      <p className="text-[10px] text-[#A0A8B8] mt-2 uppercase tracking-wide">{memory.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Recent Discoveries */}
          <section>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white">Discoveries</h2>
              <p className="text-sm text-[#A0A8B8] mt-2">Places and events worth exploring</p>
            </div>

            <div className="space-y-3">
              {discoveries.slice(0, 3).map((discovery, idx) => (
                <div
                  key={idx}
                  className="rounded-[24px] border border-white/10 bg-[#161A22]/80 p-4 hover:bg-[#161A22] transition-all duration-200"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-white text-sm">{discovery.title}</h4>
                      <p className="text-xs text-[#A0A8B8] mt-1">{discovery.detail}</p>
                      <p className="text-[10px] text-[#A0A8B8] mt-2 uppercase tracking-wide">{discovery.category}</p>
                    </div>
                    <button
                      className={`shrink-0 text-xl transition-transform duration-200 hover:scale-110 ${
                        discovery.saved ? 'text-[#4F8CFF]' : 'text-[#A0A8B8]'
                      }`}
                    >
                      {discovery.saved ? '❤️' : '🤍'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
export default DashboardPage;
