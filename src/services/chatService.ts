import { GoogleGenAI } from "@google/genai";
import { Expense, Income, Budget } from "../types";

let ai: GoogleGenAI | null = null;

function getAI() {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set");
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
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
      recentExpenses: data.expenses.slice(-5).map(e => ({ date: e.date, desc: e.description, amount: e.amount, cat: e.category }))
    };

    const systemInstruction = `
      You are SpendWise AI, a highly sophisticated and friendly personal financial advisor. 
      You have access to the user's current financial data:
      ${JSON.stringify(dataSummary, null, 2)}
      
      Always use Indian Rupees (₹) for currency. Be concise, expert, and encouraging.
      Your primary task is to help users manage their money better and provide custom saving tips.
    `;

    // Flatten history and add the latest message for a single generateContent call
    // This is often more robust than stateful chat objects in some environments
    const contents = [
      ...history.map(h => ({
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
      }
    });

    if (!result.text) {
      throw new Error("Empty response from AI");
    }

    return result.text;
  } catch (error: any) {
    console.error("SpendWise AI Error:", error);
    
    // Friendly error messages in Bengali and English
    if (error.message?.includes('GEMINI_API_KEY')) {
      return "দুঃখিত, আপনার GEMINI_API_KEY সেট করা নেই। দয়া করে নেটলিফাই বা এআই স্টুডিও সেটিংসে এটি চেক করুন। (Missing API Key)";
    }
    
    return "দুঃখিত, আমি এই মুহূর্তে আপনার প্রশ্নের উত্তর দিতে পারছি না। দয়া করে কিছুক্ষণ পর আবার চেষ্টা করুন। (Connection Error)";
  }
}
