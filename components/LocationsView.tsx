
import React, { useEffect, useState, useRef } from 'react';
import { pb } from '../lib/pocketbase';
import L from 'leaflet';
import { differenceInHours, formatDistanceToNow } from 'date-fns';

interface LocationLog {
  id: string;
  lat: number;
  lng: number;
  created: string;
  updated: string;
  note?: string;
  user: string;
  expand?: {
    user: {
      id: string;
      collectionId: string;
      name: string;
      email: string;
      avatar: string;
    }
  }
}

// Security: Helper to escape user input to prevent XSS in Leaflet HTML markers
const escapeHTML = (str: string | undefined): string => {
  if (!str) return "";
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
};

const LocationsView: React.FC = () => {
  const [allLocations, setAllLocations] = useState<LocationLog[]>([]);
  const [currentUserLoc, setCurrentUserLoc] = useState<LocationLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [logging, setLogging] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [isStale, setIsStale] = useState(false);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const markersLayer = useRef<L.LayerGroup | null>(null);

  const fetchData = async () => {
    try {
      const records = await pb.collection('locations').getFullList<LocationLog>({
        sort: '-updated',
        expand: 'user',
      });
      
      setAllLocations(records);

      const myId = pb.authStore.record?.id;
      const myLoc = records.find(r => r.user === myId);
      
      if (myLoc) {
        setCurrentUserLoc(myLoc);
        setNote(myLoc.note || '');
        const hoursDiff = differenceInHours(new Date(), new Date(myLoc.updated));
        setIsStale(hoursDiff >= 24);
      } else {
        setCurrentUserLoc(null);
        setIsStale(true);
      }
      
      setError(null);
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError("Unable to sync location registry. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => {
      clearInterval(interval);
      if (leafletMap.current) leafletMap.current.remove();
    };
  }, []);

  useEffect(() => {
    if (mapRef.current && !leafletMap.current) {
      leafletMap.current = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([0, 0], 2);
      
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 20
      }).addTo(leafletMap.current);
      
      L.control.zoom({ position: 'bottomright' }).addTo(leafletMap.current);
      markersLayer.current = L.layerGroup().addTo(leafletMap.current);
    }

    if (markersLayer.current && leafletMap.current) {
      markersLayer.current.clearLayers();
      const bounds = L.latLngBounds([]);
      
      allLocations.forEach(loc => {
        const userName = loc.expand?.user?.name || loc.expand?.user?.email?.split('@')[0] || "Unknown User";
        const isMe = loc.user === pb.authStore.record?.id;
        const timeStr = formatDistanceToNow(new Date(loc.updated), { addSuffix: true });
        
        const avatarUrl = loc.expand?.user?.avatar 
          ? pb.files.getURL(loc.expand.user, loc.expand.user.avatar, { thumb: '100x100' })
          : null;

        // Security: Escape user-provided data before injecting into raw HTML string
        const safeUserName = escapeHTML(userName);
        const safeNote = escapeHTML(loc.note);

        const icon = L.divIcon({
          className: 'custom-div-icon',
          html: `
            <div class="flex flex-col items-center">
              <div class="relative">
                <div class="w-10 h-10 ${isMe ? 'bg-[#6750a4]' : 'bg-[#1d192b]'} rounded-full border-4 border-white shadow-xl flex items-center justify-center text-white text-[10px] font-bold overflow-hidden">
                  ${avatarUrl 
                    ? `<img src="${avatarUrl}" class="w-full h-full object-cover" />` 
                    : safeUserName.charAt(0).toUpperCase()
                  }
                </div>
                ${isMe && isStale ? '<div class="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full border-2 border-white flex items-center justify-center text-[8px] text-white font-black">!</div>' : ''}
              </div>
              <div class="mt-1 px-2 py-0.5 bg-white/90 backdrop-blur-sm rounded-md shadow-sm border border-slate-100 whitespace-nowrap">
                <p class="text-[9px] font-bold text-slate-800 leading-none">${isMe ? 'You' : safeUserName}</p>
              </div>
            </div>
          `,
          iconSize: [40, 55],
          iconAnchor: [20, 40]
        });

        const marker = L.marker([loc.lat, loc.lng], { icon })
          .bindPopup(`
            <div class="p-2 min-w-[150px]">
              <p class="text-[10px] font-black uppercase text-slate-400 mb-1">${isMe ? 'Your' : `${safeUserName}'s`} Last Seen</p>
              <p class="text-xs font-bold text-slate-900">${timeStr}</p>
              <p class="text-[9px] text-slate-400 mb-2">${new Date(loc.updated).toLocaleString()}</p>
              ${safeNote ? `<p class="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 mt-1 italic">"${safeNote}"</p>` : ''}
            </div>
          `);
        
        markersLayer.current?.addLayer(marker);
        bounds.extend([loc.lat, loc.lng]);
      });

      if (allLocations.length > 0 && leafletMap.current.getZoom() === 2) {
        leafletMap.current.fitBounds(bounds, { padding: [100, 100], maxZoom: 15 });
      }
    }
  }, [allLocations, isStale]);

  const handleUpdate = () => {
    if (!navigator.geolocation) {
      setError("GPS not supported.");
      return;
    }

    setLogging(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const data = {
            user: pb.authStore.record?.id,
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            note: note.trim() || "",
          };

          if (currentUserLoc) {
            await pb.collection('locations').update(currentUserLoc.id, data);
          } else {
            await pb.collection('locations').create(data);
          }
          
          await fetchData();
        } catch (err: any) {
          setError("Failed to transmit location. Verify API rules.");
        } finally {
          setLogging(false);
        }
      },
      (err) => {
        setError("GPS Access Denied. Please enable location services.");
        setLogging(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleDelete = async () => {
    if (!currentUserLoc) return;
    
    setDeleting(true);
    setError(null);
    try {
      await pb.collection('locations').delete(currentUserLoc.id);
      setCurrentUserLoc(null);
      setNote('');
      await fetchData();
    } catch (err: any) {
      setError("Failed to remove location data.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="h-full flex flex-col md:flex-row relative">
      <div className="flex-1 relative order-2 md:order-1 h-full">
        <div ref={mapRef} className="w-full h-full" />
        <div className="absolute bottom-8 right-8 z-[1000] md:hidden">
          <button 
            onClick={handleUpdate}
            disabled={logging || deleting}
            className={`w-16 h-16 rounded-full ${isStale ? 'bg-amber-500' : 'bg-[#6750a4]'} text-white shadow-2xl flex items-center justify-center transition-all active:scale-95 disabled:opacity-50`}
          >
             {logging ? (
               <div className="animate-spin h-6 w-6 border-2 border-white/30 border-t-white rounded-full"></div>
             ) : (
               <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
               </svg>
             )}
          </button>
        </div>
      </div>

      <aside className="w-full md:w-80 lg:w-96 bg-white border-r border-[#eaddff] flex flex-col order-1 md:order-2 z-10 md:h-full overflow-y-auto">
        <div className="p-6 space-y-6">
          <div className={`p-6 rounded-[28px] border-2 transition-all duration-500 ${isStale ? 'bg-amber-50 border-amber-200' : 'bg-[#f7f2fa] border-transparent'}`}>
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${isStale ? 'bg-amber-500' : 'bg-[#6750a4]'}`}>
                {isStale ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <div>
                <h2 className="font-bold text-[#1c1b1f]">{isStale ? (currentUserLoc ? 'Outdated' : 'No Location') : 'Location Synced'}</h2>
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">
                  {currentUserLoc ? `Last Seen: ${formatDistanceToNow(new Date(currentUserLoc.updated), { addSuffix: true })}` : 'Not sharing'}
                </p>
              </div>
            </div>

            {isStale && currentUserLoc && (
              <p className="text-xs text-amber-700 font-medium mb-4 leading-relaxed bg-white/50 p-3 rounded-2xl">
                Your location hasn't been updated in over 24 hours. Keep your circle informed by logging your current status.
              </p>
            )}

            {!currentUserLoc && !logging && (
              <p className="text-xs text-slate-500 mb-4 leading-relaxed bg-slate-100 p-3 rounded-2xl">
                You are currently not visible to your circle. Update your location to let others know where you were last seen.
              </p>
            )}

            <div className="space-y-3">
               <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What are you up to?"
                className="w-full px-4 py-3 bg-white border border-[#eaddff] rounded-2xl text-xs outline-none focus:ring-2 focus:ring-[#6750a4]/20"
                disabled={logging || deleting}
              />
              <button
                onClick={handleUpdate}
                disabled={logging || deleting}
                className={`w-full py-4 rounded-full font-bold text-xs uppercase tracking-widest transition-all ${isStale ? 'bg-amber-500 hover:bg-amber-600' : 'bg-[#6750a4] hover:bg-[#7e6bb4]'} text-white flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] disabled:opacity-50`}
              >
                {logging ? (
                  <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full"></div>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    <span>{currentUserLoc ? 'Update Location' : 'Share Location'}</span>
                  </>
                )}
              </button>

              {currentUserLoc && (
                <button
                  onClick={handleDelete}
                  disabled={logging || deleting}
                  className="w-full py-3 rounded-full font-bold text-[10px] uppercase tracking-[0.1em] transition-all bg-white border border-rose-200 text-rose-500 hover:bg-rose-50 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
                >
                  {deleting ? (
                    <div className="animate-spin h-4 w-4 border-2 border-rose-200 border-t-rose-500 rounded-full"></div>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>Clear My Location</span>
                    </>
                  )}
                </button>
              )}
            </div>
            {error && <p className="mt-3 text-[10px] text-rose-500 font-bold uppercase text-center">{error}</p>}
          </div>

          <div className="space-y-4">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center justify-between">
              Active Circle
              <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[9px]">{allLocations.length} members</span>
            </h3>
            
            <div className="space-y-2">
              {allLocations.map((loc) => {
                const isMe = loc.user === pb.authStore.record?.id;
                const name = loc.expand?.user?.name || loc.expand?.user?.email?.split('@')[0] || "User";
                const isOld = differenceInHours(new Date(), new Date(loc.updated)) >= 24;
                const avatarUrl = loc.expand?.user?.avatar 
                  ? pb.files.getURL(loc.expand.user, loc.expand.user.avatar, { thumb: '100x100' })
                  : null;
                
                return (
                  <div 
                    key={loc.id} 
                    onClick={() => leafletMap.current?.setView([loc.lat, loc.lng], 16)}
                    className="group flex items-center gap-3 p-3 rounded-2xl hover:bg-[#f7f2fa] border border-transparent hover:border-[#eaddff] transition-all cursor-pointer"
                  >
                    <div className="relative shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs overflow-hidden ${isMe ? 'bg-[#6750a4]' : 'bg-[#1d192b]'}`}>
                        {avatarUrl ? (
                          <img src={avatarUrl} className="w-full h-full object-cover" />
                        ) : (
                          name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${isOld ? 'bg-amber-400' : 'bg-green-400'}`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <p className="text-xs font-bold text-[#1c1b1f] truncate">{isMe ? 'You' : escapeHTML(name)}</p>
                        <p className="text-[9px] text-slate-400">{formatDistanceToNow(new Date(loc.updated), { addSuffix: true })}</p>
                      </div>
                      {loc.note && <p className="text-[10px] text-slate-500 truncate italic">"{escapeHTML(loc.note)}"</p>}
                    </div>
                  </div>
                );
              })}
              {allLocations.length === 0 && !loading && (
                <div className="py-12 text-center text-slate-400 text-xs italic">
                  No location data shared yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default LocationsView;
