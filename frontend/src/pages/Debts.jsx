import React, { useState, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Users, Plus, CheckCircle, Trash2, ArrowUpRight, ArrowDownRight, TrendingUp, ChevronDown, ChevronUp, History } from 'lucide-react';
import useFinanceStore from '../store/useFinanceStore';
import ConfirmDialog from '../components/ConfirmDialog';

const Debts = () => {
  const { currency, formatCurrency } = useSettings();
  const { debts, debtsLoaded, fetchDebts, dataVersion, markDataDirty } = useFinanceStore();

  // New debt form
  const [personName, setPersonName] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('lent');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [interestRate, setInterestRate] = useState('');
  const [interestPeriod, setInterestPeriod] = useState('monthly');

  // Payment form state (tied to active debt)
  const [expandedId, setExpandedId] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentNote, setPaymentNote] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);

  const [deleteConfirmInfo, setDeleteConfirmInfo] = useState({ isOpen: false, id: null, type: null });

  const currencySymbol = new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).formatToParts(1).find(x => x.type === 'currency').value;

  useEffect(() => {
    fetchDebts();
  }, [fetchDebts, dataVersion]);

  const handleCreateDebt = async (e) => {
    e.preventDefault();
    try {
      await api.post('/debts/', {
        person_name: personName,
        type: type,
        amount: parseFloat(amount),
        date: date,
        is_settled: false,
        interest_rate: interestRate ? parseFloat(interestRate) : null,
        interest_period: interestPeriod
      });
      toast.success('Debt recorded successfully!');
      setPersonName('');
      setAmount('');
      setInterestRate('');
      setInterestPeriod('monthly');
      markDataDirty();
    } catch (err) {
      toast.error('Failed to record debt.');
    }
  };

  const handleSettle = async (debt) => {
    try {
      await api.put(`/debts/${debt.id}/`, { ...debt, is_settled: true });
      toast.success(`${debt.person_name}'s debt settled!`);
      markDataDirty();
    } catch (err) {
      toast.error('Failed to settle debt.');
    }
  };

  const confirmDelete = (id, type) => {
    setDeleteConfirmInfo({ isOpen: true, id, type });
  };

  const executeDelete = async () => {
    const { id, type } = deleteConfirmInfo;
    try {
      if (type === 'debt') {
        await api.delete(`/debts/${id}/`);
        toast.success('Record deleted');
      } else {
        await api.delete(`/debt-payments/${id}/`);
        toast.success('Payment deleted');
      }
      markDataDirty();
      setDeleteConfirmInfo({ isOpen: false, id: null, type: null });
    } catch (err) {
      toast.error('Failed to delete');
      setDeleteConfirmInfo({ isOpen: false, id: null, type: null });
    }
  };

  const handleAddPayment = async (e, debtId) => {
    e.preventDefault();
    setPaymentLoading(true);
    try {
      await api.post('/debt-payments/', {
        debt: debtId,
        amount: parseFloat(paymentAmount),
        date: paymentDate,
        note: paymentNote
      });
      toast.success('Payment logged successfully!');
      setPaymentAmount('');
      setPaymentNote('');
      markDataDirty();
    } catch (err) {
      toast.error('Failed to log payment.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const calculateDebtTotals = (d) => {
    const principal = parseFloat(d.amount);
    const paymentsTotal = d.payments ? d.payments.reduce((sum, p) => sum + parseFloat(p.amount), 0) : 0;
    
    // Fixed interest calculation
    let fixedInterestAmount = 0;
    if (d.interest_rate) {
      const rate = parseFloat(d.interest_rate);
      fixedInterestAmount = principal * (rate / 100);
    }

    return {
      principal,
      paymentsTotal,
      remaining: principal - paymentsTotal,
      fixedInterestAmount,
      interestLabel: d.interest_period === 'monthly' ? 'per month' : 'per year'
    };
  };

  const handleExpand = (d) => {
    if (expandedId === d.id) {
      setExpandedId(null);
    } else {
      setExpandedId(d.id);
      const { fixedInterestAmount } = calculateDebtTotals(d);
      setPaymentAmount(fixedInterestAmount > 0 ? fixedInterestAmount.toString() : '');
      setPaymentDate(new Date().toISOString().split('T')[0]);
      setPaymentNote('');
    }
  };

  const totalLent = debts.filter(d => d.type === 'lent' && !d.is_settled).reduce((acc, d) => acc + calculateDebtTotals(d).remaining, 0);
  const totalBorrowed = debts.filter(d => d.type === 'borrowed' && !d.is_settled).reduce((acc, d) => acc + calculateDebtTotals(d).remaining, 0);

  return (
    <div className="flex flex-col w-full h-full pb-10">
      <header className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground mb-1">Lending & Borrowing</h1>
        <p className="text-sm md:text-base text-muted-foreground font-medium">Track money you owe and money owed to you</p>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">People Owe Me</span>
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <ArrowUpRight size={20} />
              </div>
            </div>
            <div className="text-3xl font-black text-emerald-500">
              {formatCurrency(totalLent)}
            </div>
            <div className="text-xs font-semibold text-muted-foreground mt-1">Total outstanding balance</div>
          </div>
        </div>
        
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-destructive/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">I Owe People</span>
              <div className="w-10 h-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
                <ArrowDownRight size={20} />
              </div>
            </div>
            <div className="text-3xl font-black text-destructive">
              {formatCurrency(totalBorrowed)}
            </div>
            <div className="text-xs font-semibold text-muted-foreground mt-1">Total outstanding balance</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Create Form */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm lg:sticky lg:top-6">
          <h3 className="text-base font-bold text-foreground mb-5 flex items-center gap-2">
            <Plus size={18} className="text-primary" /> New Record
          </h3>
          <form onSubmit={handleCreateDebt} className="space-y-4">
            
            <div className="flex bg-muted/40 p-1.5 rounded-xl border border-border/50">
              <button 
                type="button" 
                onClick={() => setType('lent')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${type === 'lent' ? 'bg-emerald-500 text-white shadow-sm' : 'text-muted-foreground hover:bg-muted/80'}`}
              >
                I Lent Money
              </button>
              <button 
                type="button" 
                onClick={() => setType('borrowed')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${type === 'borrowed' ? 'bg-destructive text-white shadow-sm' : 'text-muted-foreground hover:bg-muted/80'}`}
              >
                I Borrowed
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Person's Name</label>
              <input 
                type="text" 
                required
                placeholder="e.g. John Doe"
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Principal Amount</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-muted-foreground font-bold">{currencySymbol}</span>
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl pl-8 pr-4 py-2.5 text-sm text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Date Issued</label>
                <input 
                  type="date" 
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
            
            <div className="bg-muted/20 p-4 rounded-xl border border-border">
              <label className="flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider mb-3">
                <TrendingUp size={14} /> Interest (Optional)
              </label>
              <div className="flex gap-3">
                <div className="flex-1 relative flex items-center">
                  <input 
                    type="number" 
                    step="0.01"
                    placeholder="Rate"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <span className="absolute right-4 text-muted-foreground font-bold">%</span>
                </div>
                <div className="flex-1">
                  <select 
                    value={interestPeriod}
                    onChange={(e) => setInterestPeriod(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="monthly">Per Month</option>
                    <option value="yearly">Per Year</option>
                  </select>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              className={`w-full font-bold py-3 px-4 rounded-xl transition-all shadow-md active:scale-[0.98] ${type === 'lent' ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20' : 'bg-destructive hover:bg-destructive/90 text-white shadow-destructive/20'}`}
            >
              Save Record
            </button>
          </form>
        </div>

        {/* Debts Accordion List */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <h3 className="text-base font-bold text-foreground mb-1 flex items-center gap-2">
            <Users size={18} className="text-primary" /> Active Records
          </h3>
          
          {!debtsLoaded ? (
            <div className="bg-card border border-border rounded-2xl p-8 text-center text-muted-foreground">Loading...</div>
          ) : debts.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-12 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                <Users size={32} className="text-muted-foreground/50" />
              </div>
              <p className="font-bold text-lg text-foreground mb-2">No records found</p>
              <p className="text-sm text-muted-foreground">Use the form to log a new lending or borrowing record.</p>
            </div>
          ) : (
            debts.map(d => {
              const isExpanded = expandedId === d.id;
              const { principal, paymentsTotal, remaining, fixedInterestAmount, interestLabel } = calculateDebtTotals(d);
              
              return (
                <div key={d.id} className={`bg-card border border-border rounded-2xl overflow-hidden transition-all ${d.is_settled ? 'opacity-60 grayscale' : 'hover:shadow-md'}`}>
                  
                  {/* Card Header (Clickable) */}
                  <div 
                    onClick={() => handleExpand(d)}
                    className={`p-5 md:p-6 cursor-pointer flex flex-wrap gap-4 justify-between items-center transition-colors group ${isExpanded ? 'bg-muted/10' : 'hover:bg-muted/5'}`}
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-1.5">
                        <span className="text-lg font-bold text-foreground">{d.person_name}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide ${d.type === 'lent' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-destructive/10 text-destructive'}`}>
                          {d.type === 'lent' ? 'Lent' : 'Borrowed'}
                        </span>
                        {d.is_settled && <span className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide bg-emerald-500 text-white">Settled</span>}
                      </div>
                      <div className="text-xs font-semibold text-muted-foreground">
                        Issued: {new Date(d.date).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className={`text-xl font-black ${d.type === 'lent' ? 'text-emerald-500' : 'text-destructive'}`}>
                          {formatCurrency(remaining)}
                        </div>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">Remaining</div>
                        {d.interest_rate && (
                          <div className="text-[10px] font-bold text-primary mt-1">
                            {d.interest_rate}% ({formatCurrency(fixedInterestAmount)} {interestLabel})
                          </div>
                        )}
                      </div>
                      <div className="text-muted-foreground group-hover:text-foreground transition-colors shrink-0">
                        <ChevronDown size={20} className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="p-5 md:p-6 border-t border-border bg-background/50">
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        
                        {/* Add Payment Form */}
                        {!d.is_settled && (
                          <div className="bg-card border border-border p-5 rounded-xl">
                            <h4 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                              <Plus size={16} className="text-primary" /> Log a Payment
                            </h4>
                            <form onSubmit={(e) => handleAddPayment(e, d.id)} className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-xs font-semibold text-foreground mb-1.5">Amount</label>
                                  <input type="number" step="0.01" required value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary/50 outline-none" placeholder="0.00" />
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-foreground mb-1.5">Date</label>
                                  <input type="date" required value={paymentDate} onChange={e => setPaymentDate(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary/50 outline-none" />
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-foreground mb-1.5">Note (Optional)</label>
                                <input type="text" value={paymentNote} onChange={e => setPaymentNote(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary/50 outline-none" placeholder="e.g. Jan Interest" />
                              </div>
                              <button type="submit" disabled={paymentLoading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2.5 rounded-lg transition-colors text-sm">
                                Save Payment
                              </button>
                            </form>
                          </div>
                        )}

                        {/* Summary & Actions */}
                        <div className="flex flex-col gap-4">
                          <div className="bg-card border border-border p-5 rounded-xl">
                            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Debt Summary</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm font-medium">
                                <span className="text-muted-foreground">Principal:</span>
                                <span className="text-foreground">{formatCurrency(principal)}</span>
                              </div>
                              <div className="flex justify-between text-sm font-medium">
                                <span className="text-muted-foreground">Total Paid:</span>
                                <span className="text-primary font-bold">{formatCurrency(paymentsTotal)}</span>
                              </div>
                              <div className="flex justify-between text-base font-black pt-3 border-t border-border/50">
                                <span className="text-foreground">Balance:</span>
                                <span>{formatCurrency(remaining)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-3">
                            {!d.is_settled && (
                              <button 
                                onClick={() => handleSettle(d)} 
                                className="flex-1 flex items-center justify-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 border border-emerald-500/20 py-2.5 rounded-xl text-sm font-bold transition-colors"
                              >
                                <CheckCircle size={16} /> Settle Debt
                              </button>
                            )}
                            <button 
                              onClick={() => confirmDelete(d.id, 'debt')} 
                              className="flex-1 flex items-center justify-center gap-2 bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/20 py-2.5 rounded-xl text-sm font-bold transition-colors"
                            >
                              <Trash2 size={16} /> Delete
                            </button>
                          </div>
                        </div>

                      </div>

                      {/* Payment History Table */}
                      <div className="bg-card border border-border rounded-xl overflow-hidden">
                        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
                          <History size={16} className="text-primary" />
                          <h4 className="text-sm font-bold text-foreground">Payment History</h4>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-muted/30 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                              <tr>
                                <th className="px-5 py-3">Date</th>
                                <th className="px-5 py-3">Note</th>
                                <th className="px-5 py-3 text-right">Amount</th>
                                <th className="px-5 py-3 text-right w-12"></th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                              {(!d.payments || d.payments.length === 0) ? (
                                <tr><td colSpan="4" className="text-center py-8 text-sm font-medium text-muted-foreground">No payments logged yet.</td></tr>
                              ) : (
                                d.payments.map(p => (
                                  <tr key={p.id} className="hover:bg-muted/10 transition-colors">
                                    <td className="px-5 py-3 font-medium text-foreground">{new Date(p.date).toLocaleDateString()}</td>
                                    <td className="px-5 py-3 text-muted-foreground">{p.note || '-'}</td>
                                    <td className="px-5 py-3 text-right font-bold text-primary">
                                      {formatCurrency(p.amount)}
                                    </td>
                                    <td className="px-5 py-3 text-right">
                                      <button 
                                        onClick={() => confirmDelete(p.id, 'payment')} 
                                        className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
      
      <ConfirmDialog 
        isOpen={deleteConfirmInfo.isOpen}
        onClose={() => setDeleteConfirmInfo({ isOpen: false, id: null, type: null })}
        onConfirm={executeDelete}
        title={deleteConfirmInfo.type === 'debt' ? "Delete Debt Record" : "Delete Payment"}
        message={deleteConfirmInfo.type === 'debt' ? "Are you sure you want to delete this debt record? All associated payments will also be deleted." : "Are you sure you want to delete this payment log?"}
      />
    </div>
  );
};

export default Debts;
