import React from 'react';
import { Income } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Calendar, IndianRupee } from 'lucide-react';
import { formatCurrency } from '../lib/firestore-utils';
import { motion, AnimatePresence } from 'motion/react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface IncomeListProps {
  income: Income[];
  onDelete: (id: string) => void;
}

export function IncomeList({ income, onDelete }: IncomeListProps) {
  return (
    <Card className="card-premium h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-6 space-y-0 p-6 border-b border-zinc-800/50">
        <div>
          <CardTitle className="text-lg font-bold tracking-tight">Recent Inflow</CardTitle>
          <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-[0.2em] font-bold mt-1">Earnings Registry</p>
        </div>
        <div className="text-right">
           <span className="text-[10px] font-bold text-zinc-500 bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-lg border border-emerald-500/20">
             {income.length} Sources
           </span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[500px]">
          <div className="divide-y divide-zinc-800/50">
            <AnimatePresence initial={false}>
              {income.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.3 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-24"
                >
                  <p className="text-xs font-bold uppercase tracking-widest">No Income Found</p>
                </motion.div>
              ) : (
                income.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((item, i) => (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="group flex items-center justify-between p-3 sm:p-5 hover:bg-zinc-900/50 transition-all cursor-default"
                  >
                    <div className="flex items-center gap-2 sm:gap-4">
                      <div className="h-9 w-9 rounded-lg bg-emerald-500/5 flex items-center justify-center text-emerald-500 transition-colors">
                        <IndianRupee className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-zinc-200 tracking-tight">{item.source}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[9px] text-zinc-600 font-mono italic flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(item.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-mono font-bold text-emerald-400 text-sm tracking-tighter">{formatCurrency(item.amount)}</div>
                        <div className="text-[9px] text-zinc-600 font-bold uppercase">Credit</div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => onDelete(item.id)}
                        className="opacity-0 group-hover:opacity-100 h-8 w-8 text-zinc-700 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
