import React from 'react';
import { Bill } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '../lib/firestore-utils';
import { format, isAfter, parseISO } from 'date-fns';
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface BillReminderProps {
  bills: Bill[];
  onMarkPaid: (id: string) => void;
}

export function BillReminder({ bills, onMarkPaid }: BillReminderProps) {
  const unpaidBills = bills.filter(b => !b.isPaid).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  return (
    <Card className="bg-zinc-950 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-400" />
          Upcoming Bills
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {unpaidBills.length > 0 ? (
            unpaidBills.map((bill) => {
              const isOverdue = isAfter(new Date(), parseISO(bill.dueDate));
              return (
                <div 
                  key={bill.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-zinc-800 bg-zinc-900/30"
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${isOverdue ? 'bg-rose-500/10 text-rose-500' : 'bg-blue-500/10 text-blue-500'}`}>
                      {isOverdue ? <AlertCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-zinc-100">{bill.name}</h4>
                      <p className="text-[10px] text-zinc-500">
                        Due: {format(parseISO(bill.dueDate), 'MMM dd')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm font-bold text-zinc-100">{formatCurrency(bill.amount)}</div>
                      {isOverdue && <Badge variant="destructive" className="text-[8px] h-4">Overdue</Badge>}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => onMarkPaid(bill.id)}
                      className="text-zinc-500 hover:text-emerald-500 hover:bg-emerald-500/10"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-4 text-zinc-500 text-sm">
              All bills are paid!
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
