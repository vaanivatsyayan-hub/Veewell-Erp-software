
import React, { useState, useEffect } from 'react';
import { useERP } from '../store/context';
import { Lock, User, ShieldCheck, Mail, ArrowRight, Loader2, Info } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useERP();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showConfigHint, setShowConfigHint] = useState(false);

  // Replace this string with your real Client ID from Google Cloud Console
  const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';

  useEffect(() => {
    const handleGoogleCallback = (response: any) => {
      try {
        const payload = JSON.parse(atob(response.credential.split('.')[1]));
        login({
          name: payload.name,
          email: payload.email,
          picture: payload.picture,
          role: 'Admin'
        });
      } catch (e) {
        setError('Google Sign-In failed to decode user data.');
      }
    };

    const google = (window as any).google;
    if (google && GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com') {
      try {
        google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCallback,
        });

        google.accounts.id.renderButton(
          document.getElementById('google-btn'),
          { theme: 'outline', size: 'large', width: '100%' }
        );
      } catch (e) {
        console.error("Google Auth Init Error:", e);
      }
    } else {
      setShowConfigHint(true);
    }
  }, [login]);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Default admin credentials
    setTimeout(() => {
      if (username === 'admin' && password === 'admin123') {
        login({
          name: 'System Administrator',
          email: 'admin@veewell.com',
          role: 'Admin'
        });
      } else {
        setError('Invalid username or password. (Hint: admin / admin123)');
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left Panel */}
      <div className="hidden lg:flex w-1/2 bg-blue-700 p-16 flex-col justify-between text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-blue-700 font-black text-2xl shadow-xl">V</div>
            <span className="text-2xl font-bold tracking-tight">Veewell Lifescience</span>
          </div>
          <h1 className="text-5xl font-black leading-tight mb-6">
            Intelligent ERP <br />
            for the Future of Pharma.
          </h1>
          <p className="text-blue-100 text-lg max-w-md">
            Securely manage your inventory, sales, and accounts with Indian GST compliance and AI-driven insights.
          </p>
        </div>
        
        <div className="relative z-10 flex items-center gap-4 text-sm font-medium opacity-80">
          <ShieldCheck size={20}/>
          <span>Enterprise Grade Security • SSL Encrypted • ISO Certified</span>
        </div>

        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600 rounded-full -mr-24 -mt-24 opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-800 rounded-full -ml-24 -mb-24 opacity-30"></div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h2>
            <p className="text-slate-500">Please enter your credentials to access your dashboard.</p>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-xl text-sm font-medium animate-in shake duration-300">
              {error}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <User size={16}/> Username
              </label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-4 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-700 outline-none transition-all"
                placeholder="admin"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Lock size={16}/> Password
              </label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-700 outline-none transition-all"
                placeholder="admin123"
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-blue-700 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : <ArrowRight size={20}/>}
              {isLoading ? 'Authenticating...' : 'Sign In to Dashboard'}
            </button>
          </form>

          <div className="relative flex items-center py-4">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4 text-slate-400 text-xs font-bold uppercase tracking-widest">Or continue with</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* Google Sign-In Area */}
          <div className="space-y-4">
            <div id="google-btn" className="w-full"></div>
            
            {showConfigHint && (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex gap-3 text-amber-800 text-sm">
                <Info size={20} className="shrink-0" />
                <div>
                  <p className="font-bold mb-1">Google Auth Not Configured</p>
                  <p>To enable Google Sign-In, you must provide a real <strong>Client ID</strong> from the Google Cloud Console and authorize your current origin (e.g. localhost).</p>
                  <p className="mt-2">Use <strong>admin / admin123</strong> to enter for now.</p>
                </div>
              </div>
            )}
          </div>
          
          <p className="text-center text-slate-400 text-sm">
            Don't have an account? <a href="#" className="text-blue-700 font-bold">Contact Admin</a>
          </p>
        </div>
      </div>
    </div>
  );
};
