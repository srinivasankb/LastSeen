import React, { useEffect, useState, useRef } from 'react';
import { pb } from '../lib/pocketbase';
import L from 'leaflet';
import { differenceInHours, formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

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
      publicSharing?: boolean;
    }
  }
}

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
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [isStale, setIsStale] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const [isPubliclySharing, setIsPubliclySharing] = useState(pb.authStore.record?.publicSharing ?? false);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const markersLayer = useRef<L.LayerGroup | null>(null);

  const user = pb.authStore.record;

  const fetchData = async () => {
    try {
      // Fetch all locations that are either mine OR belong to users with public sharing enabled
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
      setError("Unable to sync registry.");
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

        const icon = L.divIcon({
          className: 'custom-div-icon',
          html: `
            <div class="flex flex-col items-center">
              <div class="relative group">
                <div class="w-12 h-12 ${isMe ? 'bg-[#6750a4]' : 'bg-slate-900'} rounded-2xl border-4 border-white shadow-2xl flex items-center justify-center text-white text-xs font-bold overflow-hidden transition-all group-hover:scale-110">
                  ${avatarUrl ? `<img src="${avatarUrl}" class="w-full h-full object-cover" />` : userName.charAt(0).toUpperCase()}
                </div>
                <div class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${differenceInHours(new Date(), new Date(loc.updated)) >= 24 ? 'bg-amber-500' : 'bg-green-500'}"></div>
              </div>
            </div>
          `,
          iconSize: [48, 48],
          iconAnchor: [24, 24]
        });

        const marker = L.marker([loc.lat, loc.lng], { icon })
          .bindPopup(`
            <div class="p-3 text-center min-w-[140px]">
              <p class="font-bold text-sm mb-1 text-slate-900">${isMe ? 'Your Location' : escapeHTML(userName)}</p>
              <p class="text-[10px] font-black uppercase tracking-widest text-[#6750a4] mb-2">${timeStr}</p>
              ${loc.note ? `<p class="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-xl">"${escapeHTML(loc.note)}"</p>` : ''}
            </div>
          `);
        
        markersLayer.current?.addLayer(marker);
        bounds.extend([loc.lat, loc.lng]);
      });

      if (allLocations.length > 0 && leafletMap.current.getZoom() === 2) {
        leafletMap.current.fitBounds(bounds, { padding: [100, 100], maxZoom: 15 });
      }
    }
  }, [allLocations]);

  const togglePublicSharing = async () => {
    if (!user) return;
    setError(null);
    try {
      const newStatus = !isPubliclySharing;
      const updatedUser = await pb.collection('users').update(user.id, { publicSharing: newStatus });
      setIsPubliclySharing(newStatus);
      // Update local auth store cache
      pb.authStore.save(pb.authStore.token, updatedUser);
    } catch (err: any) {
      setError("Failed to update sharing preference.");
    }
  };

  const copyShareLink = () => {
    // Generate URL based on the standard format
    const baseUrl = window.location.origin + window.location.pathname;
    const shareUrl = `${baseUrl}#/loc/${user?.id}`;
    
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      setError("Failed to copy to clipboard.");
    });
  };

  const handleUpdate = () => {
    if (!navigator.geolocation) {
      setError("GPS not supported on this device.");
      return;
    }
    setLogging(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const data = { 
            user: user?.id, 
            lat: pos.coords.latitude, 
            lng: pos.coords.longitude, 
            note: note.trim() 
          };
          if (currentUserLoc) {
            await pb.collection('locations').update(currentUserLoc.id, data);
          } else {
            await pb.collection('locations').create(data);
          }
          await fetchData();
        } catch (err) { 
          setError("Failed to transmit location data."); 
        } finally { 
          setLogging(false); 
        }
      },
      () => { 
        setError("GPS Access Denied. Please enable location permissions."); 
        setLogging(false); 
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="h-full flex flex-col md:flex-row relative bg-white">
      {/* Map View */}
      <div className="flex-1 relative order-2 md:order-1 h-full min-h-[300px]">
        <div ref={mapRef} className="w-full h-full" />
      </div>

      {/* Sidebar Controls */}
      <aside className="w-full md:w-80 lg:w-96 bg-white border-r border-slate-100 flex flex-col order-1 md:order-2 z-10 md:h-full overflow-hidden shadow-2xl md:shadow-none">
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {/* My Location Section */}
          <div className={`p-6 rounded-[32px] border-2 transition-all duration-500 ${isStale ? 'bg-amber-50 border-amber-100' : 'bg-[#f7f2fa] border-transparent'}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-900">My Status</h2>
              {isStale && <span className="bg-amber-500 text-[9px] text-white px-2 py-0.5 rounded-full font-black uppercase animate-pulse">Update Needed</span>}
            </div>
            
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Where are you going?"
              className="w-full px-5 py-3 bg-white border border-slate-100 rounded-2xl text-xs mb-4 outline-none focus:ring-2 focus:ring-[#6750a4]/10 transition-all placeholder:text-slate-300"
            />
            
            <button
              onClick={handleUpdate}
              disabled={logging}
              className={`w-full py-4 rounded-full font-bold text-xs uppercase tracking-[0.15em] shadow-lg shadow-indigo-100/50 transition-all active:scale-95 disabled:opacity-50 ${isStale ? 'bg-amber-500 hover:bg-amber-600' : 'bg-[#6750a4] hover:bg-[#7e6bb4]'} text-white flex items-center justify-center gap-3`}
            >
              {logging ? (
                <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full"></div>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  <span>Update My Spot</span>
                </>
              )}
            </button>

            {/* Public Sharing Toggle (Universal User Setting) */}
            <div className="mt-6 pt-6 border-t border-black/5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Global Share</span>
                  <span className="text-[9px] text-slate-400">Share with anyone via link</span>
                </div>
                <button 
                  onClick={togglePublicSharing}
                  className={`w-11 h-6 rounded-full relative transition-all duration-500 ${isPubliclySharing ? 'bg-[#6750a4]' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${isPubliclySharing ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
              
              {isPubliclySharing && (
                <button 
                  onClick={copyShareLink} 
                  className={`w-full py-2.5 rounded-xl border border-dashed transition-all font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 ${copied ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-white border-slate-200 text-[#6750a4] hover:bg-[#6750a4]/5'}`}
                >
                  {copied ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied Link
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy Share Link
                    </>
                  )}
                </button>
              )}
            </div>
            {error && <p className="mt-3 text-[10px] text-rose-500 font-bold uppercase tracking-tight text-center bg-rose-50 p-2 rounded-xl border border-rose-100">{error}</p>}
          </div>
          
          {/* List of Other Users */}
          <div className="space-y-4 pb-12">
            <div className="px-2 flex justify-between items-center">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Trusted Circle</h3>
              <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[9px] font-bold">{allLocations.length} active</span>
            </div>
            
            <div className="space-y-3">
              {allLocations.map(loc => {
                 const isMe = loc.user === user?.id;
                 const userName = loc.expand?.user?.name || loc.expand?.user?.email?.split('@')[0] || "User";
                 const avatarUrl = loc.expand?.user?.avatar 
                  ? pb.files.getURL(loc.expand.user, loc.expand.user.avatar, { thumb: '100x100' })
                  : null;
                 const hoursOld = differenceInHours(new Date(), new Date(loc.updated));
                 
                 return (
                    <div 
                      key={loc.id} 
                      onClick={() => leafletMap.current?.setView([loc.lat, loc.lng], 16)}
                      className="group p-4 bg-slate-50/50 hover:bg-[#6750a4]/5 rounded-3xl border border-transparent hover:border-[#6750a4]/10 transition-all cursor-pointer flex items-center gap-4"
                    >
                      <div className="relative shrink-0">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold text-sm overflow-hidden ${isMe ? 'bg-[#6750a4]' : 'bg-slate-900 shadow-sm group-hover:shadow-md'}`}>
                          {avatarUrl ? <img src={avatarUrl} className="w-full h-full object-cover" /> : userName.charAt(0).toUpperCase()}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${hoursOld >= 24 ? 'bg-amber-400' : 'bg-green-400'}`}></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <p className="text-xs font-bold text-slate-900 truncate">{isMe ? 'You' : userName}</p>
                          <p className="text-[9px] text-slate-400 font-medium whitespace-nowrap ml-2">{formatDistanceToNow(new Date(loc.updated), { addSuffix: true })}</p>
                        </div>
                        {loc.note ? (
                          <p className="text-[10px] text-slate-500 truncate leading-tight font-medium">"{escapeHTML(loc.note)}"</p>
                        ) : (
                          <p className="text-[10px] text-slate-300 italic">No note added</p>
                        )}
                      </div>
                    </div>
                 );
              })}
              
              {!loading && allLocations.length === 0 && (
                <div className="py-20 flex flex-col items-center justify-center text-center px-6 border-2 border-dashed border-slate-100 rounded-[40px]">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nothing to show</p>
                  <p className="text-[10px] text-slate-300 mt-2 max-w-[160px]">Update your location or invite friends to join your circle.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <footer className="p-6 border-t border-slate-50 bg-white/80 backdrop-blur-sm flex justify-between items-center">
           <div className="flex gap-4">
              <Link to="/privacy" className="text-[10px] uppercase font-black text-slate-300 hover:text-[#6750a4] transition-colors tracking-widest">Privacy</Link>
              <Link to="/terms" className="text-[10px] uppercase font-black text-slate-300 hover:text-[#6750a4] transition-colors tracking-widest">Terms</Link>
           </div>
           <span className="text-[9px] font-black text-slate-200 uppercase tracking-tighter">Last Seen v1.2.1</span>
        </footer>
      </aside>
    </div>
  );
};

export default LocationsView;