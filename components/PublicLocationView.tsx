import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { pb } from '../lib/pocketbase';
import { formatDistanceToNow, isPast } from 'date-fns';
import { useTheme } from '../lib/theme';

declare const L: any;

const PublicLocationView: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [targetUser, setTargetUser] = useState<any | null>(null);
  const [targetLocation, setTargetLocation] = useState<any | null>(null);

  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const initialized = useRef(false);

  const { theme, toggleTheme } = useTheme();

  const fetchPublicData = async () => {
    if (!token) { setError("Invalid link."); setLoading(false); return; }

    try {
        const users = await pb.collection('users').getList(1, 1, { filter: `public_token = "${token}"` });
        if (users.items.length === 0) { setError("Link expired."); setLoading(false); return; }

        const userRec = users.items[0];
        setTargetUser(userRec);

        try {
             const locations = await pb.collection('locations').getList(1, 1, { filter: `user = "${userRec.id}"`, sort: '-updated' });
             if (locations.items.length > 0) {
                 const loc = locations.items[0];
                 if (loc.expiresAt && isPast(new Date(loc.expiresAt))) setTargetLocation(null);
                 else setTargetLocation(loc);
             } else {
                 setTargetLocation(null);
             }
        } catch (e) { setTargetLocation(null); }

    } catch (err: any) { 
        // Only set global error for non-network/non-abort errors to avoid flickering "Something went wrong"
        const isTransient = err.status === 0 || err.isAbort;
        if (!isTransient) {
            setError("Unavailable."); 
        }
    } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchPublicData();
    const interval = setInterval(fetchPublicData, 30000);
    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
      if (loading) return;
      if (mapRef.current && !leafletMap.current && typeof L !== 'undefined') {
          leafletMap.current = L.map(mapRef.current, { 
            zoomControl: false, 
            attributionControl: false,
            maxZoom: 20
          }).setView([20, 0], 2);
          L.control.zoom({ position: 'bottomright' }).addTo(leafletMap.current);
      }
      return () => { 
        if (leafletMap.current) { 
            // 1. Stop animations
            leafletMap.current.stop();

            // 2. Clear all layers
            try {
              leafletMap.current.eachLayer((layer: any) => {
                 try { leafletMap.current.removeLayer(layer); } catch(e) {}
              });
            } catch(e) {}

            // 3. Remove map
            try {
              leafletMap.current.off();
              leafletMap.current.remove(); 
            } catch(e) {}
            
            leafletMap.current = null; 
            initialized.current = false; 
            tileLayerRef.current = null;
            markerRef.current = null;
        } 
      };
  }, [loading]);

  useEffect(() => {
    if (leafletMap.current) {
        if (tileLayerRef.current) {
             try { tileLayerRef.current.remove(); } catch(e) {}
        }
        
        const tileUrl = theme === 'dark' 
            ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
            : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
        
        tileLayerRef.current = L.tileLayer(tileUrl, { maxZoom: 20 }).addTo(leafletMap.current);
    }
  }, [theme, loading]);

  useEffect(() => {
      // Check for map container existence
      if (!leafletMap.current || !leafletMap.current.getContainer() || !targetLocation) return;
      
      const isVague = targetLocation.isVague === true;

      const icon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div class="relative"><div class="w-16 h-16 bg-[#6750a4] rounded-full border-4 border-white dark:border-slate-800 shadow-xl flex items-center justify-center text-white text-xl font-bold animate-bounce overflow-hidden relative z-10">${targetUser?.avatar ? `<img src="${pb.files.getURL(targetUser, targetUser.avatar)}" class="w-full h-full object-cover"/>` : targetUser?.name?.[0]}</div>${isVague ? '<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-4 border-dashed border-[#6750a4]/30 rounded-full animate-spin-slow" style="animation-duration: 10s"></div>' : ''}</div>`,
        iconSize: [64, 64],
        iconAnchor: [32, 64]
      });

      if (markerRef.current) {
          // Update existing marker
          markerRef.current.setLatLng([targetLocation.lat, targetLocation.lng]);
          markerRef.current.setIcon(icon);
      } else {
          // Create new marker
          markerRef.current = L.marker([targetLocation.lat, targetLocation.lng], { icon }).addTo(leafletMap.current);
      }

      // Only fly to bounds on first load or valid location update if not initialized
      if (!initialized.current) {
          leafletMap.current.flyTo([targetLocation.lat, targetLocation.lng], 15, { duration: 1.5 });
          initialized.current = true;
      }
  }, [targetLocation, targetUser]);

  if (loading) return <div className="h-screen flex items-center justify-center bg-white dark:bg-slate-900"><div className="w-8 h-8 border-4 border-[#6750a4]/30 border-t-[#6750a4] rounded-full animate-spin"></div></div>;

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-slate-900">
        <header className="absolute top-0 left-0 right-0 z-50 p-4 flex justify-between items-center pointer-events-none">
            <Link to="/" className="pointer-events-auto flex items-center gap-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm px-3 py-1.5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="w-6 h-6 bg-[#6750a4] rounded-lg flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                </div>
                <span className="font-bold text-sm text-slate-900 dark:text-white tracking-tight">Last Seen</span>
            </Link>
            <div className="flex gap-2 pointer-events-auto">
                <button 
                  onClick={toggleTheme}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white shadow-sm border border-slate-100 dark:border-slate-700 transition-colors"
                >
                  {theme === 'light' ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                  ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  )}
                </button>
                <Link to="/" className="bg-[#6750a4] text-white px-5 py-2 rounded-full text-xs font-bold shadow-lg hover:bg-[#5a4491] transition-colors flex items-center">Get App</Link>
            </div>
        </header>

        <div ref={mapRef} className="flex-1 w-full" />

        <div className="bg-white dark:bg-slate-850 p-6 rounded-t-[32px] shadow-[0_-5px_20px_rgba(0,0,0,0.1)] -mt-6 relative z-10 pb-8 border-t border-slate-50 dark:border-slate-800">
            {error ? (
                <div className="text-center py-4 text-slate-500">{error}</div>
            ) : (
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-xl font-bold text-slate-400 overflow-hidden">
                        {targetUser?.avatar ? <img src={pb.files.getURL(targetUser, targetUser.avatar)} className="w-full h-full object-cover"/> : targetUser?.name?.[0]}
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Location Of</p>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                           {targetUser?.name || 'User'}
                           {targetLocation?.isVague && (
                               <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800">
                                   <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12c2-3 5-3 8 0s6 3 8 0" /></svg>
                                   Approximate
                               </span>
                           )}
                        </h1>
                        
                        {targetLocation?.note && (
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-200 mt-2 bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700 inline-block">
                                "{targetLocation.note}"
                            </p>
                        )}

                        {targetLocation?.address && (
                            <div className="flex items-center gap-1.5 mt-3 text-slate-600 dark:text-slate-400">
                                <div className="w-6 h-6 rounded-full bg-indigo-50 dark:bg-slate-800 flex items-center justify-center shrink-0 text-[#6750a4] dark:text-indigo-400">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                </div>
                                <span className="text-sm font-medium">{targetLocation.address}</span>
                            </div>
                        )}

                        {targetLocation && <p className="text-[11px] text-slate-400 font-bold mt-2 ml-1">Updated {formatDistanceToNow(new Date(targetLocation.updated))} ago</p>}
                    </div>
                </div>
            )}
            {targetLocation && (
                <a href={`https://www.google.com/maps/search/?api=1&query=${targetLocation.lat},${targetLocation.lng}`} target="_blank" className="mt-6 w-full py-4 bg-slate-900 dark:bg-slate-700 text-white rounded-2xl flex items-center justify-center gap-2 font-bold text-sm hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors shadow-lg shadow-slate-200 dark:shadow-none">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                    Open in Maps
                </a>
            )}
        </div>
    </div>
  );
};

export default PublicLocationView;