
import React from 'react';
import { Link } from 'react-router-dom';

interface LegalPageProps {
  title: string;
  type: 'privacy' | 'terms' | 'guide';
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
        {type === 'privacy' && (
          <div className="space-y-6 text-[#1c1b1f]">
            <section>
              <h2 className="text-2xl font-bold mb-4">Community Sharing Privacy</h2>
              <p className="text-slate-600 leading-relaxed">
                Last Seen is a <strong>Community Map</strong> utility. When you broadcast your location, you are sharing it with all authenticated members of the application.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-bold mb-2">How Data is Shared</h3>
              <p className="text-slate-600 leading-relaxed">
                Your location log (latitude, longitude, timestamp, and optional note) is stored in our database and displayed on the shared map to any user who is signed in via a verified account.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-bold mb-2">No Passive Tracking</h3>
              <p className="text-slate-600 leading-relaxed">
                We value your battery and your privacy. Last Seen <strong>does not</strong> track your movement in the background. Location data is only recorded and shared when you explicitly click the "Log My Spot" button.
              </p>
            </section>
          </div>
        )}

        {type === 'terms' && (
          <div className="space-y-6 text-[#1c1b1f]">
            <section>
              <h2 className="text-2xl font-bold mb-4">Terms of Use</h2>
              <p className="text-slate-600 leading-relaxed">
                By using Last Seen, you acknowledge the following terms.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-bold mb-2">Public Intent</h3>
              <p className="text-slate-600 leading-relaxed">
                You understand that this is a communal map. Do not use this service if you require private, one-to-one encrypted location sharing.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-bold mb-2">Accuracy Disclaimer</h3>
              <p className="text-slate-600 leading-relaxed">
                Last Seen is a manual log. A user's marker represents their <strong>last known</strong> manual update, which may not be their current live position. Always check the timestamp for accuracy.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-bold mb-2">Safety Notice</h3>
              <p className="text-slate-600 leading-relaxed">
                This app is not a replacement for emergency services or professional safety tracking. Use at your own discretion.
              </p>
            </section>
          </div>
        )}

        {type === 'guide' && (
          <div className="space-y-10 text-[#1c1b1f]">
            <section>
                <h2 className="text-2xl font-bold mb-4">Welcome to Last Seen</h2>
                <p className="text-slate-600 leading-relaxed">
                    Last Seen is a simple, community-driven map that lets you broadcast your location to your trusted circle manually. This guide will help you get the most out of it.
                </p>
            </section>

            <section>
                <h3 className="text-lg font-bold mb-3 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-[#6750a4] text-white flex items-center justify-center text-sm font-black shadow-md shadow-indigo-100">1</span>
                    Sharing Your Location
                </h3>
                <p className="text-slate-600 leading-relaxed mb-4">
                    We do not track you in the background. To share your location, you must click the <strong>"Log My Spot"</strong> button on the dashboard. This captures your current GPS coordinates once and updates the map.
                </p>
                <ul className="list-none space-y-3">
                    <li className="flex gap-3 items-start">
                        <svg className="w-5 h-5 text-[#6750a4] mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span className="text-slate-600 text-sm"><strong>Add a Note:</strong> You can add a short status message (e.g., "At the library", "Safe at home").</span>
                    </li>
                    <li className="flex gap-3 items-start">
                        <svg className="w-5 h-5 text-[#6750a4] mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span className="text-slate-600 text-sm"><strong>Set Expiration:</strong> Choose how long your spot remains visible (e.g., 1 hour, 24 hours). After this time, it is automatically removed.</span>
                    </li>
                </ul>
            </section>

            <section>
                <h3 className="text-lg font-bold mb-3 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-[#6750a4] text-white flex items-center justify-center text-sm font-black shadow-md shadow-indigo-100">2</span>
                    Managing Your Privacy
                </h3>
                <p className="text-slate-600 leading-relaxed">
                    Your location is visible to other authenticated users of the application while it is active.
                </p>
                <div className="mt-4 p-5 bg-slate-50 rounded-3xl border border-slate-100 text-sm leading-relaxed">
                    <strong>Stop Sharing:</strong> If you want to remove your marker immediately, click the <span className="text-rose-500 font-bold uppercase text-xs tracking-wider border border-rose-200 bg-rose-50 px-2 py-0.5 rounded-lg mx-1">Stop Sharing</span> button below the log controls. This deletes your data from our server instantly.
                </div>
            </section>

            <section>
                <h3 className="text-lg font-bold mb-3 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-[#6750a4] text-white flex items-center justify-center text-sm font-black shadow-md shadow-indigo-100">3</span>
                    Navigating the Map
                </h3>
                <p className="text-slate-600 leading-relaxed">
                    The map shows clusters of people to keep the view clean.
                </p>
                <ul className="list-disc pl-5 space-y-2 text-slate-600 mt-4 text-sm">
                    <li><strong>Clusters:</strong> Click on a numbered circle to zoom in and see individual people in that area.</li>
                    <li><strong>User Details:</strong> Click on any avatar on the map or in the sidebar list to see when they were last seen and read their status note.</li>
                    <li><strong>Freshness:</strong> <span className="text-green-600 font-bold">Green dots</span> indicate updates within the last 24 hours. <span className="text-amber-500 font-bold">Amber dots</span> indicate older data.</li>
                </ul>
            </section>
          </div>
        )}
        
        <div className="mt-12 pt-8 border-t border-slate-100 flex justify-center">
          <Link 
            to="/"
            className="px-8 py-3 bg-[#6750a4] text-white rounded-full font-bold text-sm uppercase tracking-widest hover:bg-[#7e6bb4] transition-all active:scale-95 shadow-md"
          >
            {type === 'guide' ? 'Go to Map' : 'I Accept'}
          </Link>
        </div>
      </main>
    </div>
  );
};

export default LegalPage;
