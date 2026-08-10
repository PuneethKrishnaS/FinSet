import React, { useState, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
  Download, Search, Trash2, Filter,
  Home, Coffee, Car, Zap, 
  Film, ShoppingBag, HeartPulse, MoreHorizontal,
  Briefcase, TrendingUp, TrendingDown, Wallet
} from 'lucide-react';
import useFinanceStore from '../store/useFinanceStore';
import { getCategoryIcon, getIconForCategory } from '../utils/CategoryIcons';

const INCOME_SOURCES = [
  { value: 'salary', label: 'Salary', icon: Briefcase, color: '#10b981' },
  { value: 'investment', label: 'Investment', icon: TrendingUp, color: '#3b82f6' },
  { value: 'other', label: 'Other', icon: MoreHorizontal, color: '#64748b' },
];

const History = () => {
  const { formatCurrency } = useSettings();
  const { incomes, incomesLoaded, fetchIncomes, expenses, expensesLoaded, fetchExpenses, categories, fetchCategories, dataVersion, markDataDirty } = useFinanceStore();
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, income, expense
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    fetchIncomes();
    fetchExpenses();
    fetchCategories();
  }, [fetchIncomes, fetchExpenses, fetchCategories, dataVersion]);

  const transactions = React.useMemo(() => {
    if (!incomesLoaded || !expensesLoaded) return [];
    const mappedIncomes = incomes.map(i => ({ ...i, type: 'income', displayTitle: i.source, categoryKey: i.source.toLowerCase() }));
    const mappedExpenses = expenses.map(e => ({ ...e, type: 'expense', displayTitle: e.description || e.category, categoryKey: e.category.toLowerCase() }));
    return [...mappedIncomes, ...mappedExpenses].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [incomes, expenses, incomesLoaded, expensesLoaded]);

  const loading = !incomesLoaded || !expensesLoaded;

  const handleDelete = async (id, type) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    try {
      if (type === 'income') {
        await api.delete(`/incomes/${id}/`);
      } else {
        await api.delete(`/expenses/${id}/`);
      }
      markDataDirty();
      toast.success('Transaction deleted');
    } catch (err) {
      toast.error('Failed to delete transaction');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Type', 'Category/Source', 'Description', 'Amount'];
    const csvData = filteredTransactions.map(t => [
      t.date,
      t.type,
      t.type === 'income' ? 'Income' : t.category,
      t.displayTitle,
      t.amount
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8," + [headers, ...csvData].map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "transaction_history.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Export started!');
  };

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.displayTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || t.type === filterType;
    const matchesCategory = filterCategory === 'all' || (t.type === 'expense' && t.categoryKey === filterCategory);
    return matchesSearch && matchesType && matchesCategory;
  });

  // Calculate dynamic stats based on CURRENT filters
  const filteredIncome = filteredTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + parseFloat(t.amount), 0);
  const filteredExpense = filteredTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + parseFloat(t.amount), 0);
  const filteredNet = filteredIncome - filteredExpense;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', fontSize: '0.85rem', width: '100%' }}>
      
      <header className="responsive-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 className="header-title">History</h1>
          <p className="header-subtitle">View, search, and export your past transactions</p>
        </div>
        <button onClick={handleExportCSV} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
          <Download size={16} /> Export CSV
        </button>
      </header>

      {/* Dynamic Filter Stats */}
      <div className="responsive-grid-3" style={{ marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--success-light)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Filtered Income</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>{formatCurrency(filteredIncome)}</div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--danger-light)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingDown size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Filtered Expenses</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>{formatCurrency(filteredExpense)}</div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-main)', color: filteredNet >= 0 ? 'var(--primary-color)' : 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Wallet size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Net Flow</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: filteredNet >= 0 ? 'var(--primary-color)' : 'var(--danger)' }}>
              {filteredNet > 0 ? '+' : ''}{formatCurrency(filteredNet)}
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        
        {/* Modern Filters Bar */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
            <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
            <input 
              type="text" 
              placeholder="Search descriptions..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
              style={{ marginBottom: 0, paddingLeft: '2.5rem', paddingRight: '1rem', background: 'var(--bg-main)', border: 'none' }}
            />
          </div>
          
          <div style={{ display: 'flex', background: 'var(--bg-main)', padding: '0.25rem', borderRadius: 'var(--radius-md)' }}>
            <button 
              onClick={() => { setFilterType('all'); setFilterCategory('all'); }}
              style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: 600, border: 'none', background: filterType === 'all' ? 'var(--bg-panel)' : 'transparent', color: filterType === 'all' ? 'var(--text-main)' : 'var(--text-muted)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', boxShadow: filterType === 'all' ? 'var(--shadow-sm)' : 'none', transition: 'all 0.2s' }}
            >All</button>
            <button 
              onClick={() => { setFilterType('income'); setFilterCategory('all'); }}
              style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: 600, border: 'none', background: filterType === 'income' ? 'var(--bg-panel)' : 'transparent', color: filterType === 'income' ? 'var(--success)' : 'var(--text-muted)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', boxShadow: filterType === 'income' ? 'var(--shadow-sm)' : 'none', transition: 'all 0.2s' }}
            >Income</button>
            <button 
              onClick={() => { setFilterType('expense'); setFilterCategory('all'); }}
              style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: 600, border: 'none', background: filterType === 'expense' ? 'var(--bg-panel)' : 'transparent', color: filterType === 'expense' ? 'var(--danger)' : 'var(--text-muted)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', boxShadow: filterType === 'expense' ? 'var(--shadow-sm)' : 'none', transition: 'all 0.2s' }}
            >Expenses</button>
          </div>
        </div>

        {filterType === 'expense' && (
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            <button
              onClick={() => setFilterCategory('all')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.8rem', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: 600, fontSize: '0.75rem', background: filterCategory === 'all' ? 'var(--primary-color)' : 'var(--bg-main)', color: filterCategory === 'all' ? '#fff' : 'var(--text-muted)', transition: 'all 0.2s' }}
            >
              All Categories
            </button>
            {categories.map(c => {
              const isSelected = filterCategory === c.name.toLowerCase();
              return (
                <button
                  key={c.id}
                  onClick={() => setFilterCategory(c.name.toLowerCase())}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.8rem', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: 600, fontSize: '0.75rem', background: isSelected ? 'var(--primary-color)' : 'var(--bg-main)', color: isSelected ? '#fff' : 'var(--text-muted)', transition: 'all 0.2s' }}
                >
                  {getIconForCategory(c, 14, isSelected ? '#fff' : 'currentColor')} {c.name}
                </button>
              );
            })}
          </div>
        )}

        {/* Transaction List */}
        <div style={{ overflowY: 'auto', flex: 1, paddingRight: '0.5rem' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading history...</div>
          ) : filteredTransactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
              <Filter size={32} style={{ margin: '0 auto 1rem auto', opacity: 0.3 }} />
              <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-main)' }}>No transactions found</div>
              <div style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>Try adjusting your search or filters.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filteredTransactions.map(t => {
                const isInc = t.type === 'income';
                let iconElement = <MoreHorizontal size={18} />;
                let bgColor = '#64748b';
                let typeLabel = 'Other';
                
                if (isInc) {
                  const sourceObj = INCOME_SOURCES.find(s => s.value === t.categoryKey) || INCOME_SOURCES.find(s => s.label.toLowerCase() === t.categoryKey);
                  if (sourceObj) { iconElement = <sourceObj.icon size={18} />; bgColor = sourceObj.color; typeLabel = sourceObj.label; }
                  else { typeLabel = t.displayTitle; }
                } else {
                  const catObj = categories.find(c => c.name.toLowerCase() === t.categoryKey);
                  typeLabel = catObj ? catObj.name : t.category;
                  iconElement = catObj ? getIconForCategory(catObj, 18) : <MoreHorizontal size={18} />;
                  bgColor = catObj ? (catObj.color || '#64748b') : '#64748b';
                }

                return (
                  <div key={`${t.type}-${t.id}`} className="card interactive-table" style={{ display: 'flex', alignItems: 'center', padding: '1rem 1.25rem', gap: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: 'none' }}>
                    
                    {/* Icon */}
                    <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: `${bgColor}15`, color: bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {iconElement}
                    </div>
                    
                    {/* Details */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {t.displayTitle}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <span style={{ fontWeight: 600, color: bgColor }}>{typeLabel}</span>
                        <span>•</span>
                        <span>{new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </div>

                    {/* Amount & Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                      <div style={{ textAlign: 'right', fontWeight: 800, fontSize: '1.1rem', color: isInc ? 'var(--success)' : 'var(--text-main)' }}>
                        {isInc ? '+' : '-'}{formatCurrency(t.amount)}
                      </div>
                      <button 
                        onClick={() => handleDelete(t.id, t.type)} 
                        style={{ background: 'var(--bg-main)', border: 'none', color: 'var(--text-light)', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        onMouseOver={(e) => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.background = 'var(--danger-light)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-light)'; e.currentTarget.style.background = 'var(--bg-main)'; }}
                        title="Delete Transaction"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default History;
