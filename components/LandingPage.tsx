
import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import AuthCard from './AuthCard';

const LandingPage: React.FC = () => {
  const authSectionRef = useRef<HTMLDivElement>(null);

  const scrollToAuth = () => {
    authSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const features = [
    {
      title: "Real-time Transparency",
      description: "Keep your trusted circle updated with your latest coordinates and status notes automatically.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      color: "bg-indigo-100 text-indigo-600"
    },
    {
      title: "Safety Notes",
      description: "Going for a run or meeting someone new? Add a quick note to your location for extra context and peace of mind.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      color: "bg-amber-100 text-amber-600"
    },
    {
      title: "Public Share Links",
      description: "Generate a unique link to share your live location with anyone, even if they don't have an account.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      color: "bg-emerald-100 text-emerald-600"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#6750a4] rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-900">Last Seen</span>
          </div>
          <button 
            onClick={scrollToAuth}
            className="text-sm font-bold text-[#6750a4] hover:bg-[#6750a4]/5 px-4 py-2 rounded-full transition-colors"
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-widest">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              Instant Location Logs
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 leading-[1.1]">
              Safety through <br />
              <span className="text-[#6750a4]">transparency.</span>
            </h1>
            <p className="text-xl text-slate-500 max-w-lg leading-relaxed">
              A minimalist utility to keep your trusted ones informed. Log your status with one tap and stay visible to those who matter most.
            </p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={scrollToAuth}
                className="px-8 py-4 bg-[#6750a4] text-white rounded-full font-bold text-lg shadow-xl shadow-indigo-100 hover:bg-[#7e6bb4] hover:-translate-y-1 transition-all active:scale-95"
              >
                Get Started
              </button>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 rounded-[40px] -rotate-3 scale-105"></div>
            <div className="relative bg-white p-3 rounded-[40px] shadow-2xl border border-slate-100 rotate-1 transform transition-transform hover:rotate-0 duration-700">
              <div className="aspect-[4/3] bg-slate-50 rounded-[32px] overflow-hidden flex items-center justify-center group">
                 <img 
                  src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=800" 
                  alt="Map Preview" 
                  className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-black/5 flex items-center justify-center">
                  <div className="bg-white/95 backdrop-blur-md p-5 rounded-3xl shadow-2xl flex items-center gap-4 scale-90 md:scale-100">
                    <div className="w-14 h-14 bg-[#6750a4] rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">JD</div>
                    <div>
                      <p className="font-bold text-slate-900">John Doe</p>
                      <p className="text-[10px] text-[#6750a4] font-black uppercase tracking-[0.1em]">Logged 2 mins ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">Simple. Secure. Reliable.</h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg leading-relaxed">No tracking, no history, just your last seen status shared with the people you trust.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            {features.map((feature, idx) => (
              <div key={idx} className="bg-white p-10 rounded-[40px] border border-slate-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-8 shadow-sm`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Auth Section */}
      <section ref={authSectionRef} className="py-32 px-6 bg-[#f7f2fa]">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <div className="text-center mb-16 max-w-lg">
            <h2 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">Ready to join?</h2>
            <p className="text-slate-500 leading-relaxed text-lg">Create your account in seconds using Google and start sharing your journey securely.</p>
          </div>
          <div className="w-full max-w-md">
            <AuthCard />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12 items-center text-center md:text-left">
            <div className="flex flex-col items-center md:items-start gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#6750a4] rounded-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                </div>
                <span className="font-bold text-xl tracking-tighter text-slate-900">Last Seen</span>
              </div>
              <p className="text-xs font-medium text-slate-400 max-w-[200px]">Keeping circles safe through transparent location sharing.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-8">
              <Link to="/privacy" className="text-xs font-bold text-slate-400 hover:text-[#6750a4] uppercase tracking-widest transition-colors">Privacy</Link>
              <Link to="/terms" className="text-xs font-bold text-slate-400 hover:text-[#6750a4] uppercase tracking-widest transition-colors">Terms</Link>
              <a href="mailto:srinikb.vino@gmail.com" className="text-xs font-bold text-slate-400 hover:text-[#6750a4] uppercase tracking-widest transition-colors">Support</a>
            </div>
            <div className="flex flex-col items-center md:items-end gap-2">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
                &copy; {new Date().getFullYear()} LAST SEEN PROJECT
              </p>
              <p className="text-[9px] text-slate-300 font-medium">Developed with care for safety</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
