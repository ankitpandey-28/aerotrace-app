import React from 'react';
import { motion } from 'framer-motion';

interface RouteCanvasProps {
  coordinates?: { x: number; y: number }[];
  color?: string;
  stopsCount?: number;
}

export function RouteCanvas({ 
  coordinates = [
    { x: 15, y: 75 }, 
    { x: 30, y: 60 }, 
    { x: 45, y: 65 }, 
    { x: 55, y: 40 }, 
    { x: 75, y: 30 },
    { x: 85, y: 45 }
  ],
  color = 'rgba(34,211,238,0.95)',
  stopsCount = 3
}: RouteCanvasProps) {
  
  // Assemble SVG path from array of coordinate markers
  const getSvgPath = () => {
    if (coordinates.length === 0) return '';
    return coordinates.reduce((path, coord, index) => {
      return index === 0 
        ? `M ${coord.x},${coord.y}` 
        : `${path} L ${coord.x},${coord.y}`;
    }, '');
  };

  const pathData = getSvgPath();
  const lastCoordinate = coordinates[coordinates.length - 1] || { x: 50, y: 50 };

  return (
    <div className="relative h-full w-full overflow-hidden rounded-[24px] border border-white/5 bg-[#0b0f19]">
      <div className="absolute inset-0 grid-fade opacity-20 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.06),transparent_38%)] pointer-events-none" />

      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Glow backdrop path */}
        {pathData && (
          <path
            d={pathData}
            stroke="rgba(34,211,238,0.15)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        )}

        {/* Primary vector track */}
        {pathData && (
          <motion.path
            d={pathData}
            stroke={color}
            strokeWidth="0.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            initial={{ pathLength: 0.9 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5 }}
          />
        )}

        {/* Dotted tracer line */}
        {pathData && (
          <path
            d={pathData}
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="0.4"
            strokeDasharray="0.8,1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        )}

        {/* Historic Stop Coordinates */}
        {coordinates.map((coord, idx) => {
          const isLast = idx === coordinates.length - 1;
          const isFirst = idx === 0;
          
          if (isLast || isFirst || idx % 2 === 0) {
            return (
              <circle
                key={idx}
                cx={coord.x}
                cy={coord.y}
                r={isLast ? 2 : 1.2}
                fill={isLast ? '#ffffff' : 'rgba(255, 255, 255, 0.7)'}
              />
            );
          }
          return null;
        })}
      </svg>

      {/* GPS Active pulsing beacon */}
      <div 
        className="absolute z-10"
        style={{ left: `${lastCoordinate.x}%`, top: `${lastCoordinate.y}%`, transform: 'translate(-50%, -50%)' }}
      >
        <motion.div
          className="absolute -inset-2.5 rounded-full bg-cyan-400/20"
          animate={{ scale: [1, 2, 1], opacity: [0.6, 0.1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <div className="h-2 w-2 rounded-full bg-cyan-400 border border-white" />
      </div>

      <div className="absolute top-4 left-4 flex gap-2">
        <span className="rounded-full bg-slate-900/90 border border-white/5 px-2.5 py-1 text-[9px] uppercase tracking-wider font-semibold text-slate-400 shadow-sm select-none">
          GPS Live Tracking
        </span>
        <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-[9px] uppercase tracking-wider font-semibold text-emerald-300 shadow-sm select-none">
          Signal Synchronized
        </span>
      </div>

      <div className="absolute bottom-4 right-4 rounded-full bg-slate-900/90 border border-white/5 px-3 py-1.5 text-[9px] text-slate-400 font-light select-none">
        Telemetry Active: <span className="font-semibold text-white">{coordinates.length} Logs</span>
      </div>
    </div>
  );
}
export default RouteCanvas;
