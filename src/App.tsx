import React, { useState, useEffect } from 'react';
import { auth, db, googleProvider } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { 
  collection, query, where, onSnapshot, 
  addDoc, deleteDoc, doc, updateDoc, setDoc, getDocs 
} from 'firebase/firestore';
import { Expense, Income, Budget, SavingsGoal, Bill, Category } from './types';
import { Dashboard } from './components/Dashboard';
import { ExpenseForm } from './components/ExpenseForm';
import { IncomeForm } from './components/IncomeForm';
import { ExpenseList } from './components/ExpenseList';
import { AIInsights } from './components/AIInsights';
import { SavingsGoalForm } from './components/SavingsGoalForm';
import { SavingsGoalList } from './components/SavingsGoalList';
import { BillForm } from './components/BillForm';
import { BillReminder } from './components/BillReminder';
import { BudgetSettings } from './components/BudgetSettings';
import { AIChatBot } from './components/AIChatBot';
import { AuthHelpModal } from './components/AuthHelpModal';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { 
  LogOut, LogIn, IndianRupee, 
  Download, LayoutDashboard, 
  PieChart as PieChartIcon, Settings,
  User as UserIcon, Bell, ShieldCheck,
  Zap, BarChart3, Lock, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { handleFirestoreError, OperationType } from './lib/firestore-utils';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [income, setIncome] = useState<Income[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [showAuthHelp, setShowAuthHelp] = useState(false);
  const [unauthorizedDomain, setUnauthorizedDomain] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setExpenses([]);
      setIncome([]);
      setBudgets([]);
      setGoals([]);
      setBills([]);
      return;
    }

    const qExpenses = query(collection(db, 'expenses'), where('userId', '==', user.uid));
    const unsubExpenses = onSnapshot(qExpenses, (snapshot) => {
      setExpenses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'expenses'));

    const qIncome = query(collection(db, 'income'), where('userId', '==', user.uid));
    const unsubIncome = onSnapshot(qIncome, (snapshot) => {
      setIncome(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Income)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'income'));

    const qBudgets = query(collection(db, 'budgets'), where('userId', '==', user.uid));
    const unsubBudgets = onSnapshot(qBudgets, (snapshot) => {
      setBudgets(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Budget)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'budgets'));

    const qGoals = query(collection(db, 'savingsGoals'), where('userId', '==', user.uid));
    const unsubGoals = onSnapshot(qGoals, (snapshot) => {
      setGoals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SavingsGoal)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'savingsGoals'));

    const qBills = query(collection(db, 'bills'), where('userId', '==', user.uid));
    const unsubBills = onSnapshot(qBills, (snapshot) => {
      setBills(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Bill)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'bills'));

    return () => {
      unsubExpenses();
      unsubIncome();
      unsubBudgets();
      unsubGoals();
      unsubBills();
    };
  }, [user]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success('Successfully signed in!');
    } catch (error: any) {
      console.error(error);
      const currentDomain = window.location.hostname;
      if (error.code === 'auth/unauthorized-domain') {
        setUnauthorizedDomain(currentDomain);
        setShowAuthHelp(true);
      } else {
        toast.error(`Sign in failed: ${error.message || 'Unknown error'}`);
      }
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    toast.success('Signed out successfully');
  };

  const addExpense = async (data: any) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'expenses'), {
        ...data,
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName
      });
      toast.success('Expense added!');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'expenses');
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'expenses', id));
      toast.success('Expense deleted');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'expenses');
    }
  };

  const addIncome = async (data: any) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'income'), { ...data, userId: user.uid });
      toast.success('Income added!');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'income');
    }
  };

  const saveBudget = async (category: Category | 'Total', amount: number) => {
    if (!user) return;
    try {
      const existing = budgets.find(b => b.category === category);
      if (existing) {
        await updateDoc(doc(db, 'budgets', existing.id), { amount });
      } else {
        await addDoc(collection(db, 'budgets'), { category, amount, userId: user.uid });
      }
      toast.success('Budget updated!');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'budgets');
    }
  };

  const addGoal = async (data: any) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'savingsGoals'), { ...data, userId: user.uid });
      toast.success('Goal created!');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'savingsGoals');
    }
  };

  const addBill = async (data: any) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'bills'), { ...data, userId: user.uid });
      toast.success('Bill reminder added!');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'bills');
    }
  };

  const markBillPaid = async (id: string) => {
    try {
      await updateDoc(doc(db, 'bills', id), { isPaid: true });
      toast.success('Bill marked as paid');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'bills');
    }
  };

  const exportCSV = () => {
    const headers = ['Date', 'Description', 'Category', 'Amount', 'Method'];
    const rows = expenses.map(e => [
      e.date.split('T')[0],
      e.description,
      e.category,
      e.amount,
      e.paymentMethod
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `expenses_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
          <IndianRupee className="h-10 w-10 text-emerald-500" />
        </motion.div>
        <p className="text-zinc-500 text-sm font-medium animate-pulse">Initializing SpendWise...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-emerald-500 selection:text-zinc-950">
      <Toaster position="top-center" theme="dark" richColors />
      <AuthHelpModal isOpen={showAuthHelp} onClose={() => setShowAuthHelp(false)} domain={unauthorizedDomain} />
      
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-default">
            <div className="h-9 w-9 bg-emerald-500 rounded-xl flex items-center justify-center transform transition-all group-hover:rotate-12 group-hover:scale-110">
              <IndianRupee className="h-5 w-5 text-zinc-950 font-bold" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">SpendWise</h1>
              <p className="text-[10px] text-zinc-500 font-mono -mt-1 uppercase tracking-widest">Financial OS</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800">
                  <div className="h-6 w-6 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] font-bold text-zinc-950">
                    {user.displayName?.charAt(0)}
                  </div>
                  <span className="text-sm font-medium">{user.displayName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BillForm onSubmit={addBill} />
                  <Button variant="ghost" size="icon" onClick={exportCSV} className="text-zinc-400 hover:text-white hover:bg-zinc-900">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleLogout} className="text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10">
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <Button onClick={handleLogin} className="bg-zinc-100 text-zinc-950 hover:bg-white font-bold gap-2 rounded-xl">
                <LogIn className="h-4 w-4" /> Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {!user ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-12 md:py-24"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-8">
                  <motion.div 
                    initial={{ x: -20, opacity: 0 }} 
                    animate={{ x: 0, opacity: 1 }} 
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20"
                  >
                    <Zap className="h-3 w-3 text-emerald-500" />
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">AI Powered OS v2.0</span>
                  </motion.div>
                  
                  <motion.h2 
                    initial={{ y: 20, opacity: 0 }} 
                    animate={{ y: 0, opacity: 1 }} 
                    transition={{ delay: 0.1 }}
                    className="text-5xl md:text-7xl font-bold tracking-tighter leading-[0.9]"
                  >
                    Master your money with <span className="text-emerald-500 underline decoration-zinc-800">precision</span>.
                  </motion.h2>
                  
                  <motion.p 
                    initial={{ y: 20, opacity: 0 }} 
                    animate={{ y: 0, opacity: 1 }} 
                    transition={{ delay: 0.2 }}
                    className="text-zinc-400 text-lg max-w-md leading-relaxed"
                  >
                    The advanced monthly financial tracker designed for clarity, automated insights, and absolute control over your wealth.
                  </motion.p>
                  
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }} 
                    animate={{ y: 0, opacity: 1 }} 
                    transition={{ delay: 0.3 }}
                    className="flex flex-col sm:flex-row gap-4"
                  >
                    <Button onClick={handleLogin} size="lg" className="bg-zinc-100 text-zinc-950 hover:bg-white font-bold h-14 px-8 text-lg rounded-2xl gap-3">
                      <LogIn className="h-5 w-5" /> Get Started Now
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg" 
                      onClick={() => window.open('https://github.com', '_blank')}
                      className="border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 h-14 px-8 text-lg rounded-2xl"
                    >
                       View Documentation
                    </Button>
                  </motion.div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-8 border-t border-zinc-900">
                    {[
                      { label: "Data Security", icon: Lock, val: "256-bit" },
                      { label: "AI Insights", icon: Sparkles, val: "Gemini 3" },
                      { label: "Accuracy", icon: BarChart3, val: "100%" }
                    ].map((item, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex items-center gap-2 text-zinc-500">
                          <item.icon className="h-3 w-3" />
                          <span className="text-[10px] uppercase font-bold tracking-widest">{item.label}</span>
                        </div>
                        <p className="text-zinc-100 font-bold">{item.val}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <motion.div 
                  initial={{ scale: 0.8, opacity: 0, rotate: -5 }} 
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  transition={{ type: 'spring', damping: 20 }}
                  className="relative group lg:ml-auto"
                >
                  <div className="absolute -inset-1 bg-emerald-500/20 rounded-3xl blur-2xl group-hover:bg-emerald-500/30 transition-all" />
                  <div className="relative bg-zinc-900 border border-zinc-800 p-8 rounded-3xl shadow-2xl space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="h-6 w-12 bg-zinc-800 rounded-full" />
                      <div className="h-8 w-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                        <BarChart3 className="h-4 w-4 text-emerald-500" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 w-full bg-zinc-800 rounded animate-pulse" />
                      <div className="h-4 w-2/3 bg-zinc-800 rounded animate-pulse" />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {[1, 2, 3].map(i => <div key={i} className={`h-20 rounded-xl bg-zinc-800/50 flex flex-col justify-end p-2`}><div className={`w-full bg-emerald-500 rounded-lg h-${i*4}`} /></div>)}
                    </div>
                    <div className="p-4 rounded-xl bg-emerald-500 text-zinc-950 font-bold text-center">
                      Analysis Complete
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Left Column - Main Content */}
              <div className="lg:col-span-8 space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-3xl font-bold tracking-tight">Financial Overview</h2>
                    <p className="text-zinc-400">Track your income, expenses, and savings in real-time.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <IncomeForm onSubmit={addIncome} />
                    <ExpenseForm onSubmit={addExpense} />
                  </div>
                </div>

                <Dashboard expenses={expenses} income={income} budgets={budgets} />
                
                <ExpenseList expenses={expenses} onDelete={deleteExpense} />
              </div>

              {/* Right Column - Sidebar */}
              <div className="lg:col-span-4 space-y-8">
                <AIInsights expenses={expenses} income={income} budgets={budgets} />
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">Goals & Bills</h3>
                    <SavingsGoalForm onSubmit={addGoal} />
                  </div>
                  <SavingsGoalList goals={goals} />
                  <BillReminder bills={bills} onMarkPaid={markBillPaid} />
                </div>

                <div className="pt-4 border-t border-zinc-800">
                  <BudgetSettings budgets={budgets} onSave={saveBudget} />
                </div>
              </div>

              {/* Persistent Chat */}
              <AIChatBot expenses={expenses} income={income} budgets={budgets} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-12 mt-20 bg-zinc-900/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2 opacity-50">
              <IndianRupee className="h-4 w-4" />
              <span className="text-sm font-bold tracking-tight uppercase">SpendWise</span>
            </div>
            <p className="text-zinc-500 text-sm">
              © 2026 SpendWise. All rights reserved. Secure Cloud Storage by Firebase.
            </p>
            <div className="flex gap-6 text-sm text-zinc-500">
              <a href="#" className="hover:text-emerald-500 transition-colors">Privacy</a>
              <a href="#" className="hover:text-emerald-500 transition-colors">Terms</a>
              <a href="#" className="hover:text-emerald-500 transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

