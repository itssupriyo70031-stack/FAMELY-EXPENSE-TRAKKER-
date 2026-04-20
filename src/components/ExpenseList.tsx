import React, { useState } from 'react';
import { Expense, Category } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '../lib/firestore-utils';
import { 
  Search, Filter, Trash2, Calendar, 
  ChevronRight, MoreVertical, CreditCard,
  Banknote, Smartphone, Landmark
} from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  const [filter, setFilter] = useState<Category | 'All'>('All');

  const filteredExpenses = expenses
    .filter(e => {
      const matchesSearch = e.description.toLowerCase().includes(search.toLowerCase()) || 
                           e.category.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === 'All' || e.category === filter;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <Card className="bg-zinc-950 border-zinc-800">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-xl font-bold">Recent Transactions</CardTitle>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Search..."
              className="pl-9 w-[200px] bg-zinc-900 border-zinc-800 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-3">
            {filteredExpenses.length > 0 ? (
              filteredExpenses.map((expense) => (
                <div 
                  key={expense.id}
                  className="group flex items-center justify-between p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/60 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                      {getPaymentIcon(expense.paymentMethod)}
                    </div>
                    <div>
                      <h4 className="font-medium text-zinc-100">{expense.description}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[10px] uppercase tracking-wider border-zinc-700 text-zinc-400">
                          {expense.category}
                        </Badge>
                        <span className="text-xs text-zinc-500 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(expense.date), 'MMM dd, yyyy')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-bold text-zinc-100">{formatCurrency(expense.amount)}</div>
                      <div className="text-[10px] text-zinc-500 uppercase">{expense.paymentMethod}</div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => onDelete(expense.id)}
                      className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-zinc-500">
                No transactions found.
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
