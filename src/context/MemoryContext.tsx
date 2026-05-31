import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { Memory, MoodType } from '../types';

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
  const [memories, setMemories] = useState<Memory[]>([]);

  const addMemory = useCallback((memoryData: Omit<Memory, 'id' | 'timestamp'>): Memory => {
    const newMemory: Memory = {
      ...memoryData,
      id: `memory-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    };
    
    setMemories(prev => [newMemory, ...prev]);
    return newMemory;
  }, []);

  const updateMemory = useCallback((id: string, updates: Partial<Memory>) => {
    setMemories(prev => prev.map(memory => 
      memory.id === id ? { ...memory, ...updates } : memory
    ));
  }, []);

  const deleteMemory = useCallback((id: string) => {
    setMemories(prev => prev.filter(memory => memory.id !== id));
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
    return memories
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