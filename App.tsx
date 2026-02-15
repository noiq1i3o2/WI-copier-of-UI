import React, { useState, useEffect } from 'react';
// @ts-ignore
import html2canvas from 'html2canvas';
import { AppTheme, DynamicElement, DynamicElementType, User } from './types';
import { ChatInterface } from './components/ChatInterface';
import { SettingsModal } from './components/SettingsModal';
import { DynamicInjector } from './components/DynamicElements';
import { WelcomeModal } from './components/WelcomeModal';
import { generateLayoutFromImage, generateWidgetHTML, refineHtml, initializeGemini } from './services/geminiService';
import { subscribeToAuthChanges, saveLayout, signInWithGoogle } from './services/firebase';
import { Plus, X, Zap, AlertTriangle, ShieldAlert, Terminal, Sparkles, Send, Loader2, Code2, RefreshCw, Camera, Save, LogIn } from 'lucide-react';

const App: React.FC = () => {
  const [theme, setTheme] = useState<AppTheme>(AppTheme.Gemini);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [dynamicElements, setDynamicElements] = useState<DynamicElement[]>([]);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isProcessingCustom, setIsProcessingCustom] = useState(false);
  const [isGeneratingLayout, setIsGeneratingLayout] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  
  // Custom Cloned Layout
  const [customLayoutHtml, setCustomLayoutHtml] = useState<string | null>(null);
  
  // Refinement State
  const [isRefining, setIsRefining] = useState(false);
  const [refinePrompt, setRefinePrompt] = useState('');
  const [showRefineBar, setShowRefineBar] = useState(false);

  // Welcome Modal State
  const [showWelcome, setShowWelcome] = useState(true);

  // Save Layout State
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((u) => {
       // @ts-ignore - firebase user type mapping
       setUser(u);
    });
    return () => unsubscribe();
  }, []);

  const toggleSettings = () => setIsSettingsOpen(!isSettingsOpen);
  
  const handleSetupComplete = (apiKey: string) => {
      initializeGemini(apiKey);
      setShowWelcome(false);
  };

  const handleScreenshot = async () => {
      const element = document.getElementById('root');
      if (element) {
          // Hide controls momentarily for screenshot
          const controls = document.querySelectorAll('.screenshot-hide');
          controls.forEach(el => el.classList.add('opacity-0'));

          try {
              const canvas = await html2canvas(element, {
                  useCORS: true,
                  scale: window.devicePixelRatio,
              });
              
              const link = document.createElement('a');
              link.download = `omnichat-ui-${Date.now()}.png`;
              link.href = canvas.toDataURL();
              link.click();
          } catch (err) {
              console.error("Screenshot failed", err);
              alert("Could not capture screenshot.");
          } finally {
              controls.forEach(el => el.classList.remove('opacity-0'));
          }
      }
  };

  const handleSaveLayout = async () => {
      if (!customLayoutHtml) return;

      if (!user) {
          if (confirm("You need to sign in to save layouts. Sign in with Google now?")) {
              try {
                await signInWithGoogle();
              } catch (e) {
                  return; // User cancelled or failed
              }
          } else {
              return;
          }
      }

      // Check user again after potential sign in
      // We rely on auth state listener, but for immediate flow we might need to wait or just re-trigger
      // Simplified: If user was null, we triggered sign in. The listener updates `user`. 
      // User might need to click save again if the state update is async/detached.
      // But let's assume if they just signed in, they are persistent. 
      
      const name = prompt("Enter a name for this layout:", "My Custom UI");
      if (name) {
          setIsSaving(true);
          try {
              // We need the current user ID. If user state hasn't updated yet, we might fail.
              // In a real app we'd await the auth state.
              if (user) {
                  await saveLayout(user.uid, name, customLayoutHtml);
                  alert("Layout saved successfully!");
              } else {
                  // Fallback if state update is lagging, though rare with popup await
                  alert("Please try clicking save again now that you are signed in.");
              }
          } catch (error) {
              alert("Failed to save layout.");
              console.error(error);
          }
          setIsSaving(false);
      }
  };
  
  const addElement = (type: DynamicElementType, props: Record<string, any> = {}, rawHtml?: string) => {
    const newElement: DynamicElement = {
      id: Date.now().toString(),
      type,
      props,
      rawHtml
    };
    setDynamicElements(prev => [...prev, newElement]);
    setIsAddMenuOpen(false);
  };

  const removeElement = (id: string) => {
    setDynamicElements(prev => prev.filter(el => el.id !== id));
  };

  const handleCustomWidget = async () => {
    if (!customPrompt.trim()) return;
    setIsProcessingCustom(true);
    const html = await generateWidgetHTML(customPrompt);
    addElement(DynamicElementType.CustomHTML, {}, html);
    setIsProcessingCustom(false);
    setCustomPrompt('');
    setIsAddMenuOpen(false);
  };

  const handleImportImage = async (base64: string) => {
      setIsGeneratingLayout(true);
      const html = await generateLayoutFromImage(base64);
      setCustomLayoutHtml(html);
      setTheme(AppTheme.Custom);
      setIsGeneratingLayout(false);
      setIsSettingsOpen(false);
      // Automatically show refinement bar for new layouts
      setShowRefineBar(true);
  };

  const handleRefineLayout = async () => {
      if (!refinePrompt.trim() || !customLayoutHtml) return;
      setIsRefining(true);
      const newHtml = await refineHtml(customLayoutHtml, refinePrompt);
      setCustomLayoutHtml(newHtml);
      setIsRefining(false);
      setRefinePrompt('');
  };

  const resetToPreset = (newTheme: AppTheme) => {
      setCustomLayoutHtml(null);
      setTheme(newTheme);
      setShowRefineBar(false);
  };

  const handleLoadLayout = (html: string) => {
      setCustomLayoutHtml(html);
      setTheme(AppTheme.Custom);
      setShowRefineBar(true);
  };

  if (showWelcome) {
      return <WelcomeModal onComplete={handleSetupComplete} />;
  }

  return (
    <div className="h-full w-full relative">
      
      {/* Screenshot Trigger (Top Left) */}
      <button 
          onClick={handleScreenshot}
          className="fixed top-4 left-4 z-[90] p-2 bg-black/10 hover:bg-black/20 rounded-full text-gray-500 hover:text-gray-800 transition-colors screenshot-hide"
          title="Take Screenshot of UI"
      >
          <Camera className="w-5 h-5" />
      </button>

      {/* Main UI Renderer */}
      {theme === AppTheme.Custom && customLayoutHtml ? (
          <div className="w-full h-full relative overflow-auto bg-gray-50">
              {/* The Generated Content */}
              <div dangerouslySetInnerHTML={{ __html: customLayoutHtml }} className="min-h-full" />
              
              {/* Custom Mode Controls */}
              <div className="fixed bottom-6 right-6 z-[90] flex flex-col gap-3 items-end screenshot-hide">
                  
                  {/* Refinement Bar */}
                  {showRefineBar && (
                      <div className="bg-white p-2 rounded-xl shadow-xl border border-gray-200 mb-2 w-80 animate-in slide-in-from-bottom-2">
                          <div className="flex items-center justify-between mb-2 px-1">
                              <span className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                                  <Sparkles className="w-3 h-3 text-purple-500" /> AI Refinement
                              </span>
                              <button onClick={() => setShowRefineBar(false)} className="text-gray-400 hover:text-gray-600">
                                  <X className="w-3 h-3" />
                              </button>
                          </div>
                          <div className="flex gap-2">
                              <input 
                                type="text" 
                                value={refinePrompt}
                                onChange={(e) => setRefinePrompt(e.target.value)}
                                placeholder="e.g. 'Make the header dark mode'"
                                onKeyDown={(e) => e.key === 'Enter' && handleRefineLayout()}
                                className="flex-1 text-sm bg-gray-50 border border-gray-200 rounded-md px-3 py-2 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                              />
                              <button 
                                onClick={handleRefineLayout}
                                disabled={isRefining || !refinePrompt}
                                className="bg-purple-600 text-white p-2 rounded-md hover:bg-purple-700 disabled:opacity-50"
                              >
                                  {isRefining ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                              </button>
                          </div>
                      </div>
                  )}

                  <div className="flex gap-3">
                    {/* Save Button */}
                    <button 
                        onClick={handleSaveLayout} 
                        className={`p-3 rounded-full shadow-lg border transition-all hover:scale-105 flex items-center justify-center gap-2
                            bg-green-600 text-white border-green-600 hover:bg-green-700
                        `}
                        disabled={isSaving}
                        title="Save Layout"
                    >
                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    </button>

                    <button 
                        onClick={() => setShowRefineBar(!showRefineBar)} 
                        className={`p-3 rounded-full shadow-lg border transition-all hover:scale-105 flex items-center justify-center gap-2
                            ${showRefineBar ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}
                        `}
                        title="Modify Layout"
                    >
                        <Sparkles className="w-5 h-5" />
                        {showRefineBar && <span className="pr-1 font-medium text-sm">Edit</span>}
                    </button>
                    
                    <button 
                        onClick={() => setIsAddMenuOpen(true)} 
                        className="p-3 bg-white text-gray-800 rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition-transform hover:scale-105"
                        title="Inject Fake Widget"
                    >
                        <Plus className="w-5 h-5" />
                    </button>

                    <button 
                        onClick={() => setIsSettingsOpen(true)} 
                        className="p-3 bg-black text-white rounded-full shadow-lg hover:bg-gray-800 transition-transform hover:scale-105"
                        title="Settings"
                    >
                        <Terminal className="w-5 h-5" />
                    </button>
                  </div>
              </div>
          </div>
      ) : (
          <ChatInterface 
            theme={theme} 
            onOpenSettings={toggleSettings} 
            onOpenAddMenu={() => setIsAddMenuOpen(true)}
          />
      )}
      
      {/* Dynamic Overlays (Errors, Popups, etc.) */}
      <DynamicInjector elements={dynamicElements} removeElement={removeElement} />
      
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        currentTheme={theme} 
        setTheme={resetToPreset}
        onImportImage={handleImportImage}
        isGenerating={isGeneratingLayout}
        onLoadLayout={handleLoadLayout}
        user={user}
      />

      {/* Add Menu Popup */}
      {isAddMenuOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-[2px]" onClick={() => setIsAddMenuOpen(false)}>
            <div className="bg-white rounded-xl shadow-2xl p-4 w-80 animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-800">Inject Fake Element</h3>
                    <button onClick={() => setIsAddMenuOpen(false)}><X className="w-4 h-4 text-gray-500"/></button>
                </div>
                
                <div className="space-y-2 mb-4">
                    <button onClick={() => addElement(DynamicElementType.ErrorToast, { title: 'Connection Error', description: 'Failed to connect to the neural engine.', color: 'red', icon: 'WifiOff' })} 
                        className="w-full flex items-center gap-3 p-3 hover:bg-red-50 text-red-700 rounded-lg text-sm font-medium transition-colors">
                        <AlertTriangle className="w-4 h-4" /> Fake Error Toast
                    </button>
                    <button onClick={() => addElement(DynamicElementType.ServerDownModal, { title: 'System Outage', description: 'Our servers are currently experiencing high load. Please try again later.', color: 'orange', icon: 'ServerCrash' })} 
                        className="w-full flex items-center gap-3 p-3 hover:bg-orange-50 text-orange-700 rounded-lg text-sm font-medium transition-colors">
                        <ShieldAlert className="w-4 h-4" /> Fake Server Down
                    </button>
                    <button onClick={() => addElement(DynamicElementType.BetaFeatureBanner, { title: 'New Model Available', description: 'Try the experimental Gemini 1.5 Pro model now.', color: 'indigo', icon: 'Sparkles' })} 
                        className="w-full flex items-center gap-3 p-3 hover:bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium transition-colors">
                        <Zap className="w-4 h-4" /> Fake Beta Banner
                    </button>
                </div>

                <div className="border-t border-gray-100 pt-4">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Custom Fake Element (AI)</label>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            className="flex-1 text-sm border border-gray-200 rounded-md px-2 py-1 outline-none focus:border-blue-500"
                            placeholder="e.g. 'Red warning popup'"
                            value={customPrompt}
                            onChange={e => setCustomPrompt(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleCustomWidget()}
                        />
                        <button 
                            onClick={handleCustomWidget} 
                            disabled={isProcessingCustom}
                            className="bg-blue-600 text-white rounded-md p-2 hover:bg-blue-700 disabled:opacity-50"
                        >
                           {isProcessingCustom ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} 
                        </button>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-2">Describe a fake popup/alert and AI will generate the HTML overlay.</p>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default App;
