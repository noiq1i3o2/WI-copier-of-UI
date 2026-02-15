import React, { useState, useEffect } from 'react';
import { ShieldCheck, Sparkles, Zap, ArrowRight, Loader2, Key, LogIn, CheckCircle } from 'lucide-react';
import { signInWithGoogle, subscribeToAuthChanges } from '../services/firebase';
import { User } from '../types';

interface WelcomeModalProps {
  onComplete: (apiKey: string) => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  const handleConnect = () => {
      if (!apiKey.trim()) {
          setError('Please enter a valid API Key.');
          return;
      }
      setIsLoading(true);
      setError('');
      // Simulate validation delay
      setTimeout(() => {
          setIsLoading(false);
          setStep(2);
      }, 1000);
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (e: any) {
      if (e.code === 'auth/unauthorized-domain') {
          // Provide specific instructions for this error
          setError(`Configuration Error: This domain (${window.location.hostname}) is not authorized in Firebase Console.`);
      } else {
          setError(e.message || 'Failed to sign in with Google.');
      }
    }
  };

  const handleFinalStart = () => {
      onComplete(apiKey);
  };

  if (step === 1) {
    return (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-md w-full p-8 shadow-2xl text-center animate-in zoom-in-95 flex flex-col">
                <div className="w-16 h-16 bg-blue-600/20 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShieldCheck className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">OmniChat Simulator</h1>
                <p className="text-gray-400 mb-6">
                    Enter your Gemini API Key to initialize the neural core.
                </p>

                <div className="space-y-4 text-left">
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase ml-1">Gemini API Key (Required)</label>
                        <div className="relative mt-1">
                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input 
                                type="password" 
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="Paste Gemini API key here..."
                                className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                            />
                        </div>
                        {error && <p className="text-red-500 text-xs mt-2 ml-1 break-words bg-red-900/20 p-2 rounded">{error}</p>}
                    </div>

                    <div className="pt-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase ml-1 block mb-2">Cloud Sync (Optional)</label>
                        {user ? (
                           <div className="flex items-center gap-3 p-3 bg-green-900/20 border border-green-800 rounded-xl">
                              {user.photoURL && <img src={user.photoURL} alt="User" className="w-8 h-8 rounded-full" />}
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-green-400">Signed in as {user.displayName}</div>
                                <div className="text-xs text-gray-500 truncate">{user.email}</div>
                              </div>
                              <CheckCircle className="w-5 h-5 text-green-500" />
                           </div>
                        ) : (
                          <button 
                            onClick={handleGoogleSignIn}
                            className="w-full py-2.5 bg-white text-gray-900 rounded-xl font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 text-sm"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                            Sign in with Google
                          </button>
                        )}
                        <p className="text-[10px] text-gray-500 mt-1 ml-1">Sign in to save your generated layouts to the cloud.</p>
                    </div>
                    
                    <button 
                        onClick={handleConnect}
                        disabled={isLoading}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 mt-4 shadow-lg shadow-blue-900/20"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 fill-current" />}
                        {isLoading ? "Verifying..." : "Connect Neural Link"}
                    </button>
                    
                    <div className="text-center pt-2">
                        <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:text-blue-300 underline">
                            Get a Gemini API Key
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
  }

  return (
      <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl text-center animate-in slide-in-from-bottom-4">
              <div className="w-16 h-16 bg-gradient-to-tr from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Sparkles className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">System Ready</h2>
              <p className="text-gray-600 mb-8">
                  You can now simulate Gemini, ChatGPT, and Claude interfaces, or use the <strong className="text-purple-600">AI Cloner</strong> to replicate any UI from a screenshot.
              </p>
              
              <button 
                  onClick={handleFinalStart}
                  className="w-full py-3 bg-gray-900 hover:bg-black text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 group"
              >
                  Enter Simulator
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
          </div>
      </div>
  );
};