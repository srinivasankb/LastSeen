
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { pb, isAuthenticated } from './lib/pocketbase';
import { ThemeProvider } from './lib/theme';
import Dashboard from './components/Dashboard';
import LegalPage from './components/LegalPage';
import LandingPage from './components/LandingPage';
import PublicLocationView from './components/PublicLocationView';
import ProfilePage from './components/ProfilePage';

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
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-[#6750a4]/10 dark:bg-[#6750a4]/20 rounded-full flex items-center justify-center">
             <div className="w-8 h-8 bg-[#6750a4] rounded-full animate-ping"></div>
          </div>
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Last Seen</span>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <HashRouter>
        <div className="min-h-screen bg-white dark:bg-slate-900 text-[#1c1b1f] dark:text-slate-50 selection:bg-[#6750a4]/10 dark:selection:bg-[#6750a4]/30">
          <Routes>
            <Route path="/" element={<MainView />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/share/:token" element={<PublicLocationView />} />
            <Route path="/privacy" element={<LegalPage title="Privacy Policy" type="privacy" />} />
            <Route path="/terms" element={<LegalPage title="Terms & Conditions" type="terms" />} />
            <Route path="/guide" element={<LegalPage title="User Guide" type="guide" />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </HashRouter>
    </ThemeProvider>
  );
};

export default App;
