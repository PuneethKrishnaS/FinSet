import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  Save, Briefcase, TrendingUp, History, ArrowRight, MoreHorizontal, Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useSettings } from '../context/SettingsContext';
import useFinanceStore from '../store/useFinanceStore';
import { getCategoryIcon, getIconForCategory } from '../utils/CategoryIcons';
import { numberToWords } from '../utils/numberToWords';

const INCOME_SOURCES = [
  { value: 'salary', label: 'Salary', icon: Briefcase, color: '#10b981' },
  { value: 'investment', label: 'Investment', icon: TrendingUp, color: '#3b82f6' },
  { value: 'other', label: 'Other', icon: MoreHorizontal, color: '#64748b' },
];

const LogTransaction = () => {
  const [type, setType] = useState('expense'); // 'income' or 'expense'
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('');
  const [incomeSource, setIncomeSource] = useState('salary');
  const [description, setDescription] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const { fetchIncomes, fetchExpenses, markDataDirty, categories, categoriesLoaded, fetchCategories, incomes, incomesLoaded, expenses, expensesLoaded } = useFinanceStore();

  const { currency, formatCurrency } = useSettings();
  const currencySymbol = new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).formatToParts(1).find(x => x.type === 'currency').value;
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
    fetchIncomes();
    fetchExpenses();
  }, [fetchCategories, fetchIncomes, fetchExpenses]);

  // Default category selection
  useEffect(() => {
    if (categoriesLoaded && categories.length > 0 && !category) {
      setCategory(categories[0].name);
    }
  }, [categories, categoriesLoaded, category]);

  const recentTransactions = React.useMemo(() => {
    if (!incomesLoaded || !expensesLoaded) return [];
    const mappedIncomes = incomes.map(i => ({ ...i, type: 'income', displayTitle: i.source }));
    const mappedExpenses = expenses.map(e => ({ ...e, type: 'expense', displayTitle: e.description || e.category }));
    return [...mappedIncomes, ...mappedExpenses].sort((a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date)).slice(0, 5);
  }, [incomes, expenses, incomesLoaded, expensesLoaded]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (type === 'income') {
        await api.post('/incomes/', {
          source: incomeSource === 'other' ? description || 'Other Income' : INCOME_SOURCES.find(i => i.value === incomeSource).label,
          amount: parseFloat(amount),
          date: date,
          is_recurring: isRecurring
        });
        toast.success('Income logged successfully!');
      } else {
        await api.post('/expenses/', {
          category: category,
          description: description || category,
          amount: parseFloat(amount),
          date: date,
          is_recurring: isRecurring
        });
        toast.success('Expense logged successfully!');
      }

      setAmount('');
      setDescription('');
      
      // Force global refresh of data
      markDataDirty();
    } catch (err) {
      toast.error('Failed to log transaction. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid = amount && parseFloat(amount) > 0 && date && (type === 'income' || category);

  return (
    <div className="flex flex-col w-full h-full pb-10">
      


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* Left Column: Log Form */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border  overflow-hidden">
          
          {/* Header Toggle */}
          <div className="flex border-b border-border bg-muted/30">
            <button
              type="button"
              onClick={() => { setType('expense'); }}
              className={`flex-1 py-4 text-center font-bold text-sm transition-colors border-b-2 ${
                type === 'expense' 
                  ? 'border-primary text-primary bg-card' 
                  : 'border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              }`}
            >
              Add Expense
            </button>
            <button
              type="button"
              onClick={() => { setType('income'); }}
              className={`flex-1 py-4 text-center font-bold text-sm transition-colors border-b-2 ${
                type === 'income' 
                  ? 'border-emerald-500 text-emerald-500 bg-card' 
                  : 'border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              }`}
            >
              Add Income
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 md:p-8 space-y-8">
            
            {/* Amount Input */}
            <div className="flex flex-col items-center justify-center">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Enter Amount</label>
              <div className="flex items-center justify-center text-4xl md:text-6xl font-black">
                <span className={`${type === 'expense' ? 'text-foreground' : 'text-emerald-500'}`}>{currencySymbol}</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={`bg-transparent border-none outline-none text-center p-0 ml-1 appearance-none ${type === 'expense' ? 'text-foreground' : 'text-emerald-500'}`}
                  style={{ width: amount ? `calc(${amount.length}ch + 0.5ch)` : '1.5ch', maxWidth: '100%' }}
                />
              </div>
              
              {/* Number in words */}
              {amount > 0 && (
                <div className="mt-2 text-xs text-muted-foreground font-medium italic opacity-80 text-center">
                  {numberToWords(parseFloat(amount), currency)}
                </div>
              )}
            </div>

            {/* Date & Note Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">
                  {type === 'expense' ? 'Note / Description' : 'Note (Optional)'}
                </label>
                <input
                  type="text"
                  placeholder="What was this for?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required={type === 'expense' && category === 'other'}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>
            </div>

            {/* Category Selector */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground">
                Select {type === 'expense' ? 'Category' : 'Source'}
              </label>

              {type === 'expense' ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {categories.map((c, index) => {
                    const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#f43f5e'];
                    const color = COLORS[index % COLORS.length];
                    const isSelected = category === c.name;
                    return (
                      <div
                        key={c.id}
                        onClick={() => setCategory(c.name)}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl cursor-pointer transition-all border-2 select-none ${
                          isSelected ? 'bg-primary/5 border-primary ' : 'bg-muted/30 border-transparent hover:bg-muted/60'
                        }`}
                      >
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center  mb-2 transition-transform duration-200"
                          style={{ 
                            backgroundColor: isSelected ? color : 'var(--card)', 
                            color: isSelected ? '#fff' : color,
                            transform: isSelected ? 'scale(1.1)' : 'scale(1)'
                          }}
                        >
                          {getIconForCategory(c, 18)}
                        </div>
                        <span className={`text-[11px] text-center font-bold w-full truncate ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>
                          {c.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {INCOME_SOURCES.map((c) => {
                    const Icon = c.icon;
                    const isSelected = incomeSource === c.value;
                    return (
                      <div
                        key={c.value}
                        onClick={() => setIncomeSource(c.value)}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl cursor-pointer transition-all border-2 select-none ${
                          isSelected ? 'bg-emerald-500/5 border-emerald-500 ' : 'bg-muted/30 border-transparent hover:bg-muted/60'
                        }`}
                      >
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center  mb-2 transition-transform duration-200"
                          style={{ 
                            backgroundColor: isSelected ? c.color : 'var(--card)', 
                            color: isSelected ? '#fff' : c.color,
                            transform: isSelected ? 'scale(1.1)' : 'scale(1)'
                          }}
                        >
                          <Icon size={20} />
                        </div>
                        <span className={`text-xs text-center font-bold w-full truncate ${isSelected ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                          {c.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Recurring Toggle */}
            <label className="flex items-center gap-3 p-4 bg-muted/40 rounded-xl cursor-pointer hover:bg-muted/60 transition-colors border border-border/50">
              <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors border ${isRecurring ? 'bg-primary border-primary' : 'bg-background border-input'}`}>
                {isRecurring && <Check size={14} className="text-primary-foreground" />}
              </div>
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="hidden"
              />
              <span className="text-sm font-semibold text-foreground select-none">
                Mark as Recurring <span className="text-muted-foreground font-medium ml-1">(log automatically every month)</span>
              </span>
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || !isFormValid}
              className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl text-base font-bold text-white transition-all  active:scale-[0.98] ${
                !isFormValid || submitting 
                  ? 'bg-muted-foreground/40 cursor-not-allowed shadow-none'
                  : type === 'expense' 
                    ? 'bg-primary hover:bg-primary/90 hover:shadow-primary/25 ' 
                    : 'bg-emerald-500 hover:bg-emerald-600 hover:shadow-emerald-500/25 '
              }`}
            >
              <Save size={18} />
              {submitting ? 'Processing...' : `Confirm ${type === 'expense' ? 'Expense' : 'Income'}`}
            </button>
            
          </form>
        </div>

        {/* Right Column: Mini History Feed */}
        <div className="lg:sticky lg:top-6">
          <div className="bg-card rounded-2xl border border-border p-5 md:p-6 ">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <History size={18} className="text-primary" /> Recent Activity
              </h3>
              <button
                onClick={() => navigate('/history')}
                className="text-xs font-bold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
              >
                View All <ArrowRight size={14} />
              </button>
            </div>

            <div className="space-y-4">
              {recentTransactions.length === 0 ? (
                <div className="py-8 text-center text-sm font-medium text-muted-foreground bg-muted/20 rounded-xl">
                  No recent transactions found.
                </div>
              ) : (
                recentTransactions.map((t, idx) => {
                  const isInc = t.type === 'income';
                  let iconElement = <MoreHorizontal size={16} />;
                  let bgColor = '#64748b';

                  if (isInc) {
                    const sourceObj = INCOME_SOURCES.find(s => s.value === t.source.toLowerCase()) || INCOME_SOURCES.find(s => s.label.toLowerCase() === t.source.toLowerCase());
                    if (sourceObj) { iconElement = <sourceObj.icon size={16} />; bgColor = sourceObj.color; }
                  } else {
                    const catObj = categories.find(c => c.name.toLowerCase() === t.category.toLowerCase());
                    if (catObj) { iconElement = getIconForCategory(catObj, 16); bgColor = 'var(--primary)'; }
                  }

                  return (
                    <div key={idx} className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" 
                        style={{ backgroundColor: isInc ? '#10b98115' : 'var(--primary-light, rgba(59, 130, 246, 0.1))', color: isInc ? '#10b981' : 'var(--primary)' }}
                      >
                        {iconElement}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-foreground truncate">{t.displayTitle}</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">{t.date}</div>
                      </div>
                      <div className={`font-bold text-sm ${isInc ? 'text-emerald-500' : 'text-foreground'}`}>
                        {isInc ? '+' : '-'}{formatCurrency(t.amount)}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LogTransaction;
