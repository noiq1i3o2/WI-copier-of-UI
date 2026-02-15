import React, { useState } from 'react';
import { ShieldCheck, Sparkles, Zap, ArrowRight, Loader2, Key } from 'lucide-react';

interface WelcomeModalProps {
  onComplete: (apiKey: string) => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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

  const handleFinalStart = () => {
      onComplete(apiKey);
  };

  if (step === 1) {
    return (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-md w-full p-8 shadow-2xl text-center animate-in zoom-in-95">
                <div className="w-16 h-16 bg-blue-600/20 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShieldCheck className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">OmniChat Simulator</h1>
                <p className="text-gray-400 mb-6">
                    Enter your Gemini API Key to initialize the neural core.
                </p>

                <div className="space-y-4 text-left">
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase ml-1">API Key</label>
                        <div className="relative mt-1">
                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input 
                                type="password" 
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="Paste key here..."
                                className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                            />
                        </div>
                        {error && <p className="text-red-500 text-xs mt-2 ml-1">{error}</p>}
                    </div>
                    
                    <button 
                        onClick={handleConnect}
                        disabled={isLoading}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
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
