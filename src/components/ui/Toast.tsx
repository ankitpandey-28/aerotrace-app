import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ToastProps {
  show: boolean;
  message: string;
  subtitle?: string;
  onClose: () => void;
  duration?: number;
}

export function Toast({ show, message, subtitle, onClose, duration = 4000 }: ToastProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="fixed top-6 right-6 z-[100] max-w-sm rounded-[20px] border border-white/10 bg-slate-900/90 px-5 py-4 shadow-2xl backdrop-blur-2xl"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-400/10 text-cyan-300">
              ⚡
            </div>
            <div>
              <div className="text-sm font-semibold text-white">{message}</div>
              {subtitle && <div className="mt-1 text-xs text-slate-400 font-light">{subtitle}</div>}
            </div>
            <button 
              onClick={onClose} 
              className="ml-auto text-slate-500 hover:text-white transition-colors text-xs"
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
export default Toast;
