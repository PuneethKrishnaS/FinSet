import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import api from '../services/api';
import {
  ArrowUpRight, ArrowDownRight, TrendingDown, TrendingUp, Wallet, Target,
  History, Calendar as CalendarIcon, X, ChevronLeft, ChevronRight, MoreHorizontal,
  PlusCircle, MinusCircle, PieChart as PieChartIcon
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import useFinanceStore from '../store/useFinanceStore';
import { getCategoryIcon, getIconForCategory } from '../utils/CategoryIcons';
import { motion, AnimatePresence } from 'framer-motion';

const COLORS = ['#4f46e5', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#14b8a6', '#3b82f6', '#6366f1'];

// --- Calendar Overlay Component ---
const CalendarOverlay = ({ isOpen, onClose, transactions, formatCurrency }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  if (!isOpen) return null;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 (Sun) to 6 (Sat)
  
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const blanks = Array(firstDayOfMonth).fill(null);
  const days = Array.from({length: daysInMonth}, (_, i) => i + 1);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 w-full max-w-4xl max-h-full rounded-2xl flex flex-col overflow-hidden shadow-2xl border border-slate-800">
        
        {/* Calendar Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <CalendarIcon size={20} />
            </div>
            <h2 className="text-xl font-bold text-white m-0">Transaction Calendar</h2>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Calendar Controls */}
        <div className="flex justify-between items-center p-4 bg-slate-900">
          <h3 className="text-lg font-bold text-white m-0">
            {monthNames[month]} {year}
          </h3>
          <div className="flex gap-2">
            <button onClick={prevMonth} className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-white"><ChevronLeft size={16} /></button>
            <button onClick={nextMonth} className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-white"><ChevronRight size={16} /></button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 flex flex-col bg-slate-800 gap-[1px] min-h-0">
          {/* Days Header */}
          <div className="grid grid-cols-7 bg-slate-950 gap-[1px]">
            {dayNames.map(day => (
              <div key={day} className="p-2 text-center font-bold text-xs text-slate-400 uppercase">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Body */}
          <div className="flex-1 grid grid-cols-7 auto-rows-fr bg-slate-800 gap-[1px] overflow-y-auto">
            {blanks.map((_, i) => (
              <div key={`blank-${i}`} className="bg-slate-900/50"></div>
            ))}
            
            {days.map(day => {
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayTransactions = transactions.filter(t => (t.date || t.created_at).startsWith(dateStr));
              
              const dayIncome = dayTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
              const dayExpense = dayTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
              
              const isToday = new Date().toISOString().startsWith(dateStr);

              return (
                <div key={day} className="bg-slate-950 p-1 md:p-2 flex flex-col overflow-hidden min-h-[80px]">
                  <div className="flex justify-between items-start mb-1">
                    <span className={`flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs ${isToday ? 'bg-indigo-500 text-white' : 'text-slate-300'}`}>
                      {day}
                    </span>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto flex flex-col gap-1 pr-1">
                    {dayTransactions.map((t, idx) => (
                      <div key={idx} className={`text-[10px] md:text-xs px-1 md:px-1.5 py-0.5 rounded flex justify-between items-center gap-1 ${t.type === 'income' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                        <span className="whitespace-nowrap overflow-hidden text-ellipsis font-semibold">{t.title}</span>
                        <span className="font-bold">{formatCurrency(t.amount)}</span>
                      </div>
                    ))}
                  </div>
                  
                  {(dayIncome > 0 || dayExpense > 0) && (
                    <div className="mt-1 pt-1 border-t border-slate-800/50 flex justify-between text-[10px] md:text-xs font-bold">
                      <span className="text-emerald-400">{dayIncome > 0 ? `+${formatCurrency(dayIncome)}` : ''}</span>
                      <span className="text-rose-400">{dayExpense > 0 ? `-${formatCurrency(dayExpense)}` : ''}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};


const Dashboard = () => {
  const { 
    dashboardData, dashboardLoaded, fetchDashboard, 
    incomes, incomesLoaded, fetchIncomes, 
    expenses, expensesLoaded, fetchExpenses, 
    budgets, budgetsLoaded, fetchBudgets, categories,
    dataVersion
  } = useFinanceStore();

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const { formatCurrency } = useSettings();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboard();
    fetchIncomes();
    fetchExpenses();
    fetchBudgets();
  }, [fetchDashboard, fetchIncomes, fetchExpenses, fetchBudgets, dataVersion]);

  const loading = !dashboardLoaded || !incomesLoaded || !expensesLoaded || !budgetsLoaded || !dashboardData;

  const processedData = React.useMemo(() => {
    if (loading) return null;

    const formattedPieData = dashboardData.expenses_by_category.map(item => {
      const catObj = categories.find(c => c.name.toLowerCase() === item.category.toLowerCase());
      return {
        name: catObj ? catObj.name : item.category,
        value: parseFloat(item.amount),
        originalCategory: item.category,
        icon: catObj ? catObj.icon : null
      };
    });

    const mappedIncomes = incomes.map(i => ({ ...i, type: 'income', title: i.source, amount: parseFloat(i.amount), date: i.date }));
    const mappedExpenses = expenses.map(e => ({ ...e, type: 'expense', title: e.description || e.category, amount: parseFloat(e.amount), date: e.date, categoryKey: e.category.toLowerCase() }));
    const combined = [...mappedIncomes, ...mappedExpenses].sort((a, b) => new Date(b.date || b.created_at) - new Date(a.date || a.created_at));
    
    const daysMap = {};
    const currentMonthPrefix = new Date().toISOString().slice(0, 7); 
    
    mappedIncomes.forEach(i => { if(i.date.startsWith(currentMonthPrefix)) { daysMap[i.date] = { name: i.date.split('-')[2], income: 0, expense: 0 }; }});
    mappedExpenses.forEach(e => { if(e.date.startsWith(currentMonthPrefix)) { daysMap[e.date] = { name: e.date.split('-')[2], income: 0, expense: 0 }; }});
    
    mappedIncomes.forEach(i => { if(daysMap[i.date]) daysMap[i.date].income += i.amount; });
    mappedExpenses.forEach(e => { if(daysMap[e.date]) daysMap[e.date].expense += e.amount; });
    
    const cashFlowData = Object.keys(daysMap).sort().map(date => daysMap[date]);
    
    const topBudgets = budgets.slice(0, 3);
    const spends = {};
    mappedExpenses.forEach(e => {
      if (e.date.startsWith(currentMonthPrefix)) {
        spends[e.category] = (spends[e.category] || 0) + e.amount;
      }
    });

    return {
      pieData: formattedPieData,
      allTransactions: combined,
      recentActivity: combined.slice(0, 5),
      cashFlowData,
      topBudgets,
      budgetSpends: spends
    };
  }, [loading, dashboardData, incomes, expenses, budgets]);

  if (loading || !processedData) return <div className="text-center mt-16 text-slate-400">Loading Analytics...</div>;

  const netSavings = dashboardData.total_income - dashboardData.total_expense;

  return (
    <div className="min-h-screen bg-[#0f0f11] text-slate-50 flex flex-col font-sans -mx-4 -mt-4 pb-20 md:mx-0 md:mt-0 md:pb-0">
      
      <CalendarOverlay 
        isOpen={isCalendarOpen} 
        onClose={() => setIsCalendarOpen(false)} 
        transactions={processedData.allTransactions} 
        formatCurrency={formatCurrency} 
      />

      {/* Header Area */}
      <header className="px-5 pt-8 pb-4 flex justify-between items-center bg-[#17171a] sticky top-0 z-10 border-b border-white/5">
        <h1 className="text-2xl font-bold tracking-tight m-0 text-white">Dashboard</h1>
        <button onClick={() => setIsCalendarOpen(true)} className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
          <CalendarIcon size={20} className="text-slate-300" />
        </button>
      </header>

      {/* Main Balance */}
      <div className="px-5 py-6 bg-[#17171a]">
        <div className="text-slate-400 text-sm font-medium mb-1">Total Net Balance</div>
        <div className="text-4xl font-extrabold text-white tracking-tight">{formatCurrency(dashboardData.balance)}</div>
      </div>

      {/* Overview Cards (Horizontal Scroll) */}
      <div className="px-5 pb-6 bg-[#17171a] flex gap-3 overflow-x-auto no-scrollbar snap-x">
        <div className="min-w-[140px] flex-1 bg-[#222226] p-4 rounded-2xl snap-start border border-white/5">
          <div className="flex items-center gap-2 text-emerald-400 mb-2">
            <TrendingUp size={16} />
            <span className="text-xs font-semibold uppercase tracking-wider">Income</span>
          </div>
          <div className="text-lg font-bold text-white">{formatCurrency(dashboardData.total_income)}</div>
        </div>
        
        <div className="min-w-[140px] flex-1 bg-[#222226] p-4 rounded-2xl snap-start border border-white/5">
          <div className="flex items-center gap-2 text-rose-400 mb-2">
            <TrendingDown size={16} />
            <span className="text-xs font-semibold uppercase tracking-wider">Spent</span>
          </div>
          <div className="text-lg font-bold text-white">{formatCurrency(dashboardData.total_expense)}</div>
        </div>

        <div className="min-w-[140px] flex-1 bg-[#222226] p-4 rounded-2xl snap-start border border-white/5">
          <div className="flex items-center gap-2 text-indigo-400 mb-2">
            <Wallet size={16} />
            <span className="text-xs font-semibold uppercase tracking-wider">Savings</span>
          </div>
          <div className="text-lg font-bold text-white">{formatCurrency(netSavings)}</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-2 px-5 py-6 bg-[#17171a] border-t border-white/5">
        <button onClick={() => navigate('/log-transaction')} className="flex flex-col items-center gap-2 focus:outline-none">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
            <MinusCircle size={24} />
          </div>
          <span className="text-[11px] font-medium text-slate-300">Expense</span>
        </button>
        <button onClick={() => navigate('/log-transaction')} className="flex flex-col items-center gap-2 focus:outline-none">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <PlusCircle size={24} />
          </div>
          <span className="text-[11px] font-medium text-slate-300">Income</span>
        </button>
        <button onClick={() => navigate('/budgets')} className="flex flex-col items-center gap-2 focus:outline-none">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Target size={24} />
          </div>
          <span className="text-[11px] font-medium text-slate-300">Budgets</span>
        </button>
        <button onClick={() => navigate('/history')} className="flex flex-col items-center gap-2 focus:outline-none">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-500 flex items-center justify-center">
            <History size={24} />
          </div>
          <span className="text-[11px] font-medium text-slate-300">History</span>
        </button>
      </div>

      {/* Thick Divider */}
      <div className="h-3 w-full bg-[#0a0a0b]"></div>

      {/* Cash Flow Chart */}
      <div className="bg-[#17171a] py-6 px-5">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-white m-0">Cash Flow</h3>
        </div>
        <div className="h-[220px] w-full">
          {processedData.cashFlowData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={processedData.cashFlowData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorInc2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExp2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#71717a' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#71717a' }} tickFormatter={val => formatCurrency(val)} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #27272a', backgroundColor: '#18181b', color: '#fff' }} />
                <Area type="monotone" dataKey="income" name="Income" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorInc2)" />
                <Area type="monotone" dataKey="expense" name="Expense" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorExp2)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 text-sm">No data for this month yet.</div>
          )}
        </div>
      </div>

      <div className="h-3 w-full bg-[#0a0a0b]"></div>

      {/* Category Breakdown */}
      <div className="bg-[#17171a] py-6 px-5">
        <h3 className="text-lg font-bold text-white mb-6">Where your money goes</h3>
        
        {processedData.pieData.length > 0 ? (
          <div className="flex flex-col gap-6">
            <div className="h-[200px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={processedData.pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={4} dataKey="value" stroke="none">
                    {processedData.pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={val => formatCurrency(val)} contentStyle={{ borderRadius: '12px', border: '1px solid #27272a', backgroundColor: '#18181b', color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                <div className="text-xs text-slate-400">Total</div>
                <div className="text-lg font-bold text-white">{formatCurrency(dashboardData.total_expense)}</div>
              </div>
            </div>
            
            <div className="flex flex-col gap-4">
              {processedData.pieData.slice(0, 4).map((cat, i) => {
                const icon = cat ? getIconForCategory(cat, 16) : <MoreHorizontal size={16} />;
                const percentage = ((cat.value / dashboardData.total_expense) * 100).toFixed(0);
                return (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${COLORS[i % COLORS.length]}15`, color: COLORS[i % COLORS.length] }}>
                        {icon}
                      </div>
                      <span className="font-semibold text-slate-200 text-sm">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-slate-500">{percentage}%</span>
                      <span className="font-bold text-white">{formatCurrency(cat.value)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-slate-500 text-sm">No expense data</div>
        )}
      </div>

      <div className="h-3 w-full bg-[#0a0a0b]"></div>

      {/* Recent Activity (Edge to Edge List) */}
      <div className="bg-[#17171a] py-6">
        <div className="flex justify-between items-center mb-4 px-5">
          <h3 className="text-lg font-bold text-white m-0">Recent Activity</h3>
          <button onClick={() => navigate('/history')} className="text-indigo-400 text-sm font-semibold hover:text-indigo-300">View All</button>
        </div>
        
        <div className="flex flex-col">
          {processedData.recentActivity.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">No recent activity.</div>
          ) : (
            processedData.recentActivity.map((t, i) => {
              const isInc = t.type === 'income';
              let bgColor = isInc ? '#10b981' : '#64748b'; // default slate for others
              let typeLabel = 'Other';
              
              if (!isInc) {
                const catObj = categories.find(c => c.name.toLowerCase() === t.categoryKey);
                if (catObj) { bgColor = catObj.color || '#64748b'; typeLabel = catObj.name; }
                else { typeLabel = t.category; }
              }

              return (
                <div key={i} className="flex items-center gap-4 px-5 py-3.5 border-b border-white/5 active:bg-white/5 transition-colors">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${bgColor}15`, color: bgColor }}>
                    {isInc ? <ArrowDownRight size={20} /> : getIconForCategory({ name: typeLabel, color: bgColor }, 20)}
                  </div>
                  
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="font-semibold text-slate-100 text-[15px] mb-0.5 truncate">{t.title}</div>
                    <div className="text-[11px] text-slate-400">
                      Paid on {new Date(t.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end justify-center">
                    <div className={`font-bold text-[15px] ${isInc ? 'text-emerald-400' : 'text-slate-100'}`}>
                      {isInc ? '+' : '-'} {formatCurrency(t.amount)}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                      From <Wallet size={10} className="text-indigo-400" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
