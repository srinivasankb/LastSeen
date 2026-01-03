
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
            <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-lg pointer-events-auto flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-xs font-bold text-slate-800">Live View</span>
            </div>
            <Link to="/" className="pointer-events-auto bg-[#6750a4] text-white px-5 py-2 rounded-full text-xs font-bold shadow-lg">Get App</Link>
        </header>

        <div ref={mapRef} className="flex-1 w-full" />

        <div className="bg-white p-6 rounded-t-[32px] shadow-[0_-5px_20px_rgba(0,0,0,0.1)] -mt-6 relative z-10">
            {error ? (
                <div className="text-center py-4 text-slate-500">{error}</div>
            ) : (
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-xl font-bold text-slate-400 overflow-hidden">
                        {targetUser?.avatar ? <img src={pb.files.getURL(targetUser, targetUser.avatar)} className="w-full h-full object-cover"/> : targetUser?.name?.[0]}
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Current Location Of</p>
                        <h1 className="text-xl font-bold text-slate-900">{targetUser?.name || 'User'}</h1>
                        {targetLocation && <p className="text-xs text-[#6750a4] font-medium mt-0.5">Updated {formatDistanceToNow(new Date(targetLocation.updated))} ago</p>}
                    </div>
                </div>
            )}
            {targetLocation && (
                <a href={`https://www.google.com/maps/search/?api=1&query=${targetLocation.lat},${targetLocation.lng}`} target="_blank" className="mt-6 w-full py-4 bg-slate-900 text-white rounded-2xl flex items-center justify-center gap-2 font-bold text-sm">
                    Open in Maps
                </a>
            )}
        </div>
    </div>
  );
};

export default PublicLocationView;
