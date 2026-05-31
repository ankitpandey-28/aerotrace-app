import React from 'react';
import { motion } from 'framer-motion';

interface PolaroidPhotoProps {
  src: string;
  caption?: string;
  rotation?: number;
  scale?: number;
  removable?: boolean;
  onRemove?: () => void;
  className?: string;
}

export function PolaroidPhoto({
  src,
  caption = '',
  rotation = 0,
  scale = 1,
  removable = false,
  onRemove,
  className = '',
}: PolaroidPhotoProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
      animate={{ opacity: 1, scale, rotate: rotation }}
      exit={{ opacity: 0, scale: 0.8, rotate: rotation + 10 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`relative inline-block ${className}`}
      style={{
        transform: `rotate(${rotation}deg) scale(${scale})`,
      }}
    >
      {/* Polaroid Frame */}
      <div className="relative bg-white p-3 pb-8 rounded-sm shadow-[0_8px_32px_-12px_rgba(0,0,0,0.4)] hover:shadow-[0_12px_48px_-16px_rgba(0,0,0,0.5)] transition-shadow duration-300">
        {/* Photo Container */}
        <div className="relative overflow-hidden rounded-sm bg-slate-100">
          <img
            src={src}
            alt={caption || 'Memory photo'}
            className="w-full h-40 object-cover"
          />
          
          {/* Remove Button */}
          {removable && onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-rose-500 text-white text-xs font-bold flex items-center justify-center hover:bg-rose-600 transition-colors shadow-lg"
            >
              ×
            </button>
          )}
        </div>

        {/* Caption Area */}
        {caption && (
          <p className="absolute bottom-2 left-0 right-0 text-center text-xs font-handwriting text-slate-600 px-2 truncate">
            {caption}
          </p>
        )}
      </div>
    </motion.div>
  );
}
export default PolaroidPhoto;