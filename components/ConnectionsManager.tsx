
import React, { useState, useEffect } from 'react';
import { pb } from '../lib/pocketbase';

interface ConnectedUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

interface ConnectionsManagerProps {
  onRefresh: () => void;
}

const ConnectionsManager: React.FC<ConnectionsManagerProps> = ({ onRefresh }) => {
  const [connections, setConnections] = useState<ConnectedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [emailInput, setEmailInput] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteMode, setInviteMode] = useState(false);

  const fetchConnections = async () => {
    try {
      const userId = pb.authStore.record?.id;
      if (!userId) return;

      // Force refresh user record to ensure we have the latest connections list
      const user = await pb.collection('users').getOne(userId, {
        expand: 'connections',
        requestKey: null
      });

      const list = (user.expand?.connections as ConnectedUser[]) || [];
      // Filter out any potential deleted ghosts and ensure they are valid objects
      setConnections(list.filter(c => c && typeof c === 'object' && c.id));
    } catch (err) {
      console.error('Failed to fetch connections:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  const handleAddConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInviteMode(false);
    const email = emailInput.trim().toLowerCase();
    
    if (!email) return;
    
    const currentUser = pb.authStore.record;
    if (email === currentUser?.email) {
      setError("You cannot connect with yourself.");
      return;
    }

    setLoading(true);
    try {
      // 1. Search for user by email using a list filter which is more Rule-friendly
      let targetUser;
      try {
        const result = await pb.collection('users').getList(1, 1, {
          filter: `email = "${email}"`,
          requestKey: null
        });

        if (result.items.length === 0) {
          throw new Error("404");
        }
        targetUser = result.items[0];
      } catch (err: any) {
        if (err.message === "404" || err.status === 404) {
          setInviteMode(true);
          setError(`"${email}" is not registered on Last Seen yet.`);
        } else if (err.status === 403) {
          setError("Access Denied: Please set your 'users' List Rule to: id = @request.auth.id || email != ''");
        } else {
          setError("Search failed. Please try again.");
        }
        setLoading(false);
        return;
      }

      // 2. Direct Add to connections
      if (connections.some(c => c.id === targetUser.id)) {
        setError("This user is already in your connections.");
      } else {
        if (currentUser?.id) {
          // Use the '+' operator to append to the relation field
          await pb.collection('users').update(currentUser.id, {
            'connections+': targetUser.id
          });
          
          setEmailInput('');
          setIsAdding(false);
          await fetchConnections();
          onRefresh();
          
          // Subtle feedback that it worked
          console.log(`Connected with ${targetUser.email}`);
        }
      }
    } catch (err: any) {
      console.error("Add connection error:", err);
      setError(err.message || "Failed to add connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (targetId: string) => {
    if (!window.confirm("Remove this connection? They will no longer see your location.")) return;
    
    setLoading(true);
    try {
      const userId = pb.authStore.record?.id;
      if (userId) {
        await pb.collection('users').update(userId, {
          'connections-': targetId
        });
        await fetchConnections();
        onRefresh();
      }
    } catch (err) {
      setError("Failed to remove connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = () => {
    const msg = `Join me on Last Seen so we can share our last known locations! Check it out here: ${window.location.origin}`;
    window.location.href = `mailto:${emailInput}?subject=Join me on Last Seen&body=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">My Connections</h3>
        <button 
          onClick={() => { setIsAdding(!isAdding); setError(null); setInviteMode(false); }} 
          className={`text-[10px] font-bold px-4 py-2 rounded-xl transition-all ${isAdding ? 'bg-slate-100 text-slate-500' : 'bg-[#6750a4] text-white shadow-sm'}`}
        >
          {isAdding ? 'Cancel' : 'Add Connection'}
        </button>
      </div>

      {error && (
        <div className="mx-2 p-4 bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-bold rounded-2xl animate-in fade-in flex flex-col gap-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="flex-1 leading-relaxed">{error}</span>
            <button onClick={() => setError(null)} className="ml-2 text-lg hover:text-rose-800">&times;</button>
          </div>
          {inviteMode && (
            <button 
              onClick={handleInvite}
              className="py-2 bg-rose-500 text-white rounded-xl text-[9px] uppercase tracking-widest active:scale-95 transition-transform"
            >
              Invite to Last Seen
            </button>
          )}
        </div>
      )}

      {isAdding && (
        <form onSubmit={handleAddConnection} className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 animate-in slide-in-from-top-2 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Add user by email</p>
          <input 
            type="email" 
            value={emailInput} 
            onChange={(e) => setEmailInput(e.target.value)} 
            placeholder="friend@example.com" 
            className="w-full px-5 py-4 rounded-2xl bg-white border border-slate-100 text-sm focus:ring-2 focus:ring-[#6750a4] outline-none mb-4" 
            required
            autoFocus
          />
          <button type="submit" disabled={loading} className="w-full py-4 bg-[#6750a4] text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-lg active:scale-95 disabled:opacity-50 transition-all">
            {loading ? 'Searching...' : 'Add Connection'}
          </button>
        </form>
      )}

      <div className="flex flex-wrap gap-2.5 px-2">
        {connections.map(conn => (
          <div key={conn.id} className="relative group">
            <div className="px-5 py-3 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-widest pr-12 border border-slate-200">
              {conn.name || conn.email.split('@')[0]}
            </div>
            <button 
              onClick={() => handleRemove(conn.id)}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all"
              title="Remove Connection"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9z" clipRule="evenodd"/></svg>
            </button>
          </div>
        ))}
        {connections.length === 0 && !isAdding && !loading && (
          <div className="w-full py-4 text-center border-2 border-dashed border-slate-100 rounded-3xl">
            <p className="text-[10px] font-medium text-slate-400 italic">No connections yet.</p>
          </div>
        )}
      </div>
      
      <p className="px-2 text-[9px] text-slate-300 leading-tight">
        Note: When you add a connection, they can see your location. To see their location, they must also add you.
      </p>
    </div>
  );
};

export default ConnectionsManager;
