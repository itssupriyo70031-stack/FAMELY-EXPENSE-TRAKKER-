import React, { useState, useEffect } from 'react';
import { getFinancialInsights } from '../services/aiService';
import { Expense, Income, Budget } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, RefreshCw, TrendingDown, TrendingUp, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Badge } from '@/components/ui/badge';

interface AIInsightsProps {
  expenses: Expense[];
  income: Income[];
  budgets: Budget[];
}

export function AIInsights({ expenses, income, budgets }: AIInsightsProps) {
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchInsights = async () => {
    if (expenses.length === 0 && income.length === 0) return;
    setLoading(true);
    const data = await getFinancialInsights(expenses, income, budgets);
    setInsights(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  return (
    <Card className="border-zinc-800 bg-zinc-950/50 backdrop-blur-xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-400" />
            AI Financial Insights
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Personalized advice powered by Gemini
          </CardDescription>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={fetchInsights} 
          disabled={loading}
          className="text-zinc-400 hover:text-white hover:bg-zinc-800"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent className="pt-4">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-zinc-900/50 rounded-lg animate-pulse" />
              ))}
            </motion.div>
          ) : insights.length > 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {insights.map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-zinc-100">{insight.title}</h4>
                    <Badge variant={insight.impact === 'High' ? 'destructive' : insight.impact === 'Medium' ? 'default' : 'secondary'}>
                      {insight.impact} Impact
                    </Badge>
                  </div>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    {insight.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-8 text-zinc-500">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>Add some expenses to get AI insights!</p>
            </div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
