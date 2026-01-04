
import React from 'react';
import { pb } from '../lib/pocketbase';
import AuthCard from './AuthCard';
import { useTheme } from '../lib/theme';

const LandingPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

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
          desc: "Friends see you on the map. You control when and how long you are visible."
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
        <div className="max-w-6xl mx-auto px-6 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <div className="w-9 h-9 md:w-10 md:h-10 bg-[#6750a4] rounded-xl flex items-center justify-center shadow-md shadow-indigo-100 dark:shadow-none group-hover:scale-105 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
            </div>
            <span className="font-bold text-lg md:text-xl tracking-tight text-slate-900 dark:text-white">Last Seen</span>
          </div>
          <div className="flex items-center gap-1">
            <a 
              href="https://github.com/srinivasankb/LastSeen" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-9 h-9 flex items-center justify-center rounded-full text-slate-500 hover:text-[#181717] dark:text-slate-400 dark:hover:text-white transition-colors"
              aria-label="View on GitHub"
            >
               <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="currentColor"><title>GitHub</title><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.419-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
            </a>
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
          </div>
        </div>
      </nav>

      {/* Hero Section with Auth */}
      <section className="pt-28 md:pt-40 pb-16 md:pb-20 px-6 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-100/50 dark:bg-purple-900/20 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/4"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-50/50 dark:bg-indigo-900/20 rounded-full blur-3xl -z-10 -translate-x-1/3 translate-y-1/4"></div>

        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Left Column: Text */}
          <div className="space-y-6 md:space-y-8 animate-in slide-in-from-bottom-8 duration-700 fade-in text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest mx-auto lg:mx-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Free & Open Source
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white leading-[1.1] tracking-tight">
              Shared Safety. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6750a4] to-indigo-600 dark:to-indigo-400">Total Control.</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-500 dark:text-slate-400 max-w-lg mx-auto lg:mx-0 leading-relaxed font-medium">
              Join the community map securely. Broadcast your location when you want, and disappear when you don't.
            </p>
            <div className="flex flex-wrap gap-4 pt-2 justify-center lg:justify-start">
               <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
                  <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span>No background tracking</span>
               </div>
               <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
                  <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span>Automatic expiry</span>
               </div>
            </div>
          </div>
          
          {/* Right Column: Auth Card */}
          <div className="relative animate-in slide-in-from-right-8 duration-1000 fade-in delay-200 w-full max-w-sm mx-auto lg:max-w-md lg:ml-auto">
             <AuthCard />
          </div>
        </div>
      </section>

      {/* Informational Comparison Section */}
      <section className="py-16 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
         <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-12">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Why Manual Logging?</h2>
                <p className="text-slate-500 dark:text-slate-400">Most apps track you 24/7. We believe location sharing should be intentional.</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
                {/* Traditional Apps */}
                <div className="p-8 rounded-3xl border border-rose-100 dark:border-rose-900/30 bg-rose-50/50 dark:bg-rose-900/10">
                    <h3 className="font-bold text-rose-700 dark:text-rose-400 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        Always-On Tracking
                    </h3>
                    <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                        <li className="flex gap-3"><span className="text-rose-400">×</span> Drains your battery constantly</li>
                        <li className="flex gap-3"><span className="text-rose-400">×</span> Creates anxiety about being watched</li>
                        <li className="flex gap-3"><span className="text-rose-400">×</span> Stores history of everywhere you go</li>
                    </ul>
                </div>

                {/* Last Seen */}
                <div className="p-8 rounded-3xl border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/50 dark:bg-emerald-900/10">
                    <h3 className="font-bold text-emerald-700 dark:text-emerald-400 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Last Seen Approach
                    </h3>
                    <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                        <li className="flex gap-3"><span className="text-emerald-500">✓</span> Zero battery drain in background</li>
                        <li className="flex gap-3"><span className="text-emerald-500">✓</span> You choose exactly when to update</li>
                        <li className="flex gap-3"><span className="text-emerald-500">✓</span> Data expires automatically</li>
                    </ul>
                </div>
            </div>
         </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-24 bg-[#fcfaff] dark:bg-slate-850/50 border-y border-slate-100 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">Simple. Connected.</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">Everything you need to stay coordinated with friends.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-800 p-8 md:p-10 rounded-[32px] border border-slate-100 dark:border-slate-700 hover:border-indigo-100 dark:hover:border-indigo-900 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-6`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">{feature.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
                 <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-4">How it Works</h2>
                 <p className="text-slate-500 dark:text-slate-400">Three simple steps to start sharing.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-12">
                {steps.map((step, idx) => (
                    <div key={idx} className="relative group text-center md:text-left">
                        <div className="text-6xl font-black text-slate-100 dark:text-slate-800 absolute -top-10 left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0 -z-10 transition-colors group-hover:text-indigo-50 dark:group-hover:text-slate-700">{step.num}</div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 pt-4 md:pt-0">{step.title}</h3>
                        <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{step.desc}</p>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-12 px-6 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
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
                <a href="https://github.com/srinivasankb/LastSeen" target="_blank" rel="noopener noreferrer" className="hover:text-[#6750a4] dark:hover:text-white transition-colors text-emerald-600 dark:text-emerald-400">Open Source</a>
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
