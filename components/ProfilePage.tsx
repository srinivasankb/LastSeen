
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { pb } from '../lib/pocketbase';
import { format } from 'date-fns';

const ProfilePage: React.FC = () => {
  const user = pb.authStore.record;
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const avatarUrl = user?.avatar 
    ? pb.files.getURL(user, user.avatar, { thumb: '200x200' })
    : null;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const updatedUser = await pb.collection('users').update(user.id, { name });
      pb.authStore.save(pb.authStore.token, updatedUser);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    pb.authStore.clear();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#f7f2fa] flex flex-col">
      <header className="h-16 flex items-center px-4 sm:px-6 border-b border-[#eaddff] sticky top-0 bg-white z-10 justify-between">
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/')}
            className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors text-slate-600 mr-2 focus:outline-none focus:ring-2 focus:ring-[#6750a4]"
            aria-label="Back to Map"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-[#1c1b1f] tracking-tight">Account Settings</h1>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center py-8 sm:py-12 px-4 sm:px-6">
        <div className="w-full max-w-lg space-y-6">
          {/* Main Profile Info Card */}
          <section className="bg-white rounded-[40px] sm:rounded-[48px] p-8 sm:p-10 shadow-xl shadow-indigo-100/50 flex flex-col items-center text-center border border-slate-50">
            <div className="relative shrink-0 mb-6">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-[32px] sm:rounded-[40px] bg-[#f7f2fa] border-4 border-white shadow-lg overflow-hidden flex items-center justify-center">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Your Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl sm:text-4xl font-bold text-[#6750a4]">{(user?.name || user?.email || 'U').charAt(0).toUpperCase()}</span>
                )}
              </div>
            </div>
            
            <div className="space-y-4 w-full">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 line-clamp-1">{user?.name || 'Last Seen User'}</h2>
                <p className="text-sm text-slate-400 font-medium">{user?.email}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-50">
                <div className="flex flex-col items-center">
                  <span className="text-[9px] font-black uppercase text-slate-300 tracking-[0.2em] mb-1">Internal ID</span>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded-md">{user?.id}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[9px] font-black uppercase text-slate-300 tracking-[0.2em] mb-1">Joined On</span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase">{user?.created ? format(new Date(user.created), 'MMM yyyy') : 'Recently'}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Edit Form */}
          <section className="bg-white rounded-[40px] p-8 sm:p-10 shadow-xl shadow-indigo-100/30 border border-slate-50">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#6750a4] mb-8">Personalize Profile</h3>
            
            <form onSubmit={handleUpdate} className="space-y-6">
              <div>
                <label htmlFor="full-name" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Display Name</label>
                <input 
                  id="full-name"
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#6750a4] outline-none transition-all shadow-sm"
                  placeholder="Enter your name"
                  aria-describedby="name-hint"
                />
                <p id="name-hint" className="text-[10px] text-slate-400 mt-2 px-1">This name is visible to your circle members on the map.</p>
              </div>

              {error && (
                <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 text-rose-500 text-[11px] font-bold" role="alert">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-600 text-[11px] font-bold flex items-center gap-2" role="status">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Profile updated successfully!
                </div>
              )}

              <button 
                type="submit"
                disabled={loading}
                className="w-full min-h-[56px] bg-[#6750a4] text-white rounded-full font-bold text-xs uppercase tracking-[0.2em] shadow-lg shadow-indigo-100 hover:bg-[#7e6bb4] transition-all disabled:opacity-50 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6750a4]"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </section>

          {/* Session Management */}
          <div className="bg-rose-50 rounded-[40px] p-8 sm:p-10 border border-rose-100/50">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-rose-500 mb-6">Security & Session</h3>
            <p className="text-[11px] font-medium text-rose-400 mb-8 leading-relaxed">Closing your session will remove your authentication from this device. Your location history is never stored, but your account details remain active.</p>
            <button 
              onClick={handleLogout}
              className="w-full min-h-[56px] bg-white text-rose-500 border-2 border-rose-100 rounded-full font-bold text-xs uppercase tracking-[0.2em] hover:bg-rose-100 transition-all active:scale-95 flex items-center justify-center gap-3 focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out Securely
            </button>
          </div>
        </div>
      </main>

      <footer className="py-12 px-6 flex flex-wrap justify-center gap-x-8 gap-y-4 border-t border-black/5 bg-white">
        <Link to="/guide" className="text-[10px] uppercase font-black text-slate-300 hover:text-[#6750a4] transition-colors tracking-widest p-2">User Guide</Link>
        <Link to="/privacy" className="text-[10px] uppercase font-black text-slate-300 hover:text-[#6750a4] transition-colors tracking-widest p-2">Privacy Policy</Link>
        <Link to="/terms" className="text-[10px] uppercase font-black text-slate-300 hover:text-[#6750a4] transition-colors tracking-widest p-2">Terms of Service</Link>
      </footer>
    </div>
  );
};

export default ProfilePage;
