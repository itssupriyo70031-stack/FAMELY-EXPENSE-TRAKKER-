import React, { useState } from 'react';
import { Expense } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '../lib/firestore-utils';
import { 
  Search, Trash2, CreditCard,
  Banknote, Smartphone, Landmark
} from 'lucide-react';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'motion/react';

interface ExpenseListProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
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

export function ExpenseList({ expenses, onDelete }: ExpenseListProps) {
  const [search, setSearch] = useState('');

  const filteredExpenses = expenses
    .filter(e => {
      const matchesSearch = e.description.toLowerCase().includes(search.toLowerCase()) || 
                           e.category.toLowerCase().includes(search.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <Card className="card-premium h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-6 space-y-0 p-6 border-b border-zinc-800/50">
        <div>
          <CardTitle className="text-lg font-bold tracking-tight">Recent Outflow</CardTitle>
          <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-[0.2em] font-bold mt-1">Transaction Ledger</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
          <Input
            placeholder="Search..."
            className="pl-9 w-[150px] bg-zinc-950/50 border-zinc-800/80 text-xs rounded-lg"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[500px]">
          <div className="divide-y divide-zinc-800/50">
            <AnimatePresence initial={false}>
              {filteredExpenses.length > 0 ? (
                filteredExpenses.map((expense, i) => (
                  <motion.div 
                    key={expense.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="group flex items-center justify-between p-3 sm:p-5 hover:bg-zinc-900/50 transition-all cursor-default"
                  >
                    <div className="flex items-center gap-2 sm:gap-4">
                      <div className="h-9 w-9 rounded-lg bg-zinc-900 flex items-center justify-center text-zinc-500 group-hover:bg-zinc-800 transition-colors">
                        {getPaymentIcon(expense.paymentMethod)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-zinc-200 tracking-tight">{expense.description}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[9px] uppercase font-bold tracking-widest text-zinc-500">{expense.category}</span>
                          <span className="text-[9px] text-zinc-600 font-mono">
                            {expense.date && !isNaN(new Date(expense.date).getTime()) 
                              ? format(new Date(expense.date), 'dd/MM/yy')
                              : 'Invalid Date'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-mono font-bold text-rose-400 text-sm tracking-tighter">{formatCurrency(expense.amount)}</div>
                        <div className="text-[9px] text-zinc-600 font-bold uppercase">{expense.paymentMethod}</div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => onDelete(expense.id)}
                        className="opacity-0 group-hover:opacity-100 h-8 w-8 text-zinc-700 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-20 opacity-30">
                  <p className="text-xs font-bold uppercase tracking-widest">No Records Found</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
