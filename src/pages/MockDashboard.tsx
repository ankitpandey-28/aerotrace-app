import React from 'react';
import Card from '../components/ui/Card';
import MetricCard from '../components/ui/MetricCard';
import MapRibbon from '../components/maps/MapRibbon';

export function MockDashboard() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
      {/* Welcome & Stats Row */}
      <div className="space-y-6">
        <section className="rounded-[28px] border border-white/5 bg-slate-900/40 p-6 backdrop-blur-xl">
          <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500 font-medium">
            TELEMETRY DASHBOARD
          </span>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Welcome back, Alex.
          </h2>
          <p className="mt-2 text-xs text-slate-400 font-light leading-5">
            Your life is in motion. AeroTrace has synced your active coordinate chains and generated your morning district stories.
          </p>
        </section>

        {/* Mock Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard label="Active Constellation" value="14 Nodes" text="Memory Landmarks Mapped" />
          <MetricCard label="Captures Logged" value="27 Items" text="Photos, Clips & Audio Notes" />
          <MetricCard label="Explored Zones" value="6 Districts" text="San Francisco & Shoreline" />
        </div>

        {/* Static Map preview */}
        <section className="rounded-[28px] border border-white/5 bg-slate-900/40 p-6 backdrop-blur-xl">
          <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500 font-medium">
            ACTIVE BREADCRUMBS
          </span>
          <div className="mt-4">
            <MapRibbon />
          </div>
        </section>
      </div>

      {/* Sidebar Insights */}
      <div className="space-y-6">
        <Card glowColor="bg-cyan-400">
          <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
            PERSONAL RADAR
          </span>
          <h3 className="mt-3 text-base font-semibold text-white">District Insights</h3>
          <p className="mt-1 text-xs text-slate-400 font-light leading-5">
            AI analytics mapping repeated routes and anomalies.
          </p>
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-white/5 text-xs">
              <span className="text-slate-400 font-light">Anchor Zone</span>
              <span className="font-semibold text-white">River Line District</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/5 text-xs">
              <span className="text-slate-400 font-light">Peak Activity Time</span>
              <span className="font-semibold text-white">8:10 PM - Sunset</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
export default MockDashboard;
