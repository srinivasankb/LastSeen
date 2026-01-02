
import React, { useEffect, useState, useRef } from 'react';
import { pb } from '../lib/pocketbase';
import L from 'leaflet';
import { formatDistanceToNow } from 'date-fns';

interface PublicLocationViewProps {
  userId: string;
  onAuthRequired: () => void;
}

const PublicLocationView: React.FC<PublicLocationViewProps> = ({ userId, onAuthRequired }) => {
  const [loc, setLoc] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const record = await pb.collection('locations').getFirstListItem(`user="${userId}"`, { expand: 'user' });
        if (!record.expand?.user.publicSharing) {
          throw new Error("This location share is no longer active or private.");
        }
        setLoc(record);
      } catch (err: any) { 
        setError(err.message || "We couldn't find this location share."); 
      }
    };
    fetch();
  }, [userId]);

  useEffect(() => {
    if (loc && mapRef.current && !leafletMap.current) {
      leafletMap.current = L.map(mapRef.current, { 
        zoomControl: false, 
        attributionControl: false 
      }).setView([loc.lat, loc.lng], 15);
      
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png').addTo(leafletMap.current);
      
      const icon = L.divIcon({
        className: 'custom-div-icon',
        html: `
          <div class="flex flex-col items-center">
            <div class="w-14 h-14 bg-[#6750a4] rounded-2xl border-4 border-white shadow-2xl flex items-center justify-center text-white text-xl font-bold overflow-hidden ring-4 ring-[#6750a4]/10">
              ${loc.expand?.user.avatar 
                ? `<img src="${pb.files.getURL(loc.expand.user, loc.expand.user.avatar, { thumb: '100x100' })}" class="w-full h-full object-cover" />` 
                : (loc.expand?.user.name || 'U').charAt(0).toUpperCase()
              }
            </div>
            <div class="mt-2 px-3 py-1 bg-white/95 backdrop-blur-sm rounded-full shadow-lg border border-slate-100 whitespace-nowrap">
              <p class="text-[10px] font-black text-[#6750a4] uppercase tracking-widest">${loc.expand?.user.name || 'User'}</p>
            </div>
          </div>
        `,
        iconSize: [56, 80],
        iconAnchor: [28, 40]
      });

      L.marker([loc.lat, loc.lng], { icon }).addTo(leafletMap.current);
      L.control.zoom({ position: 'bottomright' }).addTo(leafletMap.current);
    }
  }, [loc]);

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[#f7f2fa] text-center">
      <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mb-6 text-rose-500">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Unavailable</h2>
      <p className="text-slate-500 mb-10 max-w-xs">{error}</p>
      <button 
        onClick={onAuthRequired} 
        className="px-10 py-4 bg-[#6750a4] text-white rounded-full font-bold text-sm uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-[#7e6bb4] active:scale-95 transition-all"
      >
        Go to Homepage
      </button>
    </div>
  );

  return (
    <div className="h-screen flex flex-col relative bg-white">
      {/* Background Map */}
      <div ref={mapRef} className="flex-1 z-0" />
      
      {/* Branding Header */}
      <div className="absolute top-6 left-6 z-10 flex items-center gap-3">
        <div className="w-10 h-10 bg-white shadow-xl rounded-2xl flex items-center justify-center border border-slate-50">
          <div className="w-6 h-6 bg-[#6750a4] rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
          </div>
        </div>
        <span className="font-bold text-lg tracking-tighter text-slate-900 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-2xl shadow-xl border border-white">Last Seen</span>
      </div>

      {/* Info Overlay */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-sm px-6 z-10">
        <div className="bg-white/95 backdrop-blur-xl p-8 rounded-[40px] shadow-2xl border border-white flex flex-col items-center">
          <div className="w-16 h-16 rounded-3xl bg-[#f7f2fa] flex items-center justify-center mb-4">
             <div className="w-10 h-10 bg-[#6750a4] rounded-2xl flex items-center justify-center text-white font-bold text-lg">
               {(loc?.expand?.user.name || 'U').charAt(0).toUpperCase()}
             </div>
          </div>
          <h3 className="font-bold text-xl text-slate-900 mb-1">{loc?.expand?.user.name || 'User'}</h3>
          <p className="text-[10px] uppercase font-black text-[#6750a4] tracking-[0.2em] mb-4">
            Last seen {loc ? formatDistanceToNow(new Date(loc.updated), { addSuffix: true }) : ''}
          </p>
          
          {loc?.note && (
            <p className="text-sm text-slate-500 italic text-center mb-8 px-4 bg-slate-50 py-3 rounded-2xl border border-slate-100 w-full">
              "{loc.note}"
            </p>
          )}
          
          <button 
            onClick={onAuthRequired} 
            className="w-full py-5 bg-[#6750a4] text-white rounded-full font-bold text-xs uppercase tracking-[0.2em] shadow-2xl shadow-indigo-200/50 hover:bg-[#7e6bb4] transition-all active:scale-95"
          >
            Join the Circle
          </button>
          
          <p className="mt-6 text-[10px] text-slate-300 font-bold uppercase tracking-widest">&copy; Last Seen Project</p>
        </div>
      </div>
    </div>
  );
};

export default PublicLocationView;
