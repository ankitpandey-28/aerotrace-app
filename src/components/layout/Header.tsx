import React from 'react';
import { useNavigation } from '../../context/NavigationContext';
import type { Page } from '../../types';

interface HeaderProps {
  onOpenMobileSidebar: () => void;
}

export function Header({ onOpenMobileSidebar }: HeaderProps) {
  const { page } = useNavigation();

  const getPageTitle = (p: Page) => {
    const titles: Record<Page, string> = {
      landing: 'Welcome',
      login: 'Sign In',
      signup: 'Create Account',
      dashboard: 'Overview',
      'start-journey': 'Setup Adventure',
      'live-journey': 'Live Telemetry Cockpit',
      'journey-summary': 'Chapter Summary',
      'journey-details': 'Chapters Retrospective',
      memories: 'Scrapbook Reel',
      'memories-reel': 'Memories Reel',
      discover: 'Discoveries Cabinet',
      'life-map': 'Signature Life Map',
      safety: 'Safety Control Center',
      profile: 'Explorer Statistics',
    };
    return titles[p] || 'AeroTrace';
  };

  return (
    <header className="flex h-16 w-full items-center justify-between border-b border-white/5 bg-slate-900/20 px-6 backdrop-blur-md">
      
      {/* Mobile Drawer Trigger & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-300 xl:hidden hover:bg-white/10"
        >
          ☰
        </button>
        
        <div>
          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 font-light select-none">
            AEROTRACE / BREADCRUMBS
          </span>
          <h1 className="text-sm font-bold text-white tracking-wide">
            {getPageTitle(page)}
          </h1>
        </div>
      </div>

      {/* Static status indicator */}
      <div className="flex items-center gap-4">
        {/* Secure session status indicator */}
        <div className="hidden sm:flex items-center gap-2 rounded-full border border-white/5 bg-white/[0.02] px-3.5 py-1 text-[10px] font-bold uppercase text-slate-400 tracking-wider select-none">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
          Secure trace active
        </div>
      </div>

    </header>
  );
}
export default Header;
