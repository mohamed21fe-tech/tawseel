import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  type: 'restaurant' | 'customer' | 'driver';
  subtitle?: string;
}

interface LeafletMapProps {
  centerLat?: number;
  centerLng?: number;
  zoom?: number;
  markers?: MapMarker[];
  interactivePicker?: boolean;
  onLocationSelect?: (lat: number, lng: number) => void;
  showRoute?: boolean;
  routeCoordinates?: [number, number][];
  className?: string;
  height?: string;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  centerLat = 35.9306,
  centerLng = 36.6340,
  zoom = 14,
  markers = [],
  interactivePicker = false,
  onLocationSelect,
  showRoute = false,
  routeCoordinates,
  className = '',
  height = '320px',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerGroupRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const pickerMarkerRef = useRef<L.Marker | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLng],
        zoom,
        zoomControl: true,
        attributionControl: false,
      });

      // Standard OpenStreetMap tiles (free, reliable, zero regional blocks)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      // Dedicated layer groups
      markerGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;

      // Handle interactive click for address picker
      if (interactivePicker && onLocationSelect) {
        map.on('click', (e: L.LeafletMouseEvent) => {
          const { lat, lng } = e.latlng;
          onLocationSelect(lat, lng);

          if (pickerMarkerRef.current) {
            pickerMarkerRef.current.setLatLng([lat, lng]);
          } else {
            const pickerIcon = L.divIcon({
              className: 'custom-picker-pin',
              html: `
                <div style="background-color: #ea580c; color: white; width: 34px; height: 34px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 2px solid white;">
                  <div style="transform: rotate(45deg); font-size: 14px; font-weight: bold;">📍</div>
                </div>
              `,
              iconSize: [34, 34],
              iconAnchor: [17, 34],
            });
            pickerMarkerRef.current = L.marker([lat, lng], { icon: pickerIcon }).addTo(map);
          }
        });
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers & Route
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = markerGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    const bounds: L.LatLngExpression[] = [];

    markers.forEach((m) => {
      bounds.push([m.lat, m.lng]);

      let iconHtml = '';
      if (m.type === 'restaurant') {
        iconHtml = `
          <div style="background: #ea580c; color: white; width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(234, 88, 12, 0.4); border: 2px solid white; font-size: 18px;">
            🍳
          </div>
        `;
      } else if (m.type === 'customer') {
        iconHtml = `
          <div style="background: #2563eb; color: white; width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4); border: 2px solid white; font-size: 18px;">
            🏠
          </div>
        `;
      } else if (m.type === 'driver') {
        iconHtml = `
          <div class="driver-marker-pulse" style="background: #16a34a; color: white; width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; font-size: 20px;">
            🛵
          </div>
        `;
      }

      const customIcon = L.divIcon({
        className: 'custom-map-icon',
        html: iconHtml,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      const marker = L.marker([m.lat, m.lng], { icon: customIcon });
      marker.bindPopup(`
        <div style="direction: rtl; text-align: right; font-family: 'Cairo', sans-serif; padding: 4px;">
          <strong style="font-size: 14px; color: #1c1917;">${m.title}</strong>
          ${m.subtitle ? `<div style="font-size: 12px; color: #78716c; margin-top: 2px;">${m.subtitle}</div>` : ''}
        </div>
      `);

      group.addLayer(marker);
    });

    // Draw route if enabled
    if (showRoute && (routeCoordinates || markers.length >= 2)) {
      if (routeLayerRef.current) {
        map.removeLayer(routeLayerRef.current);
      }

      const coords: [number, number][] =
        routeCoordinates ||
        markers.map((m) => [m.lat, m.lng]);

      if (coords.length >= 2) {
        routeLayerRef.current = L.polyline(coords, {
          color: '#ea580c',
          weight: 4,
          dashArray: '8, 8',
          opacity: 0.85,
        }).addTo(map);
      }
    }

    // Auto-fit view when there are multiple points
    if (bounds.length > 1) {
      map.fitBounds(L.latLngBounds(bounds), { padding: [40, 40], maxZoom: 16 });
    } else if (bounds.length === 1) {
      map.setView(bounds[0], zoom);
    }
  }, [markers, showRoute, routeCoordinates, zoom]);

  return (
    <div className={`relative overflow-hidden rounded-xl border border-stone-200 shadow-inner ${className}`} style={{ height }}>
      <div ref={mapContainerRef} className="h-full w-full" />
      <div className="absolute bottom-2 left-2 z-[400] rounded bg-white/90 px-2 py-0.5 text-[10px] text-stone-600 backdrop-blur-xs">
        OpenStreetMap • إدلب
      </div>
    </div>
  );
};
