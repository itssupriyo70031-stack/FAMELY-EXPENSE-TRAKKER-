import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Target, IndianRupee } from 'lucide-react';

interface SavingsGoalFormProps {
  onSubmit: (data: any) => void;
}

export function SavingsGoalForm({ onSubmit }: SavingsGoalFormProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('0');
  const [deadline, setDeadline] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !targetAmount) return;
    
    onSubmit({
      name,
      targetAmount: parseFloat(targetAmount),
      currentAmount: parseFloat(currentAmount),
      deadline: deadline || new Date().toISOString()
    });
    
    setName('');
    setTargetAmount('');
    setCurrentAmount('0');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" className="border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 gap-2" />
        }
      >
        <Target className="h-4 w-4" /> New Goal
      </DialogTrigger>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100">
        <DialogHeader>
          <DialogTitle>Set Savings Goal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Goal Name</Label>
            <Input
              id="name"
              placeholder="e.g. New Car, Emergency Fund"
              className="bg-zinc-900 border-zinc-800"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="target">Target (₹)</Label>
              <Input
                id="target"
                type="number"
                className="bg-zinc-900 border-zinc-800"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="current">Initial Savings (₹)</Label>
              <Input
                id="current"
                type="number"
                className="bg-zinc-900 border-zinc-800"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">Deadline</Label>
            <Input
              id="deadline"
              type="date"
              className="bg-zinc-900 border-zinc-800"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full bg-amber-600 text-white hover:bg-amber-500 mt-4">
            Create Goal
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
