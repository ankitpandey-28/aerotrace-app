import React, { useState } from 'react';
import { useJourney } from '../context/JourneyContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import MetricCard from '../components/ui/MetricCard';

export function SafetyCenterPage() {
  const { triggerSOS, sosActive, resetSOS } = useJourney();
  const [contacts, setContacts] = useState([
    { name: 'Maya Chen', relation: 'Partner', active: true },
    { name: 'Jordan Lee', relation: 'Coworker', active: true },
    { name: 'Priya Shah', relation: 'Sister', active: false },
  ]);

  const handleToggleContact = (name: string) => {
    setContacts(prev => prev.map(c => 
      c.name === name ? { ...c, active: !c.active } : c
    ));
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
      {/* Controls Column */}
      <div className="space-y-6">
        <section className="rounded-[28px] border border-white/5 bg-slate-900/40 p-6 backdrop-blur-xl">
          <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500 font-medium">
            JOURNEY PROTECTION
          </span>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Safety Center
          </h2>
          <p className="mt-2 text-xs text-slate-400 font-light leading-5">
            AeroTrace is built for exploration. True freedom requires confidence. Our safety architecture keeps trusted circles updated with context-aware ETA crumbs—quietly, without social clutter.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <MetricCard label="Trusted Contacts" value="3 Configured" text="Receiving live traces" />
            <MetricCard label="SOS Status" value={sosActive ? 'TRIGGERED' : 'READY'} text="SOS telemetry sync" />
            <MetricCard label="Auto Check-ins" value="4 Completed" text="Schedule verified" />
          </div>

          {/* Trusted contacts list */}
          <div className="mt-8 border-t border-white/5 pt-6">
            <h3 className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500 mb-4">
              Your Trusted Contacts
            </h3>
            
            <div className="space-y-3">
              {contacts.map((c, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-white/[0.01]">
                  <div>
                    <div className="text-sm font-semibold text-white">{c.name}</div>
                    <div className="text-[10px] text-slate-500 font-light mt-0.5">{c.relation}</div>
                  </div>

                  <Button
                    type="button"
                    variant={c.active ? 'success' : 'glass'}
                    size="sm"
                    onClick={() => handleToggleContact(c.name)}
                    className={`rounded-full text-xs font-semibold ${c.active ? 'px-4 py-2' : 'px-4 py-2 text-slate-400'}`}
                  >
                    {c.active ? 'Broadcasting active' : 'Broadcasting paused'}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Emergency triggers side block */}
      <div className="space-y-6">
        
        {/* SOS Card */}
        <Card className="border-rose-500/20" glowColor={sosActive ? 'bg-rose-500' : ''}>
          <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
            EMERGENCY OVERRIDE
          </span>
          <h3 className="mt-3 text-lg font-semibold text-white">Trigger Live SOS Alert</h3>
          <p className="mt-2 text-xs text-slate-400 font-light leading-5">
            Instantly sends an encrypted, high-priority distress token containing active GPS coordinates, a brief ambient audio buffer, and cell tower telemetry logs to your active trusted contacts.
          </p>

          <div className="mt-6 flex flex-col gap-3">
            {sosActive ? (
              <Button variant="primary" className="bg-white text-slate-900 font-bold" onClick={resetSOS}>
                Reset Alert System
              </Button>
            ) : (
              <Button variant="danger" className="font-bold" onClick={triggerSOS}>
                ACTIVATE SOS NOW 🚨
              </Button>
            )}
            
            <span className="text-[9px] text-slate-500 font-light text-center">
              Requires active cellular coordinates or Wi-Fi token sync.
            </span>
          </div>
        </Card>

        {/* Quiet check-in scheduling */}
        <Card>
          <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
            AUTOMATIC BREADCRUMBS
          </span>
          <h3 className="mt-3 text-sm font-semibold text-white">Passive Check-in Timers</h3>
          <p className="mt-2 text-xs text-slate-400 font-light leading-5">
            If you do not register stops or coordinates changes for 45 minutes inside active exploration zones, AeroTrace will quietly prompt a safety check-in.
          </p>
        </Card>
      </div>
    </div>
  );
}
export default SafetyCenterPage;
