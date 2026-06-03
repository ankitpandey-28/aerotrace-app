import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { ActiveJourneyCoordinate, ActiveJourneyStop } from '../../context/JourneyContext';

interface LiveTrackingMapProps {
  coordinates: ActiveJourneyCoordinate[];
  stops: ActiveJourneyStop[];
  isPaused: boolean;
}

// User location marker with pulsing beacon
const createUserIcon = () => {
  return L.divIcon({
    className: 'user-gps-marker',
    html: `
      <div style="position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
        <div class="beacon-pulse" style="
          position: absolute;
          width: 24px;
          height: 24px;
          background: rgba(34, 211, 238, 0.4);
          border-radius: 50%;
          animation: gps-beacon-pulse 2s infinite ease-out;
        "></div>
        <div style="
          position: absolute;
          width: 12px;
          height: 12px;
          background: #22d3ee;
          border: 2px solid #ffffff;
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(34, 211, 238, 0.9);
        "></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

// Checkpoint / stop pin marker
const createStopIcon = (index: number) => {
  return L.divIcon({
    className: 'stop-gps-marker',
    html: `
      <div style="
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: #8b5cf6;
        border: 2.5px solid white;
        box-shadow: 0 3px 8px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        color: white;
        font-weight: 700;
      ">
        ${index + 1}
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
};

// Dynamic map controller to auto-center/pan when current location changes
function MapFocusController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.panTo(center, { animate: true, duration: 1 });
  }, [center, map]);
  return null;
}

export function LiveTrackingMap({ coordinates, stops, isPaused }: LiveTrackingMapProps) {
  const defaultCenter: [number, number] = [0, 0];

  // Latest logged user coordinate (prefer most recent, otherwise first recorded point)
  const latestCoord = coordinates[coordinates.length - 1] || coordinates[0];
  const center: [number, number] = latestCoord ? [latestCoord.lat, latestCoord.lng] : defaultCenter;

  const routePositions: [number, number][] = coordinates.map((c) => [c.lat, c.lng]);

  return (
    <div className="relative w-full h-full overflow-hidden rounded-[24px] border border-white/5 bg-[#0b0f19] shadow-2xl">
      <MapContainer
        center={center}
        zoom={16}
        style={{ width: '100%', height: '100%' }}
        className="rounded-[24px]"
        zoomControl={false}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        dragging={true}
        touchZoom={true}
      >
        {latestCoord && <MapFocusController center={center} />}

        {/* Dark theme map tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={20}
        />

        {/* Dynamic Route Polyline Path */}
        {routePositions.length > 1 && (
          <Polyline
            positions={routePositions}
            color="#22d3ee"
            weight={4.5}
            opacity={0.9}
            lineJoin="round"
            lineCap="round"
          />
        )}

        {/* Visited Checkpoints Marker Pins */}
        {stops.map((stop, index) => (
          <Marker
            key={`${stop.name}-${index}`}
            position={[stop.lat, stop.lng]}
            icon={createStopIcon(index)}
          >
            <Popup className="stop-popup">
              <div className="p-1 text-slate-800 text-xs">
                <div className="font-bold text-slate-900">{stop.name}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Logged: {stop.time}</div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Pulsing Active User GPS Marker */}
        {latestCoord && !isPaused && (
          <Marker position={center} icon={createUserIcon()} />
        )}
      </MapContainer>

      {/* Pulsing beacon custom keyframe css */}
      <style>{`
        @keyframes gps-beacon-pulse {
          0% {
            transform: scale(0.6);
            opacity: 0.9;
          }
          100% {
            transform: scale(2.0);
            opacity: 0.0;
          }
        }
        .user-gps-marker {
          background: transparent !important;
          border: none !important;
        }
        .stop-gps-marker {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-control-attribution {
          background: rgba(15, 23, 42, 0.8) !important;
          color: #94a3b8 !important;
        }
      `}</style>
    </div>
  );
}

export default LiveTrackingMap;
