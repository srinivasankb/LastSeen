
import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { pb } from '../lib/pocketbase';
import { formatDistanceToNow, isPast } from 'date-fns';

declare const L: any;

const PublicLocationView: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [targetUser, setTargetUser] = useState<any | null>(null);
  const [targetLocation, setTargetLocation] = useState<any | null>(null);

  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const markerRef = useRef<any>(null);

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

    } catch (err) { setError("Unavailable."); } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchPublicData();
    const interval = setInterval(fetchPublicData, 30000);
    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
      if (loading) return;
      if (mapRef.current && !leafletMap.current && typeof L !== 'undefined') {
          leafletMap.current = L.map(mapRef.current, { zoomControl: false, attributionControl: false }).setView([20, 0], 2);
          L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { maxZoom: 20 }).addTo(leafletMap.current);
          L.control.zoom({ position: 'bottomright' }).addTo(leafletMap.current);
      }
      return () => { if (leafletMap.current) { leafletMap.current.remove(); leafletMap.current = null; } };
  }, [loading]);

  useEffect(() => {
      if (!leafletMap.current || !targetLocation) return;
      if (markerRef.current) markerRef.current.remove();

      const icon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div class="w-16 h-16 bg-[#6750a4] rounded-full border-4 border-white shadow-xl flex items-center justify-center text-white text-xl font-bold animate-bounce overflow-hidden">${targetUser?.avatar ? `<img src="${pb.files.getURL(targetUser, targetUser.avatar)}" class="w-full h-full object-cover"/>` : targetUser?.name?.[0]}</div>`,
        iconSize: [64, 64],
        iconAnchor: [32, 64]
      });

      markerRef.current = L.marker([targetLocation.lat, targetLocation.lng], { icon }).addTo(leafletMap.current);
      leafletMap.current.flyTo([targetLocation.lat, targetLocation.lng], 15, { duration: 1.5 });
  }, [targetLocation]);

  if (loading) return <div className="h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-[#6750a4]/30 border-t-[#6750a4] rounded-full animate-spin"></div></div>;

  return (
    <div className="h-screen flex flex-col bg-white">
        <header className="absolute top-0 left-0 right-0 z-50 p-4 flex justify-between items-center pointer-events-none">
            <Link to="/" className="pointer-events-auto flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-xl shadow-sm border border-slate-100">
                <div className="w-6 h-6 bg-[#6750a4] rounded-lg flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                </div>
                <span className="font-bold text-sm text-slate-900 tracking-tight">Last Seen</span>
            </Link>
            <Link to="/" className="pointer-events-auto bg-[#6750a4] text-white px-5 py-2 rounded-full text-xs font-bold shadow-lg hover:bg-[#5a4491] transition-colors">Get App</Link>
        </header>

        <div ref={mapRef} className="flex-1 w-full" />

        <div className="bg-white p-6 rounded-t-[32px] shadow-[0_-5px_20px_rgba(0,0,0,0.1)] -mt-6 relative z-10 pb-8">
            {error ? (
                <div className="text-center py-4 text-slate-500">{error}</div>
            ) : (
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-xl font-bold text-slate-400 overflow-hidden">
                        {targetUser?.avatar ? <img src={pb.files.getURL(targetUser, targetUser.avatar)} className="w-full h-full object-cover"/> : targetUser?.name?.[0]}
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Location Of</p>
                        <h1 className="text-xl font-bold text-slate-900">{targetUser?.name || 'User'}</h1>
                        {targetLocation && <p className="text-xs text-[#6750a4] font-medium mt-0.5">Updated {formatDistanceToNow(new Date(targetLocation.updated))} ago</p>}
                    </div>
                </div>
            )}
            {targetLocation && (
                <a href={`https://www.google.com/maps/search/?api=1&query=${targetLocation.lat},${targetLocation.lng}`} target="_blank" className="mt-6 w-full py-4 bg-slate-900 text-white rounded-2xl flex items-center justify-center gap-2 font-bold text-sm hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                    Open in Maps
                </a>
            )}
        </div>
    </div>
  );
};

export default PublicLocationView;
