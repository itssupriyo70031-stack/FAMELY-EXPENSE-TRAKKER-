import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, IndianRupee } from 'lucide-react';

interface BillFormProps {
  onSubmit: (data: any) => void;
}

export function BillForm({ onSubmit }: BillFormProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount || !dueDate) return;
    
    onSubmit({
      name,
      amount: parseFloat(amount),
      dueDate,
      category: category || 'General',
      isPaid: false
    });
    
    setName('');
    setAmount('');
    setDueDate('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="icon" className="border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900" />
        }
      >
        <Calendar className="h-4 w-4" />
      </DialogTrigger>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100">
        <DialogHeader>
          <DialogTitle>Add Bill Reminder</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Bill Name</Label>
            <Input
              id="name"
              placeholder="e.g. Electricity, Internet"
              className="bg-zinc-900 border-zinc-800"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              className="bg-zinc-900 border-zinc-800"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              className="bg-zinc-900 border-zinc-800"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full bg-blue-600 text-white hover:bg-blue-500 mt-4">
            Add Reminder
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
