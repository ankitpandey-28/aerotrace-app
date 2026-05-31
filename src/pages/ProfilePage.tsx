import React from 'react';
import { useJourney } from '../context/JourneyContext';
import Card from '../components/ui/Card';
import MetricCard from '../components/ui/MetricCard';

export function ProfilePage() {
  const { user } = useJourney();

  return (
    <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
      {/* Account Info Column */}
      <div className="space-y-6">
        <section className="rounded-[28px] border border-white/5 bg-slate-900/40 p-6 backdrop-blur-xl">
          <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500 font-medium">
            MEMBER DETAILS
          </span>
          
          <div className="mt-6 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-gradient-to-br from-cyan-400 to-indigo-500 text-xl font-bold text-slate-950">
              {user?.avatar || 'AM'}
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">
                {user?.name || 'Alex Morgan'}
              </h2>
              <div className="text-[10px] text-slate-400 font-light uppercase tracking-wider mt-0.5">
                Premium Wanderer • Member since 2020
              </div>
            </div>
          </div>

          <p className="mt-4 text-xs text-slate-400 font-light leading-5">
            City walker, detour archivist, and note keeper. You use AeroTrace to preserve the physical coordinate patterns of your years, locking snapshots and memories to geography.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <MetricCard label="Historic Loops" value="248 Runs" text="Completed exploring tracks" />
            <MetricCard label="Anchors Mapped" value="18 Locations" text="Home-like landmarks established" />
            <MetricCard label="Average Pace" value="Walking" text="Optimized for observation" />
            <MetricCard label="Story Chapters" value="61 Collections" text="Saved retrospective books" />
          </div>
        </section>
      </div>

      {/* Account Controls Column */}
      <div className="space-y-6">
        
        {/* Sync Settings */}
        <Card>
          <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
            METRICS SYNC
          </span>

          <h3 className="mt-3 text-sm font-semibold text-white">System Settings</h3>
          
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-white/5 text-xs">
              <span className="text-slate-400 font-light">Email Address</span>
              <span className="font-semibold text-white">{user?.email || 'alex@aerotrace.app'}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/5 text-xs">
              <span className="text-slate-400 font-light">Home Base District</span>
              <span className="font-semibold text-white">San Francisco, CA</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/5 text-xs">
              <span className="text-slate-400 font-light">Cloud Backups</span>
              <span className="font-semibold text-white text-emerald-400">Active (Secure Token)</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/5 text-xs">
              <span className="text-slate-400 font-light">Telemetry Precision</span>
              <span className="font-semibold text-white">Balanced (Low Battery)</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
export default ProfilePage;
