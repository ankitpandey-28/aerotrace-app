import React from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { useAuth } from '../../context/AuthContext';
import type { Page } from '../../types';

interface SidebarProps {
  onCloseMobile?: () => void;
}

interface NavItem {
  id: Page;
  label: string;
  icon: string;
}

interface NavGroup {
  label: string;
  pages: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: 'Explore',
    pages: [
      { id: 'dashboard', label: 'Overview', icon: '🌌' },
      { id: 'life-map', label: 'Life Map', icon: '🗺️' },
      { id: 'start-journey', label: 'Start Loop', icon: '⚡' },
    ],
  },
  {
    label: 'Archive',
    pages: [
      { id: 'memories', label: 'Memories Reel', icon: '🎙️' },
      { id: 'discover', label: 'Discoveries', icon: '📡' },
    ],
  },
  {
    label: 'Personal',
    pages: [
      { id: 'safety', label: 'Safety Center', icon: '🛡️' },
      { id: 'profile', label: 'Explorer Stats', icon: '👤' },
    ],
  },
];

export function Sidebar({ onCloseMobile }: SidebarProps) {
  const { page: activePage, go } = useNavigation();
  const { logout } = useAuth();

  const handleNav = (id: Page) => {
    // For Sprint 1, limit actual navigation to dashboard or landing if they log out
    // If they click on pages not in Sprint 1, let them see a clean mock, or just route to dashboard
    const sprintPages = ['dashboard', 'profile', 'safety', 'memories', 'discover', 'life-map', 'start-journey'];
    if (sprintPages.includes(id)) {
      go(id);
    } else {
      go('dashboard');
    }
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <div className="flex h-full flex-col justify-between p-4 bg-slate-900/40 border-r border-white/5 backdrop-blur-xl">
      
      {/* Upper navigation area */}
      <div>
        
        {/* Brand details */}
        <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-4 select-none">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 border border-white/10 font-bold text-white text-sm">
            AT
          </div>
          <div>
            <div className="text-xs font-bold tracking-wider text-white uppercase">AeroTrace</div>
            <div className="text-[9px] text-slate-500 uppercase tracking-widest font-light">Explore Platform</div>
          </div>
        </div>

        {/* Group pages */}
        <div className="space-y-5">
          {navGroups.map((group) => (
            <div key={group.label}>
              <div className="mb-2 text-[9px] uppercase font-bold tracking-[0.25em] text-slate-500">
                {group.label}
              </div>
              <div className="space-y-1">
                {group.pages.map((item) => {
                  const isActive = activePage === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNav(item.id)}
                      className={`w-full rounded-2xl px-4 py-2.5 text-left text-xs font-semibold flex items-center gap-3 transition duration-150 ${
                        isActive
                          ? 'bg-white text-slate-950 shadow-md shadow-white/5'
                          : 'text-slate-400 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <span className="text-sm">{item.icon}</span>
                      <span className="flex-1">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Footer logout controls */}
      <div className="border-t border-white/5 pt-4">
        <button
          onClick={() => {
            logout();
            go('landing');
          }}
          className="w-full rounded-2xl border border-white/5 bg-white/[0.01] px-4 py-2.5 text-center text-xs font-semibold text-slate-400 hover:bg-rose-500/10 hover:border-rose-500/25 hover:text-rose-300 transition duration-200"
        >
          Sign Out
        </button>
      </div>

    </div>
  );
}
export default Sidebar;
