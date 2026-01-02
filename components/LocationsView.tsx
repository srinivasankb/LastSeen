import React, { useEffect, useState, useRef, useMemo } from 'react';
import { pb } from '../lib/pocketbase';
import { differenceInHours, formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

// Access the global Leaflet instance populated by script tags in index.html
declare const L: any;

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
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [newName, setNewName] = useState(pb.authStore.record?.name || '');
  
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const clusterLayer = useRef<any>(null);
  const markerRefs = useRef<Record<string, any>>({});
  const hasFitBounds = useRef(false);

  const user = pb.authStore.record;

  const latestLocations = useMemo(() => {
    const uniqueMap: Record<string, LocationLog> = {};
    allLocations.forEach(loc => {
      if (loc.user && (!uniqueMap[loc.user] || new Date(loc.updated) > new Date(uniqueMap[loc.user].updated))) {
        uniqueMap[loc.user] = loc;
      }
    });
    return Object.values(uniqueMap).sort((a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime());
  }, [allLocations]);

  const fetchData = async () => {
    try {
      const myId = pb.authStore.record?.id;
      if (!myId) return;

      const records = await pb.collection('locations').getFullList<LocationLog>({
        sort: '-updated',
        expand: 'user',
        requestKey: null,
      });
      
      setAllLocations(records);

      const myLoc = records.find(r => r.user === myId);
      if (myLoc) {
        setCurrentUserLoc(myLoc);
        setNote(myLoc.note || '');
        setIsStale(differenceInHours(new Date(), new Date(myLoc.updated)) >= 24);
      }
      setError(null);
    } catch (err: any) {
      if (err.name !== 'ClientResponseError' || !err.isAbort) {
        console.error('Fetch error:', err);
        setError("Sync failed. Check connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    if (!user) return;
    try {
      const updated = await pb.collection('users').update(user.id, { name: newName });
      pb.authStore.save(pb.authStore.token, updated);
      setShowProfileEdit(false);
      fetchData();
    } catch (err) {
      setError("Profile update failed.");
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Map Initialization
  useEffect(() => {
    if (mapRef.current && !leafletMap.current && typeof L !== 'undefined') {
      leafletMap.current = L.map(mapRef.current, { 
        zoomControl: false, 
        attributionControl: false,
        worldCopyJump: true
      }).setView([20, 0], 2);
      
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 20
      }).addTo(leafletMap.current);
      
      L.control.zoom({ position: 'bottomright' }).addTo(leafletMap.current);

      // Initialize Cluster Group with graceful transitions and overlap handling
      if (L.markerClusterGroup) {
        clusterLayer.current = L.markerClusterGroup({
          showCoverageOnHover: false,
          spiderfyOnMaxZoom: true,
          removeOutsideVisibleBounds: true,
          animate: true,
          maxClusterRadius: 50,
          spiderLegPolylineOptions: { weight: 1.5, color: '#6750a4', opacity: 0.5 },
          iconCreateFunction: (cluster: any) => {
            const count = cluster.getChildCount();
            let sizeClass = 'cluster-small';
            if (count >= 10) sizeClass = 'cluster-medium';
            if (count >= 50) sizeClass = 'cluster-large';

            return L.divIcon({
              html: `<span>${count}</span>`,
              className: `custom-cluster-icon ${sizeClass}`,
              iconSize: L.point(40, 40)
            });
          }
        });
        leafletMap.current.addLayer(clusterLayer.current);
      }
    }

    return () => {
        if (leafletMap.current) {
            leafletMap.current.remove();
            leafletMap.current = null;
        }
    };
  }, []);

  // Marker and Layer Update Logic
  useEffect(() => {
    if (clusterLayer.current && leafletMap.current && typeof L !== 'undefined') {
      clusterLayer.current.clearLayers();
      markerRefs.current = {};
      const bounds = L.latLngBounds([]);
      
      latestLocations.forEach(loc => {
        const userName = loc.expand?.user?.name || loc.expand?.user?.email?.split('@')[0] || "User";
        const isMe = loc.user === pb.authStore.record?.id;
        const avatarUrl = (loc.expand?.user?.id && loc.expand?.user?.avatar) ? pb.files.getURL(loc.expand.user, loc.expand.user.avatar, { thumb: '100x100' }) : null;
        const hoursDiff = differenceInHours(new Date(), new Date(loc.updated));

        const icon = L.divIcon({
          className: 'custom-div-icon',
          html: `
            <div class="relative group">
              <div class="w-12 h-12 ${isMe ? 'bg-[#6750a4]' : 'bg-slate-900'} rounded-2xl border-4 border-white shadow-xl flex items-center justify-center text-white text-xs font-bold overflow-hidden transition-all group-hover:scale-110 active:scale-90">
                ${avatarUrl ? `<img src="${avatarUrl}" class="w-full h-full object-cover" />` : userName.charAt(0).toUpperCase()}
              </div>
              <div class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${hoursDiff >= 24 ? 'bg-amber-500' : 'bg-green-500'}"></div>
            </div>
          `,
          iconSize: [48, 48],
          iconAnchor: [24, 24],
          popupAnchor: [0, -20]
        });

        const marker = L.marker([loc.lat, loc.lng], { icon }).bindPopup(`
          <div class="p-4 text-center min-w-[160px]">
            <p class="font-bold text-sm mb-1 text-slate-900">${isMe ? 'My Location' : escapeHTML(userName)}</p>
            <p class="text-[9px] font-black uppercase tracking-widest text-[#6750a4] mb-3">${formatDistanceToNow(new Date(loc.updated), { addSuffix: true })}</p>
            ${loc.note ? `<p class="text-[11px] text-slate-500 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100 break-words">"${escapeHTML(loc.note)}"</p>` : ''}
          </div>
        `, {
            closeButton: false,
            className: 'custom-popup'
        });
        
        markerRefs.current[loc.user] = marker;
        clusterLayer.current.addLayer(marker);
        bounds.extend([loc.lat, loc.lng]);
      });

      // Intelligent Auto-fit: Only on first load or when explicitly requested
      if (latestLocations.length > 0 && !hasFitBounds.current) {
        leafletMap.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
        hasFitBounds.current = true;
      }
    }
  }, [latestLocations]);

  const resetView = () => {
    if (latestLocations.length > 0 && leafletMap.current) {
      const bounds = L.latLngBounds(latestLocations.map(l => [l.lat, l.lng]));
      leafletMap.current.flyToBounds(bounds, { padding: [50, 50], duration: 1.2 });
    }
  };

  const focusMember = (userId: string, lat: number, lng: number) => {
    if (!leafletMap.current) return;
    
    // Smooth cinematic movement with "FlyTo"
    leafletMap.current.flyTo([lat, lng], 17, {
      duration: 1.5,
      easeLinearity: 0.25
    });

    const marker = markerRefs.current[userId];
    if (marker && clusterLayer.current) {
      setTimeout(() => {
        clusterLayer.current.zoomToShowLayer(marker, () => {
          marker.openPopup();
        });
      }, 1600);
    }
  };

  const handleUpdate = () => {
    if (!navigator.geolocation) return setError("GPS not supported.");
    setLogging(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const data = { user: user?.id, lat: pos.coords.latitude, lng: pos.coords.longitude, note: note.trim() };
          if (currentUserLoc) await pb.collection('locations').update(currentUserLoc.id, data);
          else await pb.collection('locations').create(data);
          await fetchData();
        } catch (err) { setError("Broadcast failed."); }
        finally { setLogging(false); }
      },
      () => { setError("Location access denied."); setLogging(false); },
      { enableHighAccuracy: true }
    );
  };

  return (
    <div className="h-full flex flex-col md:flex-row bg-white overflow-hidden">
      <div className="flex-1 relative order-1 h-[40vh] md:h-full">
        <div ref={mapRef} className="w-full h-full" />
        
        {/* Map Controls */}
        <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
            <button 
                onClick={resetView}
                className="bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-slate-100 hover:bg-white text-slate-600 transition-all active:scale-95"
                title="Fit All Markers"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
            </button>
        </div>

        {loading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-[1000] flex items-center justify-center">
             <div className="w-10 h-10 border-4 border-[#6750a4]/20 border-t-[#6750a4] rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      <aside className="w-full md:w-80 lg:w-96 bg-white border-t md:border-t-0 md:border-r border-slate-100 flex flex-col order-2 z-10 h-[60vh] md:h-full overflow-hidden shadow-2xl md:shadow-none">
        <div className="p-4 sm:p-6 space-y-6 flex-1 overflow-y-auto">
          
          <div className="p-4 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
               <div className="w-10 h-10 rounded-xl bg-[#6750a4]/10 flex items-center justify-center text-[#6750a4] font-bold shrink-0">
                 {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
               </div>
               <div className="min-w-0">
                 <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Display Name</p>
                 <p className="text-xs font-bold text-slate-900 truncate">{user?.name || user?.email?.split('@')[0]}</p>
               </div>
            </div>
            <button 
              onClick={() => setShowProfileEdit(!showProfileEdit)}
              className="text-[10px] font-bold text-[#6750a4] hover:bg-white px-3 py-1.5 rounded-lg border border-transparent hover:border-slate-100 transition-all shrink-0"
            >
              Edit
            </button>
          </div>

          {showProfileEdit && (
            <div className="p-4 bg-[#6750a4]/5 rounded-3xl border border-[#6750a4]/10 animate-in slide-in-from-top-2">
               <input 
                type="text" 
                value={newName} 
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Enter display name..."
                className="w-full px-4 py-2 bg-white border border-slate-100 rounded-xl text-xs mb-3 focus:ring-2 focus:ring-[#6750a4] outline-none"
               />
               <div className="flex gap-2">
                 <button onClick={handleProfileUpdate} className="flex-1 py-2 bg-[#6750a4] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest">Save</button>
                 <button onClick={() => setShowProfileEdit(false)} className="px-4 py-2 text-slate-400 text-[10px] font-bold uppercase">Cancel</button>
               </div>
            </div>
          )}

          <div className={`p-5 rounded-[32px] border-2 ${isStale ? 'bg-amber-50 border-amber-100' : 'bg-[#f7f2fa] border-transparent'}`}>
            <h2 className="font-bold text-slate-900 mb-4 flex justify-between items-center text-sm">
              My Current Spot
              {isStale && <span className="text-[8px] bg-amber-500 text-white px-2 py-0.5 rounded-full uppercase tracking-widest font-black">Outdated</span>}
            </h2>
            <input
              type="text" value={note} onChange={(e) => setNote(e.target.value)}
              placeholder="What are you up to?"
              className="w-full px-5 py-3.5 bg-white border border-slate-100 rounded-2xl text-sm mb-4 outline-none focus:ring-2 focus:ring-[#6750a4] transition-all"
            />
            <button
              onClick={handleUpdate} disabled={logging}
              className={`w-full min-h-[52px] rounded-full font-bold text-xs uppercase tracking-widest text-white flex items-center justify-center gap-3 transition-all shadow-lg active:scale-95 ${isStale ? 'bg-amber-500 shadow-amber-100' : 'bg-[#6750a4] shadow-indigo-100'}`}
            >
              {logging ? <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full"></div> : "Log My Spot"}
            </button>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-bold rounded-xl animate-in fade-in">
              {error}
            </div>
          )}
          
          <div className="space-y-4 pb-8">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 px-2">Recent Community Updates</h3>
            <div className="space-y-2">
              {latestLocations.map(loc => {
                 const isMe = loc.user === user?.id;
                 const userName = loc.expand?.user?.name || loc.expand?.user?.email?.split('@')[0] || "User";
                 const hoursDiff = differenceInHours(new Date(), new Date(loc.updated));
                 
                 return (
                    <button 
                      key={loc.id} 
                      onClick={() => focusMember(loc.user, loc.lat, loc.lng)}
                      className="w-full p-4 bg-slate-50/50 hover:bg-[#6750a4]/5 hover:translate-x-1 border border-transparent hover:border-[#6750a4]/10 rounded-[24px] flex items-center gap-4 transition-all group"
                    >
                      <div className="relative shrink-0">
                        <div className={`w-12 h-12 rounded-[18px] flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm ${isMe ? 'bg-[#6750a4]' : 'bg-slate-900'}`}>
                          {loc.expand?.user?.avatar ? (
                            <img src={pb.files.getURL(loc.expand.user, loc.expand.user.avatar, { thumb: '100x100' })} className="w-full h-full object-cover rounded-[18px]" />
                          ) : userName.charAt(0).toUpperCase()}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${hoursDiff >= 24 ? 'bg-amber-500' : 'bg-green-500'}`}></div>
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <p className={`text-xs font-bold truncate ${isMe ? 'text-[#6750a4]' : 'text-slate-900'}`}>
                            {isMe ? 'You' : userName}
                          </p>
                          <p className="text-[8px] text-slate-400 font-black uppercase tracking-tight whitespace-nowrap ml-2">
                            {formatDistanceToNow(new Date(loc.updated), { addSuffix: true })}
                          </p>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate italic">
                          {loc.note ? `"${loc.note}"` : 'Active on map'}
                        </p>
                      </div>
                    </button>
                 );
              })}
              {latestLocations.length === 0 && !loading && (
                <div className="py-12 text-center px-6 border-2 border-dashed border-slate-100 rounded-[32px] bg-slate-50/30">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.15em] leading-relaxed">
                    Be the first to share your spot
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <footer className="p-4 border-t border-slate-50 bg-white flex justify-between items-center text-[9px] font-black text-slate-300 uppercase tracking-widest">
           <Link to="/privacy" className="hover:text-[#6750a4]">Privacy</Link>
           <span>Shared Community Map</span>
        </footer>
      </aside>
    </div>
  );
};

export default LocationsView;