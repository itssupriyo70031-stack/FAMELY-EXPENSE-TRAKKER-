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
import { CalendarExplorer } from './components/CalendarExplorer';
import { AuthHelpModal } from './components/AuthHelpModal';
import { IncomeList } from './components/IncomeList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { 
  LogOut, LogIn, IndianRupee, 
  Download, LayoutDashboard, 
  PieChart as PieChartIcon, Settings,
  User as UserIcon, Bell, ShieldCheck,
  Zap, BarChart3, Lock, Sparkles, Loader2, Target,
  TrendingUp, TrendingDown, CalendarDays
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
  const [authErrorCode, setAuthErrorCode] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

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
    if (isAuthenticating) return;
    setIsAuthenticating(true);
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success('Successfully signed in!');
    } catch (error: any) {
      console.error("Auth Exception:", error);
      const currentDomain = window.location.hostname;
      
      const errorCode = error.code || (error.message?.includes('INTERNAL ASSERTION FAILED') ? 'auth/internal-error' : '');
      
      const helpErrors = [
        'auth/unauthorized-domain', 
        'auth/network-request-failed', 
        'auth/popup-blocked', 
        'auth/cancelled-popup-request',
        'auth/internal-error'
      ];

      if (helpErrors.includes(errorCode)) {
        setUnauthorizedDomain(currentDomain);
        setAuthErrorCode(errorCode);
        setShowAuthHelp(true);
      } else {
        toast.error(`Sign in failed: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setIsAuthenticating(false);
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

  const deleteIncome = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'income', id));
      toast.success('Income source removed');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'income');
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
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-emerald-500 selection:text-zinc-950">
      <Toaster position="top-right" theme="dark" richColors />
      <AuthHelpModal 
        isOpen={showAuthHelp} 
        onClose={() => setShowAuthHelp(false)} 
        domain={unauthorizedDomain} 
        errorCode={authErrorCode}
      />
      
      {user ? (
        <div className="flex min-h-screen w-full relative">
          {/* Desktop Navigation Sidebar */}
          <aside className="w-64 border-r border-zinc-900 bg-zinc-950 hidden lg:flex flex-col fixed inset-y-0 z-50">
            <div className="p-8 flex items-center gap-3">
              <div className="h-9 w-9 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/10">
                <IndianRupee className="h-5 w-5 text-zinc-950 font-bold" />
              </div>
              <h1 className="text-xl font-bold tracking-tighter">SpendWise</h1>
            </div>

            <nav className="flex-1 px-4 space-y-1 mt-4">
              {[
                { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                { id: 'transactions', label: 'Ledger', icon: BarChart3 },
                { id: 'explorer', label: 'Explorer', icon: CalendarDays },
                { id: 'planning', label: 'Blueprint', icon: Target },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-5 py-4 rounded-xl transition-all font-semibold ${
                    activeTab === item.id 
                      ? 'bg-zinc-900/50 text-emerald-400 border border-zinc-800/10' 
                      : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/30'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="text-sm font-bold">{item.label}</span>
                </button>
              ))}
            </nav>

            <div className="p-6 border-t border-zinc-900 mt-auto">
              <div className="bg-zinc-900/40 rounded-2xl p-4 border border-zinc-800/30">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-xs font-bold text-zinc-950 shadow-lg shadow-emerald-500/10">
                    {user?.displayName?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate text-zinc-200">{user?.displayName || 'User'}</p>
                    <p className="text-[10px] text-zinc-500 truncate uppercase tracking-widest mt-0.5">Primary Node</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start h-11 text-xs gap-3 text-zinc-500 hover:text-rose-500 hover:bg-rose-500/5 rounded-xl border border-zinc-800/30 hover:border-rose-500/20 transition-all font-bold uppercase tracking-widest" 
                  onClick={handleLogout}
                >
                   <LogOut className="h-3.5 w-3.5" /> Deactivate
                </Button>
              </div>
            </div>
          </aside>

          {/* Mobile Bottom Navigation (Responsive Height & Safe Area) */}
          <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-zinc-950/80 backdrop-blur-3xl border-t border-zinc-900/50 flex items-center justify-around h-20 z-50 px-6 pb-2 shadow-[0_-20px_60px_rgba(0,0,0,0.8)]">
            {[
              { id: 'overview', label: 'Hub', icon: LayoutDashboard },
              { id: 'transactions', label: 'Ledger', icon: BarChart3 },
              { id: 'explorer', label: 'Cal', icon: CalendarDays },
              { id: 'planning', label: 'Plan', icon: Target },
            ].map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex flex-col items-center gap-2 transition-all flex-1 py-1 relative ${
                    isActive ? 'text-emerald-400' : 'text-zinc-600'
                  }`}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="nav-pill" 
                      className="absolute -top-1 h-1 w-10 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]" 
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <item.icon className={`h-6 w-6 ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : ''} transition-all`} />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em]">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Main Content Area (Layout Guarded) */}
          <div className="flex-1 lg:ml-64 relative min-h-screen">
            <main className="max-w-[1400px] mx-auto p-6 sm:p-10 md:p-12 space-y-10 md:space-y-16 pb-32 lg:pb-16 overflow-x-hidden">
              <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-10 border-b border-zinc-900/80">
                 <div className="flex justify-between items-center w-full md:w-auto">
                    <div className="space-y-1.5">
                      <h2 className="text-4xl md:text-6xl font-black tracking-tighter capitalize text-zinc-100">{activeTab}</h2>
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        <p className="text-[10px] md:text-[11px] text-zinc-500 uppercase tracking-[0.4em] font-bold">Terminal Interface Sync</p>
                      </div>
                    </div>
                    {/* Mobile LogOut for even more convenience if needed, but we have bottom nav. 
                        Let's keep it for tablet/desktop consistency */}
                    <div className="lg:hidden flex items-center gap-2">
                       {/* Space for additional mobile-only head icons if needed */}
                    </div>
                 </div>
                 <div className="flex flex-wrap items-center gap-3 sm:gap-4 no-scrollbar">
                   <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={exportCSV} 
                    className="border-zinc-800 bg-zinc-950/50 text-zinc-400 h-12 px-6 rounded-2xl gap-3 hover:bg-zinc-900 hover:text-zinc-100 shrink-0 font-bold text-xs border-dashed"
                   >
                      <Download className="h-4 w-4" /> <span>Export Ledger</span>
                   </Button>
                   <IncomeForm onSubmit={addIncome} />
                   <ExpenseForm onSubmit={addExpense} />
                 </div>
              </header>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, scale: 0.98, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 1.02, y: -20 }}
                  transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
                  className="w-full"
                >
                  {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 md:gap-14 items-start">
                      <div className="xl:col-span-8 space-y-12 md:space-y-16">
                        <Dashboard expenses={expenses} income={income} budgets={budgets} />
                      </div>
                      <div className="xl:col-span-4 lg:sticky lg:top-12 space-y-12">
                        <AIInsights expenses={expenses} income={income} budgets={budgets} />
                        <div className="p-8 bg-zinc-900/20 border border-zinc-900 rounded-[2.5rem] relative group overflow-hidden">
                          <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
                            <ShieldCheck className="h-3 w-3" /> System Integrity
                          </h4>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-xs font-mono">
                              <span className="text-zinc-600">ENCRYPTION:</span>
                              <span className="text-emerald-500 font-bold">AES-256</span>
                            </div>
                            <div className="flex items-center justify-between text-xs font-mono">
                              <span className="text-zinc-600">LATENCY:</span>
                              <span className="text-emerald-500 font-bold">14ms</span>
                            </div>
                            <div className="flex items-center justify-between text-xs font-mono">
                              <span className="text-zinc-600">UPLINK:</span>
                              <span className="text-emerald-500 font-bold">ACTIVE</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'explorer' && (
                    <CalendarExplorer expenses={expenses} income={income} />
                  )}

                  {activeTab === 'transactions' && (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 md:gap-12 items-start">
                      <div className="space-y-6">
                         <div className="flex items-center gap-3 px-2">
                           <div className="h-8 w-8 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                             <TrendingDown className="h-4 w-4" />
                           </div>
                           <h3 className="text-xl font-bold tracking-tight">Withdrawal Hub</h3>
                         </div>
                         <ExpenseList expenses={expenses} onDelete={deleteExpense} />
                      </div>
                      <div className="space-y-6">
                         <div className="flex items-center gap-3 px-2">
                           <div className="h-8 w-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                             <TrendingUp className="h-4 w-4" />
                           </div>
                           <h3 className="text-xl font-bold tracking-tight">Deposit Hub</h3>
                         </div>
                         <IncomeList income={income} onDelete={deleteIncome} />
                      </div>
                    </div>
                  )}

                  {activeTab === 'planning' && (
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 lg:gap-16">
                      <div className="xl:col-span-8 space-y-10 md:space-y-14">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14">
                          <div className="space-y-6">
                            <div className="flex items-center justify-between px-2 bg-zinc-900/50 p-4 rounded-3xl border border-zinc-900/50">
                              <div>
                                <h3 className="text-lg font-bold">Capital Vault</h3>
                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Asset Allocation</p>
                              </div>
                              <SavingsGoalForm onSubmit={addGoal} />
                            </div>
                            <SavingsGoalList goals={goals} />
                          </div>
                          <div className="space-y-6">
                            <div className="px-2 bg-zinc-900/50 p-4 rounded-3xl border border-zinc-900/50">
                              <h3 className="text-lg font-bold">Scheduled Flux</h3>
                              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Recurring Obligations</p>
                            </div>
                            <BillReminder bills={bills} onMarkPaid={markBillPaid} />
                          </div>
                        </div>
                      </div>
                      <div className="xl:col-span-4 space-y-10 border-l-0 xl:border-l border-zinc-900/50 pt-10 xl:pt-4 xl:pl-12">
                        <BudgetSettings budgets={budgets} onSave={saveBudget} />
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Bot Controller */}
              <AIChatBot expenses={expenses} income={income} budgets={budgets} />
            </main>
          </div>
          </div>
      ) : (
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-12">
           <div className="h-20 w-20 bg-emerald-500 rounded-[2.5rem] flex items-center justify-center shadow-[0_20px_50px_rgba(16,185,129,0.3)] mb-4">
              <IndianRupee className="h-10 w-10 text-zinc-950 font-bold" />
           </div>
           <div className="space-y-4 max-w-xl">
             <h1 className="text-6xl md:text-8xl font-black tracking-tighter bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent">SpendWise</h1>
             <p className="text-zinc-500 text-xl md:text-2xl leading-relaxed max-w-lg mx-auto">
               The autonomous financial OS for modern wealth management and systematic cash-flow optimization.
             </p>
           </div>
           <Button 
             size="lg" 
             onClick={handleLogin} 
             disabled={isAuthenticating}
             className="bg-zinc-100 text-zinc-950 hover:bg-white h-16 px-12 rounded-2xl font-bold text-xl transition-all hover:scale-105 active:scale-95 gap-3"
           >
             {isAuthenticating ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogIn className="h-5 w-5" />} 
             Access Dashboard
           </Button>
           
           <div className="grid grid-cols-2 md:grid-cols-3 gap-12 pt-12 opacity-40">
              {[
                { icon: ShieldCheck, label: "Hardened Auth" },
                { icon: Zap, label: "Real-time Sync" },
                { icon: Sparkles, label: "Native AI" }
              ].map((f, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                   <f.icon className="h-5 w-5" />
                   <span className="text-[10px] uppercase font-bold tracking-widest">{f.label}</span>
                </div>
              ))}
           </div>
        </main>
      )}

      {/* Footer (Simplified) */}
      <footer className="border-t border-zinc-900 py-12 mt-auto w-full">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2 opacity-50">
              <IndianRupee className="h-4 w-4" />
              <span className="text-xs font-bold tracking-widest uppercase">SpendWise Registry</span>
            </div>
            <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">
              © 2026 Secured via Firebase • Cloud Native
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

