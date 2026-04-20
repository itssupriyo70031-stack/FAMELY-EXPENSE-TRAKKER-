import { GoogleGenAI } from "@google/genai";
import { Expense, Income, Budget } from "../types";

let ai: GoogleGenAI | null = null;

function getAI() {
  if (!ai) {
    // 1. Check LocalStorage (Manual User Input)
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

/**
 * Saves the API key to local storage so the user doesn't have to keep setting it.
 */
export function saveManualApiKey(key: string) {
  if (key && key.trim()) {
    localStorage.setItem('SPENDWISE_GEMINI_KEY', key.trim());
    ai = null; // Reset singleton to force re-init with new key
    return true;
  }
  return false;
}

/**
 * Clears the stored API key
 */
export function clearManualApiKey() {
  localStorage.removeItem('SPENDWISE_GEMINI_KEY');
  ai = null;
}

export async function getChatResponse(message: string, history: any[], data: { expenses: Expense[], income: Income[], budgets: Budget[] }) {
  try {
    const client = getAI();
    
    const dataSummary = {
      totalExpenses: data.expenses.reduce((sum, e) => sum + e.amount, 0),
      totalIncome: data.income.reduce((sum, i) => sum + i.amount, 0),
      budgets: data.budgets.map(b => ({ category: b.category, amount: b.amount })),
      expensesByCategory: data.expenses.reduce((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + e.amount;
        return acc;
      }, {} as Record<string, number>),
      recentExpenses: data.expenses.slice(-10).map(e => ({ date: e.date, desc: e.description, amount: e.amount, cat: e.category }))
    };

    const systemInstruction = `
      You are SpendWise AI, a personal financial advisor. 
      Access to current user data: ${JSON.stringify(dataSummary)}
      
      Requirements:
      1. Use ₹ (INR) for amounts.
      2. Be concise but insightful.
      3. Focus on saving tips and budget adherence.
      4. Language: If the user speaks in Bengali, reply in Bengali. Otherwise English.
    `;

    const contents = [
      ...history.slice(-10).map(h => ({
        role: h.role,
        parts: [{ text: h.content }]
      })),
      {
        role: 'user',
        parts: [{ text: message }]
      }
    ];

    const result = await client.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    return result.text || "I processed your request but have no response. Try again?";
  } catch (error: any) {
    console.error("SpendWise AI Error:", error);
    
    if (error.message === "GEMINI_API_KEY_MISSING") {
      return "⚠️ **এপিআই কী পাওয়া যায়নি (API Key Missing)**\n\nচ্যাটবট চালানোর জন্য এপিআই কী সেট করা নেই।\n১. উপরের গিয়ার আইকন (⚙️) ক্লিক করে **Secrets**-এ যান।\n২. নাম দিন (Name): `USER_GEMINI_KEY` (এটি রিজার্ভড নয়)।\n৩. ভ্যালু দিন (Value): আপনার এপিআই কী।\n৪. এই পেজটি রিফ্রেশ করুন।";
    }
    
    if (error.message?.includes('API key not valid')) {
      return "❌ **এপিআই কী সঠিক নয় (Invalid API Key)**\n\nআপনার দেওয়া কী-টি সঠিক নয়। দয়া করে [aistudio.google.com](https://aistudio.google.com/app/apikey) থেকে নতুন একটি কী নিন।";
    }

    return "⚠️ **কানেকশন সমস্যা (Connection Error)**\n\nআমি এই মুহূর্তে এআই সার্ভারের সাথে যোগাযোগ করতে পারছি না। দয়া করে কয়েক সেকেন্ড পর আবার মেসেজ দিন।";
  }
}
