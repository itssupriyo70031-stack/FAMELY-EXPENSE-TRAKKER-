import React from 'react';
import { SavingsGoal } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '../lib/firestore-utils';
import { Target, TrendingUp } from 'lucide-react';

interface SavingsGoalListProps {
  goals: SavingsGoal[];
}

export function SavingsGoalList({ goals }: SavingsGoalListProps) {
  return (
    <Card className="bg-zinc-950 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Target className="h-5 w-5 text-amber-400" />
          Savings Goals
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {goals.length > 0 ? (
            goals.map((goal) => {
              const progress = (goal.currentAmount / goal.targetAmount) * 100;
              return (
                <div key={goal.id} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <div>
                      <h4 className="text-sm font-medium text-zinc-100">{goal.name}</h4>
                      <p className="text-[10px] text-zinc-500">
                        Target: {formatCurrency(goal.targetAmount)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-zinc-100">{Math.round(progress)}%</div>
                      <p className="text-[10px] text-zinc-500">
                        {formatCurrency(goal.currentAmount)} saved
                      </p>
                    </div>
                  </div>
                  <Progress value={progress} className="h-2 bg-zinc-900" />
                </div>
              );
            })
          ) : (
            <div className="text-center py-4 text-zinc-500 text-sm">
              No savings goals yet.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
