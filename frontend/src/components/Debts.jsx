import React, { useState, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Users, Plus, CheckCircle, Trash2, ArrowUpRight, ArrowDownRight, TrendingUp, ChevronDown, ChevronUp, History } from 'lucide-react';
import useFinanceStore from '../store/useFinanceStore';

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

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      await api.delete(`/debts/${id}/`);
      toast.success('Record deleted');
      markDataDirty();
    } catch (err) {
      toast.error('Failed to delete record');
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

  const handleDeletePayment = async (paymentId) => {
    if (!window.confirm('Delete this payment log?')) return;
    try {
      await api.delete(`/debt-payments/${paymentId}/`);
      toast.success('Payment deleted');
      markDataDirty();
    } catch (err) {
      toast.error('Failed to delete payment');
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
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', fontSize: '0.9rem', width: '100%' }}>
      <header className="header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 className="header-title">Lending & Borrowing</h1>
          <p className="header-subtitle">Track money you owe and money owed to you</p>
        </div>
      </header>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span className="card-title" style={{ fontSize: '0.9rem' }}>People Owe Me (Remaining)</span>
            <span style={{ padding: '0.5rem', background: 'var(--success-light)', color: 'var(--success)', borderRadius: '50%' }}><ArrowUpRight size={20} /></span>
          </div>
          <div className="amount stat-pulse" style={{ fontSize: '1.5rem', color: 'var(--success)', display: 'inline-block' }}>
            {formatCurrency(totalLent)}
          </div>
        </div>
        
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span className="card-title" style={{ fontSize: '0.9rem' }}>I Owe People (Remaining)</span>
            <span style={{ padding: '0.5rem', background: 'var(--danger-light)', color: 'var(--danger)', borderRadius: '50%' }}><ArrowDownRight size={20} /></span>
          </div>
          <div className="amount stat-pulse" style={{ fontSize: '1.5rem', color: 'var(--danger)', display: 'inline-block' }}>
            {formatCurrency(totalBorrowed)}
          </div>
        </div>
      </div>

      <div className="responsive-grid-1-2">
        
        {/* Create Form */}
        <div className="card" style={{ padding: '1.5rem', height: 'fit-content' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={18} className="text-primary" /> New Record
          </h3>
          <form onSubmit={handleCreateDebt}>
            
            <div style={{ display: 'flex', background: 'var(--bg-main)', padding: '0.25rem', borderRadius: 'var(--radius-lg)', marginBottom: '1rem' }}>
              <button 
                type="button" 
                onClick={() => setType('lent')}
                style={{ flex: 1, padding: '0.5rem', border: 'none', borderRadius: 'var(--radius-md)', background: type === 'lent' ? 'var(--success)' : 'transparent', color: type === 'lent' ? 'white' : 'var(--text-muted)', fontWeight: '600', cursor: 'pointer' }}
              >
                I Lent Money
              </button>
              <button 
                type="button" 
                onClick={() => setType('borrowed')}
                style={{ flex: 1, padding: '0.5rem', border: 'none', borderRadius: 'var(--radius-md)', background: type === 'borrowed' ? 'var(--danger)' : 'transparent', color: type === 'borrowed' ? 'white' : 'var(--text-muted)', fontWeight: '600', cursor: 'pointer' }}
              >
                I Borrowed
              </button>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.85rem' }}>Person's Name</label>
              <input 
                type="text" 
                required
                placeholder="e.g. John Doe"
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                className="input-field"
                style={{ marginBottom: 0 }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 150px' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.85rem' }}>Principal Amount</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <span style={{ position: 'absolute', left: '1rem', color: 'var(--text-light)', fontWeight: 600 }}>{currencySymbol}</span>
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="input-field"
                    style={{ marginBottom: 0, paddingLeft: '2.5rem' }}
                  />
                </div>
              </div>
              <div style={{ flex: '1 1 150px' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.85rem' }}>Date Issued</label>
                <input 
                  type="date" 
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="input-field"
                  style={{ marginBottom: 0 }}
                />
              </div>
            </div>
            
            <div style={{ marginBottom: '1.5rem', background: 'var(--bg-main)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', fontWeight: '600', fontSize: '0.85rem', color: 'var(--primary-color)' }}>
                <TrendingUp size={16} /> Interest (Optional)
              </label>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 120px' }}>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input 
                      type="number" 
                      step="0.01"
                      placeholder="Rate"
                      value={interestRate}
                      onChange={(e) => setInterestRate(e.target.value)}
                      className="input-field"
                      style={{ marginBottom: 0, paddingRight: '2rem' }}
                    />
                    <span style={{ position: 'absolute', right: '0.75rem', color: 'var(--text-light)', fontWeight: 600 }}>%</span>
                  </div>
                </div>
                <div style={{ flex: '1 1 120px' }}>
                  <select 
                    value={interestPeriod}
                    onChange={(e) => setInterestPeriod(e.target.value)}
                    className="input-field"
                    style={{ marginBottom: 0 }}
                  >
                    <option value="monthly">Per Month</option>
                    <option value="yearly">Per Year</option>
                  </select>
                </div>
              </div>
            </div>

            <button type="submit" className="btn" style={{ width: '100%', background: type === 'lent' ? 'var(--success)' : 'var(--danger)' }}>
              Save Record
            </button>
          </form>
        </div>

        {/* Debts Accordion List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={18} className="text-primary" /> Active Records
          </h3>
          
          {!debtsLoaded ? (
            <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
          ) : debts.length === 0 ? (
            <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No records found.</div>
          ) : (
            debts.map(d => {
              const isExpanded = expandedId === d.id;
              const { principal, paymentsTotal, remaining, fixedInterestAmount, interestLabel } = calculateDebtTotals(d);
              
              return (
                <div key={d.id} className="card" style={{ overflow: 'hidden', padding: 0, opacity: d.is_settled ? 0.6 : 1, transition: 'all 0.2s' }}>
                  
                  {/* Card Header (Clickable) */}
                  <div 
                    onClick={() => handleExpand(d)}
                    style={{ padding: '1.25rem 1.5rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: isExpanded ? 'rgba(0,0,0,0.02)' : 'transparent' }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>{d.person_name}</span>
                        <span className={`badge ${d.type === 'lent' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.7rem' }}>
                          {d.type === 'lent' ? 'Lent' : 'Borrowed'}
                        </span>
                        {d.is_settled && <span className="badge badge-success" style={{ background: 'var(--success)', color: 'white' }}>Settled</span>}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Issued: {new Date(d.date).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, fontSize: '1.1rem', color: d.type === 'lent' ? 'var(--success)' : 'var(--danger)' }}>
                          {formatCurrency(remaining)} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Remaining</span>
                        </div>
                        {d.interest_rate && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--primary-color)', fontWeight: 600 }}>
                            {d.interest_rate}% ({formatCurrency(fixedInterestAmount)} {interestLabel})
                          </div>
                        )}
                      </div>
                      <div style={{ color: 'var(--text-light)' }}>
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)', background: 'var(--bg-main)' }}>
                      
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', marginBottom: '2rem' }}>
                        
                        {/* Add Payment Form */}
                        {!d.is_settled && (
                          <div style={{ flex: '1 1 300px', background: 'var(--bg-panel)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                            <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <Plus size={16} /> Log a Payment (Interest / Principal)
                            </h4>
                            <form onSubmit={(e) => handleAddPayment(e, d.id)}>
                              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Amount</label>
                                  <input type="number" step="0.01" required value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} className="input-field" style={{ marginBottom: 0, padding: '0.6rem' }} placeholder="0.00" />
                                </div>
                                <div style={{ flex: 1 }}>
                                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Date</label>
                                  <input type="date" required value={paymentDate} onChange={e => setPaymentDate(e.target.value)} className="input-field" style={{ marginBottom: 0, padding: '0.6rem' }} />
                                </div>
                              </div>
                              <div style={{ marginBottom: '1rem' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Note / Month (Optional)</label>
                                <input type="text" value={paymentNote} onChange={e => setPaymentNote(e.target.value)} className="input-field" style={{ marginBottom: 0, padding: '0.6rem' }} placeholder="e.g. Jan Interest" />
                              </div>
                              <button type="submit" disabled={paymentLoading} className="btn" style={{ width: '100%', padding: '0.6rem', fontSize: '0.85rem' }}>
                                Save Payment
                              </button>
                            </form>
                          </div>
                        )}

                        {/* Summary & Actions */}
                        <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          <div style={{ background: 'var(--bg-panel)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                            <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>Debt Summary</h4>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                              <span>Principal:</span>
                              <span style={{ fontWeight: 600 }}>{formatCurrency(principal)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                              <span>Total Paid:</span>
                              <span style={{ fontWeight: 600, color: 'var(--primary-color)' }}>{formatCurrency(paymentsTotal)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', paddingTop: '0.5rem', borderTop: '1px dashed var(--border-color)' }}>
                              <span>Balance Remaining:</span>
                              <span style={{ fontWeight: 800 }}>{formatCurrency(remaining)}</span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '1rem' }}>
                            {!d.is_settled && (
                              <button onClick={() => handleSettle(d)} className="btn-secondary" style={{ flex: 1, color: 'var(--success)', borderColor: 'var(--success)' }}>
                                <CheckCircle size={16} /> Settle Debt
                              </button>
                            )}
                            <button onClick={() => handleDelete(d.id)} className="btn-secondary" style={{ flex: 1, color: 'var(--danger)', borderColor: 'var(--danger)' }}>
                              <Trash2 size={16} /> Delete
                            </button>
                          </div>
                        </div>

                      </div>

                      {/* Payment History Table */}
                      <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <History size={16} /> Payment History
                      </h4>
                      <div style={{ overflowX: 'auto' }}>
                        <table className="interactive-table" style={{ fontSize: '0.8rem', background: 'var(--bg-panel)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Note</th>
                              <th style={{ textAlign: 'right' }}>Amount</th>
                              <th style={{ textAlign: 'right', width: '50px' }}></th>
                            </tr>
                          </thead>
                          <tbody>
                            {(!d.payments || d.payments.length === 0) ? (
                              <tr><td colSpan="4" style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>No payments logged yet.</td></tr>
                            ) : (
                              d.payments.map(p => (
                                <tr key={p.id}>
                                  <td>{new Date(p.date).toLocaleDateString()}</td>
                                  <td>{p.note || '-'}</td>
                                  <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--primary-color)' }}>
                                    {formatCurrency(p.amount)}
                                  </td>
                                  <td style={{ textAlign: 'right' }}>
                                    <button onClick={() => handleDeletePayment(p.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}>
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
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Debts;
