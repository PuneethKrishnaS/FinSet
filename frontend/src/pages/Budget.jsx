import React, { useState, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { PiTargetDuotone, PiPlus, PiFloppyDisk, PiTrash, PiCalendarDuotone, PiWarningCircleDuotone } from "react-icons/pi";
import useFinanceStore from '../store/useFinanceStore';
import { getIconForCategory } from '../utils/CategoryIcons';
import ConfirmDialog from '../components/ConfirmDialog';

// Circular Progress Component
const CircularProgress = ({ percentage, isOver, isWarning, size = 60, strokeWidth = 6 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (Math.min(percentage, 100) / 100) * circumference;
  
  let colorClass = 'text-primary';
  if (isOver) colorClass = 'text-destructive';
  else if (isWarning) colorClass = 'text-amber-500';

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="stroke-muted"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className={`${colorClass} transition-all duration-1000 ease-in-out`}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="none"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-foreground">
        {percentage > 999 ? '>999%' : `${percentage.toFixed(0)}%`}
      </div>
    </div>
  );
};

const Budget = () => {
  const { formatCurrency, currency } = useSettings();
  const { 
    budgets, budgetsLoaded, fetchBudgets, 
    expenses: storeExpenses, expensesLoaded, fetchExpenses, 
    categories, categoriesLoaded, fetchCategories,
    dataVersion, markDataDirty
  } = useFinanceStore();

  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const currencySymbol = new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).formatToParts(1).find(x => x.type === 'currency').value;

  useEffect(() => {
    fetchBudgets();
    fetchExpenses();
    fetchCategories();
  }, [fetchBudgets, fetchExpenses, fetchCategories, dataVersion]);

  useEffect(() => {
    if (categoriesLoaded && categories.length > 0 && !category) {
      setCategory(categories[0].name);
    }
  }, [categories, categoriesLoaded, category]);

  const loading = !budgetsLoaded || !expensesLoaded || !categoriesLoaded;

  const expensesSums = React.useMemo(() => {
    if (loading) return {};
    const currentMonthStr = new Date().toISOString().slice(0, 7);
    const currentMonthExpenses = storeExpenses.filter(e => e.date.startsWith(currentMonthStr));
    
    const sums = {};
    currentMonthExpenses.forEach(e => {
      sums[e.category] = (sums[e.category] || 0) + parseFloat(e.amount);
    });
    return sums;
  }, [loading, storeExpenses]);

  const handleCreateBudget = async (e) => {
    e.preventDefault();
    try {
      const firstDay = new Date().toISOString().slice(0, 8) + '01';
      await api.post('/budgets/', { category, amount: parseFloat(amount), month: firstDay });
      toast.success('Budget created!');
      setAmount('');
      markDataDirty();
    } catch (err) {
      toast.error('Failed to create budget.');
    }
  };

  const confirmDeleteBudget = (id) => {
    setDeleteConfirmId(id);
  };

  const handleDeleteBudget = async () => {
    if (!deleteConfirmId) return;
    try {
      await api.delete(`/budgets/${deleteConfirmId}/`);
      toast.success('Budget removed.');
      markDataDirty();
      setDeleteConfirmId(null);
    } catch (err) {
      toast.error('Failed to delete.');
      setDeleteConfirmId(null);
    }
  };

  const totalBudgeted = budgets.reduce((acc, b) => acc + parseFloat(b.amount), 0);
  const totalSpentInBudgets = budgets.reduce((acc, b) => acc + (expensesSums[b.category] || 0), 0);
  const totalRemaining = totalBudgeted - totalSpentInBudgets;

  const today = new Date();
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const daysLeft = lastDay.getDate() - today.getDate();

  return (
    <div className="flex flex-col w-full h-full pb-10">


      {/* Split Layout: 2/3 List, 1/3 Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Side: Budget List */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground bg-card rounded border border-border">Loading...</div>
          ) : budgets.length === 0 ? (
            <div className="bg-card border border-border rounded p-12 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                <Target size={32} className="text-muted-foreground/50" />
              </div>
              <p className="font-bold text-lg text-foreground mb-2">No budgets set</p>
              <p className="text-sm text-muted-foreground">Use the control panel to create your first monthly budget.</p>
            </div>
          ) : (
            budgets.map(b => {
              const limit = parseFloat(b.amount);
              const spent = expensesSums[b.category] || 0;
              const percentage = limit > 0 ? (spent / limit) * 100 : 0;
              const isOver = spent > limit;
              const isWarning = percentage >= 80 && !isOver;
              const catObj = categories.find(c => c.name.toLowerCase() === b.category.toLowerCase());
              const catLabel = catObj ? catObj.name : b.category;
              const icon = catObj ? getIconForCategory(catObj, 20) : <Target size={20} />;

              return (
                <div key={b.id} className="bg-card border border-border rounded p-5 flex items-center gap-5 hover: transition-shadow group">
                  
                  {/* Circular Gauge */}
                  <div className="shrink-0">
                    <CircularProgress percentage={percentage} isOver={isOver} isWarning={isWarning} />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="text-muted-foreground bg-muted/30 p-1.5 rounded">{icon}</div>
                      <span className="font-bold text-base text-foreground truncate">{catLabel}</span>
                      {isOver && <AlertCircle size={16} className="text-destructive shrink-0" />}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-baseline gap-1 truncate">
                      <span className={`font-bold ${isOver ? 'text-destructive' : 'text-foreground'}`}>
                        {formatCurrency(spent)}
                      </span> 
                      <span>spent of {formatCurrency(limit)}</span>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <button 
                      onClick={() => confirmDeleteBudget(b.id)}
                      className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={18} />
                    </button>
                    <div className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      isOver ? 'bg-destructive/10 text-destructive' : isWarning ? 'bg-amber-500/10 text-amber-600' : 'bg-emerald-500/10 text-emerald-600'
                    }`}>
                      {isOver ? `${formatCurrency(Math.abs(limit - spent))} over` : `${formatCurrency(limit - spent)} left`}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Side: Control Panel (Sticky) */}
        <div className="lg:sticky lg:top-6 flex flex-col gap-6">
          
          {/* Overview Panel */}
          <div className="bg-card border border-border rounded p-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50"></div>
            <div className="relative z-10">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 flex justify-between items-center">
                Month Overview
                <span className="flex items-center gap-1.5 text-primary bg-primary/10 px-2 py-1 rounded normal-case text-[11px]">
                  <Calendar size={14} /> {daysLeft} days left
                </span>
              </h3>
              
              <div className="mb-5">
                <div className="text-xs font-medium text-muted-foreground mb-1">Total Budgeted</div>
                <div className="text-3xl font-black text-foreground">{formatCurrency(totalBudgeted)}</div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="text-xs font-medium text-muted-foreground mb-1">Spent</div>
                  <div className="text-lg font-bold text-amber-500">{formatCurrency(totalSpentInBudgets)}</div>
                </div>
                <div className="flex-1 border-l border-border pl-4">
                  <div className="text-xs font-medium text-muted-foreground mb-1">Remaining</div>
                  <div className={`text-lg font-bold ${totalRemaining >= 0 ? 'text-emerald-500' : 'text-destructive'}`}>
                    {formatCurrency(Math.abs(totalRemaining))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Create Form Panel */}
          <div className="bg-card border border-border rounded p-6 ">
            <h3 className="text-base font-bold text-foreground mb-5 flex items-center gap-2">
              <Plus size={18} className="text-primary" /> Create Budget
            </h3>
            <form onSubmit={handleCreateBudget} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Category</label>
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-background border border-border rounded px-4 py-2.5 text-sm text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Monthly Limit</label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-muted-foreground font-bold">{currencySymbol}</span>
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-background border border-border rounded pl-10 pr-4 py-2.5 text-sm text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>
              <button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 rounded transition-colors  active:scale-[0.98]"
              >
                Save Budget
              </button>
            </form>
          </div>

        </div>
      </div>

      <ConfirmDialog 
        isOpen={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleDeleteBudget}
        title="Delete Budget"
        message="Are you sure you want to delete this budget rule?"
      />
    </div>
  );
};

export default Budget;
