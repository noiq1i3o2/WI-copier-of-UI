import { AppTheme } from './types';

export const THEME_CONFIG = {
  [AppTheme.Gemini]: {
    name: 'Gemini',
    primaryColor: 'text-blue-600',
    bgColor: 'bg-white',
    sidebarColor: 'bg-[#f0f4f9]',
    userBubble: 'bg-[#f0f4f9]',
    aiBubble: 'bg-transparent',
    font: 'font-sans',
    icon: 'Sparkles',
  },
  [AppTheme.ChatGPT]: {
    name: 'ChatGPT',
    primaryColor: 'text-emerald-500',
    bgColor: 'bg-white',
    sidebarColor: 'bg-[#202123]',
    userBubble: 'bg-gray-100',
    aiBubble: 'bg-transparent',
    font: 'font-sans',
    icon: 'Zap',
  },
  [AppTheme.Claude]: {
    name: 'Claude',
    primaryColor: 'text-[#d97757]',
    bgColor: 'bg-[#fcf7f1]', // Warm beige
    sidebarColor: 'bg-[#f5eadd]',
    userBubble: 'bg-[#f0e4d4]',
    aiBubble: 'bg-transparent',
    font: 'font-serif', // Claude uses a serif-heavy design
    icon: 'MessageSquare',
  },
};

export const INITIAL_GREETING = {
  [AppTheme.Gemini]: "Hello, I'm Gemini. How can I help you today?",
  [AppTheme.ChatGPT]: "How can I help you today?",
  [AppTheme.Claude]: "Good morning. How can I help you with your tasks today?",
};
