export type Category = 
  | 'Food' 
  | 'Rent' 
  | 'Entertainment' 
  | 'Transport' 
  | 'Shopping' 
  | 'Health' 
  | 'Utilities' 
  | 'Savings' 
  | 'Investments' 
  | 'Other';

export type PaymentMethod = 'Cash' | 'Card' | 'UPI' | 'Bank Transfer';

export interface Expense {
  id: string;
  amount: number;
  category: Category;
  description: string;
  date: string;
  userId: string;
  userEmail: string;
  userName: string;
  paymentMethod: PaymentMethod;
  isRecurring: boolean;
}

export interface Income {
  id: string;
  amount: number;
  source: string;
  date: string;
  userId: string;
}

export interface Budget {
  id: string;
  category: Category | 'Total';
  amount: number;
  userId: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  userId: string;
}

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  category: string;
  isPaid: boolean;
  userId: string;
}
