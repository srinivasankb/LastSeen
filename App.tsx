
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { pb, isAuthenticated } from './lib/pocketbase';
import Dashboard from './components/Dashboard';
import LegalPage from './components/LegalPage';
import LandingPage from './components/LandingPage';
import PublicLocationView from './components/PublicLocationView';

const MainView: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(isAuthenticated());

  useEffect(() => {
    const unsubscribe = pb.authStore.onChange(() => {
      setIsLoggedIn(pb.authStore.isValid);
    });
    return () => unsubscribe();
  }, []);

  if (isLoggedIn) {
    return <Dashboard onLogout={() => pb.authStore.clear()} />;
  }

  return <LandingPage />;
};

const App: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-[#6750a4]/10 rounded-full flex items-center justify-center">
             <div className="w-8 h-8 bg-[#6750a4] rounded-full animate-ping"></div>
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em]">Last Seen</span>
        </div>
      </div>
    );
  }

  return (
    <HashRouter>
      <div className="min-h-screen bg-white text-[#1c1b1f] selection:bg-[#6750a4]/10">
        <Routes>
          <Route path="/" element={<MainView />} />
          <Route path="/share/:token" element={<PublicLocationView />} />
          <Route path="/privacy" element={<LegalPage title="Privacy Policy" type="privacy" />} />
          <Route path="/terms" element={<LegalPage title="Terms & Conditions" type="terms" />} />
          <Route path="/guide" element={<LegalPage title="User Guide" type="guide" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </HashRouter>
  );
};

export default App;