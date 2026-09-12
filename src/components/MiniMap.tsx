import { useEffect, useRef } from 'react';
import L from 'leaflet';

interface MiniMapProps {
  latitude: number;
  longitude: number;
  title?: string;
  zoom?: number;
  height?: string;
}

export default function MiniMap({
  latitude,
  longitude,
  title = 'Lokasi Temuan K3',
  zoom = 16,
  height = '180px'
}: MiniMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Bersihkan instance lama jika ada
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    try {
      const map = L.map(mapContainerRef.current, {
        center: [latitude, longitude],
        zoom: zoom,
        zoomControl: false,
        attributionControl: false
      });

      // Tambahkan tile layer OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      // Custom marker icon modern SVG
      const customIcon = L.divIcon({
        className: 'custom-leaflet-pin',
        html: `
          <div style="
            background: #ef4444;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 15px rgba(239, 68, 68, 0.7);
            border: 3px solid #ffffff;
            transform: translate(-50%, -50%);
          ">
            <div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [0, 0]
      });

      const marker = L.marker([latitude, longitude], { icon: customIcon }).addTo(map);
      marker.bindPopup(`<b style="color: #0f172a;">${title}</b><br/><span style="font-size: 11px; color: #64748b;">${latitude.toFixed(5)}, ${longitude.toFixed(5)}</span>`);

      mapInstanceRef.current = map;
      markerRef.current = marker;

      // Invalidate size untuk memastikan rendering sempurna dalam modal
      setTimeout(() => {
        map.invalidateSize();
      }, 200);
    } catch (err) {
      console.error('Error initializing map:', err);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude, zoom, title]);

  return (
    <div
      ref={mapContainerRef}
      style={{
        width: '100%',
        height: height,
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        zIndex: 1
      }}
    />
  );
}
