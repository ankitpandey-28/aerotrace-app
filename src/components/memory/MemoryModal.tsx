import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMemory } from '../../context/MemoryContext';
import { useJourney } from '../../context/JourneyContext';
import type { Memory, MoodType, Discovery, DiscoveryCategory } from '../../types';
import { MOOD_OPTIONS, SUGGESTED_TAGS } from '../../types';
import PolaroidPhoto from './PolaroidPhoto';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface MemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (memory: Memory) => void;
}

export function MemoryModal({ isOpen, onClose, onSuccess }: MemoryModalProps) {
  const { addMemory } = useMemory();
  const { activeJourney, addDiscovery } = useJourney();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [discovery, setDiscovery] = useState('');
  const [mood, setMood] = useState<MoodType | ''>('');
  const [tags, setTags] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [isDiscovery, setIsDiscovery] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suggestion, setSuggestion] = useState<{ memory: Memory, category: string } | null>(null);

  // Get current location from active journey
  const currentLocation = activeJourney?.stops[activeJourney.stops.length - 1] || 'Along Route';

  // Handle photo upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setPhotos(prev => [...prev, event.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Remove photo
  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  // Toggle tag
  const toggleTag = (tag: string) => {
    setTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  // Add custom tag
  const addCustomTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags(prev => [...prev, trimmed]);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !mood) return;

    console.log('[MemoryModal submit] Form submitted:', {
      title: title.trim(),
      note: note.trim(),
      discovery: discovery.trim(),
      mood,
      tags,
      photosCount: photos.length,
      location: typeof currentLocation === 'string' ? currentLocation : currentLocation.name,
      journeyId: activeJourney?.id,
    });

    setIsSubmitting(true);

    // Simulate a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));

    const lastCoord = activeJourney?.coordinates[activeJourney.coordinates.length - 1];
    let lat = lastCoord?.lat;
    let lng = lastCoord?.lng;

    if (lat === undefined || lng === undefined) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 3000 });
        });
        lat = position.coords.latitude;
        lng = position.coords.longitude;
      } catch (err) {
        // Don't fallback to demo coordinates; leave coords undefined if unavailable
        lat = undefined;
        lng = undefined;
      }
    }

    console.log('[MemoryModal submit] Geotagging coordinates resolved to:', { lat, lng });

    const memoryData = {
      title: title.trim(),
      note: note.trim(),
      discovery: discovery.trim(),
      mood: mood as MoodType,
      tags,
      photos,
      location: typeof currentLocation === 'string' ? currentLocation : currentLocation.name,
      journeyId: activeJourney?.id,
      lat,
      lng,
    };

    const newMemory = addMemory(memoryData);
    
    // Evaluate discovery
    const hasDiscoveryField = discovery.trim().length > 0;
    
    // Heuristic checking
    const categoryKeywords = ['Food', 'Cafe', 'Nature', 'Landmark', 'Viewpoint', 'Hidden Gem', 'Activity', 'Personal'];
    let suggestedCategory = '';
    for (const tag of tags) {
      const match = categoryKeywords.find(c => tag.toLowerCase().includes(c.toLowerCase()));
      if (match) {
        suggestedCategory = match;
        break;
      }
    }
    
    if (isDiscovery || hasDiscoveryField) {
      // Auto create discovery
      const newDiscovery: Discovery = {
         id: `discovery-${Date.now()}`,
         title: title.trim(),
         category: (suggestedCategory || 'Personal') as DiscoveryCategory,
         description: discovery.trim() || note.trim(),
         lat,
         lng,
         timestamp: new Date().toISOString(),
         coverPhoto: photos[0],
         photo: photos[0],
         tags,
         sourceMemoryId: newMemory.id,
         sourceJourneyId: activeJourney?.id,
         locationName: typeof currentLocation === 'string' ? currentLocation : currentLocation.name,
         creationSource: isDiscovery ? 'manual' : 'discovery-field',
         visitCount: 1
      };
      addDiscovery(newDiscovery);
      
      resetForm();
      if (onSuccess) onSuccess(newMemory);
      onClose();
    } else if (suggestedCategory) {
       // Show suggestion prompt!
       setSuggestion({ memory: newMemory, category: suggestedCategory });
    } else {
       resetForm();
       if (onSuccess) onSuccess(newMemory);
       onClose();
    }
  };

  const resetForm = () => {
    setTitle('');
    setNote('');
    setDiscovery('');
    setMood('');
    setTags([]);
    setPhotos([]);
    setIsDiscovery(false);
    setIsSubmitting(false);
  };

  const handleCreateSuggestedDiscovery = () => {
    if (!suggestion) return;
    
    const newDiscovery: Discovery = {
       id: `discovery-${Date.now()}`,
       title: suggestion.memory.title,
       category: suggestion.category as DiscoveryCategory,
       description: suggestion.memory.note || 'A meaningful find.',
       lat: suggestion.memory.lat,
       lng: suggestion.memory.lng,
       timestamp: new Date().toISOString(),
       coverPhoto: suggestion.memory.photos?.[0],
       photo: suggestion.memory.photos?.[0],
       tags: suggestion.memory.tags,
       sourceMemoryId: suggestion.memory.id,
       sourceJourneyId: activeJourney?.id,
       locationName: suggestion.memory.location,
       creationSource: 'suggested',
       visitCount: 1
    };
    addDiscovery(newDiscovery);
    
    resetForm();
    if (onSuccess) onSuccess(suggestion.memory);
    setSuggestion(null);
    onClose();
  };

  const handleDismissSuggestion = () => {
    if (suggestion && onSuccess) {
      onSuccess(suggestion.memory);
    }
    resetForm();
    setSuggestion(null);
    onClose();
  };

  // Get random rotation for polaroid effect
  const getRandomRotation = (index: number) => {
    const rotations = [-3, 2, -1, 3, -2, 1];
    return rotations[index % rotations.length];
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="w-full max-w-2xl my-8"
          >
            <Card className="max-h-[90vh] overflow-y-auto custom-scrollbar">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
                    MEMORY JOURNAL
                  </span>
                  <h2 className="text-xl font-bold text-white mt-1">Capture This Moment</h2>
                </div>
                <Button
                  type="button"
                  variant="glass"
                  size="sm"
                  className="text-slate-400 px-3 py-2"
                  onClick={onClose}
                >
                  ✕
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                {/* Photos Section */}
                <section>
                  <label className="block mb-3 text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">
                    📷 Photos
                  </label>
                  
                  {photos.length > 0 ? (
                    <div className="flex flex-wrap gap-4 mb-4 justify-center p-4 bg-white/5 rounded-2xl">
                      {photos.map((photo, index) => (
                        <PolaroidPhoto
                          key={index}
                          src={photo}
                          rotation={getRandomRotation(index)}
                          removable
                          onRemove={() => removePhoto(index)}
                        />
                      ))}
                    </div>
                  ) : null}

                  <div className="relative">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="border-2 border-dashed border-white/10 rounded-2xl p-6 text-center hover:border-cyan-400/30 transition-colors bg-white/5">
                      <span className="text-3xl mb-2 block">📸</span>
                      <p className="text-sm text-slate-400">
                        Click to upload photos or drag and drop
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        PNG, JPG up to 10MB each
                      </p>
                    </div>
                  </div>
                </section>

                {/* Title */}
                <div>
                  <label className="block mb-2 text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Give this memory a title..."
                    required
                    className="w-full rounded-[28px] border border-white/10 bg-[#161A22] px-4 py-3 text-sm text-white placeholder-[#A0A8B8] shadow-[0_12px_40px_-24px_rgba(0,0,0,0.85)] transition-all duration-200 focus:border-cyan-400/20 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                  />
                </div>

                {/* Personal Note */}
                <div>
                  <label className="block mb-2 text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">
                    📝 Personal Note
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Describe what happened, how you felt, what you noticed..."
                    rows={4}
                    className="w-full rounded-2xl border border-white/10 bg-[#161A22] px-4 py-3 text-sm text-white placeholder-[#A0A8B8] shadow-[0_12px_40px_-24px_rgba(0,0,0,0.85)] transition-all duration-200 focus:border-cyan-400/20 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 resize-none"
                  />
                </div>

                {/* Discovery */}
                <div>
                  <label className="block mb-2 text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">
                    💡 Discovery
                  </label>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-300">Mark as Discovery</span>
                    <button
                      type="button"
                      onClick={() => setIsDiscovery(!isDiscovery)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        isDiscovery ? 'bg-cyan-400' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          isDiscovery ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={discovery}
                    onChange={(e) => setDiscovery(e.target.value)}
                    placeholder="Found something interesting? A hidden gem, new insight..."
                    className="w-full rounded-[28px] border border-white/10 bg-[#161A22] px-4 py-3 text-sm text-white placeholder-[#A0A8B8] shadow-[0_12px_40px_-24px_rgba(0,0,0,0.85)] transition-all duration-200 focus:border-cyan-400/20 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                  />
                </div>

                {/* Mood Selector */}
                <div>
                  <label className="block mb-3 text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">
                    😊 How are you feeling?
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                    {MOOD_OPTIONS.map(({ value, emoji, color }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setMood(mood === value ? '' : value)}
                        className={`relative p-3 rounded-2xl transition-all duration-200 ${
                          mood === value
                            ? `bg-gradient-to-br ${color} text-white shadow-lg scale-105`
                            : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <span className="text-xl block mb-1">{emoji}</span>
                        <span className="text-[10px] font-semibold">{value}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block mb-3 text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">
                    🏷 Tags
                  </label>
                  
                  {/* Selected Tags */}
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {tags.map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-cyan-400/20 text-cyan-300 text-xs font-semibold"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => toggleTag(tag)}
                            className="hover:text-white"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Suggested Tags */}
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTED_TAGS.map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${
                          tags.includes(tag)
                            ? 'bg-cyan-400 text-slate-950'
                            : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Location & Timestamp */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">
                      📍 Location
                    </label>
                    <div className="rounded-[28px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                      {typeof currentLocation === 'string' ? currentLocation : currentLocation.name}
                    </div>
                  </div>
                  <div>
                    <label className="block mb-2 text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">
                      ⏰ Timestamp
                    </label>
                    <div className="rounded-[28px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                      {new Date().toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  variant="primary" 
                  className="w-full mt-4"
                  disabled={isSubmitting || !title.trim() || !mood}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving Memory...
                    </span>
                  ) : (
                    '✨ Save Memory'
                  )}
                </Button>
              </form>
            </Card>
          </motion.div>
          
          {/* Suggestion Overlay */}
          <AnimatePresence>
            {suggestion && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-md"
              >
                <Card className="w-full max-w-md p-6 text-center border border-cyan-400/30 shadow-[0_0_50px_-12px_rgba(34,211,238,0.2)]">
                  <div className="w-16 h-16 rounded-full bg-cyan-400/10 flex items-center justify-center mx-auto mb-4 text-3xl">
                    💡
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Create Discovery?</h3>
                  <p className="text-slate-400 text-sm mb-6">
                    You tagged this memory with <strong>{suggestion.category}</strong>. 
                    Would you like to save <strong>{suggestion.memory.title}</strong> as a curated Discovery?
                  </p>
                  
                  <div className="space-y-3">
                    <Button 
                      onClick={handleCreateSuggestedDiscovery}
                      variant="primary" 
                      className="w-full"
                    >
                      ✨ Create Discovery
                    </Button>
                    <Button 
                      onClick={handleDismissSuggestion}
                      variant="glass" 
                      className="w-full text-slate-400"
                    >
                      Dismiss
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </AnimatePresence>
  );
}
export default MemoryModal;