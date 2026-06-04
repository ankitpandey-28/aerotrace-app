import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import type { Memory, MoodType } from '../types';

const STORAGE_KEY = 'aerotrace_memories_v1';

interface MemoryContextType {
  memories: Memory[];
  addMemory: (memory: Omit<Memory, 'id' | 'timestamp'>) => Memory;
  updateMemory: (id: string, updates: Partial<Memory>) => void;
  deleteMemory: (id: string) => void;
  getMemoriesByJourney: (journeyId: string) => Memory[];
  getMemoriesByMood: (mood: MoodType) => Memory[];
  getMemoriesByTag: (tag: string) => Memory[];
  getRecentMemories: (count?: number) => Memory[];
}

const MemoryContext = createContext<MemoryContextType | undefined>(undefined);

export function MemoryProvider({ children }: { children: React.ReactNode }) {
  const [memories, setMemories] = useState<Memory[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed as Memory[];
    } catch (e) {
      console.warn('[MemoryContext] failed to parse saved memories', e);
      return [];
    }
  });

  // No dev seeding: Memory state must come from real usage or persisted saved journeys

  // Listen for storage events to synchronize across tabs/windows
  useEffect(() => {
    const onStorage = (ev: StorageEvent) => {
      if (ev.key !== STORAGE_KEY) return;
      try {
        if (!ev.newValue) {
          setMemories([]);
          return;
        }
        const parsed = JSON.parse(ev.newValue);
        if (Array.isArray(parsed)) setMemories(parsed as Memory[]);
      } catch (e) {
        console.warn('[MemoryContext] storage event parse error', e);
      }
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const addMemory = useCallback((memoryData: Omit<Memory, 'id' | 'timestamp'>): Memory => {
    const newMemory: Memory = {
      ...memoryData,
      id: `memory-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    };
    
    console.log('[addMemory()] Added memory to MemoryContext:', newMemory);
    setMemories(prev => {
      const next = [newMemory, ...prev];
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
    return newMemory;
  }, []);

  const updateMemory = useCallback((id: string, updates: Partial<Memory>) => {
    setMemories(prev => {
      const next = prev.map(memory => memory.id === id ? { ...memory, ...updates } : memory);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const deleteMemory = useCallback((id: string) => {
    setMemories(prev => {
      const next = prev.filter(memory => memory.id !== id);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const getMemoriesByJourney = useCallback((journeyId: string) => {
    return memories.filter(memory => memory.journeyId === journeyId);
  }, [memories]);

  const getMemoriesByMood = useCallback((mood: MoodType) => {
    return memories.filter(memory => memory.mood === mood);
  }, [memories]);

  const getMemoriesByTag = useCallback((tag: string) => {
    return memories.filter(memory => memory.tags.includes(tag));
  }, [memories]);

  const getRecentMemories = useCallback((count: number = 10) => {
    return [...memories]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, count);
  }, [memories]);

  const value = useMemo(() => ({
    memories,
    addMemory,
    updateMemory,
    deleteMemory,
    getMemoriesByJourney,
    getMemoriesByMood,
    getMemoriesByTag,
    getRecentMemories,
  }), [memories, addMemory, updateMemory, deleteMemory, getMemoriesByJourney, getMemoriesByMood, getMemoriesByTag, getRecentMemories]);

  return (
    <MemoryContext.Provider value={value}>
      {children}
    </MemoryContext.Provider>
  );
}

export function useMemory() {
  const context = useContext(MemoryContext);
  if (!context) {
    throw new Error('useMemory must be used within a MemoryProvider');
  }
  return context;
}