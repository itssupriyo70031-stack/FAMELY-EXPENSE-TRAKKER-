import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, IndianRupee, TrendingUp } from 'lucide-react';

interface IncomeFormProps {
  onSubmit: (data: any) => void;
}

export function IncomeForm({ onSubmit }: IncomeFormProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !source) return;
    
    onSubmit({
      amount: parseFloat(amount),
      source,
      date: new Date().toISOString()
    });
    
    setAmount('');
    setSource('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" className="border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 gap-2" />
        }
      >
        <TrendingUp className="h-4 w-4" /> Add Income
      </DialogTrigger>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100">
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

          <Button type="submit" className="w-full bg-emerald-600 text-white hover:bg-emerald-500 mt-4">
            Add Income
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
