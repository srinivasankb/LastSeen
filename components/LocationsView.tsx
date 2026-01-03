
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { pb } from '../lib/pocketbase';
import { differenceInHours, formatDistanceToNow, addMinutes, isPast } from 'date-fns';
import { Link } from 'react-router-dom';

declare const L: any;

interface LocationLog {
  id: string;
  lat: number;
  lng: number;
  created: string;
  updated: string;
  expiresAt?: string;
  note?: string;
  address?: string;
  user: string;
  isPublic?: boolean; 
  expand?: {
    user: {
      id: string;
      collectionId: string;
      name: string;
      email: string;
      avatar: string;
      public_token?: string;
    }
  }
}

const EXPIRY_OPTIONS = [
  { label: 'Never expire', value: 0 },
  { label: '1 hour', value: 60 },
  { label: '4 hours', value: 240 },
  { label: '24 hours', value: 1440 },
  { label: '1 week', value: 10080 },
];

const escapeHTML = (str: string | undefined): string => {
  if (!str) return "";
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
};

export default function LocationsView() {
  const [allLocations, setAllLocations] = useState<LocationLog[]>([]);
  const [currentUserLoc, setCurrentUserLoc] = useState<LocationLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [logging, setLogging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [expiryMinutes, setExpiryMinutes] = useState<number>(0); 
  const [isPublic, setIsPublic] = useState<boolean>(true); 
  const [isStale, setIsStale] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [newName, setNewName] = useState(pb.authStore.record?.name || '');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Public Link State
  const [publicToken, setPublicToken] = useState<string | null>(pb.authStore.record?.public_token || null);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const clusterLayer = useRef<any>(null);
  const markerRefs = useRef<Record<string, any>>({});
  const hasFitBounds = useRef(false);

  const user = pb.authStore.record;

  const latestLocations = useMemo(() => {
    // Client-side deduplication based on fetched records
    const uniqueMap: Record<string, LocationLog> = {};
    allLocations.forEach(loc => {
      // 1. Check expiration (visual filter)
      if (loc.expiresAt && isPast(new Date(loc.expiresAt))) return;
      // 2. Group by user, keep most recent
      if (loc.user && (!uniqueMap[loc.user] || new Date(loc.updated) > new Date(uniqueMap[loc.user].updated))) {
        uniqueMap[loc.user] = loc;
      }
    });
    return Object.values(uniqueMap).sort((a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime());
  }, [allLocations]);

  // Filter for Search
  const filteredLocations = useMemo(() => {
    if (!searchQuery.trim()) return latestLocations;
    const lowerQuery = searchQuery.toLowerCase();
    return latestLocations.filter(loc => {
        const userName = loc.expand?.user?.name || loc.expand?.user?.email || "";
        const address = loc.address || "";
        return userName.toLowerCase().includes(lowerQuery) || address.toLowerCase().includes(lowerQuery);
    });
  }, [latestLocations, searchQuery]);

  const fetchData = async () => {
    try {
      const myId = pb.authStore.record?.id;

      // Scalability: Only fetch latest 50 records to save bandwidth/API
      const result = await pb.collection('locations').getList<LocationLog>(1, 50, {
        sort: '-updated',
        expand: 'user',
        requestKey: null,
      });
      
      let records = result.items;
      let myLoc = records.find(r => r.user === myId);

      // If current user is not in the top 50, fetch them specifically so they can update their status
      if (myId && !myLoc) {
        try {
            const myRecordsList = await pb.collection('locations').getList<LocationLog>(1, 1, {
                filter: `user = "${myId}"`,
                expand: 'user',
                requestKey: null
            });
            if (myRecordsList.items.length > 0) {
                myLoc = myRecordsList.items[0];
                records = [...records, myLoc]; 
            }
        } catch (e) {
            console.error("Could not fetch my record", e);
        }
      }

      if (myId) {
        const freshUser = await pb.collection('users').getOne(myId);
        setPublicToken(freshUser.public_token || null);
        
        // Background Cleanup for owned expired records
        const myExpiredRecords = records.filter(r => 
          r.user === myId && r.expiresAt && isPast(new Date(r.expiresAt))
        );
        if (myExpiredRecords.length > 0) {
          Promise.all(myExpiredRecords.map(r => 
            pb.collection('locations').delete(r.id).catch(err => console.error(err))
          ));
        }
      }

      // Filter out expired records for display state
      const validRecords = records.filter(r => {
        if (myId && r.user === myId && r.expiresAt && isPast(new Date(r.expiresAt))) return false;
        return true;
      });

      setAllLocations(validRecords);
      
      if (myLoc) {
        setCurrentUserLoc(myLoc);
        if (note === '') setNote(myLoc.note || '');
        setIsPublic(myLoc.isPublic !== false); 
        setIsStale(differenceInHours(new Date(), new Date(myLoc.updated)) >= 24);
      } else {
        setCurrentUserLoc(null);
        setIsStale(false);
      }
      setError(null);
    } catch (err: any) {
      if (err.name !== 'ClientResponseError' || !err.isAbort) {
        console.error('Fetch error:', err);
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

  const generatePublicLink = async () => {
    if (!user) return;
    setLogging(true);
    try {
        const token = crypto.randomUUID();
        await pb.collection('users').update(user.id, { public_token: token });
        setPublicToken(token);
    } catch (err) {
        setError("Failed to generate link.");
    } finally {
        setLogging(false);
    }
  };

  const copyToClipboard = () => {
      if (!publicToken) return;
      const url = `${window.location.origin}/#/share/${publicToken}`;
      navigator.clipboard.writeText(url);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
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
      
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { maxZoom: 20 }).addTo(leafletMap.current);
      L.control.zoom({ position: 'topright' }).addTo(leafletMap.current); 

      if (L.markerClusterGroup) {
        clusterLayer.current = L.markerClusterGroup({
          showCoverageOnHover: false,
          maxClusterRadius: 40,
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

  // Marker Rendering
  useEffect(() => {
    if (clusterLayer.current && leafletMap.current && typeof L !== 'undefined') {
      clusterLayer.current.clearLayers();
      markerRefs.current = {};
      const bounds = L.latLngBounds([]);
      
      filteredLocations.forEach(loc => {
        const userName = loc.expand?.user?.name || loc.expand?.user?.email?.split('@')[0] || "User";
        const isMe = loc.user === pb.authStore.record?.id;
        const isPrivate = loc.isPublic === false;
        
        // Skip rendering other users if they are private
        if (isPrivate && !isMe) return;

        const avatarUrl = (loc.expand?.user?.id && loc.expand?.user?.avatar) ? pb.files.getURL(loc.expand.user, loc.expand.user.avatar, { thumb: '100x100' }) : null;
        const hoursDiff = differenceInHours(new Date(), new Date(loc.updated));

        let statusColor = hoursDiff >= 24 ? 'bg-amber-500' : 'bg-green-500';
        if (isMe && isPrivate) statusColor = 'bg-slate-400';

        const icon = L.divIcon({
          className: 'custom-div-icon',
          html: `
            <div class="relative group">
              <div class="w-10 h-10 md:w-12 md:h-12 ${isMe ? 'bg-[#6750a4]' : 'bg-slate-900'} rounded-xl border-[3px] border-white shadow-lg flex items-center justify-center text-white text-[10px] md:text-xs font-bold overflow-hidden transition-all group-hover:scale-110">
                ${avatarUrl ? `<img src="${avatarUrl}" class="w-full h-full object-cover" />` : userName.charAt(0).toUpperCase()}
                ${isMe && isPrivate ? `
                  <div class="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  </div>
                ` : ''}
              </div>
              <div class="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${statusColor}"></div>
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 20],
          popupAnchor: [0, -20]
        });

        const marker = L.marker([loc.lat, loc.lng], { icon }).bindPopup(`
          <div class="p-3 text-center min-w-[140px]">
            <p class="font-bold text-sm mb-1 text-slate-900 flex items-center justify-center gap-1">
               ${isMe ? 'My Location' : escapeHTML(userName)}
               ${isPrivate ? '<span class="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-normal border border-slate-200">Hidden</span>' : ''}
            </p>
            <p class="text-[10px] text-[#6750a4] mb-2 font-medium">${formatDistanceToNow(new Date(loc.updated), { addSuffix: true })}</p>
            ${loc.note ? `<p class="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 break-words mb-2">"${escapeHTML(loc.note)}"</p>` : ''}
            ${loc.address ? `<p class="text-[10px] text-slate-500 flex items-center justify-center gap-1"><svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>${escapeHTML(loc.address)}</p>` : ''}
          </div>
        `, { closeButton: false, className: 'custom-popup' });
        
        markerRefs.current[loc.user] = marker;
        clusterLayer.current.addLayer(marker);
        bounds.extend([loc.lat, loc.lng]);
      });

      if (filteredLocations.length > 0 && !hasFitBounds.current) {
        leafletMap.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
        hasFitBounds.current = true;
      }
    }
  }, [filteredLocations]);

  const resetView = () => {
    if (latestLocations.length > 0 && leafletMap.current) {
      const bounds = L.latLngBounds(latestLocations.map(l => [l.lat, l.lng]));
      leafletMap.current.flyToBounds(bounds, { padding: [50, 50], duration: 1.2 });
    }
  };

  const focusMember = (userId: string, lat: number, lng: number) => {
    if (!leafletMap.current) return;
    leafletMap.current.flyTo([lat, lng], 17, { duration: 1.5 });
    const marker = markerRefs.current[userId];
    if (marker && clusterLayer.current) {
      setTimeout(() => clusterLayer.current.zoomToShowLayer(marker, () => marker.openPopup()), 1600);
    }
  };

  const getReadableAddress = async (lat: number, lng: number): Promise<string> => {
    try {
      // Zoom 14 gives neighborhood/suburb/village level details which is better for "properly shown" addresses
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&accept-language=en`);
      if (!res.ok) return "";
      const data = await res.json();
      const addr = data.address;
      
      // Construct a more meaningful address
      const locality = addr.suburb || addr.neighbourhood || addr.village || addr.town || addr.city || "";
      const region = addr.county || addr.state || addr.country || "";
      
      if (locality && region) {
          // Avoid duplication if city and county are same
          if (locality === region) return locality;
          return `${locality}, ${region}`;
      }
      return locality || region || "Unknown Location";
    } catch (e) { return ""; }
  };

  const handleUpdate = () => {
    if (!navigator.geolocation) return setError("GPS not supported.");
    setLogging(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const now = new Date();
          let expiresAt = "";
          if (expiryMinutes > 0) expiresAt = addMinutes(now, expiryMinutes).toISOString();

          const address = await getReadableAddress(pos.coords.latitude, pos.coords.longitude);
          const data = { 
            user: user?.id, 
            lat: pos.coords.latitude, 
            lng: pos.coords.longitude, 
            note: note.trim(),
            address: address, 
            expiresAt: expiresAt,
            isPublic: isPublic 
          };

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

  const handleDelete = async () => {
    if (!currentUserLoc || !window.confirm("Stop sharing your location?")) return;
    setLogging(true);
    try {
        await pb.collection('locations').delete(currentUserLoc.id);
        setCurrentUserLoc(null);
        setNote('');
        setAllLocations(prev => prev.filter(l => l.id !== currentUserLoc.id));
        await fetchData();
    } catch (err) { setError("Failed to delete."); } 
    finally { setLogging(false); }
  };

  return (
    <div className="h-full flex flex-col md:flex-row bg-white overflow-hidden relative">
      {/* Sidebar - Relative on mobile to prevent map obstruction */}
      <aside className="w-full md:w-[420px] lg:w-[480px] bg-white border-t md:border-t-0 md:border-r border-slate-200 flex flex-col order-2 md:order-1 z-20 h-[45vh] md:h-full shadow-[0_-5px_20px_rgba(0,0,0,0.1)] md:shadow-none relative">
        
        {/* Handle for resizing on mobile (visual cue) */}
        <div className="w-full h-6 flex items-center justify-center md:hidden shrink-0 cursor-grab active:cursor-grabbing">
             <div className="w-12 h-1.5 bg-slate-200 rounded-full mt-2"></div>
        </div>

        <div className="p-5 md:p-8 space-y-6 flex-1 overflow-y-auto">
          {/* Controls Area */}
          <div className="bg-slate-50 p-6 rounded-[24px] border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
                 <h2 className="text-sm font-bold text-slate-800">My Status</h2>
                 <button onClick={() => setShowProfileEdit(!showProfileEdit)} className="text-[10px] font-bold text-[#6750a4] uppercase tracking-wider hover:underline focus:outline-none focus:text-indigo-800">
                    {showProfileEdit ? 'Cancel' : 'Edit Name'}
                 </button>
            </div>

            {showProfileEdit && (
                <div className="mb-4 flex gap-2 animate-in fade-in">
                    <label htmlFor="edit-name" className="sr-only">Edit Display Name</label>
                    <input 
                        id="edit-name"
                        type="text" 
                        value={newName} 
                        onChange={(e) => setNewName(e.target.value)} 
                        className="flex-1 px-4 py-3 text-sm border border-slate-300 rounded-xl bg-white text-slate-900 placeholder:text-slate-500 focus:ring-2 focus:ring-[#6750a4] focus:border-transparent outline-none shadow-sm" 
                        placeholder="Name..." 
                    />
                    <button onClick={handleProfileUpdate} className="px-5 bg-[#6750a4] text-white rounded-xl text-xs font-bold shadow-md hover:bg-[#5a4491] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#6750a4]">Save</button>
                </div>
            )}

            <label htmlFor="status-note" className="sr-only">Status Note</label>
            <input 
                id="status-note"
                type="text" 
                value={note} 
                onChange={(e) => setNote(e.target.value)} 
                placeholder="What are you doing?" 
                className="w-full px-5 py-4 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-500 mb-5 outline-none focus:ring-2 focus:ring-[#6750a4] focus:border-transparent transition-all shadow-sm" 
            />
            
            <div className="grid grid-cols-2 gap-4 mb-6">
                 {/* Expiry Selector */}
                 <div className="relative">
                    <label htmlFor="expiry-select" className="sr-only">Expiration Time</label>
                    <select 
                        id="expiry-select"
                        value={expiryMinutes} 
                        onChange={(e) => setExpiryMinutes(Number(e.target.value))} 
                        className="w-full appearance-none bg-white border border-slate-300 text-slate-900 text-[11px] font-bold rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#6750a4] cursor-pointer shadow-sm"
                    >
                      {EXPIRY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                    {/* Custom Arrow */}
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                        <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                 </div>
                 
                 {/* Privacy Segmented Control */}
                 <div className="flex bg-slate-200 p-1 rounded-xl">
                    <button 
                        onClick={() => setIsPublic(true)}
                        className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all py-2.5 ${isPublic ? 'bg-white text-[#6750a4] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        aria-pressed={isPublic}
                        aria-label="Set visibility to Community"
                    >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        Community
                    </button>
                    <button 
                        onClick={() => setIsPublic(false)}
                        className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all py-2.5 ${!isPublic ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        aria-pressed={!isPublic}
                        aria-label="Set visibility to Unlisted"
                    >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                        Unlisted
                    </button>
                 </div>
            </div>

            <button onClick={handleUpdate} disabled={logging} className="w-full py-4 rounded-xl font-bold text-sm uppercase tracking-wider text-white bg-[#6750a4] shadow-lg shadow-indigo-100 hover:bg-[#5a4491] active:scale-95 transition-all flex justify-center items-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6750a4]">
              {logging ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Updating...
                  </>
              ) : "Log Location"}
            </button>
            
            {currentUserLoc && (
                 <button onClick={handleDelete} className="w-full mt-3 py-2 text-[10px] font-bold uppercase tracking-widest text-rose-500 hover:bg-rose-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500">
                    Stop Sharing
                 </button>
            )}
          </div>

          {/* Share Section */}
          <div className="bg-indigo-50/50 rounded-[24px] border border-indigo-50 p-1">
              <button 
                onClick={() => {
                  if (!publicToken) generatePublicLink();
                  setShowShareOptions(!showShareOptions);
                }} 
                className="w-full flex items-center justify-between p-4 text-left group"
                aria-expanded={showShareOptions}
              >
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-indigo-100 text-[#6750a4] flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                    </div>
                    <div>
                        <span className="block text-sm font-bold text-slate-800">Share Unique Link</span>
                        <span className="block text-[11px] text-slate-500">Visible to link holders even if unlisted</span>
                    </div>
                  </div>
                  <svg className={`w-4 h-4 text-slate-400 transition-transform ${showShareOptions ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              
              {showShareOptions && (
                  <div className="px-4 pb-4 animate-in slide-in-from-top-1">
                     <button 
                        onClick={copyToClipboard} 
                        className="w-full bg-white border border-indigo-200 rounded-xl p-3 flex items-center justify-between cursor-pointer hover:border-[#6750a4] transition-all group shadow-sm"
                        title="Copy to clipboard"
                     >
                         <span className="text-xs font-mono text-slate-600 truncate mr-3 select-all">
                            {publicToken ? `${window.location.origin}/#/share/${publicToken}` : 'Generating...'}
                         </span>
                         <span className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${copyFeedback ? 'text-emerald-600' : 'text-[#6750a4]'}`}>
                             {copyFeedback ? (
                                <>Copied <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></>
                             ) : (
                                <>Copy <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg></>
                             )}
                         </span>
                     </button>
                  </div>
              )}
          </div>

          {/* Search Bar */}
          <div className="relative">
             <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
             </div>
             <input 
                type="text" 
                placeholder="Search name or place..." 
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#6750a4] outline-none transition-shadow"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
             />
          </div>

          {/* List */}
          <div className="space-y-3 pb-8">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">
                Nearby Activity {searchQuery && `(${filteredLocations.length})`}
            </h3>
            {filteredLocations.length === 0 && !loading && (
                <div className="text-center py-10 text-slate-400 text-xs italic bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                    {searchQuery ? "No matches found." : "Map is quiet. Be the first to log!"}
                </div>
            )}
            {filteredLocations.map(loc => {
                const isMe = loc.user === user?.id;
                if (loc.isPublic === false && !isMe) return null; 
                
                const userName = loc.expand?.user?.name || "User";
                const isUnlisted = loc.isPublic === false;
                
                return (
                    <button key={loc.id} onClick={() => focusMember(loc.user, loc.lat, loc.lng)} className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors text-left group border border-transparent hover:border-slate-100">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-sm shrink-0 ${isMe ? 'bg-[#6750a4]' : 'bg-slate-800'}`}>
                           {loc.expand?.user?.avatar ? <img src={pb.files.getURL(loc.expand.user, loc.expand.user.avatar, {thumb:'100x100'})} className="w-full h-full object-cover rounded-xl"/> : userName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-bold text-slate-900 truncate flex items-center gap-1.5">
                                    {isMe ? "You" : userName} 
                                    {isUnlisted && <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold border border-slate-200 uppercase tracking-wider">Hidden</span>}
                                </span>
                                <span className="text-[10px] text-slate-400 font-bold tabular-nums">{formatDistanceToNow(new Date(loc.updated))}</span>
                            </div>
                            <div className="flex flex-col gap-0.5">
                                {loc.note && (
                                    <p className="text-xs text-slate-900 font-medium truncate">"{loc.note}"</p>
                                )}
                                <p className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                                    <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    {loc.address || "Location logged"}
                                </p>
                            </div>
                        </div>
                    </button>
                )
            })}
          </div>
        </div>
      </aside>

      {/* Map Section */}
      <div className="flex-1 relative order-1 md:order-2 h-full w-full min-h-0 bg-slate-50">
        <div ref={mapRef} className="w-full h-full" />
        {/* Reset Button - Moved to bottom right */}
        <div className="absolute bottom-8 right-4 z-[1000] flex flex-col gap-2">
            <button onClick={resetView} aria-label="Reset Map View" className="bg-white p-3 rounded-full shadow-lg text-slate-600 hover:text-[#6750a4] active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-[#6750a4]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
            </button>
        </div>
      </div>
    </div>
  );
};
