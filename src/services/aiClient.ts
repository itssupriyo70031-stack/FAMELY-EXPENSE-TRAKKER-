import { GoogleGenAI } from "@google/genai";

let ai: GoogleGenAI | null = null;

export function getAI() {
  if (!ai) {
    // 1. Check LocalStorage (Manual User Input Fallback)
    let apiKey = localStorage.getItem('SPENDWISE_GEMINI_KEY');
    
    // 2. Check System Env/Secrets if LocalStorage is empty
    if (!apiKey) {
      apiKey = 
        process.env.GEMINI_API_KEY || 
        (process.env as any).USER_GEMINI_KEY ||
        (import.meta as any).env.VITE_GEMINI_API_KEY ||
        (import.meta as any).env.USER_GEMINI_KEY ||
        (process.env as any).GEMINI_KEY ||
        (process.env as any).APP_GEMINI_KEY;
    }
    
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey === "" || apiKey === "undefined") {
      throw new Error("GEMINI_API_KEY_MISSING");
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
}

export function saveManualApiKey(key: string) {
  if (key && key.trim()) {
    localStorage.setItem('SPENDWISE_GEMINI_KEY', key.trim());
    ai = null; // Reset singleton
    return true;
  }
  return false;
}

export function clearManualApiKey() {
  localStorage.removeItem('SPENDWISE_GEMINI_KEY');
  ai = null;
}
