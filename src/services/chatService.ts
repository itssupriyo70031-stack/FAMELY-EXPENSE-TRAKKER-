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
      You have access to the user's current financial state:
      ${JSON.stringify(dataSummary, null, 2)}
      
      Your goal is to help the user manage their money, provide specific saving tips, analyze their spending patterns, and answer questions about their budget.
      Be concise, professional, and encouraging. Use Indian Rupees (₹) for currency units.
      If asked for advice, look for overspending in categories or low savings rates.
    `;

    const chat = client.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction,
      },
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.content }]
      }))
    });

    const result = await chat.sendMessage({ message: message });
    return result.text;
  } catch (error) {
    console.error("Chat Error:", error);
    return "I'm sorry, I'm having trouble processing that right now. Please check if your GEMINI_API_KEY is configured correctly.";
  }
}
