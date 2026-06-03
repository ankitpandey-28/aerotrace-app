import type { Discovery } from '../../types';

export type JournalCardSize = 'wide' | 'tall' | 'standard';

export function getDiscoveryPhoto(discovery: Discovery): string | undefined {
  return discovery.coverPhoto || discovery.photo;
}

export function formatDiscoveryDate(timestamp: string): string {
  try {
    return new Date(timestamp).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return timestamp;
  }
}

export function formatDiscoveryDateShort(timestamp: string): string {
  try {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return timestamp;
  }
}

export function getStoryExcerpt(description: string, maxLength = 120): string {
  const text = (description || '').trim();
  if (!text) return 'A place that stayed with you.';
  if (text.length <= maxLength) return text;
  const cut = text.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 40 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

export function getPolaroidRotation(index: number): number {
  const rotations = [-2.8, 1.6, -1.2, 2.4, -0.8, 1.9, -2.2, 0.6];
  return rotations[index % rotations.length];
}

export function getJournalCardSize(index: number): JournalCardSize {
  if (index % 7 === 0) return 'wide';
  if (index % 4 === 1) return 'tall';
  return 'standard';
}

export const CATEGORY_EMOJI: Record<string, string> = {
  Food: '🍽️',
  Cafe: '☕',
  Nature: '🌿',
  Landmark: '🏛️',
  Viewpoint: '🌅',
  'Hidden Gem': '✨',
  Activity: '🎭',
  Personal: '💫',
};
