
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
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-100/50 dark:bg-purple-900/20 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/4"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-50/50 dark:bg-indigo-900/20 rounded-full blur-3xl -z-10 -translate-x-1/3 translate-y-1/4"></div>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700 fade-in order-2 lg:order-1">
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
          
          {/* Abstract Map Illustration */}
          <div className="relative animate-in slide-in-from-right-8 duration-1000 fade-in delay-200 order-1 lg:order-2 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[500px] aspect-square">
               {/* Abstract Grid Map */}
               <div className="absolute inset-0 bg-slate-50 dark:bg-slate-800/50 rounded-[40px] border border-slate-100 dark:border-slate-700 overflow-hidden shadow-2xl shadow-indigo-100/40 dark:shadow-black/40 rotate-3 transition-transform hover:rotate-0 duration-500">
                    {/* Grid Lines */}
                    <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" 
                         style={{ backgroundImage: 'linear-gradient(#6750a4 1px, transparent 1px), linear-gradient(90deg, #6750a4 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
                    </div>
                    
                    {/* Map Elements (CSS Only) */}
                    <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-indigo-100 dark:bg-indigo-900/30 rounded-full blur-2xl"></div>
                    <div className="absolute bottom-1/3 right-1/4 w-40 h-40 bg-purple-100 dark:bg-purple-900/30 rounded-full blur-2xl"></div>

                    {/* Connection Lines */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        <line x1="30%" y1="40%" x2="60%" y2="60%" stroke="#6750a4" strokeWidth="2" strokeDasharray="4 4" className="opacity-20 animate-pulse" />
                        <line x1="60%" y1="60%" x2="70%" y2="30%" stroke="#6750a4" strokeWidth="2" strokeDasharray="4 4" className="opacity-20 animate-pulse" style={{ animationDelay: '0.5s' }} />
                    </svg>

                    {/* Markers */}
                    {/* Me Marker */}
                    <div className="absolute top-[40%] left-[30%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
                        <div className="relative">
                            <div className="w-12 h-12 bg-[#6750a4] rounded-xl flex items-center justify-center text-white shadow-lg z-10 relative">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            </div>
                            <div className="absolute inset-0 bg-[#6750a4] rounded-xl animate-ping opacity-20"></div>
                        </div>
                        <div className="px-3 py-1 bg-white dark:bg-slate-700 rounded-lg shadow-sm text-[10px] font-bold text-slate-600 dark:text-slate-200">You</div>
                    </div>

                    {/* Friend 1 */}
                    <div className="absolute top-[60%] left-[60%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
                         <div className="w-10 h-10 bg-slate-800 dark:bg-slate-600 rounded-xl flex items-center justify-center text-white shadow-lg border-2 border-white dark:border-slate-700">
                            <span className="text-xs font-bold">A</span>
                         </div>
                    </div>

                    {/* Friend 2 (Vague) */}
                    <div className="absolute top-[30%] left-[70%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
                         <div className="relative">
                            <div className="w-10 h-10 bg-slate-800 dark:bg-slate-600 rounded-xl flex items-center justify-center text-white shadow-lg border-2 border-white dark:border-slate-700 z-10 relative">
                                <span className="text-xs font-bold">B</span>
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#6750a4] rounded-full border border-white"></div>
                            </div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border border-dashed border-[#6750a4]/30 rounded-full animate-[spin_10s_linear_infinite]"></div>
                         </div>
                    </div>
               </div>
            </div>
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
                    <div key={idx} className="relative group">
                        <div className="text-6xl font-black text-slate-100 dark:text-slate-800 absolute -top-10 -left-4 -z-10 transition-colors group-hover:text-indigo-50 dark:group-hover:text-slate-700">{step.num}</div>
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
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">Everything you need to stay coordinated with friends.</p>
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
