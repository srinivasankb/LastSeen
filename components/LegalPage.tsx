
import React from 'react';
import { Link } from 'react-router-dom';

interface LegalPageProps {
  title: string;
  type: 'privacy' | 'terms' | 'guide';
}

const LegalPage: React.FC<LegalPageProps> = ({ title, type }) => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 flex flex-col">
      <header className="h-16 flex items-center px-6 border-b border-[#eaddff] dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
        <Link 
          to="/"
          className="w-10 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors text-slate-600 dark:text-slate-300 mr-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <h1 className="text-xl font-bold text-[#1c1b1f] dark:text-white tracking-tight">{title}</h1>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full p-8 md:p-12 prose prose-slate dark:prose-invert">
        {type === 'privacy' && (
          <div className="space-y-8 text-[#1c1b1f] dark:text-slate-200">
            <section>
              <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Privacy Policy</h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                This Privacy Policy explains how <strong>Last Seen</strong> ("we", "our", or "us") collects, uses, shares, and protects your information. By using our application, you agree to the collection and use of information in accordance with this policy.
              </p>
            </section>

            <div className="bg-slate-50 dark:bg-slate-800 p-6 sm:p-8 rounded-[32px] border border-slate-100 dark:border-slate-700 space-y-8">
                <div>
                    <h3 className="text-sm font-black text-[#6750a4] dark:text-indigo-400 uppercase tracking-widest mb-6">Google User Data Policy</h3>
                    
                    <div className="space-y-8">
                        <section>
                            <h4 className="font-bold text-slate-900 dark:text-white mb-2 text-base">1. Data Accessed</h4>
                            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                                When you utilize Google Sign-In, Last Seen requests access to the following Google user data:
                            </p>
                            <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-600 dark:text-slate-400 text-sm marker:text-[#6750a4]">
                                <li><strong>Google ID:</strong> A unique identifier to manage your account.</li>
                                <li><strong>Name:</strong> Displayed to identify you to others.</li>
                                <li><strong>Email Address:</strong> Used for unique account identification, authentication, and communication.</li>
                                <li><strong>Profile Picture (Avatar):</strong> Used as a visual identifier on your map markers.</li>
                            </ul>
                        </section>

                        <section>
                            <h4 className="font-bold text-slate-900 dark:text-white mb-2 text-base">2. Data Usage</h4>
                            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                                The information collected is used solely for providing the core functionality of the Last Seen application:
                            </p>
                            <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-600 dark:text-slate-400 text-sm marker:text-[#6750a4]">
                                <li><strong>Authentication:</strong> Verifying your identity to secure your account.</li>
                                <li><strong>Map Functionality:</strong> Displaying your profile (Name and Avatar) on the map so community members can recognize your location status.</li>
                                <li><strong>User Experience:</strong> Managing your session and application preferences.</li>
                            </ul>
                        </section>

                        <section>
                            <h4 className="font-bold text-slate-900 dark:text-white mb-2 text-base">3. Data Sharing</h4>
                            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-3">
                                <strong>User-Controlled Sharing:</strong> Your data (Name, Avatar, Location) is shared with other users strictly based on your visibility settings:
                            </p>
                            <ul className="list-disc pl-5 mb-3 space-y-1 text-slate-600 dark:text-slate-400 text-sm marker:text-[#6750a4]">
                                <li><em>Community:</em> Visible to all authenticated users of the app.</li>
                                <li><em>Unlisted:</em> Visible only to you and those with whom you share your unique link.</li>
                            </ul>
                            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                                <strong>Third Parties:</strong> We <span className="font-bold">do not</span> sell, trade, or transfer your Google user data to outside parties, advertisers, or data brokers. Data is only shared with our cloud infrastructure providers for the purpose of hosting the service.
                            </p>
                        </section>

                        <section>
                            <h4 className="font-bold text-slate-900 dark:text-white mb-2 text-base">4. Data Storage & Protection</h4>
                            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                                Your personal information is stored in a secured database. We employ industry-standard security measures, including SSL/TLS encryption for all data transmission, to protect your personal information from unauthorized access, alteration, disclosure, or destruction.
                            </p>
                        </section>

                        <section>
                            <h4 className="font-bold text-slate-900 dark:text-white mb-2 text-base">5. Data Retention & Deletion</h4>
                            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-2">
                                <strong>Location Logs:</strong> Ephemeral by nature. Logs are automatically deleted from our systems after the expiration period you select (e.g., 24 hours), or immediately upon your request via the "Stop Sharing" feature.
                            </p>
                            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                                <strong>Account Deletion:</strong> You have the right to request the complete deletion of your account and all associated data. To do so, please contact us at <a href="mailto:hi@srinikb.in" className="text-[#6750a4] dark:text-indigo-400 font-bold hover:underline">hi@srinikb.in</a>. Upon request, we will permanently remove all your Google user data from our servers.
                            </p>
                        </section>
                    </div>
                </div>
            </div>

            <section>
              <h3 className="text-lg font-bold mb-3 text-slate-900 dark:text-white">Additional Privacy Controls</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Beyond Google data, Last Seen respects your location privacy:
              </p>
              <ul className="space-y-2">
                <li className="flex gap-3 text-sm text-slate-600 dark:text-slate-400">
                    <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    <span><strong>No Background Tracking:</strong> Location is only accessed when you manually trigger an update.</span>
                </li>
                <li className="flex gap-3 text-sm text-slate-600 dark:text-slate-400">
                    <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    <span><strong>Granular Control:</strong> You can delete your location marker instantly at any time.</span>
                </li>
              </ul>
            </section>
          </div>
        )}

        {type === 'terms' && (
          <div className="space-y-6 text-[#1c1b1f] dark:text-slate-200">
            <section>
              <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Terms of Use</h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                By using Last Seen, you acknowledge the following terms.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-bold mb-2 text-slate-900 dark:text-white">Community Intent</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                This app is designed for casual location sharing. Do not rely on it for critical safety or emergency situations.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-bold mb-2 text-slate-900 dark:text-white">Accuracy Disclaimer</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Last Seen is a manual log. A user's marker represents their <strong>last known</strong> manual update, which may not be their current live position. Always check the timestamp for accuracy.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-bold mb-2 text-slate-900 dark:text-white">Safety Notice</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                You are responsible for the links you share and the data you broadcast. Use the "Private" setting if you wish to limit your visibility on the map.
              </p>
            </section>
          </div>
        )}

        {type === 'guide' && (
          <div className="space-y-10 text-[#1c1b1f] dark:text-slate-200">
            <section>
                <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Welcome to Last Seen</h2>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    Last Seen is a simple map that lets you broadcast your location to your trusted circle manually. This guide will help you get the most out of it.
                </p>
            </section>

            <section>
                <h3 className="text-lg font-bold mb-3 flex items-center gap-3 text-slate-900 dark:text-white">
                    <span className="w-8 h-8 rounded-full bg-[#6750a4] text-white flex items-center justify-center text-sm font-black shadow-md shadow-indigo-100 dark:shadow-none">1</span>
                    Sharing Your Location
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                    We do not track you in the background. To share your location, you must click the <strong>"Log Location"</strong> button on the dashboard. This captures your current GPS coordinates once and updates the map.
                </p>
                <ul className="list-none space-y-3">
                    <li className="flex gap-3 items-start">
                        <svg className="w-5 h-5 text-[#6750a4] dark:text-indigo-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        <span className="text-slate-600 dark:text-slate-400 text-sm"><strong>Public vs Private:</strong> Select "Public" to be seen by all app users. Select "Private" to hide from the map (unless you share your unique link).</span>
                    </li>
                    <li className="flex gap-3 items-start">
                        <svg className="w-5 h-5 text-[#6750a4] dark:text-indigo-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12c2-3 5-3 8 0s6 3 8 0" /></svg>
                        <span className="text-slate-600 dark:text-slate-400 text-sm"><strong>Vague Mode:</strong> Use this toggle to fuzz your location. It adds random noise (~500m) so you can share your general area without revealing your exact pinpoint.</span>
                    </li>
                    <li className="flex gap-3 items-start">
                        <svg className="w-5 h-5 text-[#6750a4] dark:text-indigo-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span className="text-slate-600 dark:text-slate-400 text-sm"><strong>Add a Note:</strong> You can add a short status message (e.g., "At the library").</span>
                    </li>
                    <li className="flex gap-3 items-start">
                        <svg className="w-5 h-5 text-[#6750a4] dark:text-indigo-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span className="text-slate-600 dark:text-slate-400 text-sm"><strong>Set Expiration:</strong> Choose how long your spot remains visible (e.g., 1 hour, 24 hours). After this time, it is automatically removed.</span>
                    </li>
                </ul>
            </section>

            <section>
                <h3 className="text-lg font-bold mb-3 flex items-center gap-3 text-slate-900 dark:text-white">
                    <span className="w-8 h-8 rounded-full bg-[#6750a4] text-white flex items-center justify-center text-sm font-black shadow-md shadow-indigo-100 dark:shadow-none">2</span>
                    Managing Your Privacy
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    You have full control over your data.
                </p>
                <div className="mt-4 p-5 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 text-sm leading-relaxed space-y-2">
                    <p><strong>Stop Sharing:</strong> If you want to remove your marker immediately, click the <span className="text-rose-500 font-bold uppercase text-xs tracking-wider border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/30 px-2 py-0.5 rounded-lg mx-1">Stop Sharing</span> button below the log controls.</p>
                    <p><strong>Unique Link:</strong> In the dashboard, you can generate a unique URL. Sharing this link allows friends to see your location even if you set your marker to "Private".</p>
                </div>
            </section>

            <section>
                <h3 className="text-lg font-bold mb-3 flex items-center gap-3 text-slate-900 dark:text-white">
                    <span className="w-8 h-8 rounded-full bg-[#6750a4] text-white flex items-center justify-center text-sm font-black shadow-md shadow-indigo-100 dark:shadow-none">3</span>
                    Navigating the Map
                </h3>
                <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-400 mt-4 text-sm">
                    <li><strong>Clusters:</strong> Click on a numbered circle to zoom in and see individual people in that area.</li>
                    <li><strong>Status:</strong> <span className="text-green-600 font-bold">Green dots</span> indicate recent updates. <span className="text-amber-500 font-bold">Amber dots</span> indicate older data.</li>
                    <li><strong>Approximate Markers:</strong> Locations marked with a <span className="inline-flex items-center justify-center w-4 h-4 bg-[#6750a4] rounded-full align-middle mx-1"><svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M4 12c2-3 5-3 8 0s6 3 8 0"></path></svg></span> symbol are using Vague Mode and are not exact.</li>
                </ul>
            </section>
          </div>
        )}
        
        <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 flex justify-center">
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
