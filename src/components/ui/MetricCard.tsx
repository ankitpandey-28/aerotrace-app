import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  text?: string;
  className?: string;
}

export function MetricCard({ label, value, text, className = '' }: MetricCardProps) {
  return (
    <div className={`rounded-2xl border border-white/5 bg-white/[0.02] p-4 backdrop-blur-md ${className}`}>
      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-white">{value}</div>
      {text && <div className="mt-1 text-xs text-slate-400 font-light">{text}</div>}
    </div>
  );
}
export default MetricCard;
