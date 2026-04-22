import React from 'react';
import { Expense, Income, Budget } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '../lib/firestore-utils';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, Tooltip,
} from 'recharts';
import { 
  ArrowUpRight, ArrowDownRight, Wallet, 
  Target, IndianRupee, TrendingUp, TrendingDown 
} from 'lucide-react';
import { motion } from 'motion/react';
import { Progress } from '@/components/ui/progress';

interface DashboardProps {
  expenses: Expense[];
  income: Income[];
  budgets: Budget[];
}

const COLORS = ['#10b981', '#f43f5e', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'];

export function Dashboard({ expenses, income, budgets }: DashboardProps) {
  const totalExpenses = (expenses || []).reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalIncome = (income || []).reduce((sum, i) => sum + (i.amount || 0), 0);
  const netBalance = totalIncome - totalExpenses;
  
  const categoryData = Object.entries(
    (expenses || []).reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + (e.amount || 0);
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  const incomeData = Object.entries(
    (income || []).reduce((acc, i) => {
      acc[i.source] = (acc[i.source] || 0) + (i.amount || 0);
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  const healthScore = totalIncome > 0 ? Math.max(0, Math.min(100, (netBalance / totalIncome) * 100)) : 0;

  return (
    <div className="space-y-10">
      {/* Prime Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
        <div className="stat-card border-l-4 border-emerald-500 bg-gradient-to-br from-zinc-950 to-emerald-500/5">
           <div className="flex justify-between items-start">
             <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-500/60">Capital Influx</span>
             <TrendingUp className="h-5 w-5 text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
           </div>
           <p className="text-3xl md:text-4xl font-black tracking-tightest">{formatCurrency(totalIncome)}</p>
           <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Synced from {income.length} sources</p>
        </div>

        <div className="stat-card border-l-4 border-rose-500 bg-gradient-to-br from-zinc-950 to-rose-500/5">
           <div className="flex justify-between items-start">
             <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-rose-500/60">System Outflow</span>
             <TrendingDown className="h-5 w-5 text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.4)]" />
           </div>
           <p className="text-3xl md:text-4xl font-black tracking-tightest">{formatCurrency(totalExpenses)}</p>
           <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{expenses.length} distinct records</p>
        </div>

        <div className="stat-card border-l-4 border-blue-500 bg-gradient-to-br from-zinc-950 to-blue-500/5 sm:col-span-2 lg:col-span-1">
           <div className="flex justify-between items-start">
             <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-500/60">Net Variance</span>
             <Wallet className="h-5 w-5 text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.4)]" />
           </div>
           <p className="text-3xl md:text-4xl font-black tracking-tightest">{formatCurrency(netBalance)}</p>
           <div className="flex items-center gap-3 mt-4">
              <div className="flex-1 h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${healthScore}%` }}
                  className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
                />
              </div>
              <span className="text-[11px] font-black text-blue-400">{Math.round(healthScore)}%</span>
           </div>
        </div>
      </div>

      {/* Primary Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        <Card className="card-premium">
           <CardHeader className="border-b border-zinc-800/50 pb-4">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-zinc-400">Expense Distribution</CardTitle>
           </CardHeader>
           <CardContent className="pt-6 md:pt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-center">
                 <div className="h-[200px] md:h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          stroke="none"
                          cornerRadius={8}
                        >
                          {categoryData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '8px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="space-y-3 md:space-y-4">
                    {categoryData.slice(0, 5).map((item, i) => (
                       <div key={i} className="flex flex-col gap-1">
                          <div className="flex justify-between text-[10px] md:text-xs">
                             <span className="text-zinc-500 font-medium">{item.name}</span>
                             <span className="text-zinc-300 font-bold">{formatCurrency(item.value)}</span>
                          </div>
                          <Progress value={totalExpenses > 0 ? (item.value / totalExpenses) * 100 : 0} className="h-1 bg-zinc-900" />
                       </div>
                    ))}
                 </div>
              </div>
           </CardContent>
        </Card>

        <Card className="card-premium">
           <CardHeader className="border-b border-zinc-800/50 pb-4">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-zinc-400">Revenue Sources</CardTitle>
           </CardHeader>
           <CardContent className="pt-6 md:pt-8">
              <div className="h-[200px] md:h-[220px] font-mono">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={incomeData}>
                       <XAxis dataKey="name" hide />
                       <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                       <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a' }} />
                       <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} barSize={32} />
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </CardContent>
        </Card>
      </div>

      {/* Intelligence & Strategy Section Block */}
      <Card className="card-premium border-none bg-gradient-to-r from-emerald-500/5 to-blue-500/5 overflow-hidden border-zinc-800/30">
         <CardContent className="p-6 md:p-8 flex flex-col sm:flex-row items-center gap-6 md:gap-8 justify-between">
            <div className="space-y-3 md:space-y-4 max-w-lg text-center sm:text-left">
               <div className="flex items-center justify-center sm:justify-start gap-2">
                  <div className="px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded text-[10px] font-bold tracking-widest uppercase">Wealth Engine</div>
                  <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" />
               </div>
               <h3 className="text-xl md:text-2xl font-bold tracking-tight">Your financial trajectory is optimizing.</h3>
               <p className="text-zinc-500 text-[10px] md:text-sm leading-relaxed">
                 By aggregating your {expenses.length} transactions and {income.length} revenue streams, SpendWise has mapped your efficiency at {Math.round(healthScore)}%. Maintain this surplus to reach your planning goals faster.
               </p>
            </div>
            <div className="flex shrink-0">
               <div className="h-20 w-20 md:h-24 md:w-24 rounded-full border-4 border-dashed border-zinc-800 flex items-center justify-center relative bg-zinc-950/50">
                  <span className="text-lg md:text-xl font-bold">{Math.round(healthScore)}%</span>
                  <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin" />
               </div>
            </div>
         </CardContent>
      </Card>
    </div>
  );
}
