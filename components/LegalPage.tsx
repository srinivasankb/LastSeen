
import React from 'react';
import { Link } from 'react-router-dom';

interface LegalPageProps {
  title: string;
  type: 'privacy' | 'terms';
}

const LegalPage: React.FC<LegalPageProps> = ({ title, type }) => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="h-16 flex items-center px-6 border-b border-[#eaddff] sticky top-0 bg-white z-10">
        <Link 
          to="/"
          className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors text-slate-600 mr-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <h1 className="text-xl font-bold text-[#1c1b1f] tracking-tight">{title}</h1>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full p-8 md:p-12 prose prose-slate">
        {type === 'privacy' ? (
          <div className="space-y-6 text-[#1c1b1f]">
            <section>
              <h2 className="text-2xl font-bold mb-4">Direct Connection Privacy</h2>
              <p className="text-slate-600 leading-relaxed">
                Last Seen is built around <strong>Direct Peer Connections</strong>. We do not support public discovery. Your location data is strictly shared only with users you have explicitly added to your connections list.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-bold mb-2">How Sharing Works</h3>
              <p className="text-slate-600 leading-relaxed">
                When you add someone's email to your connections, you are giving them permission to view your latest location log. You can revoke this permission at any time by removing them from your list.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-bold mb-2">Manual Location Logging</h3>
              <p className="text-slate-600 leading-relaxed">
                Last Seen does not track you in the background. We only record your location when you explicitly click "Log My Spot". We only store your <strong>latest</strong> update; previous history is overwritten.
              </p>
            </section>
          </div>
        ) : (
          <div className="space-y-6 text-[#1c1b1f]">
            <section>
              <h2 className="text-2xl font-bold mb-4">Terms of Service</h2>
              <p className="text-slate-600 leading-relaxed">
                By connecting with users on Last Seen, you agree to these terms.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-bold mb-2">Connection Responsibility</h3>
              <p className="text-slate-600 leading-relaxed">
                Users are responsible for verifying the email addresses they add as connections. Do not add users you do not trust with your physical location.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-bold mb-2">No Passive Tracking</h3>
              <p className="text-slate-600 leading-relaxed">
                This app is a manual utility. We make no guarantee that a user's status is their current live position. Always check the timestamp for context. Do not use this as a replacement for emergency services.
              </p>
            </section>
          </div>
        )}
        
        <div className="mt-12 pt-8 border-t border-slate-100 flex justify-center">
          <Link 
            to="/"
            className="px-8 py-3 bg-[#6750a4] text-white rounded-full font-bold text-sm uppercase tracking-widest hover:bg-[#7e6bb4] transition-all active:scale-95 shadow-md"
          >
            I Accept
          </Link>
        </div>
      </main>
    </div>
  );
};

export default LegalPage;
