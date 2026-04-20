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
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { 
  LogOut, LogIn, IndianRupee, 
  Download, LayoutDashboard, 
  PieChart as PieChartIcon, Settings,
  User as UserIcon, Bell
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
    } catch (error) {
      console.error(error);
      toast.error('Failed to sign in. Please try again.');
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
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-zinc-100 selection:text-zinc-900">
      <Toaster position="top-center" theme="dark" />
      
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-zinc-100 rounded-lg flex items-center justify-center">
              <IndianRupee className="h-5 w-5 text-zinc-950" />
            </div>
            <h1 className="text-xl font-bold tracking-tight font-display">SpendWise</h1>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800">
                  <UserIcon className="h-4 w-4 text-zinc-500" />
                  <span className="text-sm font-medium">{user.displayName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BillForm onSubmit={addBill} />
                  <Button variant="ghost" size="icon" onClick={exportCSV} className="text-zinc-400 hover:text-white">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleLogout} className="text-zinc-400 hover:text-rose-500">
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <Button onClick={handleLogin} className="bg-zinc-100 text-zinc-950 hover:bg-white font-semibold gap-2">
                <LogIn className="h-4 w-4" /> Sign in with Google
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {!user ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="h-20 w-20 bg-zinc-900 rounded-3xl flex items-center justify-center mb-6 border border-zinc-800">
                <IndianRupee className="h-10 w-10 text-zinc-100" />
              </div>
              <h2 className="text-4xl font-bold mb-4 font-display">Master Your Finances</h2>
              <p className="text-zinc-400 max-w-md mb-8">
                The advanced monthly expense tracker designed for clarity, precision, and smarter savings.
              </p>
              <Button onClick={handleLogin} size="lg" className="bg-zinc-100 text-zinc-950 hover:bg-white font-bold px-8 py-6 text-lg rounded-2xl gap-3">
                <LogIn className="h-5 w-5" /> Get Started Now
              </Button>
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
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 opacity-50">
            <IndianRupee className="h-4 w-4" />
            <span className="text-sm font-medium font-display">SpendWise</span>
          </div>
          <p className="text-zinc-500 text-sm">
            © 2026 SpendWise. All rights reserved. Built with precision.
          </p>
          <div className="flex gap-6 text-sm text-zinc-500">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
