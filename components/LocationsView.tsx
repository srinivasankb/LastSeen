
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { pb } from '../lib/pocketbase';
import L from 'leaflet';
import { differenceInHours, formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import ConnectionsManager from './ConnectionsManager';

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
      connections: string[];
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
  const leafletMap = useRef<L.Map | null>(null);
  const markersLayer = useRef<L.LayerGroup | null>(null);
  const markerRefs = useRef<Record<string, L.Marker>>({});

  const user = pb.authStore.record;

  const latestLocations = useMemo(() => {
    const uniqueMap: Record<string, LocationLog> = {};
    allLocations.forEach(loc => {
      if (!uniqueMap[loc.user] || new Date(loc.updated) > new Date(uniqueMap[loc.user].updated)) {
        uniqueMap[loc.user] = loc;
      }
    });
    return Object.values(uniqueMap).sort((a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime());
  }, [allLocations]);

  const fetchData = async () => {
    try {
      const myId = pb.authStore.record?.id;
      if (!myId) return;

      // Rule handles permissions: user.connections.id ?= @request.auth.id || user = @request.auth.id
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
        setError("Location sync failed. Check your PocketBase API rules.");
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
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (mapRef.current && !leafletMap.current) {
      leafletMap.current = L.map(mapRef.current, { zoomControl: false, attributionControl: false }).setView([0, 0], 2);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png').addTo(leafletMap.current);
      L.control.zoom({ position: 'bottomright' }).addTo(leafletMap.current);
      markersLayer.current = L.layerGroup().addTo(leafletMap.current);
    }

    if (markersLayer.current && leafletMap.current) {
      markersLayer.current.clearLayers();
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
              <div class="w-12 h-12 ${isMe ? 'bg-[#6750a4]' : 'bg-slate-900'} rounded-2xl border-4 border-white shadow-xl flex items-center justify-center text-white text-xs font-bold overflow-hidden transition-all group-hover:scale-110">
                ${avatarUrl ? `<img src="${avatarUrl}" class="w-full h-full object-cover" />` : userName.charAt(0).toUpperCase()}
              </div>
              <div class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${hoursDiff >= 24 ? 'bg-amber-500' : 'bg-green-500'}"></div>
            </div>
          `,
          iconSize: [48, 48],
          iconAnchor: [24, 24]
        });

        const marker = L.marker([loc.lat, loc.lng], { icon }).bindPopup(`
          <div class="p-4 text-center">
            <p class="font-bold text-sm mb-1 text-slate-900">${isMe ? 'Your Location' : escapeHTML(userName)}</p>
            <p class="text-[9px] font-black uppercase tracking-widest text-[#6750a4] mb-3">${formatDistanceToNow(new Date(loc.updated), { addSuffix: true })}</p>
            ${loc.note ? `<p class="text-[11px] text-slate-500 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100 break-words">"${escapeHTML(loc.note)}"</p>` : ''}
          </div>
        `);
        
        markerRefs.current[loc.user] = marker;
        markersLayer.current?.addLayer(marker);
        bounds.extend([loc.lat, loc.lng]);
      });

      if (latestLocations.length > 0 && leafletMap.current) {
        leafletMap.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      }
    }
  }, [latestLocations]);

  const focusMember = (userId: string, lat: number, lng: number) => {
    if (!leafletMap.current) return;
    leafletMap.current.setView([lat, lng], 16, { animate: true });
    const marker = markerRefs.current[userId];
    if (marker) {
      setTimeout(() => marker.openPopup(), 300);
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
        } catch (err) { setError("Transmit failed."); }
        finally { setLogging(false); }
      },
      () => { setError("GPS Denied."); setLogging(false); },
      { enableHighAccuracy: true }
    );
  };

  return (
    <div className="h-full flex flex-col md:flex-row bg-white overflow-hidden">
      <div className="flex-1 relative order-1 h-[40vh] md:h-full">
        <div ref={mapRef} className="w-full h-full" />
      </div>

      <aside className="w-full md:w-80 lg:w-96 bg-white border-t md:border-t-0 md:border-r border-slate-100 flex flex-col order-2 z-10 h-[60vh] md:h-full overflow-hidden shadow-2xl md:shadow-none">
        <div className="p-4 sm:p-6 space-y-6 flex-1 overflow-y-auto">
          
          <div className="p-4 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-[#6750a4]/10 flex items-center justify-center text-[#6750a4] font-bold">
                 {(user?.name || 'U').charAt(0).toUpperCase()}
               </div>
               <div>
                 <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Display Name</p>
                 <p className="text-xs font-bold text-slate-900 truncate max-w-[120px]">{user?.name || "Guest"}</p>
               </div>
            </div>
            <button 
              onClick={() => setShowProfileEdit(!showProfileEdit)}
              className="text-[10px] font-bold text-[#6750a4] hover:bg-white px-3 py-1.5 rounded-lg border border-transparent hover:border-slate-100 transition-all"
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
                placeholder="New name..."
                className="w-full px-4 py-2 bg-white border border-slate-100 rounded-xl text-xs mb-3 focus:ring-2 focus:ring-[#6750a4] outline-none"
               />
               <div className="flex gap-2">
                 <button onClick={handleProfileUpdate} className="flex-1 py-2 bg-[#6750a4] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest">Save</button>
                 <button onClick={() => setShowProfileEdit(false)} className="px-4 py-2 text-slate-400 text-[10px] font-bold uppercase">Cancel</button>
               </div>
            </div>
          )}

          <hr className="border-slate-50" />
          
          <ConnectionsManager onRefresh={fetchData} />

          <hr className="border-slate-50" />

          <div className={`p-5 rounded-[32px] border-2 ${isStale ? 'bg-amber-50 border-amber-100' : 'bg-[#f7f2fa] border-transparent'}`}>
            <h2 className="font-bold text-slate-900 mb-4 flex justify-between items-center text-sm">
              My Status
              {isStale && <span className="text-[8px] bg-amber-500 text-white px-2 py-0.5 rounded-full uppercase tracking-widest font-black">Outdated</span>}
            </h2>
            <input
              type="text" value={note} onChange={(e) => setNote(e.target.value)}
              placeholder="Where are you going?"
              className="w-full px-5 py-3.5 bg-white border border-slate-100 rounded-2xl text-sm mb-4 outline-none focus:ring-2 focus:ring-[#6750a4] transition-all"
            />
            <button
              onClick={handleUpdate} disabled={logging}
              className={`w-full min-h-[52px] rounded-full font-bold text-xs uppercase tracking-widest text-white flex items-center justify-center gap-3 transition-all ${isStale ? 'bg-amber-500 shadow-amber-100' : 'bg-[#6750a4] shadow-indigo-100'}`}
            >
              {logging ? <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full"></div> : "Log My Spot"}
            </button>
          </div>
          
          <div className="space-y-4 pb-8">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 px-2">Connections Shared with Me</h3>
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
                          {loc.note ? `"${loc.note}"` : 'No current note'}
                        </p>
                      </div>
                      <div className="text-slate-200 group-hover:text-[#6750a4] transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                 );
              })}
              {latestLocations.filter(l => l.user !== user?.id).length === 0 && (
                <div className="py-12 text-center px-6 border-2 border-dashed border-slate-100 rounded-[32px] bg-slate-50/30">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 opacity-50">
                    <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.15em] leading-relaxed">
                    No connected updates<br/>visible yet
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <footer className="p-4 border-t border-slate-50 bg-white flex justify-between items-center text-[9px] font-black text-slate-300 uppercase tracking-widest">
           <Link to="/privacy" className="hover:text-[#6750a4]">Privacy</Link>
           <span>Direct Connections Only</span>
        </footer>
      </aside>
    </div>
  );
};

export default LocationsView;
