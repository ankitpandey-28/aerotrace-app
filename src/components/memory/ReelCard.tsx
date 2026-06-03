import React from 'react';
import Card from '../ui/Card';

interface ReelCardProps {
  id: string;
  cover?: string;
  title: string;
  date: string;
  summary?: string;
  duration?: string;
  distance?: string;
  onOpen: (id: string) => void;
}

export function ReelCard({ id, cover, title, date, summary, duration, distance, onOpen }: ReelCardProps) {
  return (
    <Card className="group cursor-pointer overflow-hidden" animate>
      <div onClick={() => onOpen(id)}>
        <div className="h-44 w-full rounded-xl overflow-hidden bg-slate-800">
          {cover ? (
            // eslint-disable-next-line jsx-a11y/img-redundant-alt
            <img src={cover} alt={`Cover for ${title}`} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">📍</div>
          )}
        </div>

        <div className="mt-4 flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-white leading-tight">{title}</h3>
            <p className="text-[11px] text-slate-400 mt-1">{date}</p>
          </div>
          <div className="text-right text-[11px] text-slate-400">
            <div>{duration || '—'}</div>
            <div className="mt-1">{distance || '—'}</div>
          </div>
        </div>

        {summary && (
          <p className="mt-3 text-xs text-slate-300 line-clamp-3">{summary}</p>
        )}
      </div>
    </Card>
  );
}

export default ReelCard;
