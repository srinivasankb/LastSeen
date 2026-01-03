
import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { pb } from '../lib/pocketbase';
import { formatDistanceToNow, isPast } from 'date-fns';

declare const L: any;

interface LocationLog {
  id: string;
  lat: number;
  lng: number;
  updated: string;
  expiresAt?: string;
  note?: string;
  address?: string;
  user: string;
}

interface PublicUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

const PublicLocationView: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [targetUser, setTargetUser] = useState<PublicUser | null>(null);
  const [targetLocation, setTargetLocation] = useState<LocationLog | null>(null);

  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const fetchPublicData = async () => {
    if (!token) {
        setError("Invalid link.");
        setLoading(false);
        return;
    }

    try {
        // 1. Find User by Token
        const users = await pb.collection('users').getList(1, 1, {
            filter: `public_token = "${token}"`
        });

        if (users.items.length === 0) {
            setError("Link expired or invalid.");
            setLoading(false);
            return;
        }

        const userRec = users.items[0];
        setTargetUser({
            id: userRec.id,
            name: userRec.name,
            email: userRec.email,
            avatar: userRec.avatar
        });

        // 2. Find Location by User ID
        try {
             const locations = await pb.collection('locations').getList<LocationLog>(1, 1, {
                 filter: `user = "${userRec.id}"`,
                 sort: '-updated'
             });

             if (locations.items.length > 0) {
                 const loc = locations.items[0];
                 // Check expiry
                 if (loc.expiresAt && isPast(new Date(loc.expiresAt))) {
                     setTargetLocation(null);
                 } else {
                     setTargetLocation(loc);
                 }
             } else {
                 setTargetLocation(null);
             }
        } catch (e) {
            console.error("Loc fetch error", e);
            setTargetLocation(null);
        }

    } catch (err) {
        console.error(err);
        setError("Unable to load shared location.");
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicData();
    const interval = setInterval(fetchPublicData, 30000);
    return () => clearInterval(interval);
  }, [token]);

  // Map Init
  useEffect(() => {
      // Only initialize map if not loading and mapRef is attached to DOM
      if (loading) return;

      if (mapRef.current && !leafletMap.current && typeof L !== 'undefined') {
          leafletMap.current = L.map(mapRef.current, {
              zoomControl: false,
              attributionControl: false
          }).setView([20, 0], 2);
          
          L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { maxZoom: 20 }).addTo(leafletMap.current);
          L.control.zoom({ position: 'bottomright' }).addTo(leafletMap.current);
      }
      
      // Cleanup on unmount
      return () => {
          if (leafletMap.current) {
              leafletMap.current.remove();
              leafletMap.current = null;
          }
      };
  }, [loading]); // Added loading dependency to ensure mapRef is available

  // Update Map Marker
  useEffect(() => {
      if (!leafletMap.current || typeof L === 'undefined') return;

      if (markerRef.current) {
          markerRef.current.remove();
          markerRef.current = null;
      }

      if (targetLocation && targetUser) {
          const avatarUrl = targetUser.avatar 
            ? pb.files.getURL(targetUser, targetUser.avatar, { thumb: '100x100' }) 
            : null;
          
          const icon = L.divIcon({
            className: 'custom-div-icon',
            html: `
              <div class="relative">
                <div class="w-16 h-16 bg-[#6750a4] rounded-2xl border-4 border-white shadow-xl flex items-center justify-center text-white text-xl font-bold overflow-hidden animate-bounce">
                  ${avatarUrl ? `<img src="${avatarUrl}" class="w-full h-full object-cover" />` : targetUser.name.charAt(0).toUpperCase()}
                </div>
                <div class="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white bg-green-500"></div>
              </div>
            `,
            iconSize: [64, 64],
            iconAnchor: [32, 64], // Anchored at bottom center
            popupAnchor: [0, -60]
          });

          markerRef.current = L.marker([targetLocation.lat, targetLocation.lng], { icon })
            .addTo(leafletMap.current)
            .bindPopup(`
                <div class="text-center p-2">
                    <p class="font-bold text-sm">${targetUser.name || 'User'}</p>
                    <p class="text-xs text-slate-500">${formatDistanceToNow(new Date(targetLocation.updated), { addSuffix: true })}</p>
                </div>
            `, { closeButton: false, className: 'custom-popup' });
          
          markerRef.current.openPopup();
          leafletMap.current.flyTo([targetLocation.lat, targetLocation.lng], 16, { duration: 1.5 });
      }
  }, [targetLocation, targetUser, loading]);


  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="w-10 h-10 border-4 border-[#6750a4]/20 border-t-[#6750a4] rounded-full animate-spin"></div>
        </div>
    );
  }

  if (error || !targetUser) {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Location Not Found</h2>
              <p className="text-slate-500 mb-8 max-w-sm">{error || "This link may be expired, or the user is no longer sharing their location."}</p>
              <Link to="/" className="px-6 py-3 bg-[#6750a4] text-white rounded-full font-bold text-sm">Go to Home</Link>
          </div>
      );
  }

  return (
    <div className="h-screen flex flex-col bg-white">
        <header className="h-16 flex items-center justify-between px-6 border-b border-[#eaddff] bg-white z-50 shadow-sm">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#6750a4] rounded-lg flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                </div>
                <h1 className="text-lg font-bold text-[#1c1b1f] tracking-tight">Last Seen</h1>
            </div>
            <Link to="/" className="text-sm font-bold text-[#6750a4] hover:bg-[#6750a4]/5 px-4 py-2 rounded-full transition-colors">
                Use App
            </Link>
        </header>

        <main className="flex-1 relative">
            <div ref={mapRef} className="w-full h-full" />
            
            <div className="absolute bottom-8 left-0 right-0 px-4 flex justify-center z-[1000] pointer-events-none">
                <div className="bg-white/95 backdrop-blur-md p-6 rounded-[32px] shadow-2xl border border-white/50 w-full max-w-sm pointer-events-auto">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 bg-[#6750a4]/10 rounded-[20px] flex items-center justify-center text-[#6750a4] font-bold text-xl overflow-hidden">
                             {targetUser.avatar ? (
                                 <img src={pb.files.getURL(targetUser, targetUser.avatar, { thumb: '100x100' })} className="w-full h-full object-cover" />
                             ) : (
                                 targetUser.name.charAt(0).toUpperCase()
                             )}
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Shared Location</p>
                            <h2 className="text-lg font-bold text-slate-900">{targetUser.name || 'User'}</h2>
                        </div>
                    </div>

                    {targetLocation ? (
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-[#6750a4] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <div>
                                    <p className="text-sm font-medium text-slate-700">Updated {formatDistanceToNow(new Date(targetLocation.updated), { addSuffix: true })}</p>
                                </div>
                            </div>
                            {targetLocation.note && (
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-sm italic text-slate-600">
                                    "{targetLocation.note}"
                                </div>
                            )}
                            {targetLocation.address && (
                                 <div className="flex items-start gap-3">
                                     <svg className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                                     <p className="text-sm text-slate-500">{targetLocation.address}</p>
                                 </div>
                            )}

                            <a 
                                href={`https://www.google.com/maps/search/?api=1&query=${targetLocation.lat},${targetLocation.lng}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-4 flex items-center justify-center gap-2 w-full py-3 bg-[#6750a4] text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#7e6bb4] transition-all active:scale-95 shadow-lg shadow-indigo-100"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                </svg>
                                Open in Maps
                            </a>
                        </div>
                    ) : (
                        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 text-amber-700 text-xs font-bold text-center">
                            This user is not currently sharing an active location.
                        </div>
                    )}
                </div>
            </div>
        </main>
    </div>
  );
};

export default PublicLocationView;
