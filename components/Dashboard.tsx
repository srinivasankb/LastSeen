
import React from 'react';
import { Link } from 'react-router-dom';
import { pb } from '../lib/pocketbase';
import LocationsView from './LocationsView';

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const user = pb.authStore.record;
  const avatarUrl = user?.avatar 
    ? pb.files.getURL(user, user.avatar, { thumb: '100x100' })
    : null;

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      <header className="h-16 flex items-center justify-between px-4 sm:px-6 bg-white z-50 shadow-sm shrink-0">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#6750a4] rounded-lg flex items-center justify-center shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
          </div>
          <h1 className="text-lg font-bold text-[#1c1b1f] tracking-tight hidden xs:block">Last Seen</h1>
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-1">
             {avatarUrl ? (
                <img src={avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover border border-slate-200" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-[#6750a4]">{(user?.name || 'U').charAt(0)}</div>
              )}
          </div>
          <button onClick={onLogout} className="text-slate-400 hover:text-rose-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </header>

      <main className="flex-1 relative overflow-hidden">
        <LocationsView />
      </main>
    </div>
  );
};

export default Dashboard;
