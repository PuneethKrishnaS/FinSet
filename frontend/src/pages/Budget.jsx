import React, { useState, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Target, Plus, Save, Trash2, Calendar, AlertCircle } from 'lucide-react';
import useFinanceStore from '../store/useFinanceStore';
import { getCategoryIcon, getIconForCategory } from '../utils/CategoryIcons';
import ConfirmDialog from '../components/ConfirmDialog';

// Circular Progress Component
const CircularProgress = ({ percentage, isOver, isWarning, size = 60, strokeWidth = 6 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (Math.min(percentage, 100) / 100) * circumference;
  const color = isOver ? 'var(--danger)' : isWarning ? '#f59e0b' : 'var(--primary-color)';

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--bg-main)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="none"
          style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
        />
      </svg>
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-main)' }}>
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
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', fontSize: '0.85rem', width: '100%' }}>
      <header className="responsive-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 className="header-title">Budgets</h1>
          <p className="header-subtitle">Track your spending against goals</p>
        </div>
      </header>

      {/* Split Layout: 2/3 List, 1/3 Sidebar */}
      <div className="responsive-grid-2-1" style={{ alignItems: 'start' }}>
        
        {/* Left Side: Budget List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
          ) : budgets.length === 0 ? (
            <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Target size={32} style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
              <p style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-main)' }}>No budgets set</p>
              <p style={{ fontSize: '0.85rem' }}>Use the control panel to create your first budget.</p>
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
              const icon = catObj ? getIconForCategory(catObj, 18) : <Target size={18} />;

              return (
                <div key={b.id} className="card interactive-table" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1.5rem', transition: 'transform 0.2s, box-shadow 0.2s' }}>
                  
                  {/* Circular Gauge */}
                  <CircularProgress percentage={percentage} isOver={isOver} isWarning={isWarning} />

                  {/* Details */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <div style={{ color: 'var(--text-light)' }}>{icon}</div>
                      <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-main)' }}>{catLabel}</span>
                      {isOver && <AlertCircle size={14} color="var(--danger)" style={{ marginLeft: '0.5rem' }} />}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      <span style={{ fontWeight: 600, color: isOver ? 'var(--danger)' : 'var(--text-main)' }}>{formatCurrency(spent)}</span> spent of {formatCurrency(limit)}
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                    <button 
                      onClick={() => confirmDeleteBudget(b.id)}
                      style={{ background: 'var(--bg-main)', color: 'var(--text-light)', border: 'none', padding: '0.4rem', borderRadius: '50%', cursor: 'pointer', transition: 'all 0.2s' }}
                      onMouseOver={(e) => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.background = 'var(--danger-light)'; }}
                      onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-light)'; e.currentTarget.style.background = 'var(--bg-main)'; }}
                    >
                      <Trash2 size={16} />
                    </button>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: isOver ? 'var(--danger)' : isWarning ? '#f59e0b' : 'var(--success)' }}>
                      {isOver ? `${formatCurrency(Math.abs(limit - spent))} over` : `${formatCurrency(limit - spent)} left`}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Side: Control Panel (Sticky) */}
        <div style={{ position: 'sticky', top: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Overview Panel */}
          <div className="card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, var(--bg-panel) 0%, var(--bg-main) 100%)' }}>
            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
              Month Overview
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--primary-color)', fontWeight: 600, textTransform: 'none' }}>
                <Calendar size={14} /> {daysLeft} days left
              </span>
            </h3>
            
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: '0.2rem' }}>Total Budgeted</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>{formatCurrency(totalBudgeted)}</div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: '0.2rem' }}>Spent</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f59e0b' }}>{formatCurrency(totalSpentInBudgets)}</div>
              </div>
              <div style={{ flex: 1, borderLeft: '1px solid var(--border-color)', paddingLeft: '1rem' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: '0.2rem' }}>Remaining</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: totalRemaining >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                  {formatCurrency(Math.abs(totalRemaining))}
                </div>
              </div>
            </div>
          </div>

          {/* Create Form Panel */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={16} className="text-primary" /> Create Budget
            </h3>
            <form onSubmit={handleCreateBudget}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', fontSize: '0.8rem' }}>Category</label>
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                  className="input-field" 
                  style={{ marginBottom: 0, padding: '0.6rem' }}
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', fontSize: '0.8rem' }}>Monthly Limit</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <span style={{ position: 'absolute', left: '0.75rem', color: 'var(--text-light)', fontWeight: 600 }}>{currencySymbol}</span>
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="input-field"
                    style={{ marginBottom: 0, paddingLeft: '2rem' }}
                  />
                </div>
              </div>
              <button type="submit" className="btn" style={{ width: '100%', padding: '0.75rem' }}>
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
