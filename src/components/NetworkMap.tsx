'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { Map as LeafletMap, Icon, Marker } from 'leaflet';
import 'leaflet/dist/leaflet.css';

const NetworkMap = () => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize map centered on Southern Africa
    mapRef.current = L.map(containerRef.current, {
      center: [-15.5527, 22.9375],
      zoom: 5,
      dragging: true,
      zoomControl: true,
      scrollWheelZoom: true
    });

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
      maxNativeZoom: 18
    }).addTo(mapRef.current);

    // Define country locations with markers
    const locations = [
      {
        name: 'South Africa',
        lat: -25.2744,
        lng: 25.7462,
        city: 'Johannesburg'
      },
      {
        name: 'Botswana',
        lat: -22.3285,
        lng: 24.6849,
        city: 'Gaborone'
      },
      {
        name: 'Zimbabwe',
        lat: -17.8252,
        lng: 31.0335,
        city: 'Harare'
      },
      {
        name: 'Zambia',
        lat: -10.3910,
        lng: 31.7461,
        city: 'Lusaka'
      },
      {
        name: 'DRC',
        lat: -4.0383,
        lng: 21.7587,
        city: 'Kinshasa'
      }
    ];

    // Custom marker icon
    const greenIcon = L.icon({
      iconUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2310b981" width="32" height="32"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/></svg>',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    });

    // Add markers for each location
    locations.forEach((location) => {
      const marker = L.marker([location.lat, location.lng], {
        icon: greenIcon
      }).addTo(mapRef.current!);

      marker.bindPopup(
        `<div style="font-weight: bold; color: #10b981;">${location.name}</div>
         <div style="font-size: 12px;">${location.city}</div>`,
        { closeButton: true }
      );
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      style={{
        width: '100%',
        height: '500px',
        backgroundColor: '#f0f0f0'
      }}
      className="rounded-xl overflow-hidden"
    />
  );
};

export default NetworkMap;
