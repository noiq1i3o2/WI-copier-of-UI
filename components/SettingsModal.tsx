import React, { useState, useRef, useEffect } from 'react';
import { AppTheme, SavedLayout, User } from '../types';
import { Check, Monitor, X, Upload, Wand2, Loader2, Layout, Trash2, Calendar, LogIn } from 'lucide-react';
import { getUserLayouts, deleteLayout, signInWithGoogle, signOut } from '../services/firebase';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  onImportImage: (base64: string) => void;
  isGenerating?: boolean;
  onLoadLayout: (html: string) => void;
  user: User | null;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, onClose, currentTheme, setTheme, onImportImage, isGenerating, onLoadLayout, user
}) => {
  if (!isOpen) return null;
  
  const [activeTab, setActiveTab] = useState<'general' | 'saved'>('general');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [savedLayouts, setSavedLayouts] = useState<SavedLayout[]>([]);
  const [isLoadingLayouts, setIsLoadingLayouts] = useState(false);

  useEffect(() => {
    if (activeTab === 'saved' && user) {
        setIsLoadingLayouts(true);
        getUserLayouts(user.uid).then(layouts => {
            setSavedLayouts(layouts);
            setIsLoadingLayouts(false);
        });
    }
  }, [activeTab, user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = () => {
              setPreview(reader.result as string);
          };
          reader.readAsDataURL(file);
      }
  };

  const handleClone = () => {
      if (preview) {
          onImportImage(preview);
      }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (confirm('Are you sure you want to delete this layout?')) {
          await deleteLayout(id);
          setSavedLayouts(prev => prev.filter(l => l.id !== id));
      }
  };

  const themes = [
    { id: AppTheme.Gemini, name: 'Gemini', color: 'bg-blue-500' },
    { id: AppTheme.ChatGPT, name: 'ChatGPT', color: 'bg-emerald-500' },
    { id: AppTheme.Claude, name: 'Claude', color: 'bg-[#d97757]' },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex gap-4">
              <button 
                onClick={() => setActiveTab('general')}
                className={`text-lg font-semibold transition-colors ${activeTab === 'general' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
              >
                  Settings
              </button>
              <button 
                onClick={() => setActiveTab('saved')}
                className={`text-lg font-semibold transition-colors ${activeTab === 'saved' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
              >
                  Saved Layouts
              </button>
          </div>
          <button onClick={onClose} disabled={isGenerating} className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-8 flex-1">
          {activeTab === 'general' ? (
              <>
                <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wider">Presets</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {themes.map((theme) => (
                        <button
                        key={theme.id}
                        onClick={() => setTheme(theme.id)}
                        disabled={isGenerating}
                        className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 group hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed
                            ${currentTheme === theme.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'}
                        `}
                        >
                        <div className={`w-8 h-8 rounded-lg mb-3 ${theme.color} flex items-center justify-center text-white shadow-sm`}>
                            <Monitor className="w-5 h-5" />
                        </div>
                        <div className="font-semibold text-gray-900">{theme.name}</div>
                        {currentTheme === theme.id && (
                            <div className="absolute top-3 right-3 text-blue-500">
                            <Check className="w-5 h-5" />
                            </div>
                        )}
                        </button>
                    ))}
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-8">
                    <div className="flex items-center gap-2 mb-4">
                        <Wand2 className="w-5 h-5 text-purple-600" />
                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">AI UI Cloner</h3>
                    </div>
                    
                    <div className="bg-purple-50 rounded-xl p-6 border border-purple-100">
                        <p className="text-gray-700 mb-4 text-sm">Upload a screenshot of any app interface, and Gemini will interpret and generate a replica UI for you.</p>
                        
                        <div className="flex flex-col sm:flex-row gap-4 items-start">
                            <div 
                                onClick={() => !isGenerating && fileInputRef.current?.click()}
                                className={`flex-1 w-full h-48 border-2 border-dashed border-purple-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-purple-100 transition-colors bg-white relative overflow-hidden
                                    ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}
                                `}
                            >
                                {preview ? (
                                    <img src={preview} alt="Preview" className="w-full h-full object-contain" />
                                ) : (
                                    <>
                                        <Upload className="w-8 h-8 text-purple-300 mb-2" />
                                        <span className="text-sm text-purple-400 font-medium">Click to upload screenshot</span>
                                    </>
                                )}
                                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={isGenerating} />
                            </div>
                            
                            <div className="flex flex-col gap-3 min-w-[200px]">
                                <button 
                                    onClick={handleClone}
                                    disabled={!preview || isGenerating}
                                    className={`px-4 py-3 rounded-lg font-medium shadow-sm transition-all flex items-center justify-center gap-2
                                        ${!preview || isGenerating ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-purple-600 text-white hover:bg-purple-700'}
                                    `}
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Analyzing...
                                        </>
                                    ) : (
                                        <>
                                            <Wand2 className="w-4 h-4" />
                                            Generate UI
                                        </>
                                    )}
                                </button>
                                <button 
                                    onClick={() => { setPreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                                    disabled={isGenerating}
                                    className="text-xs text-gray-500 hover:text-gray-700 underline disabled:opacity-50"
                                >
                                    Clear Image
                                </button>
                            </div>
                        </div>
                        {isGenerating && (
                            <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded-lg text-xs flex items-center gap-2 animate-pulse">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                <span>AI is writing HTML & Tailwind CSS... This can take up to 20 seconds.</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-8">
                     <div className="flex items-center justify-between mb-4">
                         <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Account</h3>
                         {user && <button onClick={signOut} className="text-xs text-red-500 hover:text-red-700 underline">Sign Out</button>}
                     </div>
                     {!user ? (
                         <div className="bg-gray-50 p-4 rounded-xl flex items-center justify-between">
                             <span className="text-sm text-gray-600">Sign in to save and sync layouts</span>
                             <button onClick={signInWithGoogle} className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-black transition-colors">Sign In</button>
                         </div>
                     ) : (
                         <div className="bg-green-50 p-4 rounded-xl flex items-center gap-3">
                             {user.photoURL && <img src={user.photoURL} alt="User" className="w-10 h-10 rounded-full" />}
                             <div>
                                 <div className="font-medium text-gray-900">{user.displayName}</div>
                                 <div className="text-xs text-gray-500">{user.email}</div>
                             </div>
                         </div>
                     )}
                </div>
              </>
          ) : (
              <div className="h-full">
                  {!user ? (
                      <div className="flex flex-col items-center justify-center h-48 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                          <LogIn className="w-8 h-8 text-gray-400 mb-2" />
                          <p className="text-gray-500 font-medium">Sign in to view saved layouts</p>
                          <button onClick={signInWithGoogle} className="mt-4 text-blue-600 hover:underline text-sm">Connect with Google</button>
                      </div>
                  ) : (
                      <div className="space-y-4">
                          {isLoadingLayouts ? (
                              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
                          ) : savedLayouts.length === 0 ? (
                              <div className="text-center py-8 text-gray-400">No saved layouts found. Generate and save one!</div>
                          ) : (
                              <div className="grid grid-cols-1 gap-3">
                                  {savedLayouts.map(layout => (
                                      <div key={layout.id} onClick={() => { onLoadLayout(layout.html); onClose(); }} className="group border border-gray-200 rounded-xl p-4 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer bg-white flex items-center justify-between">
                                          <div className="flex items-center gap-3">
                                              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                                                  <Layout className="w-5 h-5" />
                                              </div>
                                              <div>
                                                  <div className="font-medium text-gray-900">{layout.name}</div>
                                                  <div className="text-xs text-gray-400 flex items-center gap-1">
                                                      <Calendar className="w-3 h-3" />
                                                      {new Date(layout.createdAt).toLocaleDateString()}
                                                  </div>
                                              </div>
                                          </div>
                                          <button 
                                            onClick={(e) => handleDelete(layout.id, e)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                          >
                                              <Trash2 className="w-4 h-4" />
                                          </button>
                                      </div>
                                  ))}
                              </div>
                          )}
                      </div>
                  )}
              </div>
          )}
        </div>
      </div>
    </div>
  );
};
