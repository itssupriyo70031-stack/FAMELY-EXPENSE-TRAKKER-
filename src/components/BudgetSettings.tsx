import React, { useState } from 'react';
import { Budget, Category } from '../types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings2, IndianRupee } from 'lucide-react';

interface BudgetSettingsProps {
  budgets: Budget[];
  onSave: (category: Category | 'Total', amount: number) => void;
}

const CATEGORIES: (Category | 'Total')[] = [
  'Total', 'Food', 'Rent', 'Entertainment', 'Transport', 'Shopping', 
  'Health', 'Utilities', 'Savings', 'Investments', 'Other'
];

export function BudgetSettings({ budgets, onSave }: BudgetSettingsProps) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<Category | 'Total'>('Total');
  const [amount, setAmount] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;
    onSave(category, parseFloat(amount));
    setAmount('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" className="border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 gap-2" />
        }
      >
        <Settings2 className="h-4 w-4" /> Monthly Budgets
      </DialogTrigger>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100">
        <DialogHeader>
          <DialogTitle>Set Monthly Budgets</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={(v: Category | 'Total') => setCategory(v)}>
              <SelectTrigger className="bg-zinc-900 border-zinc-800">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800">
                {CATEGORIES.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Budget Amount (₹)</Label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                className="pl-9 bg-zinc-900 border-zinc-800"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full bg-zinc-100 text-zinc-950 hover:bg-white mt-4">
            Update Budget
          </Button>
        </form>

        <div className="mt-6 space-y-2">
          <h4 className="text-sm font-semibold text-zinc-400 mb-2">Current Budgets</h4>
          <div className="max-h-[200px] overflow-y-auto space-y-2 pr-2">
            {budgets.map(b => (
              <div key={b.id} className="flex justify-between items-center p-2 rounded bg-zinc-900/50 border border-zinc-800">
                <span className="text-sm">{b.category}</span>
                <span className="text-sm font-bold">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(b.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
