import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import Header from './Header';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#020617] text-slate-100">
      
      {/* 1. Desktop Persistent Sidebar */}
      <aside className="hidden xl:block w-64 shrink-0 h-full">
        <Sidebar />
      </aside>

      {/* 2. Mobile Drawer Navigation Overlay */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            {/* Backdrop cover filter */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm xl:hidden"
            />
            {/* Sliding navigation drawers */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="fixed bottom-0 top-0 left-0 z-50 w-64 bg-slate-900 xl:hidden h-full shadow-2xl"
            >
              <Sidebar onCloseMobile={() => setMobileSidebarOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 3. Primary Content & Header Assembly */}
      <div className="flex flex-col flex-1 h-full overflow-hidden">
        <Header onOpenMobileSidebar={() => setMobileSidebarOpen(true)} />
        
        {/* Scrollable Viewport Area */}
        <main className="flex-1 overflow-y-auto px-6 py-6 sm:px-10">
          <div className="mx-auto max-w-[1400px] pb-10">
            {children}
          </div>
        </main>
      </div>

    </div>
  );
}
export default AppShell;
