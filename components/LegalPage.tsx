
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
        ) : (
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
