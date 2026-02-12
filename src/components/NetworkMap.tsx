'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Shipment {
  id: string;
  from: string;
  to: string;
  status: 'in-transit' | 'delivered' | 'delayed';
  progress: number;
  cargo: string;
  eta: string;
}

const NetworkMap = () => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const [shipments, setShipments] = useState<Shipment[]>([
    { id: 'SH001', from: 'Johannesburg', to: 'Gaborone', status: 'in-transit', progress: 65, cargo: 'Electronics', eta: '2 hours' },
    { id: 'SH002', from: 'Harare', to: 'Lusaka', status: 'in-transit', progress: 40, cargo: 'FMCG', eta: '5 hours' },
    { id: 'SH003', from: 'Johannesburg', to: 'Harare', status: 'in-transit', progress: 75, cargo: 'Machinery', eta: '3 hours' },
    { id: 'SH004', from: 'Lusaka', to: 'Lubumbashi', status: 'delayed', progress: 30, cargo: 'Medical Supplies', eta: '8 hours' },
    { id: 'SH005', from: 'Gaborone', to: 'Harare', status: 'in-transit', progress: 55, cargo: 'Textiles', eta: '4 hours' },
    { id: 'SH006', from: 'Johannesburg', to: 'Lusaka', status: 'in-transit', progress: 20, cargo: 'Mining Equipment', eta: '12 hours' },
    { id: 'SH007', from: 'Harare', to: 'Johannesburg', status: 'in-transit', progress: 85, cargo: 'Agricultural Products', eta: '1 hour' },
    { id: 'SH008', from: 'Lubumbashi', to: 'Lusaka', status: 'in-transit', progress: 45, cargo: 'Construction Materials', eta: '6 hours' }
  ]);

  useEffect(() => {
    if (!containerRef.current) return;

    mapRef.current = L.map(containerRef.current, {
      center: [-15.5527, 22.9375],
      zoom: 5,
      dragging: true,
      zoomControl: true,
      scrollWheelZoom: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(mapRef.current);

    const locations = [
      { name: 'Johannesburg', lat: -26.2041, lng: 28.0473, country: 'South Africa' },
      { name: 'Gaborone', lat: -24.6282, lng: 25.9231, country: 'Botswana' },
      { name: 'Harare', lat: -17.8252, lng: 31.0335, country: 'Zimbabwe' },
      { name: 'Lusaka', lat: -15.3875, lng: 28.3228, country: 'Zambia' },
      { name: 'Lubumbashi', lat: -11.6609, lng: 27.4794, country: 'DRC' }
    ];

    const locationIcon = L.divIcon({
      html: `<div style="width: 12px; height: 12px; background: #10b981; border: 2px solid white; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });

    locations.forEach((loc) => {
      L.marker([loc.lat, loc.lng], { icon: locationIcon })
        .addTo(mapRef.current!)
        .bindPopup(`<b>${loc.name}</b><br/>${loc.country}`);
    });

    const updateShipments = () => {
      setShipments(prev => prev.map(ship => {
        if (ship.status === 'in-transit') {
          const newProgress = ship.progress + 0.5;
          if (newProgress >= 100) {
            return { ...ship, progress: 0, status: 'in-transit' };
          }
          return { ...ship, progress: newProgress };
        }
        return ship;
      }));
    };

    const interval = setInterval(updateShipments, 100);

    return () => {
      clearInterval(interval);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    const locations = [
      { name: 'Johannesburg', lat: -26.2041, lng: 28.0473 },
      { name: 'Gaborone', lat: -24.6282, lng: 25.9231 },
      { name: 'Harare', lat: -17.8252, lng: 31.0335 },
      { name: 'Lusaka', lat: -15.3875, lng: 28.3228 },
      { name: 'Lubumbashi', lat: -11.6609, lng: 27.4794 }
    ];

    markersRef.current.forEach(marker => marker.remove());
    markersRef.current.clear();

    shipments.forEach((shipment) => {
      const from = locations.find(l => l.name === shipment.from);
      const to = locations.find(l => l.name === shipment.to);
      
      if (from && to) {
        const latDiff = to.lat - from.lat;
        const lngDiff = to.lng - from.lng;
        const currentLat = from.lat + (latDiff * shipment.progress / 100);
        const currentLng = from.lng + (lngDiff * shipment.progress / 100);

        const color = shipment.status === 'delivered' ? '#10b981' : 
                     shipment.status === 'delayed' ? '#ef4444' : '#3b82f6';

        L.polyline([[from.lat, from.lng], [to.lat, to.lng]], {
          color: color,
          weight: 3,
          opacity: 0.4,
          dashArray: '10, 10',
          className: 'animated-route'
        }).addTo(mapRef.current!);

        L.polyline([[from.lat, from.lng], [currentLat, currentLng]], {
          color: color,
          weight: 4,
          opacity: 0.8
        }).addTo(mapRef.current!);

        if (shipment.status !== 'delivered') {
          const truckIcon = L.divIcon({
            html: `
              <div style="position: relative; width: 40px; height: 40px;">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="${color}" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
                  <path d="M18,18.5A1.5,1.5 0 0,1 16.5,17A1.5,1.5 0 0,1 18,15.5A1.5,1.5 0 0,1 19.5,17A1.5,1.5 0 0,1 18,18.5M19.5,9.5L21.46,12H17V9.5M6,18.5A1.5,1.5 0 0,1 4.5,17A1.5,1.5 0 0,1 6,15.5A1.5,1.5 0 0,1 7.5,17A1.5,1.5 0 0,1 6,18.5M20,8H17V4H3C1.89,4 1,4.89 1,6V17H3A3,3 0 0,0 6,20A3,3 0 0,0 9,17H15A3,3 0 0,0 18,20A3,3 0 0,0 21,17H23V12L20,8Z"/>
                </svg>
                <div style="position: absolute; top: -8px; right: -8px; background: white; border: 2px solid ${color}; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold; color: ${color};">
                  ${Math.round(shipment.progress)}%
                </div>
              </div>
            `,
            iconSize: [40, 40],
            iconAnchor: [20, 20]
          });

          const marker = L.marker([currentLat, currentLng], { icon: truckIcon })
            .addTo(mapRef.current!);
          
          markersRef.current.set(shipment.id, marker);

          marker.bindPopup(
            `<div style="min-width: 200px;">
              <b style="color: ${color};">${shipment.id}</b><br/>
              <b>From:</b> ${shipment.from}<br/>
              <b>To:</b> ${shipment.to}<br/>
              <b>Cargo:</b> ${shipment.cargo}<br/>
              <b>Progress:</b> ${Math.round(shipment.progress)}%<br/>
              <b>ETA:</b> ${shipment.eta}<br/>
              <b>Status:</b> <span style="color: ${color};">${shipment.status.toUpperCase()}</span>
            </div>`
          );

          marker.on('click', () => setSelectedShipment(shipment));
        }
      }
    });
  }, [shipments]);

  return (
    <div className="relative">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.8; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .leaflet-marker-icon:hover {
          transform: scale(1) !important;
        }
      `}} />
      
      <div 
        ref={containerRef} 
        style={{ width: '100%', height: '600px' }}
        className="rounded-xl overflow-hidden shadow-2xl"
      />
      
      {selectedShipment && (
        <div className="absolute top-4 right-4 bg-white rounded-xl shadow-2xl p-6 w-80 border-2 border-emerald-500 animate-in slide-in-from-right duration-300">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-slate-900">{selectedShipment.id}</h3>
            <button 
              onClick={() => setSelectedShipment(null)}
              className="text-gray-500 hover:text-gray-700 text-2xl leading-none hover:scale-110 transition-transform"
            >
              ×
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Route</p>
              <p className="font-semibold text-slate-900">{selectedShipment.from} → {selectedShipment.to}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Cargo</p>
              <p className="font-semibold text-slate-900">{selectedShipment.cargo}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Progress</p>
              <div className="w-full bg-gray-200 rounded-full h-3 mt-1 overflow-hidden relative">
                <div 
                  className="bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 h-3 rounded-full transition-all duration-500 relative"
                  style={{ 
                    width: `${selectedShipment.progress}%`, 
                    backgroundSize: '200% 100%', 
                    animation: 'shimmer 2s infinite' 
                  }}
                >
                  <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                  <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/50 blur-sm"></div>
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-1">{Math.round(selectedShipment.progress)}% Complete</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">ETA</p>
              <p className="font-semibold text-slate-900">{selectedShipment.eta}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                selectedShipment.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                selectedShipment.status === 'delayed' ? 'bg-red-100 text-red-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {selectedShipment.status.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="absolute bottom-4 left-4 bg-white rounded-xl shadow-xl p-4">
        <h4 className="font-bold text-slate-900 mb-2">Legend</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-blue-500"></div>
            <span>In Transit</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-emerald-500"></div>
            <span>Delivered</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-red-500"></div>
            <span>Delayed</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkMap;