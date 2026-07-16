/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';

export interface Category {
  id: number;
  name: string;
  type: 'income' | 'expense';
  icon: string | null;
  color: string | null;
  monthlyLimit: number | null;
  isDefault: boolean;
}

export interface Transaction {
  id: number;
  amount: number;
  type: 'income' | 'expense';
  categoryId: number;
  note: string | null;
  date: string;
  imageUrl?: string | null;
  savingLocation?: string | null;
  createdAt: string;
  categoryName: string | null;
  categoryIcon: string | null;
  categoryColor: string | null;
}

export interface Stats {
  balance: number;
  income: number;
  expense: number;
  byCategory: Array<{
    categoryId: number;
    categoryName: string;
    categoryColor: string | null;
    categoryIcon: string | null;
    total: number;
  }>;
  dailyTotals: Array<{
    date: string;
    type: 'income' | 'expense';
    total: number;
  }>;
  lastTransactions: Array<{
    id: number;
    amount: number;
    type: 'income' | 'expense';
    note: string | null;
    date: string;
    categoryName: string | null;
    categoryIcon: string | null;
    categoryColor: string | null;
  }>;
}

export interface Goal {
  id: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  dueDate: string;
  savingLocation: string; // 'bank_account' | 'pocket' | 'virtual_card' | 'cash' | 'other'
  icon: string | null;
  color: string | null;
  createdAt: string;
}

interface AppState {
  categories: Category[];
  stats: Stats | null;
  loading: boolean;
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  fetchCategories: () => Promise<void>;
  fetchStats: () => Promise<void>;
  addTransaction: (data: {
    amount: number;
    type: 'income' | 'expense';
    categoryId: number;
    note?: string;
    date?: string;
    imageUrl?: string | null;
    savingLocation?: string | null;
  }) => Promise<void>;

  // Navigation
  activeTab: 'home' | 'analysis' | 'transactions' | 'categories' | 'profile';
  subView: 'login' | 'register' | 'add-expense' | 'search' | 'calendar' | 'subscriptions' | 'goals' | null;
  setActiveTab: (tab: 'home' | 'analysis' | 'transactions' | 'categories' | 'profile') => void;
  setSubView: (view: 'login' | 'register' | 'add-expense' | 'search' | 'calendar' | 'subscriptions' | 'goals' | null) => void;

  // Mock Auth
  user: { name: string; email: string; phone?: string; dob?: string; avatar?: string } | null;
  loginUser: (email: string) => Promise<boolean>;
  registerUser: (name: string, email: string, phone?: string, dob?: string) => Promise<boolean>;
  updateUserAvatar: (base64Data: string) => void;
  logoutUser: () => void;

  // Prefilled category
  prefilledCategoryId: number | null;
  setPrefilledCategoryId: (id: number | null) => void;

  // Editing transaction
  editingTransaction: Transaction | null;
  setEditingTransaction: (tx: Transaction | null) => void;

  // Transactions full list
  transactions: Transaction[];
  fetchTransactions: () => Promise<void>;
  updateTransaction: (id: number, data: {
    amount: number;
    type: 'income' | 'expense';
    categoryId: number;
    note?: string;
    date?: string;
    imageUrl?: string | null;
    savingLocation?: string | null;
  }) => Promise<void>;
  deleteTransaction: (id: number) => Promise<void>;

  // Subscriptions CRUD
  subscriptions: any[];
  fetchSubscriptions: () => Promise<void>;
  addSubscription: (data: {
    name: string;
    amount: number;
    type: string;
    categoryId: number;
    dueDate: string;
  }) => Promise<void>;
  updateSubscription: (id: number, data: any) => Promise<void>;
  deleteSubscription: (id: number) => Promise<void>;
  confirmSubscriptionPayment: (id: number) => Promise<void>;

  // Goals CRUD
  goals: Goal[];
  fetchGoals: () => Promise<void>;
  addGoal: (data: {
    name: string;
    targetAmount: number;
    currentAmount?: number;
    dueDate: string;
    savingLocation: string;
    icon?: string;
    color?: string;
  }) => Promise<void>;
  updateGoal: (id: number, data: any) => Promise<void>;
  deleteGoal: (id: number) => Promise<void>;
  contributeToGoal: (id: number, amountCents: number) => Promise<void>;
  userCurrency: string;
  setUserCurrency: (code: string) => void;
  monthlyBudget: number;
  setMonthlyBudget: (amountCents: number) => void;
}

const getStoredUser = () => {
  if (typeof window !== 'undefined') {
    const u = localStorage.getItem('finwise_user');
    if (u) {
      try { return JSON.parse(u); } catch { return null; }
    }
  }
  return null;
};

export const useStore = create<AppState>((set, get) => ({
  categories: [],
  stats: null,
  loading: false,
  showModal: false,
  prefilledCategoryId: null,
  editingTransaction: null,
  transactions: [],
  subscriptions: [],
  goals: [],

  // Navigation Defaults
  activeTab: 'home',
  subView: getStoredUser() ? null : 'login',

  userCurrency: (typeof window !== 'undefined' ? localStorage.getItem('finwise_user_currency') : null) || 'COP',
  setUserCurrency: (code) => {
    localStorage.setItem('finwise_user_currency', code);
    set({ userCurrency: code });
  },
  monthlyBudget: (typeof window !== 'undefined' ? Number(localStorage.getItem('finwise_monthly_budget')) : 0) || 2000000,
  setMonthlyBudget: (amountCents) => {
    localStorage.setItem('finwise_monthly_budget', String(amountCents));
    set({ monthlyBudget: amountCents });
  },

  // Mock Auth Initial State
  user: getStoredUser(),

  setShowModal: (show) => set({ showModal: show }),

  setPrefilledCategoryId: (id) => set({ prefilledCategoryId: id }),
  setEditingTransaction: (tx) => set({ editingTransaction: tx }),

  fetchCategories: async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      set({ categories: Array.isArray(data) ? data : [] });
    } catch (e) {
      console.error('Failed to fetch categories', e);
      set({ categories: [] });
    }
  },

  fetchStats: async () => {
    set({ loading: true });
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      set({ stats: data, loading: false });
    } catch (e) {
      console.error('Failed to fetch stats', e);
      set({ loading: false });
    }
  },

  fetchTransactions: async () => {
    try {
      const res = await fetch('/api/transactions');
      const data = await res.json();
      set({ transactions: Array.isArray(data) ? data : [] });
    } catch (e) {
      console.error('Failed to fetch transactions', e);
      set({ transactions: [] });
    }
  },

  addTransaction: async (data) => {
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to add transaction');
    get().fetchStats();
    get().fetchCategories();
    get().fetchTransactions();
  },

  updateTransaction: async (id, data) => {
    const res = await fetch(`/api/transactions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update transaction');
    get().fetchStats();
    get().fetchCategories();
    get().fetchTransactions();
  },

  deleteTransaction: async (id) => {
    const res = await fetch(`/api/transactions/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete transaction');
    get().fetchStats();
    get().fetchCategories();
    get().fetchTransactions();
  },

  fetchSubscriptions: async () => {
    try {
      const res = await fetch('/api/subscriptions');
      const data = await res.json();
      set({ subscriptions: Array.isArray(data) ? data : [] });
    } catch (e) {
      console.error('Failed to fetch subscriptions', e);
      set({ subscriptions: [] });
    }
  },

  addSubscription: async (data) => {
    const res = await fetch('/api/subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to add subscription');
    get().fetchSubscriptions();
    get().fetchStats();
  },

  updateSubscription: async (id, data) => {
    const res = await fetch(`/api/subscriptions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update subscription');
    get().fetchSubscriptions();
    get().fetchStats();
    get().fetchTransactions();
  },

  deleteSubscription: async (id) => {
    const res = await fetch(`/api/subscriptions/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete subscription');
    get().fetchSubscriptions();
    get().fetchStats();
  },

  confirmSubscriptionPayment: async (id) => {
    const res = await fetch(`/api/subscriptions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'confirm_payment' }),
    });
    if (!res.ok) throw new Error('Failed to confirm subscription payment');
    get().fetchSubscriptions();
    get().fetchStats();
    get().fetchTransactions();
  },

  fetchGoals: async () => {
    try {
      const res = await fetch('/api/goals');
      const data = await res.json();
      set({ goals: Array.isArray(data) ? data : [] });
    } catch (e) {
      console.error('Failed to fetch goals', e);
      set({ goals: [] });
    }
  },

  addGoal: async (data) => {
    const res = await fetch('/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to add goal');
    get().fetchGoals();
  },

  updateGoal: async (id, data) => {
    const res = await fetch(`/api/goals/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update goal');
    get().fetchGoals();
  },

  deleteGoal: async (id) => {
    const res = await fetch(`/api/goals/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete goal');
    get().fetchGoals();
  },

  contributeToGoal: async (id, amountCents) => {
    const goal = get().goals.find(g => g.id === id);
    if (!goal) return;

    const newAmount = goal.currentAmount + amountCents;
    await get().updateGoal(id, { currentAmount: newAmount });

    const cat = get().categories.find(c => c.name === 'Otros Gastos' && c.type === 'expense') || 
                get().categories.find(c => c.type === 'expense');
    if (cat) {
      await get().addTransaction({
        amount: amountCents,
        type: 'expense',
        categoryId: cat.id,
        note: `Aporte a meta: ${goal.name}`,
        date: new Date().toISOString().split('T')[0],
      });
    }
  },

  setActiveTab: (tab) => set({ activeTab: tab, subView: null }),
  setSubView: (view) => set({ subView: view }),

  loginUser: async (email) => {
    const accountsRaw = localStorage.getItem('finwise_accounts');
    const accounts = accountsRaw ? JSON.parse(accountsRaw) : [];
    const found = accounts.find((a: any) => a.email.toLowerCase() === email.toLowerCase());
    
    if (found) {
      localStorage.setItem('finwise_user', JSON.stringify(found));
      set({ user: found, subView: null, activeTab: 'home' });
      return true;
    }
    const newUser = { name: email.split('@')[0], email };
    accounts.push(newUser);
    localStorage.setItem('finwise_accounts', JSON.stringify(accounts));
    localStorage.setItem('finwise_user', JSON.stringify(newUser));
    set({ user: newUser, subView: null, activeTab: 'home' });
    return true;
  },

  registerUser: async (name, email, phone, dob) => {
    const accountsRaw = localStorage.getItem('finwise_accounts');
    const accounts = accountsRaw ? JSON.parse(accountsRaw) : [];
    const exists = accounts.some((a: any) => a.email.toLowerCase() === email.toLowerCase());
    
    if (exists) {
      const found = accounts.find((a: any) => a.email.toLowerCase() === email.toLowerCase());
      localStorage.setItem('finwise_user', JSON.stringify(found));
      set({ user: found, subView: null, activeTab: 'home' });
      return true;
    }

    const newUser = { name, email, phone, dob };
    accounts.push(newUser);
    localStorage.setItem('finwise_accounts', JSON.stringify(accounts));
    localStorage.setItem('finwise_user', JSON.stringify(newUser));
    set({ user: newUser, subView: null, activeTab: 'home' });
    return true;
  },

  updateUserAvatar: (base64Data: string) => {
    const { user } = get();
    if (!user) return;
    const updatedUser = { ...user, avatar: base64Data };

    localStorage.setItem('finwise_user', JSON.stringify(updatedUser));

    const accountsRaw = localStorage.getItem('finwise_accounts');
    const accounts = accountsRaw ? JSON.parse(accountsRaw) : [];
    const updatedAccounts = accounts.map((acc: any) =>
      acc.email.toLowerCase() === user.email.toLowerCase() ? { ...acc, avatar: base64Data } : acc
    );
    localStorage.setItem('finwise_accounts', JSON.stringify(updatedAccounts));

    set({ user: updatedUser });
  },

  logoutUser: () => {
    localStorage.removeItem('finwise_user');
    set({ user: null, subView: 'login', activeTab: 'home' });
  },
}));
