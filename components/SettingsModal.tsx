import React, { useState, useRef } from 'react';
import { AppTheme } from '../types';
import { Check, Monitor, X, Upload, Wand2, Loader2 } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  onImportImage: (base64: string) => void;
  isGenerating?: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, onClose, currentTheme, setTheme, onImportImage, isGenerating 
}) => {
  if (!isOpen) return null;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

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

  const themes = [
    { id: AppTheme.Gemini, name: 'Gemini', color: 'bg-blue-500' },
    { id: AppTheme.ChatGPT, name: 'ChatGPT', color: 'bg-emerald-500' },
    { id: AppTheme.Claude, name: 'Claude', color: 'bg-[#d97757]' },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800">Settings</h2>
          <button onClick={onClose} disabled={isGenerating} className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-8">
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
                 <div className="mt-4 text-[10px] text-gray-400 border-t border-purple-100 pt-2">
                     Disclaimer: The generated UI is an AI interpretation and may not be pixel-perfect. Complex interactions might be static. Accuracy varies based on screenshot clarity.
                 </div>
             </div>
          </div>
        </div>
        
        <div className="p-4 bg-gray-50 text-right">
          <button onClick={onClose} disabled={isGenerating} className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium disabled:opacity-50">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
