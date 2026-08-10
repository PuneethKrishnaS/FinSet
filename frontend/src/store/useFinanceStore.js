import { create } from 'zustand';
import api from '../services/api';

const useFinanceStore = create((set, get) => ({
  dataVersion: 0,
  markDataDirty: () => {
    set(state => ({ dataVersion: state.dataVersion + 1 }));
    const store = get();
    // Background silent refetch for already loaded data
    if (store.dashboardLoaded) store.fetchDashboard(true);
    if (store.debtsLoaded) store.fetchDebts(true);
    if (store.budgetsLoaded) store.fetchBudgets(true);
    if (store.chitFundsLoaded) store.fetchChitFunds(true);
    if (store.incomesLoaded) store.fetchIncomes(true);
    if (store.expensesLoaded) store.fetchExpenses(true);
  },

  fetchAll: () => {
    const store = get();
    store.fetchDashboard();
    store.fetchDebts();
    store.fetchBudgets();
    store.fetchChitFunds();
    store.fetchIncomes();
    store.fetchExpenses();
    store.fetchCategories();
  },

  dashboardData: null,
  dashboardLoaded: false,
  fetchDashboard: async (force = false) => {
    if (get().dashboardLoaded && !force) return;
    try {
      // Process recurring before dashboard fetch
      try {
        await api.post('/process-recurring/');
      } catch (e) {
        console.error('Failed to process recurring:', e);
      }
      const res = await api.get('/dashboard/');
      set({ dashboardData: res.data, dashboardLoaded: true });
    } catch (e) {
      console.error(e);
    }
  },

  debts: [],
  debtsLoaded: false,
  fetchDebts: async (force = false) => {
    if (get().debtsLoaded && !force) return;
    try {
      const res = await api.get('/debts/');
      set({ debts: res.data, debtsLoaded: true });
    } catch (e) {
      console.error(e);
    }
  },

  budgets: [],
  budgetsLoaded: false,
  fetchBudgets: async (force = false) => {
    if (get().budgetsLoaded && !force) return;
    try {
      const res = await api.get('/budgets/');
      set({ budgets: res.data, budgetsLoaded: true });
    } catch (e) {
      console.error(e);
    }
  },

  chitFunds: [],
  chitFundsLoaded: false,
  fetchChitFunds: async (force = false) => {
    if (get().chitFundsLoaded && !force) return;
    try {
      const res = await api.get('/chit-funds/');
      set({ chitFunds: res.data, chitFundsLoaded: true });
    } catch (e) {
      console.error(e);
    }
  },

  incomes: [],
  incomesLoaded: false,
  fetchIncomes: async (force = false) => {
    if (get().incomesLoaded && !force) return;
    try {
      const res = await api.get('/incomes/');
      set({ incomes: res.data, incomesLoaded: true });
    } catch (e) {
      console.error(e);
    }
  },

  expenses: [],
  expensesLoaded: false,
  fetchExpenses: async (force = false) => {
    if (get().expensesLoaded && !force) return;
    try {
      const res = await api.get('/expenses/');
      set({ expenses: res.data, expensesLoaded: true });
    } catch (e) {
      console.error(e);
    }
  },

  categories: [],
  categoriesLoaded: false,
  fetchCategories: async (force = false) => {
    if (get().categoriesLoaded && !force) return;
    try {
      const res = await api.get('/categories/');
      set({ categories: res.data, categoriesLoaded: true });
    } catch (e) {
      console.error(e);
    }
  },

  clearCache: () => {
    set({
      dashboardLoaded: false,
      debtsLoaded: false,
      budgetsLoaded: false,
      chitFundsLoaded: false,
      incomesLoaded: false,
      expensesLoaded: false,
      categoriesLoaded: false,
      dashboardData: null,
      debts: [],
      budgets: [],
      chitFunds: [],
      incomes: [],
      expenses: [],
      categories: []
    });
  }
}));

export default useFinanceStore;
