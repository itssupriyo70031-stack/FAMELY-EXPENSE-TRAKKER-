import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Expense, Income } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, isSameDay } from 'date-fns';
import { formatCurrency } from '../lib/firestore-utils';
import { Smartphone, CreditCard, Banknote, Landmark, IndianRupee, TrendingUp, TrendingDown, CalendarDays } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'motion/react';

interface CalendarExplorerProps {
  expenses: Expense[];
  income: Income[];
}

const getPaymentIcon = (method: string) => {
  switch (method) {
    case 'Cash': return <Banknote className="h-4 w-4" />;
    case 'Card': return <CreditCard className="h-4 w-4" />;
    case 'UPI': return <Smartphone className="h-4 w-4" />;
    case 'Bank Transfer': return <Landmark className="h-4 w-4" />;
    default: return <CreditCard className="h-4 w-4" />;
  }
};

export function CalendarExplorer({ expenses, income }: CalendarExplorerProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const selectedExpenses = expenses.filter(e => date && isSameDay(new Date(e.date), date));
  const selectedIncome = income.filter(i => date && isSameDay(new Date(i.date), date));

  const totalExpenseDay = selectedExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const totalIncomeDay = selectedIncome.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
      <Card className="lg:col-span-12 xl:col-span-4 card-premium border-none shadow-2xl bg-zinc-950/20">
        <CardHeader className="border-b border-zinc-900/50 pb-6">
          <CardTitle className="text-xl font-black tracking-tight text-white flex items-center gap-3">
             <CalendarDays className="h-6 w-6 text-emerald-500" />
             Neural Calendar
          </CardTitle>
          <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-[0.2em] mt-2">Seek by Chronology</p>
        </CardHeader>
        <CardContent className="pt-6 flex justify-center">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-3xl border border-zinc-800/50 bg-zinc-900/10 p-6 shadow-inner"
            showOutsideDays={false}
          />
        </CardContent>
      </Card>

      <div className="lg:col-span-12 xl:col-span-8 space-y-6">
        <div className="grid grid-cols-2 gap-4">
           <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
              <p className="text-[10px] uppercase font-black text-emerald-500 tracking-widest mb-1">Day Influx</p>
              <p className="text-2xl font-black text-emerald-400">{formatCurrency(totalIncomeDay)}</p>
           </div>
           <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/10">
              <p className="text-[10px] uppercase font-black text-rose-500 tracking-widest mb-1">Day Outflow</p>
              <p className="text-2xl font-black text-rose-400">{formatCurrency(totalExpenseDay)}</p>
           </div>
        </div>

        <Card className="card-premium h-[400px] flex flex-col">
          <CardHeader className="border-b border-zinc-800/50">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-zinc-400">
              Logs for {date ? format(date, 'MMMM d, yyyy') : 'No date selected'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="divide-y divide-zinc-800/50">
                <AnimatePresence mode="popLayout">
                  {selectedIncome.map((item) => (
                    <motion.div
                      key={`income-${item.id}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex items-center justify-between p-4 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                          <TrendingUp className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-zinc-200">{item.source}</p>
                          <p className="text-[10px] uppercase tracking-widest text-emerald-500/60 font-bold">Revenue Inflow</p>
                        </div>
                      </div>
                      <p className="font-mono font-bold text-emerald-400 tracking-tighter">+{formatCurrency(item.amount)}</p>
                    </motion.div>
                  ))}
                  {selectedExpenses.map((expense) => (
                    <motion.div
                      key={`expense-${expense.id}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex items-center justify-between p-4 hover:bg-zinc-900/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-zinc-900 flex items-center justify-center text-white">
                          {getPaymentIcon(expense.paymentMethod)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-zinc-200">{expense.description}</p>
                          <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">{expense.category}</p>
                        </div>
                      </div>
                      <p className="font-mono font-bold text-rose-400 tracking-tighter">-{formatCurrency(expense.amount)}</p>
                    </motion.div>
                  ))}
                  {selectedExpenses.length === 0 && selectedIncome.length === 0 && (
                    <motion.div
                      key="empty-state"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.3 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center py-20"
                    >
                      <IndianRupee className="h-10 w-10 mb-4 text-zinc-500" />
                      <p className="text-[10px] uppercase font-black tracking-widest">No Activity Records</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
