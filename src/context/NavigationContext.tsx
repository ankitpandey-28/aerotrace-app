import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Page } from '../types';

interface NavigationContextType {
  page: Page;
  go: (nextPage: Page, params?: Record<string, string>) => void;
  prevPage: Page | null;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  // Parse initial page from hash, fallback to 'landing'
  const getPageFromHash = (): Page => {
    const hash = window.location.hash.replace('#/', '');
    const pagePart = hash.split('?')[0];
    const validPages: Page[] = [
      'landing', 'login', 'signup', 'dashboard', 'start-journey',
      'live-journey', 'journey-summary', 'journey-details', 'memories', 'memories-reel',
      'discover', 'life-map', 'safety', 'profile'
    ];
    return validPages.includes(pagePart as Page) ? (pagePart as Page) : 'landing';
  };

  const [page, setPageState] = useState<Page>(getPageFromHash);
  const [prevPage, setPrevPage] = useState<Page | null>(null);

  useEffect(() => {
    const handleHashChange = () => {
      const nextPage = getPageFromHash();
      setPageState((current) => {
        if (current !== nextPage) {
          setPrevPage(current);
        }
        return nextPage;
      });
    };

    window.addEventListener('hashchange', handleHashChange);
    // Initial sync — do not auto-redirect to protected routes here.
    const currentHash = window.location.hash;
    const landingHashes = ['', '#', '#/', '#/landing'];
    if (landingHashes.includes(currentHash)) {
      try {
        window.history.replaceState(null, '', '#/landing');
      } catch {
        window.history.replaceState(null, '', '#/landing');
      }
    }

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const go = (nextPage: Page, params?: Record<string, string>) => {
    setPrevPage(page);
    let url = `#/${nextPage}`;
    if (params) {
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams.toString()}`;
    }
    window.location.hash = url;
  };

  return (
    <NavigationContext.Provider value={{ page, go, prevPage }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}
