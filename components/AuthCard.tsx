
import React, { useState } from 'react';
import { pb } from '../lib/pocketbase';

const AuthCard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOAuth = async (provider: string) => {
    setLoading(true);
    setError(null);
    try {
      await pb.collection('users').authWithOAuth2({ provider });
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[28px] shadow-sm overflow-hidden border border-[#eaddff] p-8">
      <div className="text-center">
        <h2 className="text-xl font-bold text-[#1c1b1f] mb-6">Welcome Back</h2>
        
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold rounded-2xl flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        <button
          onClick={() => handleOAuth('google')}
          disabled={loading}
          className="w-full h-14 bg-[#6750a4] hover:bg-[#7e6bb4] disabled:bg-slate-200 text-white font-medium rounded-full transition-all duration-200 flex items-center justify-center gap-3 shadow-md active:scale-95 disabled:opacity-70"
        >
          {loading ? (
            <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full"></div>
          ) : (
            <>
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" />
              </svg>
              <span>Continue with Google</span>
            </>
          )}
        </button>
      </div>
      
      <div className="mt-8 pt-6 border-t border-slate-100">
        <p className="text-[11px] text-slate-400 text-center font-medium">
          Logging your location helps friends find you in case of emergency.
        </p>
      </div>
    </div>
  );
};

export default AuthCard;
