import type { MapNode, MapRoute, MoodType, Discovery } from '../types';
import type { SavedJourneyMemory } from './journeyStorage';

export interface BuildLifeMapInput {
  journeyName: string;
  dateLabel: string;
  mood: MoodType | string;
  storySummary: string;
  totalDistance: string;
  totalDuration: string;
  stops: Array<{ name: string; time: string; memoryCount?: number }>;
  memories: SavedJourneyMemory[];
  discoveries: Discovery[];
  getCoordsForStop: (idx: number) => { lat?: number; lng?: number; timestamp?: string };
  gpsPath?: Array<{ lat: number; lng: number }>;
}

function formatVisitTime(timestamp?: string, fallback?: string): string {
  if (timestamp) {
    try {
      const d = new Date(timestamp);
      if (!Number.isNaN(d.getTime())) {
        return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      }
    } catch {
      /* use fallback */
    }
  }
  return fallback || '';
}

function formatVisitDate(timestamp?: string, dateLabel?: string): string {
  if (timestamp) {
    try {
      const d = new Date(timestamp);
      if (!Number.isNaN(d.getTime())) {
        return d.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      }
    } catch {
      /* use fallback */
    }
  }
  return dateLabel || '';
}

/** Build checkpoint + memory map nodes from a saved journey payload */
export function buildLifeMapNodes(input: BuildLifeMapInput): MapNode[] {
  const {
    journeyName,
    dateLabel,
    mood,
    storySummary,
    stops,
    memories,
    discoveries,
    getCoordsForStop,
  } = input;

  const checkpointNodes: MapNode[] = stops.map((stop, idx) => {
    const coords = getCoordsForStop(idx);
    const lat = coords.lat ?? 0;
    const lng = coords.lng ?? 0;

    const stopMemories = memories.filter(
      (m) => m.location && m.location.toLowerCase().trim() === stop.name.toLowerCase().trim()
    );
    const stopPhotos = stopMemories.map(m => m.photo).filter(Boolean);
    const stopNotes = stopMemories.map(m => m.note).filter(Boolean).join(' ');

    const stopDiscoveries = discoveries.filter(
      (d) =>
        d.title.toLowerCase().includes(stop.name.toLowerCase()) ||
        stop.name.toLowerCase().includes(d.title.toLowerCase())
    );

    const kind =
      idx === 0
        ? ('home' as const)
        : stopMemories.length > 0
          ? ('memory' as const)
          : stopDiscoveries.length > 0
            ? ('discovery' as const)
            : ('journey' as const);

    const label =
      kind === 'home'
        ? 'Starting Point'
        : kind === 'memory'
          ? `${stopMemories.length} memor${stopMemories.length === 1 ? 'y' : 'ies'}`
          : kind === 'discovery'
            ? 'Discovery'
            : 'Checkpoint';

    return {
      name: stop.name,
      label,
      lat,
      lng,
      kind,
      date: dateLabel,
      time: stop.time,
      timestamp: coords.timestamp || stop.time,
      mood,
      photo: stopPhotos[0] || undefined,
      photos: stopPhotos.length > 0 ? stopPhotos : undefined,
      description: stopNotes || `Checkpoint during ${journeyName}`,
      connectedItems: [
        ...stopMemories.map((m) => ({
          type: 'memory' as const,
          title: m.title,
          icon: '📸',
          preview: (m.note || '').substring(0, 60),
        })),
        ...stopDiscoveries.map((d) => ({
          type: 'discovery' as const,
          title: d.title,
          icon: d.category === 'Food' || d.category === 'Cafe' ? '☕' : d.category === 'Nature' ? '🌳' : '🧭',
          preview: (d.description || '').substring(0, 60),
        })),
      ],
      storyContent: idx === stops.length - 1 ? storySummary : undefined,
    };
  });

  const memoryNodes: MapNode[] = memories
    .map((m) => {
      let lat = m.lat;
      let lng = m.lng;

      // Fallback: If memory coordinates are missing or invalid, resolve using location matching a stop
      if ((lat === undefined || lng === undefined || lat === 0 || lng === 0) && m.location) {
        const matchingStopIdx = stops.findIndex(
          (s) => s.name.toLowerCase().trim() === m.location.toLowerCase().trim()
        );
        if (matchingStopIdx !== -1) {
          const coords = getCoordsForStop(matchingStopIdx);
          if (coords.lat !== undefined && coords.lng !== undefined) {
            lat = coords.lat;
            lng = coords.lng;
          }
        }
      }

      // Final fallback: if still missing, use last stop coordinates
      if ((lat === undefined || lng === undefined || lat === 0 || lng === 0) && stops.length > 0) {
        const coords = getCoordsForStop(stops.length - 1);
        if (coords.lat !== undefined && coords.lng !== undefined) {
          lat = coords.lat;
          lng = coords.lng;
        }
      }

      return {
        ...m,
        lat,
        lng,
      };
    })
    .filter((m) => m.lat !== undefined && m.lng !== undefined && m.lat !== 0 && m.lng !== 0)
    .map((m) => {
      const memoryDiscovery = discoveries.find(
        (d) => d.title === m.discovery || (d.description || '').includes(m.title)
      );

      const connectedItems: MapNode['connectedItems'] = [
        {
          type: 'memory',
          title: m.title,
          icon: '📸',
          preview: (m.note || '').substring(0, 60),
        },
      ];

      if (m.discovery?.trim()) {
        connectedItems.push({
          type: 'discovery',
          title: m.discovery,
          icon: memoryDiscovery ? (memoryDiscovery.category === 'Food' ? '☕' : '✨') : '✨',
          preview: m.discovery,
        });
      }

      return {
        name: m.title,
        label: m.location || 'Memory',
        lat: m.lat!,
        lng: m.lng!,
        kind: 'memory' as const,
        date: formatVisitDate(m.timestamp, dateLabel),
        time: formatVisitTime(m.timestamp),
        timestamp: m.timestamp,
        mood: m.mood || mood,
        photo: m.photo || undefined,
        photos: m.photo ? [m.photo] : undefined,
        description: m.note || undefined,
        tags: m.tags,
        connectedItems,
      };
    });

  return [...checkpointNodes, ...memoryNodes];
}

export interface BuildGpsRouteResult {
  routes: MapRoute[];
  /** Human-readable warning when GPS data was insufficient to draw a real polyline */
  warning: string | null;
}

export function buildGpsRoute(
  nodes: MapNode[],
  gpsPath: Array<{ lat: number; lng: number }> | undefined,
  journeyName: string,
  totalDistance: string,
  totalDuration: string
): BuildGpsRouteResult {
  // ── GPS path diagnostics ─────────────────────────────────────────────────
  console.log('[buildGpsRoute] gpsPath length:', gpsPath?.length ?? 0);

  if (gpsPath && gpsPath.length > 1) {
    const routes: MapRoute[] = [
      {
        id: `route-${Date.now()}-gps`,
        from: nodes[0]?.name || 'Start',
        to: nodes[nodes.length - 1]?.name || 'End',
        pathCoords: gpsPath.map((c) => [c.lng, c.lat]),
        label: `${journeyName} Route`,
        distance: totalDistance,
        duration: totalDuration,
      },
    ];
    console.log('[buildGpsRoute] GPS route built — pathCoords.length:', routes[0].pathCoords.length);
    return { routes, warning: null };
  }

  // ── Insufficient GPS data — surface a warning instead of silently falling back ──
  let warning: string | null = null;
  if (!gpsPath || gpsPath.length === 0) {
    warning = 'No GPS points were recorded for this journey. The route shown is an approximation between checkpoints.';
    console.warn('[buildGpsRoute] WARNING:', warning);
  } else if (gpsPath.length === 1) {
    warning = 'Only 1 GPS point was recorded — insufficient to draw a route polyline. Check that GPS permission is granted and the device remained on the Live Journey screen throughout the journey.';
    console.warn('[buildGpsRoute] WARNING:', warning);
  }

  const routes: MapRoute[] = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    const from = nodes[i];
    const to = nodes[i + 1];
    routes.push({
      id: `route-${Date.now()}-${i}`,
      from: from.name,
      to: to.name,
      pathCoords: [
        [from.lng, from.lat],
        [(from.lng + to.lng) / 2, (from.lat + to.lat) / 2],
        [to.lng, to.lat],
      ],
      distance: '—',
      duration: '—',
    });
  }
  console.log('[buildGpsRoute] Fallback checkpoint routes built — count:', routes.length);
  return { routes, warning };
}
