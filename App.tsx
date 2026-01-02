
import React, { useState, useEffect } from 'react';
import { pb, isAuthenticated } from './lib/pocketbase';
import AuthCard from './components/AuthCard';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(isAuthenticated());
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = pb.authStore.onChange(() => {
      setIsLoggedIn(pb.authStore.isValid);
    });
    setLoading(false);
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
             <div className="w-8 h-8 bg-indigo-600 rounded-full animate-ping"></div>
          </div>
          <span className="text-sm font-medium text-slate-500 uppercase tracking-widest">Last Seen</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#1c1b1f] selection:bg-indigo-100">
      {isLoggedIn ? (
        <Dashboard onLogout={() => pb.authStore.clear()} />
      ) : (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#f7f2fa]">
          <div className="w-full max-w-sm">
            <div className="flex flex-col items-center mb-10">
              <div className="w-14 h-14 bg-[#6750a4] rounded-2xl flex items-center justify-center shadow-lg mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-[#1c1b1f]">Last Seen</h1>
              <p className="text-slate-500 text-sm mt-2">Safety through transparency</p>
            </div>
            <AuthCard />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
