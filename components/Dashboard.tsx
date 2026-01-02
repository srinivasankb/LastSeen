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
      {/* Top Header */}
      <header className="h-16 flex items-center justify-between px-4 sm:px-6 border-b border-[#eaddff] bg-white z-50">
        <Link 
          to="/" 
          className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-[#6750a4] rounded-lg p-1"
          aria-label="Last Seen Home"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[#6750a4] rounded-xl flex items-center justify-center shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-[#1c1b1f] tracking-tight">Last Seen</h1>
        </Link>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 p-1.5 px-3 rounded-full bg-slate-50 border border-slate-100 transition-all">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center border border-slate-300">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-[10px] sm:text-xs font-bold text-[#6750a4]">{(user?.name || user?.email || 'U').charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="hidden xs:flex flex-col items-start leading-none">
              <span className="text-[11px] sm:text-xs font-bold text-[#1c1b1f] line-clamp-1 max-w-[100px] sm:max-w-[140px]">
                {user?.name || user?.email?.split('@')[0]}
              </span>
            </div>
          </div>
          
          <button 
            onClick={onLogout}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full hover:bg-rose-50 flex items-center justify-center transition-colors text-slate-400 hover:text-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
            title="Sign Out"
            aria-label="Sign Out"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Map + Side Panel View */}
      <main className="flex-1 relative">
        <LocationsView />
      </main>
    </div>
  );
};

export default Dashboard;