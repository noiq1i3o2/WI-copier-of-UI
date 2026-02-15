import React, { useState, useRef, useEffect } from 'react';
import { AppTheme, Message } from '../types';
import { THEME_CONFIG, INITIAL_GREETING } from '../constants';
import * as Icons from 'lucide-react';
import { getSimulatedResponse } from '../services/geminiService';

interface ChatInterfaceProps {
  theme: AppTheme;
  onOpenSettings: () => void;
  onOpenAddMenu: (e: React.MouseEvent) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ theme, onOpenSettings, onOpenAddMenu }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'model', text: INITIAL_GREETING[theme] || "Ready.", timestamp: Date.now() }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const config = THEME_CONFIG[theme] || THEME_CONFIG[AppTheme.Gemini];
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (theme !== AppTheme.Custom && messages.length <= 1) {
       setMessages([{ id: '1', role: 'model', text: INITIAL_GREETING[theme] || "Hello.", timestamp: Date.now() }]);
    }
  }, [theme]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    
    // Simulate AI thinking time
    const responseText = await getSimulatedResponse(input);

    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, aiMsg]);
    setIsLoading(false);
  };

  const ThemeIcon = (Icons as any)[config.icon] || Icons.MessageCircle;

  // --- Render Helpers ---

  const renderSidebar = () => {
    if (theme === AppTheme.ChatGPT) {
        return (
            <div className={`hidden md:flex flex-col w-[260px] h-full ${config.sidebarColor} text-white p-2 transition-colors duration-300`}>
                <button 
                  className="flex items-center gap-2 px-3 py-3 rounded-md hover:bg-gray-800 transition-colors border border-gray-700 text-sm mb-4"
                  onClick={() => setMessages([{ id: Date.now().toString(), role: 'model', text: INITIAL_GREETING[theme] || "Hello", timestamp: Date.now() }])}
                >
                    <Icons.Plus className="w-4 h-4" />
                    <span>New chat</span>
                </button>
                <div className="flex-1 overflow-y-auto">
                    <div className="px-3 py-2 text-xs text-gray-500 font-medium">Today</div>
                    <div className="px-3 py-2 text-sm text-gray-100 hover:bg-gray-800 rounded-md cursor-pointer truncate">
                        Simulation Mode
                    </div>
                </div>
                <div className="pt-2 border-t border-gray-700">
                    <button onClick={onOpenSettings} className="flex items-center gap-2 px-3 py-3 w-full hover:bg-gray-800 rounded-md transition-colors text-sm">
                        <Icons.Settings className="w-4 h-4" />
                        <span>Settings</span>
                    </button>
                </div>
            </div>
        );
    }
    
    // Gemini & Claude Sidebar (Lighter)
    return (
        <div className={`hidden md:flex flex-col w-[280px] h-full ${config.sidebarColor} p-4 transition-colors duration-300`}>
             <button onClick={onOpenSettings} className="mb-6 self-start text-gray-500 hover:bg-gray-200 p-2 rounded-full">
                <Icons.Menu className="w-6 h-6" />
             </button>
             
             <button 
                className={`flex items-center gap-3 px-4 py-3 rounded-full mb-6 text-sm font-medium transition-colors shadow-sm
                  ${theme === AppTheme.Gemini ? 'bg-[#dde3ea] text-[#041e49] hover:bg-[#d0d7de]' : 'bg-[#e3d5c5] text-[#5e4b35] hover:bg-[#d6c6b3]'}
                `}
                onClick={() => setMessages([{ id: Date.now().toString(), role: 'model', text: INITIAL_GREETING[theme] || "Hello", timestamp: Date.now() }])}
             >
                 <Icons.Plus className="w-5 h-5" />
                 <span>New Chat</span>
             </button>

             <div className="flex-1">
                <div className="text-xs font-medium text-gray-500 mb-3 px-2">Recent</div>
                <div className={`px-4 py-2 text-sm rounded-full cursor-pointer mb-1 ${theme === AppTheme.Gemini ? 'bg-[#d3e3fd] text-blue-800 font-medium' : 'bg-white/50 text-gray-800'}`}>
                    <span className="truncate">Simulation Active</span>
                </div>
             </div>

             <div className="mt-auto flex flex-col gap-1">
                 <button onClick={onOpenSettings} className="flex items-center gap-3 px-4 py-2 rounded-full text-sm font-medium text-gray-700 hover:bg-black/5">
                     <Icons.Settings className="w-5 h-5" />
                     <span>Settings</span>
                 </button>
             </div>
        </div>
    );
  };

  return (
    <div className={`flex h-screen w-full ${config.bgColor} ${config.font} transition-colors duration-300`}>
      {renderSidebar()}
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full relative">
        {/* Header (Top Bar) */}
        <div className="h-14 flex items-center justify-between px-4 sticky top-0 bg-transparent z-10">
          <div className="flex items-center gap-2 md:hidden">
             <button className="p-2 -ml-2 text-gray-500"><Icons.Menu className="w-6 h-6" /></button>
          </div>
          
          <div className="flex items-center gap-2 ml-auto">
             {/* Dynamic '+' Menu Button */}
             <div className="relative group">
                 <button onClick={onOpenAddMenu} className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${config.primaryColor}`}>
                    <Icons.PlusCircle className="w-6 h-6" />
                 </button>
             </div>

             <div className={`w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold`}>
                 U
             </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
            <div className="max-w-3xl mx-auto flex flex-col py-6 gap-6">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'model' && (
                             <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${theme === AppTheme.ChatGPT ? 'bg-emerald-500' : 'bg-transparent'}`}>
                                {theme === AppTheme.ChatGPT ? <Icons.Zap className="w-5 h-5 text-white"/> : <ThemeIcon className={`w-6 h-6 ${config.primaryColor}`} />}
                             </div>
                        )}
                        <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-3 shadow-sm
                            ${msg.role === 'user' ? `${config.userBubble} text-gray-800` : `${config.aiBubble} text-gray-800`}
                            ${theme === AppTheme.ChatGPT && msg.role === 'model' ? 'shadow-none px-0' : ''}
                        `}>
                            <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${theme === AppTheme.ChatGPT ? 'bg-emerald-500' : 'bg-transparent'}`}>
                             {theme === AppTheme.ChatGPT ? <Icons.Zap className="w-5 h-5 text-white"/> : <ThemeIcon className={`w-6 h-6 ${config.primaryColor} animate-pulse`} />}
                        </div>
                        <div className="flex items-center gap-1 h-8">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
        </div>

        {/* Input Area */}
        <div className="p-4 bg-transparent">
            <div className={`max-w-3xl mx-auto rounded-full flex items-center gap-2 p-2 pr-4 shadow-sm border transition-all duration-300
                ${theme === AppTheme.ChatGPT ? 'bg-white border-black/10' : 'bg-[#f0f4f9] border-transparent hover:bg-gray-100 focus-within:bg-white focus-within:shadow-md'}
                ${theme === AppTheme.Claude ? 'bg-white border-gray-200 rounded-xl' : ''}
            `}>
                <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={theme === AppTheme.ChatGPT ? "Send a message..." : "Enter a prompt here"}
                    className="flex-1 bg-transparent border-none outline-none text-gray-700 placeholder-gray-500 font-medium"
                />
                
                <button 
                    onClick={handleSend}
                    disabled={!input}
                    className={`p-2 rounded-full transition-all duration-200
                        ${input ? config.primaryColor + ' bg-blue-50' : 'text-gray-400'}
                        ${theme === AppTheme.ChatGPT ? 'hover:bg-emerald-50' : ''}
                    `}
                >
                    <Icons.SendHorizontal className="w-5 h-5" />
                </button>
            </div>
            <div className="text-center text-xs text-gray-400 mt-2">
               Simulated Interface - Not a real AI Chat
            </div>
        </div>
      </div>
    </div>
  );
};
