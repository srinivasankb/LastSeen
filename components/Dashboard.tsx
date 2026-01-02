
import React from 'react';
import { pb } from '../lib/pocketbase';
import LocationsView from './LocationsView';

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const user = pb.authStore.record;

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      {/* Top Header - Material Style */}
      <header className="h-16 flex items-center justify-between px-6 border-b border-[#eaddff] bg-white z-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#6750a4] rounded-xl flex items-center justify-center shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-[#1c1b1f] tracking-tight">Last Seen</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-xs font-bold text-[#1c1b1f]">{user?.name || user?.email}</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest">Active Member</span>
          </div>
          <button 
            onClick={onLogout}
            className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors text-slate-500"
            title="Sign Out"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
