import React, { useState, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { PiDownload, PiMagnifyingGlass, PiTrash, PiFunnel, PiHouseDuotone, PiCoffeeDuotone, PiCarDuotone, PiLightningDuotone, PiFilmStripDuotone, PiToteDuotone, PiHeartbeatDuotone, PiDotsThree, PiBriefcaseDuotone, PiTrendUpDuotone, PiTrendDownDuotone, PiWalletDuotone, PiCaretRight } from "react-icons/pi";
import { motion, AnimatePresence } from 'framer-motion';
import useFinanceStore from '../store/useFinanceStore';
import { getCategoryIcon, getIconForCategory } from '../utils/CategoryIcons';
import ConfirmDialog from '../components/ConfirmDialog';

const INCOME_SOURCES = [
  { value: 'salary', label: 'Salary', icon: Briefcase, color: '#10b981' },
  { value: 'investment', label: 'Investment', icon: TrendingUp, color: '#3b82f6' },
  { value: 'other', label: 'Other', icon: MoreHorizontal, color: '#64748b' },
];

const History = () => {
  const { formatCurrency } = useSettings();
  const { incomes, incomesLoaded, fetchIncomes, expenses, expensesLoaded, fetchExpenses, categories, fetchCategories, dataVersion, markDataDirty } = useFinanceStore();
  
  const [deleteConfirmInfo, setDeleteConfirmInfo] = useState({ isOpen: false, id: null, type: null });
  
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

  const confirmDelete = (id, type) => {
    setDeleteConfirmInfo({ isOpen: true, id, type });
  };

  const handleDelete = async () => {
    const { id, type } = deleteConfirmInfo;
    try {
      if (type === 'income') {
        await api.delete(`/incomes/${id}/`);
      } else {
        await api.delete(`/expenses/${id}/`);
      }
      markDataDirty();
      toast.success('Transaction deleted');
      setDeleteConfirmInfo({ isOpen: false, id: null, type: null });
    } catch (err) {
      toast.error('Failed to delete transaction');
      setDeleteConfirmInfo({ isOpen: false, id: null, type: null });
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

  // Group transactions by month
  const groupedTransactions = React.useMemo(() => {
    const groups = [];
    filteredTransactions.forEach(t => {
      const dateObj = new Date(t.date);
      const monthYear = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      let group = groups.find(g => g.label === monthYear);
      if (!group) {
        group = { label: monthYear, totalSpent: 0, transactions: [] };
        groups.push(group);
      }
      if (t.type === 'expense') {
        group.totalSpent += parseFloat(t.amount);
      }
      group.transactions.push(t);
    });
    return groups;
  }, [filteredTransactions]);

  return (
    <div className="flex flex-col w-full h-full pb-10">
      
      <div className="flex flex-col gap-4 mb-6 relative z-10">
        <div className="flex justify-end">
          <button 
            onClick={handleExportCSV} 
            className="bg-secondary hover:bg-secondary/80 text-secondary-foreground text-sm font-bold py-2 px-4 rounded transition-colors  active:scale-[0.98] flex items-center gap-2 border border-border"
          >
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* Dynamic Filter Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="bg-card border border-border rounded p-5  flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Filtered Income</div>
            <div className="text-xl font-black text-foreground">{formatCurrency(filteredIncome)}</div>
          </div>
        </div>

        <div className="bg-card border border-border rounded p-5  flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
            <TrendingDown size={24} />
          </div>
          <div>
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Filtered Expenses</div>
            <div className="text-xl font-black text-foreground">{formatCurrency(filteredExpense)}</div>
          </div>
        </div>

        <div className="bg-card border border-border rounded p-5  flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${filteredNet >= 0 ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
            <Wallet size={24} />
          </div>
          <div>
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Net Flow</div>
            <div className={`text-xl font-black ${filteredNet >= 0 ? 'text-primary' : 'text-destructive'}`}>
              {filteredNet > 0 ? '+' : ''}{formatCurrency(filteredNet)}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col flex-1">
        
        {/* Modern Filters Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search descriptions..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-card border border-border rounded pl-11 pr-4 py-3 text-sm text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 "
            />
          </div>
          
          <div className="flex bg-muted/40 p-1.5 rounded border border-border/50 shrink-0 overflow-x-auto">
            <button 
              onClick={() => { setFilterType('all'); setFilterCategory('all'); }}
              className={`px-4 py-2 text-sm font-bold rounded transition-all whitespace-nowrap ${filterType === 'all' ? 'bg-background text-foreground ' : 'text-muted-foreground hover:text-foreground'}`}
            >
              All
            </button>
            <button 
              onClick={() => { setFilterType('income'); setFilterCategory('all'); }}
              className={`px-4 py-2 text-sm font-bold rounded transition-all whitespace-nowrap ${filterType === 'income' ? 'bg-background text-emerald-500 ' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Income
            </button>
            <button 
              onClick={() => { setFilterType('expense'); setFilterCategory('all'); }}
              className={`px-4 py-2 text-sm font-bold rounded transition-all whitespace-nowrap ${filterType === 'expense' ? 'bg-background text-destructive ' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Expenses
            </button>
          </div>
        </div>

        {filterType === 'expense' && (
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setFilterCategory('all')}
              className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-bold whitespace-nowrap transition-colors ${filterCategory === 'all' ? 'bg-primary text-primary-foreground ' : 'bg-card border border-border text-muted-foreground hover:bg-muted/50'}`}
            >
              All Categories
            </button>
            {categories.map(c => {
              const isSelected = filterCategory === c.name.toLowerCase();
              return (
                <button
                  key={c.id}
                  onClick={() => setFilterCategory(c.name.toLowerCase())}
                  className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-bold whitespace-nowrap transition-colors ${isSelected ? 'bg-primary text-primary-foreground ' : 'bg-card border border-border text-muted-foreground hover:bg-muted/50'}`}
                >
                  {getIconForCategory(c, 16, isSelected ? '#fff' : 'currentColor')} {c.name}
                </button>
              );
            })}
          </div>
        )}

        {/* Transaction List (Edge-to-Edge on Mobile) */}
        <div className="-mx-4 md:mx-0 flex-1 px-5">
          {loading ? (
            <div className="text-center p-12 text-muted-foreground">Loading history...</div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center p-16">
              <Filter size={48} className="mx-auto mb-4 text-muted-foreground/30" />
              <div className="font-bold text-lg text-foreground mb-1">No transactions found</div>
              <div className="text-sm text-muted-foreground">Try adjusting your search or filters.</div>
            </div>
          ) : (
            <div className="flex flex-col ">
              <AnimatePresence>
                {groupedTransactions.map((group, gIndex) => (
                  <motion.div 
                    key={group.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.2, delay: gIndex * 0.05 }}
                    className="mb-6 md:mb-8 bg-card border border-border rounded overflow-hidden "
                  >
                    {/* Month Header */}
                    <div className="sticky top-0 z-10 flex justify-between items-center bg-muted/80 backdrop-blur-md px-4 md:px-6 py-3 border-y border-border md:border-t-0 md:bg-muted/50">
                      <span className="font-bold text-sm text-foreground uppercase tracking-wider">{group.label}</span>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-[10px] font-bold text-muted-foreground uppercase">Total Spent</div>
                          <div className="font-bold text-sm text-foreground">{formatCurrency(group.totalSpent)}</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col divide-y divide-border bg-background md:bg-transparent">
                      {group.transactions.map((t, tIndex) => {
                        const isInc = t.type === 'income';
                        let iconElement = <MoreHorizontal size={20} />;
                        let bgColor = '#64748b';
                        let typeLabel = 'Other';
                        
                        if (isInc) {
                          const sourceObj = INCOME_SOURCES.find(s => s.value === t.categoryKey) || INCOME_SOURCES.find(s => s.label.toLowerCase() === t.categoryKey);
                          if (sourceObj) { iconElement = <sourceObj.icon size={20} />; bgColor = sourceObj.color; typeLabel = sourceObj.label; }
                          else { typeLabel = t.displayTitle; }
                        } else {
                          const catObj = categories.find(c => c.name.toLowerCase() === t.categoryKey);
                          typeLabel = catObj ? catObj.name : t.category;
                          iconElement = catObj ? getIconForCategory(catObj, 20) : <MoreHorizontal size={20} />;
                          bgColor = catObj ? (catObj.color || '#64748b') : '#64748b';
                        }

                        return (
                          <motion.div 
                            key={`${t.type}-${t.id}`} 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2, delay: (gIndex * 0.1) + (tIndex * 0.03) }}
                            className="flex items-center gap-4 px-4 md:px-6 py-4 hover:bg-muted/20 transition-colors group relative"
                          >
                            
                            {/* Icon */}
                            <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0" style={{ background: `${bgColor}15`, color: bgColor }}>
                              {iconElement}
                            </div>
                            
                            {/* Details */}
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                              <div className="font-bold text-base text-foreground mb-0.5 truncate">
                                {t.displayTitle}
                              </div>
                              <div className="text-xs text-muted-foreground font-medium mb-1.5">
                                {new Date(t.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}, {new Date(t.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                              </div>
                              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded w-fit" style={{ background: `${bgColor}15` }}>
                                <span style={{ color: bgColor }}>{React.cloneElement(iconElement, { size: 12 })}</span>
                                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: bgColor }}>{typeLabel}</span>
                              </div>
                            </div>

                            {/* Amount & Actions */}
                            <div className="flex flex-col items-end justify-center gap-1 shrink-0">
                              <div className={`font-black text-lg ${isInc ? 'text-emerald-500' : 'text-foreground'}`}>
                                {isInc ? '+' : '-'} {formatCurrency(t.amount)}
                              </div>
                              <button 
                                onClick={() => confirmDelete(t.id, t.type)} 
                                className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors opacity-0 md:group-hover:opacity-100 flex items-center justify-center focus:opacity-100"
                                title="Delete Transaction"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>

                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

      </div>
      <ConfirmDialog 
        isOpen={deleteConfirmInfo.isOpen}
        onClose={() => setDeleteConfirmInfo({ isOpen: false, id: null, type: null })}
        onConfirm={handleDelete}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction? This action cannot be undone."
      />
    </div>
  );
};

export default History;
