
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
              <h2 className="text-2xl font-bold mb-4">Your Privacy Matters</h2>
              <p className="text-slate-600 leading-relaxed">
                Last Seen is designed to provide safety through transparency. We understand that location data is highly sensitive and have built this service with privacy in mind.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-bold mb-2">Data Collection</h3>
              <p className="text-slate-600 leading-relaxed">
                We collect your GPS coordinates (latitude and longitude), an optional text note, and your account information (name, email, avatar) when you choose to share your location.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-bold mb-2">How Data is Used</h3>
              <p className="text-slate-600 leading-relaxed">
                Your location data is shared exclusively with other registered users of the Last Seen application. It is used solely to provide "last seen" status to your trusted circle. We do not sell your data to third parties.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-bold mb-2">Data Retention</h3>
              <p className="text-slate-600 leading-relaxed">
                We only store your most recent location update. Previous location history is not tracked or permanently stored by our application logic. You can clear your location data at any time using the "Clear My Location" feature.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-bold mb-2">Storage</h3>
              <p className="text-slate-600 leading-relaxed">
                Data is stored securely on our PocketBase servers. We utilize standard security practices to protect your information.
              </p>
            </section>
          </div>
        ) : (
          <div className="space-y-6 text-[#1c1b1f]">
            <section>
              <h2 className="text-2xl font-bold mb-4">Terms of Service</h2>
              <p className="text-slate-600 leading-relaxed">
                By using Last Seen, you agree to the following terms and conditions. Please read them carefully.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-bold mb-2">Acceptable Use</h3>
              <p className="text-slate-600 leading-relaxed">
                You agree to use this service only for its intended purpose: sharing your location with trusted contacts for safety. Any use of the service for stalking, harassment, or illegal activities is strictly prohibited and will result in immediate account termination.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-bold mb-2">Accuracy of Information</h3>
              <p className="text-slate-600 leading-relaxed">
                Last Seen relies on your device's GPS and network capabilities. We do not guarantee the accuracy, completeness, or timeliness of location data provided through the service. Do not rely solely on this app for critical emergency situations.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-bold mb-2">Account Responsibility</h3>
              <p className="text-slate-600 leading-relaxed">
                You are responsible for maintaining the security of your account and for all activities that occur under your account.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-bold mb-2">Disclaimer of Warranties</h3>
              <p className="text-slate-600 leading-relaxed">
                The service is provided "as is" and "as available" without any warranties of any kind. We reserve the right to modify or discontinue the service at any time without notice.
              </p>
            </section>
          </div>
        )}
        
        <div className="mt-12 pt-8 border-t border-slate-100 flex justify-center">
          <Link 
            to="/"
            className="px-8 py-3 bg-[#6750a4] text-white rounded-full font-bold text-sm uppercase tracking-widest hover:bg-[#7e6bb4] transition-all active:scale-95 shadow-md"
          >
            I Understand
          </Link>
        </div>
      </main>
    </div>
  );
};

export default LegalPage;
