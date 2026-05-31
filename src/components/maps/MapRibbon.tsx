import React from 'react';

export function MapRibbon() {
  return (
    <div className="relative h-36 overflow-hidden rounded-[20px] border border-white/5 bg-[#0b0f19]">
      {/* Ambient Radial Backlights */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.12),transparent_25%),radial-gradient(circle_at_80%_30%,rgba(168,85,247,0.1),transparent_22%)] pointer-events-none" />
      <div className="absolute inset-0 grid-fade opacity-20 pointer-events-none" />
      
      {/* Route Graphic */}
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 600 240" fill="none" preserveAspectRatio="none">
        {/* Soft Shadow path */}
        <path
          d="M 60,180 C 130,120 160,90 220,100 C 280,110 320,140 370,120 C 420,100 480,60 540,80"
          stroke="rgba(34,211,238,0.12)"
          strokeWidth="6"
          strokeLinecap="round"
        />
        {/* Core route line */}
        <path
          d="M 60,180 C 130,120 160,90 220,100 C 280,110 320,140 370,120 C 420,100 480,60 540,80"
          stroke="rgba(255,255,255,0.75)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Dash overlay */}
        <path
          d="M 60,180 C 130,120 160,90 220,100 C 280,110 320,140 370,120 C 420,100 480,60 540,80"
          stroke="rgba(34,211,238,0.9)"
          strokeWidth="1.5"
          strokeDasharray="4,6"
          strokeLinecap="round"
        />

        {/* Nodes */}
        {[
          [60, 180],
          [140, 126],
          [220, 100],
          [280, 110],
          [370, 120],
          [460, 78],
          [540, 80],
        ].map(([x, y], i) => (
          <circle 
            key={i} 
            cx={x} 
            cy={y} 
            r={i === 2 || i === 4 ? 4.5 : 3.5} 
            fill="white" 
            opacity={i === 2 || i === 4 ? 1 : 0.65} 
          />
        ))}
      </svg>

      <div className="absolute bottom-3 left-4 text-[9px] uppercase tracking-widest text-slate-500 font-medium">
        LIVING CORRIDOR RADAR
      </div>
    </div>
  );
}
export default MapRibbon;
