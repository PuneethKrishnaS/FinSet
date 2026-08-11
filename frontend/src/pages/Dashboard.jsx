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
      <div className="bg-background w-full max-w-4xl max-h-full flex flex-col overflow-hidden border border-border">
        
        {/* Calendar Header */}
        <div className="flex justify-between items-center p-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <CalendarIcon size={20} />
            </div>
            <h2 className="text-xl font-bold text-foreground m-0">Transaction Calendar</h2>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Calendar Controls */}
        <div className="flex justify-between items-center p-4 bg-background border-b border-border">
          <h3 className="text-lg font-bold text-foreground m-0">
            {monthNames[month]} {year}
          </h3>
          <div className="flex gap-2">
            <button onClick={prevMonth} className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center text-foreground hover:bg-muted"><ChevronLeft size={16} /></button>
            <button onClick={nextMonth} className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center text-foreground hover:bg-muted"><ChevronRight size={16} /></button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 flex flex-col bg-border gap-[1px] min-h-0">
          {/* Days Header */}
          <div className="grid grid-cols-7 bg-muted/50 gap-[1px]">
            {dayNames.map(day => (
              <div key={day} className="p-2 text-center font-bold text-xs text-muted-foreground uppercase tracking-wider">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Body */}
          <div className="flex-1 grid grid-cols-7 auto-rows-fr bg-border gap-[1px] overflow-y-auto">
            {blanks.map((_, i) => (
              <div key={`blank-${i}`} className="bg-background opacity-50"></div>
            ))}
            
            {days.map(day => {
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayTransactions = transactions.filter(t => (t.date || t.created_at).startsWith(dateStr));
              
              const dayIncome = dayTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
              const dayExpense = dayTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
              
              const isToday = new Date().toISOString().startsWith(dateStr);

              return (
                <div key={day} className="bg-background p-1 md:p-2 flex flex-col overflow-hidden min-h-[80px]">
                  <div className="flex justify-between items-start mb-1">
                    <span className={`flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs ${isToday ? 'bg-primary text-primary-foreground' : 'text-foreground'}`}>
                      {day}
                    </span>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto flex flex-col gap-1 pr-1">
                    {dayTransactions.map((t, idx) => (
                      <div key={idx} className={`text-[10px] md:text-xs px-1 md:px-1.5 py-0.5 flex justify-between items-center gap-1 ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}`}>
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
    <div className="flex flex-col w-full h-full pb-10 bg-background">
      
      <CalendarOverlay 
        isOpen={isCalendarOpen} 
        onClose={() => setIsCalendarOpen(false)} 
        transactions={processedData.allTransactions} 
        formatCurrency={formatCurrency} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left/Main Column */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* The Consolidated Passbook */}
          <section className="bg-card rounded-2xl shadow-sm border border-border p-6 md:p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="text-muted-foreground text-xs md:text-sm font-bold uppercase tracking-widest mb-2">Total Net Balance</div>
                <div className="text-4xl md:text-5xl font-black text-foreground tracking-tighter leading-none">
                  {formatCurrency(dashboardData.balance)}
                </div>
              </div>
              <button 
                onClick={() => setIsCalendarOpen(true)} 
                className="bg-primary/10 text-primary p-3 rounded-full hover:bg-primary/20 transition-colors flex items-center justify-center shadow-sm"
              >
                <CalendarIcon size={20} />
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-500 mb-1">
                  <TrendingUp size={16} strokeWidth={2.5} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Income</span>
                </div>
                <div className="text-lg md:text-xl font-bold text-foreground">{formatCurrency(dashboardData.total_income)}</div>
              </div>
              
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 text-destructive mb-1">
                  <TrendingDown size={16} strokeWidth={2.5} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Spent</span>
                </div>
                <div className="text-lg md:text-xl font-bold text-foreground">{formatCurrency(dashboardData.total_expense)}</div>
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 text-primary mb-1">
                  <Wallet size={16} strokeWidth={2.5} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Savings</span>
                </div>
                <div className="text-lg md:text-xl font-bold text-foreground">{formatCurrency(netSavings)}</div>
              </div>
            </div>
          </section>

          {/* Quick-Action Grid */}
          <section className="bg-card rounded-2xl shadow-sm border border-border p-6">
            <div className="grid grid-cols-4 gap-4 md:gap-6">
              <button onClick={() => navigate('/log?type=expense')} className="flex flex-col items-center justify-center gap-3 group">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-100 to-red-50 dark:from-red-900/30 dark:to-red-900/10 flex items-center justify-center shadow-sm group-active:scale-95 transition-transform relative overflow-hidden">
                  <MinusCircle size={28} className="text-red-500 relative z-10" />
                  <div className="absolute inset-0 bg-white/20 dark:bg-white/5" />
                </div>
                <span className="text-xs font-semibold text-foreground text-center">Add<br/>Expense</span>
              </button>
              
              <button onClick={() => navigate('/log?type=income')} className="flex flex-col items-center justify-center gap-3 group">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/30 dark:to-emerald-900/10 flex items-center justify-center shadow-sm group-active:scale-95 transition-transform relative overflow-hidden">
                  <PlusCircle size={28} className="text-emerald-500 relative z-10" />
                  <div className="absolute inset-0 bg-white/20 dark:bg-white/5" />
                </div>
                <span className="text-xs font-semibold text-foreground text-center">Add<br/>Income</span>
              </button>
              
              <button onClick={() => navigate('/budgets')} className="flex flex-col items-center justify-center gap-3 group">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-900/10 flex items-center justify-center shadow-sm group-active:scale-95 transition-transform relative overflow-hidden">
                  <Target size={28} className="text-blue-500 relative z-10" />
                  <div className="absolute inset-0 bg-white/20 dark:bg-white/5" />
                </div>
                <span className="text-xs font-semibold text-foreground text-center">Track<br/>Budgets</span>
              </button>
              
              <button onClick={() => navigate('/history')} className="flex flex-col items-center justify-center gap-3 group">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800/50 dark:to-slate-800/20 flex items-center justify-center shadow-sm group-active:scale-95 transition-transform relative overflow-hidden">
                  <History size={28} className="text-slate-600 dark:text-slate-300 relative z-10" />
                  <div className="absolute inset-0 bg-white/20 dark:bg-white/5" />
                </div>
                <span className="text-xs font-semibold text-foreground text-center">Passbook<br/>History</span>
              </button>
            </div>
          </section>

          {/* Cash Flow Chart */}
          <section className="bg-card rounded-2xl shadow-sm border border-border p-6">
            <h3 className="text-lg md:text-xl font-bold text-foreground mb-6">Cash Flow</h3>
            <div className="h-[260px] w-full -ml-4">
              {processedData.cashFlowData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={processedData.cashFlowData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00AC4F" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#00AC4F" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FD3E3E" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#FD3E3E" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#27272a' : '#e5e7eb'} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickFormatter={val => formatCurrency(val)} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.04)' }} />
                    <Area type="monotone" dataKey="income" name="Income" stroke="#00AC4F" strokeWidth={2} fillOpacity={1} fill="url(#colorInc)" />
                    <Area type="monotone" dataKey="expense" name="Expense" stroke="#FD3E3E" strokeWidth={2} fillOpacity={1} fill="url(#colorExp)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm font-medium">No data for this month yet.</div>
              )}
            </div>
          </section>

          {/* Category Breakdown */}
          <section className="bg-card rounded-2xl shadow-sm border border-border p-6">
            <h3 className="text-lg md:text-xl font-bold text-foreground mb-6">Where your money goes</h3>
            
            {processedData.pieData.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="h-[240px] w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={processedData.pieData} cx="50%" cy="50%" innerRadius={85} outerRadius={110} paddingAngle={4} dataKey="value" stroke="none">
                        {processedData.pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={val => formatCurrency(val)} contentStyle={{ borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.04)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total</div>
                    <div className="text-xl font-black text-foreground">{formatCurrency(dashboardData.total_expense)}</div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-1">
                  {processedData.pieData.slice(0, 5).map((cat, i) => {
                    const icon = cat ? getIconForCategory(cat, 18) : <MoreHorizontal size={18} />;
                    const percentage = ((cat.value / dashboardData.total_expense) * 100).toFixed(0);
                    return (
                      <div key={i} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors px-2 rounded-lg cursor-default">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${COLORS[i % COLORS.length]}15`, color: COLORS[i % COLORS.length] }}>
                            {icon}
                          </div>
                          <span className="font-bold text-foreground text-sm truncate max-w-[100px]">{cat.name}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm shrink-0">
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
          </section>

        </div>

        {/* Right Rail / Side Column */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Recent Activity */}
          <section className="bg-card rounded-2xl shadow-sm border border-border p-6 flex flex-col h-full min-h-[400px]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg md:text-xl font-bold text-foreground m-0">Recent Activity</h3>
              <button onClick={() => navigate('/history')} className="text-primary text-sm font-bold hover:text-primary/80 transition-colors">View All</button>
            </div>
            
            <div className="flex flex-col flex-1">
              {processedData.recentActivity.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm font-medium m-auto">No recent activity.</div>
              ) : (
                processedData.recentActivity.map((t, i) => {
                  const isInc = t.type === 'income';
                  let bgColor = isInc ? '#00AC4F' : '#64748b'; // success green or slate
                  let typeLabel = 'Other';
                  
                  if (!isInc) {
                    const catObj = categories.find(c => c.name.toLowerCase() === t.categoryKey);
                    if (catObj) { bgColor = catObj.color || '#64748b'; typeLabel = catObj.name; }
                    else { typeLabel = t.category; }
                  }

                  return (
                    <div key={i} className="flex items-center gap-3 py-3 border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors px-1 rounded-lg cursor-pointer">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${bgColor}15`, color: bgColor }}>
                        {isInc ? <ArrowDownRight size={18} /> : getIconForCategory({ name: typeLabel, color: bgColor }, 18)}
                      </div>
                      
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="font-bold text-foreground text-sm mb-0.5 truncate">{t.title}</div>
                        <div className="text-[10px] md:text-xs font-medium text-muted-foreground">
                          {new Date(t.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end justify-center shrink-0">
                        <div className={`font-black text-sm md:text-base ${isInc ? 'text-[#00AC4F]' : 'text-foreground'}`}>
                          {isInc ? '+' : '-'} {formatCurrency(t.amount)}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

        </div>
      </div>

    </div>
  );
};

export default Dashboard;
