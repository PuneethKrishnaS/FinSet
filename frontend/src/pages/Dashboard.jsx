import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import api from '../services/api';
import {
  ArrowDownRight, TrendingDown, TrendingUp, Wallet, Target,
  History, Calendar as CalendarIcon, X, ChevronLeft, ChevronRight, MoreHorizontal,
  PlusCircle, MinusCircle
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import useFinanceStore from '../store/useFinanceStore';
import { getIconForCategory } from '../utils/CategoryIcons';

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
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-4xl max-h-full rounded-2xl flex flex-col overflow-hidden shadow-2xl border border-border">
        
        {/* Calendar Header */}
        <div className="flex justify-between items-center p-4 border-b border-border bg-muted/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
              <CalendarIcon size={20} />
            </div>
            <h2 className="text-xl font-bold text-foreground m-0">Transaction Calendar</h2>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Calendar Controls */}
        <div className="flex justify-between items-center p-4 bg-card border-b border-border">
          <h3 className="text-lg font-bold text-foreground m-0">
            {monthNames[month]} {year}
          </h3>
          <div className="flex gap-2">
            <button onClick={prevMonth} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-foreground hover:bg-muted/80"><ChevronLeft size={16} /></button>
            <button onClick={nextMonth} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-foreground hover:bg-muted/80"><ChevronRight size={16} /></button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 flex flex-col bg-border gap-[1px] min-h-0">
          {/* Days Header */}
          <div className="grid grid-cols-7 bg-muted gap-[1px]">
            {dayNames.map(day => (
              <div key={day} className="p-2 text-center font-bold text-xs text-muted-foreground uppercase">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Body */}
          <div className="flex-1 grid grid-cols-7 auto-rows-fr bg-border gap-[1px] overflow-y-auto">
            {blanks.map((_, i) => (
              <div key={`blank-${i}`} className="bg-card opacity-50"></div>
            ))}
            
            {days.map(day => {
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayTransactions = transactions.filter(t => (t.date || t.created_at).startsWith(dateStr));
              
              const dayIncome = dayTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
              const dayExpense = dayTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
              
              const isToday = new Date().toISOString().startsWith(dateStr);

              return (
                <div key={day} className="bg-card p-1 md:p-2 flex flex-col overflow-hidden min-h-[80px]">
                  <div className="flex justify-between items-start mb-1">
                    <span className={`flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs ${isToday ? 'bg-primary text-primary-foreground' : 'text-foreground'}`}>
                      {day}
                    </span>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto flex flex-col gap-1 pr-1">
                    {dayTransactions.map((t, idx) => (
                      <div key={idx} className={`text-[10px] md:text-xs px-1 md:px-1.5 py-0.5 rounded flex justify-between items-center gap-1 ${t.type === 'income' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-destructive/10 text-destructive'}`}>
                        <span className="whitespace-nowrap overflow-hidden text-ellipsis font-semibold">{t.title}</span>
                        <span className="font-bold">{formatCurrency(t.amount)}</span>
                      </div>
                    ))}
                  </div>
                  
                  {(dayIncome > 0 || dayExpense > 0) && (
                    <div className="mt-1 pt-1 border-t border-border flex justify-between text-[10px] md:text-xs font-bold">
                      <span className="text-emerald-600 dark:text-emerald-400">{dayIncome > 0 ? `+${formatCurrency(dayIncome)}` : ''}</span>
                      <span className="text-destructive">{dayExpense > 0 ? `-${formatCurrency(dayExpense)}` : ''}</span>
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
  const { formatCurrency, theme } = useSettings();
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

  if (loading || !processedData) return (
    <div className="flex flex-col w-full h-full pb-10 text-center mt-16 text-muted-foreground">
      Loading Analytics...
    </div>
  );

  const netSavings = dashboardData.total_income - dashboardData.total_expense;

  return (
    <div className="flex flex-col w-full h-full pb-10">
      
      <CalendarOverlay 
        isOpen={isCalendarOpen} 
        onClose={() => setIsCalendarOpen(false)} 
        transactions={processedData.allTransactions} 
        formatCurrency={formatCurrency} 
      />

      {/* Header Area */}
      <header className="flex justify-between items-center mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground mb-1">Dashboard</h1>
          <p className="text-sm md:text-base text-muted-foreground font-medium">Your financial overview</p>
        </div>
        <button 
          onClick={() => setIsCalendarOpen(true)} 
          className="bg-card border border-border p-3 rounded-xl hover:bg-muted transition-colors shadow-sm flex items-center justify-center text-foreground group"
        >
          <CalendarIcon size={20} className="group-hover:text-primary transition-colors" />
        </button>
      </header>

      {/* Main Balance */}
      <div className="mb-6 md:mb-8">
        <div className="text-muted-foreground text-sm font-bold uppercase tracking-wider mb-2">Total Net Balance</div>
        <div className="text-4xl md:text-5xl font-black text-foreground tracking-tight">{formatCurrency(dashboardData.balance)}</div>
      </div>

      {/* Overview Cards (Horizontal Scroll on Mobile) */}
      <div className="flex flex-row gap-4 overflow-x-auto pb-4 mb-2 md:grid md:grid-cols-3 no-scrollbar snap-x w-full">
        <div className="min-w-[150px] flex-1 bg-card border border-border p-5 rounded-2xl snap-start shadow-sm">
          <div className="flex items-center gap-2 text-emerald-500 mb-2">
            <TrendingUp size={18} />
            <span className="text-xs font-bold uppercase tracking-wider">Income</span>
          </div>
          <div className="text-xl font-black text-foreground">{formatCurrency(dashboardData.total_income)}</div>
        </div>
        
        <div className="min-w-[150px] flex-1 bg-card border border-border p-5 rounded-2xl snap-start shadow-sm">
          <div className="flex items-center gap-2 text-destructive mb-2">
            <TrendingDown size={18} />
            <span className="text-xs font-bold uppercase tracking-wider">Spent</span>
          </div>
          <div className="text-xl font-black text-foreground">{formatCurrency(dashboardData.total_expense)}</div>
        </div>

        <div className="min-w-[150px] flex-1 bg-card border border-border p-5 rounded-2xl snap-start shadow-sm">
          <div className="flex items-center gap-2 text-primary mb-2">
            <Wallet size={18} />
            <span className="text-xs font-bold uppercase tracking-wider">Savings</span>
          </div>
          <div className="text-xl font-black text-foreground">{formatCurrency(netSavings)}</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        <button onClick={() => navigate('/log-transaction')} className="bg-card border border-border hover:bg-muted transition-colors rounded-2xl p-4 flex flex-col items-center justify-center gap-2 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
            <MinusCircle size={20} />
          </div>
          <span className="text-xs font-bold text-foreground">Expense</span>
        </button>
        <button onClick={() => navigate('/log-transaction')} className="bg-card border border-border hover:bg-muted transition-colors rounded-2xl p-4 flex flex-col items-center justify-center gap-2 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <PlusCircle size={20} />
          </div>
          <span className="text-xs font-bold text-foreground">Income</span>
        </button>
        <button onClick={() => navigate('/budgets')} className="bg-card border border-border hover:bg-muted transition-colors rounded-2xl p-4 flex flex-col items-center justify-center gap-2 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Target size={20} />
          </div>
          <span className="text-xs font-bold text-foreground">Budgets</span>
        </button>
        <button onClick={() => navigate('/history')} className="bg-card border border-border hover:bg-muted transition-colors rounded-2xl p-4 flex flex-col items-center justify-center gap-2 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-sky-500/10 text-sky-500 flex items-center justify-center">
            <History size={20} />
          </div>
          <span className="text-xs font-bold text-foreground">History</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {/* Cash Flow Chart */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-foreground mb-6">Cash Flow</h3>
          <div className="h-[220px] w-full">
            {processedData.cashFlowData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={processedData.cashFlowData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#27272a' : '#e5e7eb'} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickFormatter={val => formatCurrency(val)} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }} />
                  <Area type="monotone" dataKey="income" name="Income" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorInc)" />
                  <Area type="monotone" dataKey="expense" name="Expense" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExp)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm font-medium">No data for this month yet.</div>
            )}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-foreground mb-6">Where your money goes</h3>
          
          {processedData.pieData.length > 0 ? (
            <div className="flex flex-col gap-6">
              <div className="h-[200px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={processedData.pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={4} dataKey="value" stroke="none">
                      {processedData.pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={val => formatCurrency(val)} contentStyle={{ borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total</div>
                  <div className="text-lg font-black text-foreground">{formatCurrency(dashboardData.total_expense)}</div>
                </div>
              </div>
              
              <div className="flex flex-col gap-3">
                {processedData.pieData.slice(0, 4).map((cat, i) => {
                  const icon = cat ? getIconForCategory(cat, 16) : <MoreHorizontal size={16} />;
                  const percentage = ((cat.value / dashboardData.total_expense) * 100).toFixed(0);
                  return (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm" style={{ backgroundColor: `${COLORS[i % COLORS.length]}15`, color: COLORS[i % COLORS.length] }}>
                          {icon}
                        </div>
                        <span className="font-bold text-foreground text-sm">{cat.name}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-muted-foreground font-bold">{percentage}%</span>
                        <span className="font-black text-foreground">{formatCurrency(cat.value)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm font-medium">No expense data</div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-foreground m-0">Recent Activity</h3>
          <button onClick={() => navigate('/history')} className="text-primary text-sm font-bold hover:text-primary/80 transition-colors">View All</button>
        </div>
        
        <div className="flex flex-col divide-y divide-border -mx-6">
          {processedData.recentActivity.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm font-medium">No recent activity.</div>
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
                <div key={i} className="flex items-center gap-4 px-6 py-4 hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-sm" style={{ backgroundColor: `${bgColor}15`, color: bgColor }}>
                    {isInc ? <ArrowDownRight size={20} /> : getIconForCategory({ name: typeLabel, color: bgColor }, 20)}
                  </div>
                  
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="font-bold text-foreground text-[15px] mb-0.5 truncate">{t.title}</div>
                    <div className="text-xs font-medium text-muted-foreground">
                      {new Date(t.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end justify-center">
                    <div className={`font-black text-[15px] ${isInc ? 'text-emerald-500' : 'text-foreground'}`}>
                      {isInc ? '+' : '-'} {formatCurrency(t.amount)}
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
