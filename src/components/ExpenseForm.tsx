import React, { useState } from 'react';
import { Category, PaymentMethod } from '../types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, IndianRupee } from 'lucide-react';

interface ExpenseFormProps {
  onSubmit: (data: any) => void;
}

const CATEGORIES: Category[] = [
  'Food', 'Rent', 'Entertainment', 'Transport', 'Shopping', 
  'Health', 'Utilities', 'Savings', 'Investments', 'Other'
];

const METHODS: PaymentMethod[] = ['Cash', 'Card', 'UPI', 'Bank Transfer'];

export function ExpenseForm({ onSubmit }: ExpenseFormProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category>('Other');
  const [description, setDescription] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('UPI');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;
    
    onSubmit({
      amount: parseFloat(amount),
      category,
      description,
      paymentMethod: method,
      date: new Date().toISOString(),
      isRecurring: false
    });
    
    setAmount('');
    setDescription('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="bg-zinc-100 text-zinc-950 hover:bg-white font-semibold gap-2" />
        }
      >
        <Plus className="h-4 w-4" /> Add Expense
      </DialogTrigger>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100">
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
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
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="What did you spend on?"
              className="bg-zinc-900 border-zinc-800"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={(v: Category) => setCategory(v)}>
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
              <Label>Payment Method</Label>
              <Select value={method} onValueChange={(v: PaymentMethod) => setMethod(v)}>
                <SelectTrigger className="bg-zinc-900 border-zinc-800">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800">
                  {METHODS.map(m => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" className="w-full bg-zinc-100 text-zinc-950 hover:bg-white mt-4">
            Save Expense
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
