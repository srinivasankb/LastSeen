
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
      title: "Direct Connections",
      description: "Connect with specific people by email. Your location is only visible to those you have explicitly added to your connections list.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: "bg-indigo-100 text-indigo-600"
    },
    {
      title: "Secure Identity",
      description: "No passwords needed. Sign in with Google. We only share your location data with people you know and trust.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      color: "bg-emerald-100 text-emerald-600"
    },
    {
      title: "Full Control",
      description: "You decide when to 'Log Your Spot'. There is no passive background tracking, and you can remove connections instantly.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      ),
      color: "bg-amber-100 text-amber-600"
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
              Direct Connection Privacy
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 leading-[1.1]">
              Private Safety. <br />
              <span className="text-[#6750a4]">Direct Links.</span>
            </h1>
            <p className="text-xl text-slate-500 max-w-lg leading-relaxed">
              No public tracking. No anonymous groups. Share your spot directly with the people who matter most.
            </p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={scrollToAuth}
                className="px-8 py-4 bg-[#6750a4] text-white rounded-full font-bold text-lg shadow-xl shadow-indigo-100 hover:bg-[#7e6bb4] hover:-translate-y-1 transition-all active:scale-95"
              >
                Start Connecting
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
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">One-to-One Trust.</h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg leading-relaxed">We focus on direct connections to ensure your location data never falls into the wrong hands.</p>
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
            <h2 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">Safe and Simple.</h2>
            <p className="text-slate-500 leading-relaxed text-lg">Sign in with Google, add your friends' email addresses, and start sharing your last known location.</p>
          </div>
          <div className="w-full max-w-md">
            <AuthCard />
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
