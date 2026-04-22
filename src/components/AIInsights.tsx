import React, { useState, useEffect } from 'react';
import { getFinancialInsights } from '../services/aiService';
import { Expense, Income, Budget } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, RefreshCw, AlertCircle, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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
    try {
      const data = await getFinancialInsights(expenses, income, budgets);
      setInsights(data);
    } catch (error) {
      console.error("AI Insight Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  return (
    <Card className="card-premium h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-6 space-y-0 p-6 border-b border-zinc-800/50">
        <div className="space-y-0.5">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            AI Insights
          </CardTitle>
          <p className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest font-bold">Autonomous Analysis</p>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={fetchInsights} 
          disabled={loading}
          className="text-zinc-600 hover:text-white hover:bg-zinc-800 rounded-lg h-9 w-9"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent className="p-6">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {[1, 2].map((i) => (
                <div key={i} className="h-24 bg-zinc-900/30 rounded-xl animate-pulse border border-zinc-800/20" />
              ))}
            </motion.div>
          ) : insights.length > 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-xl mb-2">
                 <div className="flex items-center gap-2 mb-1.5">
                    <Zap className="h-3 w-3 text-emerald-400" />
                    <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">Analysis Sync Ready</span>
                 </div>
                 <p className="text-[10px] text-zinc-500 leading-relaxed uppercase tracking-tight">Data patterns identified and mapped.</p>
              </div>

              {(insights || []).map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-5 rounded-xl border border-zinc-800/60 bg-zinc-950/50 hover:bg-zinc-900/40 transition-all group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-bold text-zinc-200 tracking-tight text-sm group-hover:text-emerald-400 transition-colors uppercase">{insight.title}</h4>
                    <span className={`text-[8px] font-bold px-2 py-0.5 rounded border ${
                      insight.impact === 'High' 
                        ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' 
                        : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                    }`}>
                      {insight.impact}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                    {insight.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.2 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-16 space-y-4 grayscale"
            >
              <Sparkles className="h-10 w-10 text-zinc-500" />
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-center">Syncing Analysis...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
