import React from 'react';
import * as LucideIcons from 'lucide-react';
import { DynamicElement, DynamicElementType } from '../types';

interface DynamicInjectorProps {
  elements: DynamicElement[];
  removeElement: (id: string) => void;
}

const IconRenderer = ({ name, className }: { name: string; className?: string }) => {
  const Icon = (LucideIcons as any)[name] || LucideIcons.HelpCircle;
  return <Icon className={className} />;
};

export const DynamicInjector: React.FC<DynamicInjectorProps> = ({ elements, removeElement }) => {
  return (
    <>
      {elements.map((el) => {
        // Handle AI Generated Raw HTML Widgets
        if (el.type === DynamicElementType.CustomHTML && el.rawHtml) {
            return (
                <div key={el.id} className="relative z-50">
                    <div dangerouslySetInnerHTML={{ __html: el.rawHtml }} />
                    {/* Invisible overlay to capture click for dismissal if needed, or add a dismiss button manually via AI instructions */}
                    <button 
                        onClick={() => removeElement(el.id)} 
                        className="fixed top-2 right-2 z-[60] bg-black/20 hover:bg-black/40 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center text-xs"
                        title="Remove Widget"
                    >
                        ✕
                    </button>
                </div>
            );
        }

        // Standard Presets
        if (el.type === DynamicElementType.ServerDownModal) {
          return (
            <div key={el.id} className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full animate-in zoom-in-95 duration-200">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-${el.props.color || 'red'}-100 text-${el.props.color || 'red'}-600`}>
                   <IconRenderer name={el.props.icon || 'AlertTriangle'} className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">{el.props.title || 'System Alert'}</h3>
                <p className="text-gray-600 mb-6">{el.props.description || 'An unexpected event has occurred.'}</p>
                <button 
                  onClick={() => removeElement(el.id)}
                  className={`w-full py-2 px-4 bg-${el.props.color || 'blue'}-600 hover:bg-${el.props.color || 'blue'}-700 text-white rounded-lg transition-colors`}
                >
                  Dismiss
                </button>
              </div>
            </div>
          );
        }

        if (el.type === DynamicElementType.ErrorToast || el.type === DynamicElementType.BetaFeatureBanner) {
           const isBanner = el.type === DynamicElementType.BetaFeatureBanner;
           return (
             <div 
                key={el.id} 
                className={`fixed ${isBanner ? 'top-20 right-4' : 'top-4 right-4'} z-50 max-w-md w-full p-4 rounded-lg shadow-lg border flex items-start gap-3 animate-in slide-in-from-top-4 duration-300
                  ${isBanner ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100' : 'bg-white border-gray-200'}
                `}
             >
                <div className={`p-2 rounded-md bg-${el.props.color || 'blue'}-100 text-${el.props.color || 'blue'}-600`}>
                   <IconRenderer name={el.props.icon || 'Info'} className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{el.props.title}</h4>
                  <p className="text-sm text-gray-600">{el.props.description}</p>
                </div>
                <button onClick={() => removeElement(el.id)} className="text-gray-400 hover:text-gray-600">
                  <LucideIcons.X className="w-4 h-4" />
                </button>
             </div>
           );
        }

        return null;
      })}
    </>
  );
};
