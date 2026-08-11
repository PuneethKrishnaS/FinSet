import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  Save, Briefcase, TrendingUp, History, ArrowRight, MoreHorizontal
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', margin: '0 auto', maxWidth: '100%', boxSizing: 'border-box', padding: '0 0.5rem' }}>
      <header className="responsive-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="header-title">Transactions</h1>
          <p className="header-subtitle">Record a new expense or income</p>
        </div>
      </header>

      <div className="responsive-grid-2-1" style={{ alignItems: 'start' }}>

        {/* Left Column: Log Form */}
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>

          {/* Header Toggle */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)' }}>
            <button
              type="button"
              onClick={() => { setType('expense'); }}
              style={{
                flex: 1, padding: '1rem', border: 'none', background: type === 'expense' ? 'var(--bg-panel)' : 'var(--bg-main)',
                color: type === 'expense' ? 'var(--primary-color)' : 'var(--text-muted)',
                fontWeight: type === 'expense' ? '700' : '500', fontSize: '0.95rem', cursor: 'pointer',
                borderBottom: type === 'expense' ? '2px solid var(--primary-color)' : '2px solid transparent',
                transition: 'all 0.2s'
              }}
            >
              Add Expense
            </button>
            <button
              type="button"
              onClick={() => { setType('income'); }}
              style={{
                flex: 1, padding: '1rem', border: 'none', background: type === 'income' ? 'var(--bg-panel)' : 'var(--bg-main)',
                color: type === 'income' ? 'var(--success)' : 'var(--text-muted)',
                fontWeight: type === 'income' ? '700' : '500', fontSize: '0.95rem', cursor: 'pointer',
                borderBottom: type === 'income' ? '2px solid var(--success)' : '2px solid transparent',
                transition: 'all 0.2s'
              }}
            >
              Add Income
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>

            {/* Amount Input */}
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '0.25rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Enter Amount
              </label>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                <span style={{ fontSize: '1.75rem', fontWeight: '800', color: type === 'expense' ? 'var(--text-main)' : 'var(--success)' }}>{currencySymbol}</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="amount-input"
                  style={{
                    fontSize: '2.5rem', fontWeight: '800', border: 'none', background: 'transparent',
                    width: amount ? `calc(${amount.length}ch + 15px)` : '2ch',
                    color: type === 'expense' ? 'var(--text-main)' : 'var(--success)',
                    outline: 'none', textAlign: 'center', padding: 0
                  }}
                />
              </div>
              
              {/* Number in words */}
              {amount > 0 && (
                <div style={{ textAlign: 'center', marginTop: '0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', opacity: 0.8 }}>
                  {numberToWords(parseFloat(amount), currency)}
                </div>
              )}
            </div>

            <div className="responsive-grid-2" style={{ marginBottom: '2rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)', fontWeight: '600', fontSize: '0.85rem' }}>Date</label>
                <input
                  type="date"
                  className="input-field"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  style={{ padding: '0.75rem', background: 'var(--bg-main)', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)', fontWeight: '600', fontSize: '0.85rem' }}>
                  {type === 'expense' ? 'Note / Description' : 'Note (Optional)'}
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="What was this for?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required={type === 'expense' && category === 'other'}
                  style={{ padding: '0.75rem', background: 'var(--bg-main)', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            {/* Category Selector */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)', fontWeight: '600', fontSize: '0.85rem' }}>
                Select Category
              </label>

              {type === 'expense' ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                  {categories.map((c, index) => {
                    const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#F1948A', '#A9DFBF', '#F5B041'];
                    const color = COLORS[index % COLORS.length];
                    const isSelected = category === c.name;
                    return (
                      <div
                        key={c.id}
                        onClick={() => setCategory(c.name)}
                        style={{
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem',
                          padding: '0.75rem 0.25rem', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                          background: isSelected ? `${color}1A` : 'var(--bg-main)',
                          border: `2px solid ${isSelected ? color : 'transparent'}`,
                          transition: 'all 0.2s',
                          boxShadow: isSelected ? 'none' : 'inset 0 0 0 1px var(--border-color)'
                        }}
                      >
                        <div style={{
                          width: '32px', height: '32px', borderRadius: '50%',
                          background: isSelected ? color : '#fff',
                          color: isSelected ? '#fff' : color,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          boxShadow: isSelected ? `0 2px 8px rgba(0,0,0,0.2)` : 'var(--shadow-sm)'
                        }}>
                          {getIconForCategory(c, 16)}
                        </div>
                        <span style={{ fontSize: '0.7rem', fontWeight: isSelected ? '700' : '500', color: isSelected ? 'var(--text-main)' : 'var(--text-muted)', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
                          {c.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                  {INCOME_SOURCES.map((c) => {
                    const Icon = c.icon;
                    const isSelected = incomeSource === c.value;
                    return (
                      <div
                        key={c.value}
                        onClick={() => setIncomeSource(c.value)}
                        style={{
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem',
                          padding: '0.75rem 0.25rem', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                          background: isSelected ? `${c.color}15` : 'var(--bg-main)',
                          border: `2px solid ${isSelected ? c.color : 'transparent'}`,
                          transition: 'all 0.2s',
                          boxShadow: isSelected ? 'none' : 'inset 0 0 0 1px var(--border-color)'
                        }}
                      >
                        <div style={{
                          width: '32px', height: '32px', borderRadius: '50%',
                          background: isSelected ? c.color : '#fff',
                          color: isSelected ? '#fff' : c.color,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          boxShadow: isSelected ? `0 2px 8px ${c.color}40` : 'var(--shadow-sm)'
                        }}>
                          <Icon size={16} />
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: isSelected ? '700' : '500', color: isSelected ? 'var(--text-main)' : 'var(--text-muted)' }}>
                          {c.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-sm)' }}>
              <input
                type="checkbox"
                id="recurringCheck"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: 'var(--primary-color)', cursor: 'pointer' }}
              />
              <label htmlFor="recurringCheck" style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: '600', cursor: 'pointer' }}>
                Mark as Recurring (automatically log this every month)
              </label>
            </div>

            <button
              type="submit"
              className="btn"
              disabled={submitting}
              style={{
                width: '100%',
                padding: '0.85rem',
                fontSize: '0.95rem',
                fontWeight: 700,
                borderRadius: 'var(--radius-md)',
                background: type === 'expense' ? 'var(--primary-color)' : 'var(--success)',
                boxShadow: type === 'expense' ? '0 4px 14px -2px rgba(124, 58, 237, 0.4)' : '0 4px 14px -2px rgba(16, 185, 129, 0.4)'
              }}
            >
              <Save size={16} style={{ marginRight: '0.5rem' }} />
              {submitting ? 'Processing...' : `Confirm ${type === 'expense' ? 'Expense' : 'Income'}`}
            </button>
          </form>
        </div>

        {/* Right Column: Mini History Feed */}
        <div style={{ position: 'sticky', top: '1rem' }}>
          <div className="card" style={{ padding: '1.5rem', height: 'fit-content' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                <History size={16} className="text-primary" /> Recent Activity
              </h3>
              <button
                onClick={() => navigate('/history')}
                style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
              >
                View All <ArrowRight size={12} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {recentTransactions.length === 0 ? (
                <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
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
                    if (catObj) { iconElement = getIconForCategory(catObj, 16); bgColor = 'var(--primary-color)'; }
                  }

                  return (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1rem', borderBottom: idx !== recentTransactions.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: `${bgColor}15`, color: bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {iconElement}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {t.displayTitle}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t.date}</div>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: isInc ? 'var(--success)' : 'var(--text-main)' }}>
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
