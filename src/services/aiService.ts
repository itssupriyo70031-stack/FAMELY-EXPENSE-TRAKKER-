import { Expense, Income, Budget } from "../types";
import { getAI } from "./aiClient";

export async function getFinancialInsights(expenses: Expense[], income: Income[], budgets: Budget[]) {
  try {
    const client = getAI();

    const dataSummary = {
      totalExpenses: expenses.reduce((sum, e) => sum + e.amount, 0),
      totalIncome: income.reduce((sum, i) => sum + i.amount, 0),
      budgets: budgets.map(b => ({ category: b.category, amount: b.amount })),
      topCategories: Object.entries(
        expenses.reduce((acc, e) => {
          acc[e.category] = (acc[e.category] || 0) + e.amount;
          return acc;
        }, {} as Record<string, number>)
      ).sort((a, b) => b[1] - a[1]).slice(0, 3)
    };

    const prompt = `
      As a professional financial advisor, analyze the following monthly financial data and provide 3 actionable insights to help save money and improve financial health.
      Format the response as a JSON array of objects with "title", "description", and "impact" (High/Medium/Low) fields.
      
      Data:
      ${JSON.stringify(dataSummary, null, 2)}
      
      Keep insights concise, practical, and encouraging.
    `;

    const response = await client.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    
    const text = response.text;
    if (!text) return [];
    
    // Extract JSON from the response
    const jsonMatch = text.match(/\[.*\]/s);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return [];
  } catch (error) {
    console.error("AI Insights Error:", error);
    return [];
  }
}
