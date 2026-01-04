
import React, { useRef } from 'react';
import { pb } from '../lib/pocketbase';
import AuthCard from './AuthCard';
import { useTheme } from '../lib/theme';

const LandingPage: React.FC = () => {
  const authSectionRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useTheme();

  const scrollToAuth = () => {
    authSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const steps = [
      {
          num: "01",
          title: "Join",
          desc: "Sign in securely with your Google account. No new passwords to remember."
      },
      {
          num: "02",
          title: "Log",
          desc: "Tap to log your spot. Choose 'Exact' for precision or 'Vague' for privacy."
      },
      {
          num: "03",
          title: "Share",
          desc: "Your circle sees you on the map. You control when and how long you are visible."
      }
  ];

  const features = [
    {
      title: "Shared Map",
      description: "Instantly see where everyone in the community is. Broadcast your last known spot to help friends find you or know you're safe.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        </svg>
      ),
      color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300"
    },
    {
      title: "Vague Mode",
      description: "Need privacy but want to stay connected? Vague Mode adds random noise to your location so you appear nearby, but not exactly there.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12c2-3 5-3 8 0s6 3 8 0" />
        </svg>
      ),
      color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300"
    },
    {
      title: "Total Control",
      description: "Share publicly with the community, or keep your spot private and share only via a unique link. You decide who sees you.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      color: "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300"
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 flex flex-col font-sans text-slate-900 dark:text-slate-100 selection:bg-[#6750a4] selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg z-50 border-b border-slate-100 dark:border-slate-800 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <div className="w-10 h-10 bg-[#6750a4] rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none group-hover:scale-105 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">Last Seen</span>
          </div>
          <div className="flex items-center gap-4">
            <button 
                onClick={toggleTheme}
                className="w-9 h-9 flex items-center justify-center rounded-full text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                aria-label="Toggle Theme"
            >
                {theme === 'light' ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                )}
            </button>
            <button 
              onClick={scrollToAuth}
              className="text-sm font-bold text-white bg-[#6750a4] hover:bg-[#5a4491] px-6 py-2.5 rounded-full transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              Sign In
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-100/50 dark:bg-purple-900/20 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/4"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-50/50 dark:bg-indigo-900/20 rounded-full blur-3xl -z-10 -translate-x-1/3 translate-y-1/4"></div>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700 fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-[11px] font-bold uppercase tracking-widest shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Community Tracking
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-slate-900 dark:text-white leading-[1.1] tracking-tight">
              Shared Safety. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6750a4] to-indigo-600 dark:to-indigo-400">Total Control.</span>
            </h1>
            <p className="text-xl text-slate-500 dark:text-slate-400 max-w-lg leading-relaxed font-medium">
              Broadcast your location to the community map with precision or use <strong className="text-[#6750a4] dark:text-indigo-400">Vague Mode</strong> for privacy.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <button 
                onClick={scrollToAuth}
                className="px-8 py-4 bg-[#6750a4] text-white rounded-full font-bold text-lg shadow-xl shadow-indigo-200 dark:shadow-none hover:bg-[#5a4491] hover:-translate-y-1 transition-all active:scale-95"
              >
                Join the Map
              </button>
              <a href="#/guide" className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-700 dark:text-white border border-slate-200 dark:border-slate-700 rounded-full font-bold text-lg hover:bg-slate-50 dark:hover:bg-slate-750 hover:border-slate-300 transition-all flex items-center gap-2">
                How it works
              </a>
            </div>
          </div>
          <div className="relative animate-in slide-in-from-right-8 duration-1000 fade-in delay-200 hidden lg:block">
            <div className="relative z-10 bg-white dark:bg-slate-800 p-3 rounded-[40px] shadow-2xl shadow-indigo-200/50 dark:shadow-black/50 border border-slate-100 dark:border-slate-700 rotate-2 transform transition-transform hover:rotate-0 duration-700 cursor-pointer">
              <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-900 rounded-[32px] overflow-hidden relative group">
                <img 
                  src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=1200" 
                  alt="Map Interface Preview" 
                  className="w-full h-full object-cover opacity-90 dark:opacity-60 group-hover:scale-105 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                
                {/* Floating UI Elements Simulation */}
                <div className="absolute bottom-6 left-6 right-6 flex gap-3">
                   <div className="h-12 w-12 bg-white dark:bg-slate-800 rounded-xl shadow-lg flex items-center justify-center text-[#6750a4] dark:text-indigo-400">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z"/></svg>
                   </div>
                   <div className="h-12 flex-1 bg-white dark:bg-slate-800 rounded-xl shadow-lg flex items-center px-4 text-xs font-bold text-slate-600 dark:text-slate-200">
                      Logging location...
                   </div>
                </div>
              </div>
            </div>
            {/* Decor Elements */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#eaddff] dark:bg-indigo-900/30 rounded-full opacity-50 blur-2xl"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-100 dark:bg-purple-900/30 rounded-full opacity-50 blur-2xl"></div>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
                 <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-4">How it Works</h2>
                 <p className="text-slate-500 dark:text-slate-400">Three simple steps to start sharing.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-12">
                {steps.map((step, idx) => (
                    <div key={idx} className="relative">
                        <div className="text-6xl font-black text-slate-100 dark:text-slate-800 absolute -top-10 -left-4 -z-10">{step.num}</div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">{step.title}</h3>
                        <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{step.desc}</p>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-[#fcfaff] dark:bg-slate-850/50 border-y border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">Simple. Connected.</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">Everything you need to stay coordinated with your circle.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-800 p-10 rounded-[40px] border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl hover:shadow-indigo-100/50 dark:hover:shadow-none transition-all duration-300 hover:-translate-y-1">
                <div className={`w-16 h-16 rounded-2xl ${feature.color} flex items-center justify-center mb-8 shadow-sm`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">{feature.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Auth Section */}
      <section ref={authSectionRef} className="py-32 px-6 bg-white dark:bg-slate-900 relative">
        <div className="max-w-7xl mx-auto flex flex-col items-center relative z-10">
          <div className="text-center mb-12 max-w-lg space-y-4">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">Get Started Now</h2>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-lg">Sign in with Google to join the map. <br/>It takes less than 30 seconds.</p>
          </div>
          <div className="w-full max-w-md transform transition-all hover:scale-[1.01]">
            <AuthCard />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-12 px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                <div className="w-6 h-6 bg-[#6750a4] rounded flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                </div>
                <span className="font-bold text-slate-900 dark:text-slate-300 tracking-tight">Last Seen</span>
            </div>
            
            <div className="flex gap-8 text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                <a href="#/privacy" className="hover:text-[#6750a4] dark:hover:text-white transition-colors">Privacy</a>
                <a href="#/terms" className="hover:text-[#6750a4] dark:hover:text-white transition-colors">Terms</a>
                <a href="#/guide" className="hover:text-[#6750a4] dark:hover:text-white transition-colors">Guide</a>
            </div>

            <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Created by <a href="https://srinivasan.online/" target="_blank" rel="noopener noreferrer" className="text-[#6750a4] dark:text-indigo-400 hover:underline hover:text-[#5a4491] font-bold">Srinivasan KB</a>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
