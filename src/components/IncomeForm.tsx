import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, IndianRupee, TrendingUp, Calendar } from 'lucide-react';

interface IncomeFormProps {
  onSubmit: (data: any) => void;
}

export function IncomeForm({ onSubmit }: IncomeFormProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !source || !date) return;
    
    onSubmit({
      amount: parseFloat(amount),
      source,
      date: new Date(date).toISOString()
    });
    
    setAmount('');
    setSource('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold h-12 px-6 rounded-2xl gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95" />
        }
      >
        <TrendingUp className="h-4 w-4" /> Add Revenue
      </DialogTrigger>
      <DialogContent className="bg-zinc-950 border-zinc-900 text-zinc-100 rounded-[2.5rem] shadow-2xl">
        <DialogHeader>
          <DialogTitle>Add Monthly Income</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹)</Label>
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
          
          <div className="space-y-2">
            <Label htmlFor="source">Source</Label>
            <Input
              id="source"
              placeholder="Salary, Freelance, etc."
              className="bg-zinc-900 border-zinc-800"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Transaction Date</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              <Input
                id="date"
                type="date"
                className="pl-10 bg-zinc-900 border-zinc-800 [color-scheme:dark]"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full bg-emerald-600 text-white hover:bg-emerald-500 mt-4">
            Add Income
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
