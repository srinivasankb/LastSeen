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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);

  useEffect(() => {
    const fetchPublicLocation = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch the most recent location for the specified user
        // We use expand: 'user' to verify the user's publicSharing status
        const records = await pb.collection('locations').getList(1, 1, {
          filter: `user = "${userId}"`,
          sort: '-updated',
          expand: 'user',
        });

        if (records.items.length === 0) {
          throw new Error("No location data found for this user.");
        }

        const record = records.items[0];
        
        // Universal Sharing Check: The user must have public sharing enabled on their profile
        if (!record.expand?.user?.publicSharing) {
          throw new Error("This user has disabled public location sharing.");
        }

        setLoc(record);
      } catch (err: any) { 
        console.error("Public share error:", err);
        setError(err.message || "This location link is unavailable."); 
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchPublicLocation();
    }
  }, [userId]);

  useEffect(() => {
    if (loc && mapRef.current && !leafletMap.current) {
      leafletMap.current = L.map(mapRef.current, { 
        zoomControl: false, 
        attributionControl: false 
      }).setView([loc.lat, loc.lng], 15);
      
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png').addTo(leafletMap.current);
      
      const userName = loc.expand?.user?.name || "User";
      const avatarUrl = loc.expand?.user?.avatar 
        ? pb.files.getURL(loc.expand.user, loc.expand.user.avatar, { thumb: '100x100' })
        : null;

      const icon = L.divIcon({
        className: 'custom-div-icon',
        html: `
          <div class="flex flex-col items-center">
            <div class="w-16 h-16 bg-[#6750a4] rounded-[24px] border-4 border-white shadow-2xl flex items-center justify-center text-white text-2xl font-bold overflow-hidden ring-8 ring-[#6750a4]/10 transition-transform duration-500 scale-110">
              ${avatarUrl ? `<img src="${avatarUrl}" class="w-full h-full object-cover" />` : userName.charAt(0).toUpperCase()}
            </div>
            <div class="mt-4 px-4 py-1.5 bg-white shadow-2xl rounded-full border border-slate-100 whitespace-nowrap animate-bounce-short">
              <p class="text-[11px] font-black text-[#6750a4] uppercase tracking-[0.2em]">${userName}</p>
            </div>
          </div>
        `,
        iconSize: [64, 96],
        iconAnchor: [32, 48]
      });

      L.marker([loc.lat, loc.lng], { icon }).addTo(leafletMap.current);
      L.control.zoom({ position: 'bottomright' }).addTo(leafletMap.current);
    }
  }, [loc]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#f7f2fa]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#6750a4]/20 border-t-[#6750a4] rounded-full animate-spin"></div>
          <p className="text-xs font-black uppercase text-slate-400 tracking-widest">Locating...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[#f7f2fa] text-center">
        <div className="w-24 h-24 bg-white shadow-2xl rounded-[40px] flex items-center justify-center mb-8 border border-slate-50">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">Access Restricted</h2>
        <p className="text-slate-500 mb-12 max-w-xs text-lg leading-relaxed">{error}</p>
        <button 
          onClick={onAuthRequired} 
          className="px-12 py-5 bg-[#6750a4] text-white rounded-full font-bold text-sm uppercase tracking-widest shadow-2xl shadow-indigo-200 hover:bg-[#7e6bb4] hover:-translate-y-1 active:scale-95 transition-all"
        >
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col relative bg-white overflow-hidden">
      {/* Background Map */}
      <div ref={mapRef} className="flex-1 z-0" />
      
      {/* Logo Header */}
      <div className="absolute top-8 left-8 z-10 flex items-center gap-4">
        <div className="w-12 h-12 bg-white shadow-2xl rounded-2xl flex items-center justify-center border border-white">
          <div className="w-7 h-7 bg-[#6750a4] rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
          </div>
        </div>
        <div className="bg-white/90 backdrop-blur-md px-5 py-2 rounded-2xl shadow-2xl border border-white">
          <span className="font-black text-xl tracking-tighter text-slate-900">Last Seen</span>
        </div>
      </div>

      {/* Main Location Card */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-full max-w-[440px] px-6 z-10">
        <div className="bg-white/95 backdrop-blur-2xl p-10 rounded-[48px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-white flex flex-col items-center">
          <div className="w-20 h-20 rounded-[28px] bg-[#f7f2fa] flex items-center justify-center mb-6 shadow-sm border border-[#6750a4]/5 overflow-hidden">
             <div className="w-full h-full bg-[#6750a4] flex items-center justify-center text-white font-black text-2xl">
               {loc.expand?.user.avatar ? (
                 <img src={pb.files.getURL(loc.expand.user, loc.expand.user.avatar, { thumb: '100x100' })} className="w-full h-full object-cover" />
               ) : (
                 (loc.expand?.user.name || 'U').charAt(0).toUpperCase()
               )}
             </div>
          </div>
          
          <h3 className="font-bold text-2xl text-slate-900 mb-2">{loc?.expand?.user.name || 'Anonymous Member'}</h3>
          
          <div className="flex items-center gap-2 mb-6">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <p className="text-[11px] uppercase font-black text-[#6750a4] tracking-[0.25em]">
              Seen {loc ? formatDistanceToNow(new Date(loc.updated), { addSuffix: true }) : ''}
            </p>
          </div>
          
          {loc?.note && (
            <div className="w-full mb-10 p-5 bg-slate-50/80 rounded-[32px] border border-slate-100/50">
              <p className="text-sm text-slate-600 italic text-center leading-relaxed">
                "{loc.note}"
              </p>
            </div>
          )}
          
          <button 
            onClick={onAuthRequired} 
            className="w-full py-6 bg-[#6750a4] text-white rounded-full font-bold text-xs uppercase tracking-[0.25em] shadow-[0_20px_40px_-10px_rgba(103,80,164,0.3)] hover:bg-[#7e6bb4] hover:-translate-y-1 transition-all active:scale-95"
          >
            Join the Circle
          </button>
          
          <div className="mt-8 flex items-center gap-2 opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all cursor-default">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Powered by Last Seen Safety</p>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes bounce-short {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-bounce-short {
          animation: bounce-short 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default PublicLocationView;