import React, { useEffect, useState, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'framer-motion';
import type { MapNode, MapRoute, NodeKind } from '../../types';
import { MAP_CENTER, MAP_ZOOM } from '../../data';
import { useTheme } from '../../context/ThemeContext';

// ============================================
// INTERACTIVE MAP - Real Map with Leaflet
// Google Maps Timeline style - clean, focused on routes
// ============================================

interface InteractiveMapProps {
  selectedNode: MapNode | null;
  onSelectNode: (node: MapNode) => void;
  onOpenDrawer: (node: MapNode) => void;
  selectedDay?: string;
  dayLabel?: string;
  nodes?: MapNode[];
  routes?: MapRoute[];
  center?: [number, number];
}

// Fix Leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom marker icons for different node types
const createCustomIcon = (kind: NodeKind, isSelected: boolean) => {
  const colors: Record<NodeKind, string> = {
    home: '#64748b',
    journey: '#8b5cf6',
    memory: '#06b6d4',
    discovery: '#10b981',
    story: '#f59e0b',
  };

  const color = colors[kind];
  const size = isSelected ? 40 : 32;

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: ${color};
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${isSelected ? 18 : 14}px;
        ${isSelected ? 'transform: scale(1.2);' : ''}
        transition: all 0.2s ease;
      ">
        ${getIconForKind(kind)}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
};

const getIconForKind = (kind: NodeKind): string => {
  const icons: Record<NodeKind, string> = {
    home: '🏠',
    journey: '📍',
    memory: '📸',
    discovery: '🧭',
    story: '📝',
  };
  return icons[kind];
};

// Map controller component for programmatic controls
function MapController({
  onMapReady,
}: {
  onMapReady: (map: L.Map) => void;
}) {
  const map = useMap();
  useEffect(() => {
    onMapReady(map);
  }, [map, onMapReady]);
  return null;
}

export function InteractiveMap({
  selectedNode,
  onSelectNode,
  onOpenDrawer,
  selectedDay,
  dayLabel,
  nodes = [],
  routes = [],
  center = MAP_CENTER,
}: InteractiveMapProps) {
  const { resolvedTheme } = useTheme();
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const markerRefs = useRef<Record<string, L.Marker>>({});

  // The Life Map page owns date filtering. This map renders the selected day's saved data.
  const filteredNodes = nodes || [];
  const filteredRoutes = routes || [];

  // Calculate bounds to fit all markers and route coordinates
  const mapBounds = useMemo(() => {
    const lats: number[] = [];
    const lngs: number[] = [];

    // Add marker coordinates
    filteredNodes.forEach((n) => {
      if (typeof n.lat === 'number' && typeof n.lng === 'number') {
        lats.push(n.lat);
        lngs.push(n.lng);
      }
    });

    // Add route path coordinates
    filteredRoutes.forEach((r) => {
      r.pathCoords.forEach((coord) => {
        if (typeof coord[1] === 'number' && typeof coord[0] === 'number') {
          lats.push(coord[1]);
          lngs.push(coord[0]);
        }
      });
    });

    if (lats.length === 0 || lngs.length === 0) return null;

    return L.latLngBounds(
      L.latLng(Math.min(...lats), Math.min(...lngs)),
      L.latLng(Math.max(...lats), Math.max(...lngs))
    );
  }, [filteredNodes, filteredRoutes]);

  // Fit map to bounds when day changes
  useEffect(() => {
    if (mapInstance && mapBounds) {
      mapInstance.fitBounds(mapBounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [mapInstance, mapBounds, selectedDay]);

  // Open polaroid popup for the selected marker
  useEffect(() => {
    if (!selectedNode) return;
    const marker = markerRefs.current[selectedNode.name];
    if (marker) {
      marker.openPopup();
    }
  }, [selectedNode, filteredNodes]);

  // Dynamic initial center based on nodes
  const mapCenter: [number, number] = useMemo(() => {
    if (filteredNodes.length > 0 && typeof filteredNodes[0].lat === 'number' && typeof filteredNodes[0].lng === 'number') {
      return [filteredNodes[0].lat, filteredNodes[0].lng];
    }
    return center;
  }, [filteredNodes, center]);

  // Route line styles
  const routeColor = '#06b6d4';
  const routeActiveColor = '#22d3ee';

  return (
    <div className="relative w-full h-[650px] overflow-hidden rounded-[24px] border border-white/10 shadow-2xl">
      {/* Map Container */}
      <MapContainer
        center={mapCenter}
        zoom={MAP_ZOOM}
        style={{ width: '100%', height: '100%' }}
        className="rounded-[24px]"
        zoomControl={false}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        dragging={true}
        touchZoom={true}
      >
        <MapController onMapReady={setMapInstance} />

        {/* Dynamic theme map tiles (Voyager for Light, Dark Matter for Dark) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url={resolvedTheme === 'light' 
            ? "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          }
          subdomains="abcd"
          maxZoom={19}
        />

        {/* Route polylines */}
        {filteredRoutes.map((route) => {
          const isHighlighted =
            !selectedNode ||
            route.from === selectedNode.name ||
            route.to === selectedNode.name;

          return (
            <Polyline
              key={route.id}
              positions={route.pathCoords.map((coord) => [coord[1], coord[0]])}
              color={isHighlighted ? routeActiveColor : routeColor}
              weight={isHighlighted ? 4 : 2}
              opacity={isHighlighted ? 0.9 : 0.3}
              lineJoin="round"
              lineCap="round"
            />
          );
        })}

        {/* Node markers */}
        {filteredNodes.map((node) => {
          const isSelected = selectedNode?.name === node.name;
          const isHovered = hoveredNode === node.name;

          return (
            <Marker
              key={node.name}
              ref={(ref) => {
                if (ref) markerRefs.current[node.name] = ref;
              }}
              position={[node.lat, node.lng]}
              icon={createCustomIcon(node.kind, isSelected)}
              eventHandlers={{
                click: () => onOpenDrawer(node),
                mouseover: () => setHoveredNode(node.name),
                mouseout: () => setHoveredNode(null),
              }}
            >
              {/* Polaroid style popup */}
              <Popup
                closeButton={false}
                autoClose={true}
                autoPan={true}
                className="polaroid-popup"
              >
                <div className="polaroid-card animate-polaroid">
                  {/* Polaroid Tape Effect */}
                  <div className="polaroid-tape" />

                  {/* Photo Container */}
                  {node.photo && (
                    <div className="polaroid-image-container">
                      <img
                        src={node.photo}
                        alt={node.name}
                        className="polaroid-image"
                      />
                    </div>
                  )}

                  {/* Polaroid Content Frame */}
                  <div className="polaroid-caption">
                    <div className="polaroid-header">
                      <span className="polaroid-kind-badge">{node.kind}</span>
                      {node.time && <span className="polaroid-time">{node.time}</span>}
                    </div>
                    
                    <h3 className="polaroid-title">{node.name}</h3>
                    <p className="polaroid-label">{node.label}</p>

                    {node.description && (
                      <p className="polaroid-note">
                        "{node.description}"
                      </p>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

      </MapContainer>

      {/* ===== ZOOM CONTROLS ===== */}
      <div className="absolute bottom-20 right-4 z-[1000] flex flex-col gap-1">
        <button
          onClick={() => mapInstance?.zoomIn()}
          className="w-8 h-8 rounded-lg bg-slate-900/90 backdrop-blur text-white flex items-center justify-center hover:bg-slate-800 transition-colors border border-white/10 shadow-lg"
          aria-label="Zoom in"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
        <button
          onClick={() => mapInstance?.zoomOut()}
          className="w-8 h-8 rounded-lg bg-slate-900/90 backdrop-blur text-white flex items-center justify-center hover:bg-slate-800 transition-colors border border-white/10 shadow-lg"
          aria-label="Zoom out"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 12H4"
            />
          </svg>
        </button>
      </div>

      {/* ===== LEGEND ===== */}
      <div className="absolute bottom-4 left-4 z-[1000] flex items-center gap-3 rounded-xl border border-white/5 bg-slate-950/90 px-3 py-2 backdrop-blur-xl shadow-2xl">
        <span className="text-[8px] uppercase tracking-wider text-slate-500 font-medium">
          {dayLabel?.toUpperCase() || 'TODAY'}
        </span>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-slate-500" />
            <span className="text-[9px] text-slate-400">Home</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-violet-500" />
            <span className="text-[9px] text-slate-400">Journey</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-cyan-500" />
            <span className="text-[9px] text-slate-400">Memory</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[9px] text-slate-400">Discovery</span>
          </div>
        </div>
      </div>

      {/* ===== ROUTE STATS BAR ===== */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-6 rounded-2xl border border-white/10 bg-slate-950/90 px-5 py-2.5 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
          <span className="text-[10px] text-slate-400">Route</span>
        </div>
        <div className="h-3 w-px bg-white/10" />
        <div className="text-sm font-semibold text-white">
          {filteredRoutes.reduce(
            (acc, r) => acc + parseFloat(r.distance || '0'),
            0
          ).toFixed(1)}{' '}
          km
        </div>
        <div className="text-xs text-slate-500">·</div>
        <div className="text-sm font-semibold text-white">
          {filteredRoutes.reduce(
            (acc, r) => acc + parseInt(r.duration || '0'),
            0
          )}
          m
        </div>
        <div className="text-xs text-slate-500">·</div>
        <div className="text-sm font-semibold text-white">
          {filteredNodes.length}
        </div>
        <span className="text-[10px] text-slate-500">stops</span>
      </div>

      {/* Custom popup styles */}
      <style>{`
        .leaflet-popup-content-wrapper {
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
        }
        .leaflet-popup-content {
          margin: 8px 12px;
          color: white;
        }
        .leaflet-popup-tip {
          background: rgba(15, 23, 42, 0.95);
        }
        .custom-marker {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-control-zoom {
          display: none !important;
        }
        
        /* Polaroid Popup Styles */
        .polaroid-popup .leaflet-popup-content-wrapper {
          background: #fcfcf9 !important; /* Authentic cream polaroid paper color */
          border: 1px solid rgba(0, 0, 0, 0.15);
          border-radius: 4px !important; /* Sharp polaroid look */
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.45) !important;
          padding: 0 !important;
        }
        .polaroid-popup .leaflet-popup-content {
          margin: 0 !important;
          color: #1e293b !important;
          font-family: 'Outfit', 'Inter', sans-serif;
          width: 210px !important;
        }
        .polaroid-popup .leaflet-popup-tip {
          background: #fcfcf9 !important;
        }
        
        .polaroid-card {
          padding: 8px 8px 12px 8px;
          display: flex;
          flex-direction: column;
          position: relative;
        }
        
        /* Polaroid Washi Tape effect at the top */
        .polaroid-tape {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%) rotate(-2deg);
          width: 60px;
          height: 16px;
          background: rgba(245, 158, 11, 0.5); /* translucent warm amber tape */
          border-left: 1px dashed rgba(255,255,255,0.3);
          border-right: 1px dashed rgba(255,255,255,0.3);
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          z-index: 10;
        }

        .polaroid-image-container {
          width: 100%;
          aspect-ratio: 1; /* Perfect square aspect ratio */
          overflow: hidden;
          background: #e2e8f0;
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 2px;
        }

        .polaroid-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .polaroid-card:hover .polaroid-image {
          transform: scale(1.05);
        }

        .polaroid-caption {
          margin-top: 8px;
          display: flex;
          flex-direction: column;
        }

        .polaroid-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2px;
        }

        .polaroid-kind-badge {
          font-size: 8px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #6366f1; /* Indigo color for kind */
        }

        .polaroid-time {
          font-size: 8px;
          color: #64748b;
          font-weight: 500;
        }

        .polaroid-title {
          font-size: 13px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 !important;
          line-height: 1.2;
        }

        .polaroid-label {
          font-size: 9px;
          color: #64748b;
          margin: 1px 0 0 0 !important;
          line-height: 1.2;
        }

        .polaroid-note {
          font-size: 10px;
          color: #334155;
          margin: 6px 0 0 0 !important;
          font-style: italic;
          line-height: 1.4;
          border-left: 2px solid #cbd5e1;
          padding-left: 6px;
        }

        /* Micro animation */
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-polaroid {
          animation: fadeInScale 0.25s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default InteractiveMap;