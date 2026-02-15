export enum AppTheme {
  Gemini = 'Gemini',
  ChatGPT = 'ChatGPT',
  Claude = 'Claude',
  Custom = 'Custom', // New Custom Theme
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: string; // base64
  codeBlock?: string;
  timestamp: number;
}

export enum DynamicElementType {
  ErrorToast = 'ErrorToast',
  ServerDownModal = 'ServerDownModal',
  BetaFeatureBanner = 'BetaFeatureBanner',
  CustomHTML = 'CustomHTML', // Generic HTML injector
}

export interface DynamicElement {
  id: string;
  type: DynamicElementType;
  props: Record<string, any>;
  rawHtml?: string; // For AI generated widgets
}

// Kept for backward compatibility if needed, but we focus on raw HTML now
export interface UIRequest {
  target: 'notification' | 'modal' | 'header_button' | 'sidebar_item' | 'overlay';
  label: string;
  description: string;
  color: string; 
  icon: string;
  html?: string;
}
