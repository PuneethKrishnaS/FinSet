import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useSettings } from '../context/SettingsContext';
import { PieChart, Plus, Calendar, ChevronRight, Target, Info, Edit2 } from 'lucide-react';
import useFinanceStore from '../store/useFinanceStore';

const ChitFunds = () => {
  const { formatCurrency, currency } = useSettings();
  const { chitFunds: chits, chitFundsLoaded, fetchChitFunds } = useFinanceStore();

  // Form states for creating a new Chit
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newChit, setNewChit] = useState({
    name: '',
    start_date: new Date().toISOString().slice(0, 10),
    duration_months: 20,
    target_amount: ''
  });

  // Form states for adding contribution
  const [selectedChitId, setSelectedChitId] = useState(null);
  const [contribution, setContribution] = useState({
    amount: '',
    date: new Date().toISOString().slice(0, 10),
    month_number: 1
  });

  // Form states for editing a contribution
  const [editingContributionId, setEditingContributionId] = useState(null);
  const [editingContributionData, setEditingContributionData] = useState({
    amount: '',
    date: '',
    month_number: 1
  });

  const [expandedChitId, setExpandedChitId] = useState(null);

  const currencySymbol = new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).formatToParts(1).find(x => x.type === 'currency').value;

  useEffect(() => {
    fetchChitFunds();
  }, [fetchChitFunds]);

  const handleCreateChit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/chit-funds/', {
        ...newChit,
        target_amount: newChit.target_amount ? parseFloat(newChit.target_amount) : null
      });
      toast.success('Chit Fund created successfully!');
      setShowCreateForm(false);
      setNewChit({
        name: '',
        start_date: new Date().toISOString().slice(0, 10),
        duration_months: 20,
        target_amount: ''
      });
      fetchChitFunds(true);
    } catch (err) {
      toast.error('Failed to create Chit Fund.');
    }
  };

  const handleAddContribution = async (e, chitId) => {
    e.preventDefault();
    try {
      await api.post('/chit-contributions/', {
        ...contribution,
        chit_fund: chitId,
        amount: parseFloat(contribution.amount),
        month_number: parseInt(contribution.month_number)
      });
      toast.success('Contribution logged successfully!');
      setSelectedChitId(null);
      setContribution({
        amount: '',
        date: new Date().toISOString().slice(0, 10),
        month_number: 1
      });
      fetchChitFunds(true);
    } catch (err) {
      toast.error('Failed to log contribution.');
    }
  };

  const handleEditContributionSubmit = async (e, id) => {
    e.preventDefault();
    try {
      await api.patch(`/chit-contributions/${id}/`, {
        amount: parseFloat(editingContributionData.amount),
        date: editingContributionData.date,
        month_number: parseInt(editingContributionData.month_number)
      });
      toast.success('Contribution updated successfully!');
      setEditingContributionId(null);
      fetchChitFunds(true);
    } catch (err) {
      toast.error('Failed to update contribution.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', fontSize: '0.85rem', width: '100%' }}>
      <header className="responsive-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 className="header-title">Chit Funds (Cheeti)</h1>
          <p className="header-subtitle">Track your community savings & contributions</p>
        </div>
        <button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="btn" 
          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}
        >
          {showCreateForm ? 'Cancel' : <><Plus size={16} /> New Chit Fund</>}
        </button>
      </header>

      {/* Create Form */}
      {showCreateForm && (
        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem', background: 'linear-gradient(135deg, var(--bg-panel) 0%, var(--bg-main) 100%)' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Target size={20} className="text-primary" /> Start a New Chit Fund
          </h3>
          <form onSubmit={handleCreateChit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600' }}>Name (e.g. 5L Kuugo Cheeti)</label>
              <input type="text" className="input-field" value={newChit.name} onChange={e => setNewChit({...newChit, name: e.target.value})} required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600' }}>Target Amount (Total Pot)</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={{ position: 'absolute', left: '0.75rem', color: 'var(--text-light)', fontWeight: 600 }}>{currencySymbol}</span>
                <input type="number" step="0.01" className="input-field" style={{ paddingLeft: '2rem' }} value={newChit.target_amount} onChange={e => setNewChit({...newChit, target_amount: e.target.value})} />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600' }}>Start Date</label>
              <input type="date" className="input-field" value={newChit.start_date} onChange={e => setNewChit({...newChit, start_date: e.target.value})} required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600' }}>Duration (Months)</label>
              <input type="number" className="input-field" value={newChit.duration_months} onChange={e => setNewChit({...newChit, duration_months: parseInt(e.target.value)})} required />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button type="submit" className="btn" style={{ width: '100%' }}>Create</button>
            </div>
          </form>
        </div>
      )}

      {/* Chit Funds List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {!chitFundsLoaded ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading...</div>
        ) : chits.length === 0 ? (
          <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <PieChart size={32} style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
            <p style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-main)' }}>No Chit Funds yet</p>
            <p style={{ fontSize: '0.85rem' }}>Create one to start tracking your monthly contributions.</p>
          </div>
        ) : (
          chits.map(chit => {
            const totalContributed = chit.contributions.reduce((sum, c) => sum + parseFloat(c.amount), 0);
            const monthsPaid = chit.contributions.length;
            const progressPercent = Math.min((monthsPaid / chit.duration_months) * 100, 100);
            const targetStr = chit.target_amount ? formatCurrency(chit.target_amount) : 'Flexible';
            
            return (
              <div key={chit.id} className="card interactive-table" style={{ overflow: 'hidden', padding: 0 }}>
                <div 
                  onClick={() => setExpandedChitId(expandedChitId === chit.id ? null : chit.id)}
                  style={{ padding: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                >
                  
                  {/* Left Info */}
                  <div style={{ flex: '1 1 300px' }}>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <PieChart className="text-primary" size={20} />
                      {chit.name}
                    </h2>
                    <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.75rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Calendar size={14} /> Started {chit.start_date}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Target size={14} /> Target: <strong style={{ color: 'var(--text-main)' }}>{targetStr}</strong>
                      </span>
                    </div>
                  </div>
                  
                  {/* Stats */}
                  <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Saved</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--success)' }}>
                        {formatCurrency(totalContributed)}
                      </div>
                    </div>
                    
                    {/* Progress Circle */}
                    <div style={{ width: '60px', height: '60px', position: 'relative' }}>
                      <svg width="60" height="60" style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx="30" cy="30" r="26" stroke="var(--bg-main)" strokeWidth="6" fill="none" />
                        <circle cx="30" cy="30" r="26" stroke="var(--primary-color)" strokeWidth="6" strokeDasharray="163" strokeDashoffset={163 - (progressPercent / 100) * 163} strokeLinecap="round" fill="none" style={{ transition: 'stroke-dashoffset 1s ease' }} />
                      </svg>
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700 }}>
                        {monthsPaid}/{chit.duration_months}
                      </div>
                    </div>
                    <div style={{ color: 'var(--text-light)', display: 'flex', alignItems: 'center' }}>
                      <ChevronRight size={24} style={{ transform: expandedChitId === chit.id ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                    </div>
                  </div>
                  
                </div>
                
                {/* Expandable Contribution Area */}
                {expandedChitId === chit.id && (
                <div style={{ background: 'var(--bg-main)', borderTop: '1px solid var(--border-color)', padding: '1.5rem' }}>
                  
                  {selectedChitId === chit.id ? (
                    <form onSubmit={(e) => handleAddContribution(e, chit.id)} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', fontSize: '0.75rem' }}>Month Number</label>
                        <input type="number" min="1" max={chit.duration_months} className="input-field" style={{ marginBottom: 0, width: '100px' }} value={contribution.month_number} onChange={e => setContribution({...contribution, month_number: e.target.value})} required />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', fontSize: '0.75rem' }}>Your Contribution (Paid)</label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                          <span style={{ position: 'absolute', left: '0.75rem', color: 'var(--text-light)', fontWeight: 600 }}>{currencySymbol}</span>
                          <input type="number" step="0.01" className="input-field" style={{ paddingLeft: '2rem', marginBottom: 0, width: '150px' }} value={contribution.amount} onChange={e => setContribution({...contribution, amount: e.target.value})} required />
                        </div>
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', fontSize: '0.75rem' }}>Payment Date</label>
                        <input type="date" className="input-field" style={{ marginBottom: 0 }} value={contribution.date} onChange={e => setContribution({...contribution, date: e.target.value})} required />
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button type="submit" className="btn">Save</button>
                        <button type="button" className="btn btn-secondary" onClick={() => setSelectedChitId(null)}>Cancel</button>
                      </div>
                    </form>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ fontSize: '0.9rem', margin: 0, color: 'var(--text-main)' }}>Contribution Log</h4>
                        <button onClick={() => {
                          setSelectedChitId(chit.id);
                          setContribution({ ...contribution, month_number: monthsPaid + 1 });
                        }} className="btn" style={{ padding: '0.5rem 1rem' }}>
                          <Plus size={16} /> Log Payment
                        </button>
                      </div>
                      
                      <div style={{ overflowX: 'auto' }}>
                        {chit.contributions.length === 0 ? (
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem 0' }}>
                            <Info size={14} /> No contributions logged yet.
                          </div>
                        ) : (
                          <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left', whiteSpace: 'nowrap' }}>
                            <thead>
                              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                                <th style={{ padding: '0.5rem 0' }}>Month</th>
                                <th style={{ padding: '0.5rem 0' }}>Date</th>
                                <th style={{ padding: '0.5rem 0' }}>Standard ({chit.target_amount ? formatCurrency(chit.target_amount / chit.duration_months) : 'N/A'})</th>
                                <th style={{ padding: '0.5rem 0', color: 'var(--text-main)' }}>You Paid</th>
                                <th style={{ padding: '0.5rem 0', color: 'var(--success)' }}>Dividend Saved</th>
                                <th style={{ padding: '0.5rem 0' }}>Total Pool Collected</th>
                                <th style={{ padding: '0.5rem 0', width: '40px' }}></th>
                              </tr>
                            </thead>
                            <tbody>
                              {chit.contributions.sort((a, b) => a.month_number - b.month_number).map(c => {
                                const standardContribution = chit.target_amount ? (chit.target_amount / chit.duration_months) : 0;
                                const amountPaid = parseFloat(c.amount);
                                const dividend = chit.target_amount ? (standardContribution - amountPaid) : 0;
                                const totalPool = amountPaid * chit.duration_months;
                                const isEditable = c.created_at ? (new Date() - new Date(c.created_at)) <= 24 * 60 * 60 * 1000 : true;
                                
                                return editingContributionId === c.id ? (
                                  <tr key={`edit-${c.id}`} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td colSpan={7} style={{ padding: '0.75rem 0' }}>
                                      <form onSubmit={(e) => handleEditContributionSubmit(e, c.id)} style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', margin: 0 }}>
                                        <input type="number" min="1" max={chit.duration_months} className="input-field" style={{ marginBottom: 0, width: '70px', padding: '0.4rem', fontSize: '0.75rem' }} value={editingContributionData.month_number} onChange={e => setEditingContributionData({...editingContributionData, month_number: e.target.value})} required />
                                        <input type="date" className="input-field" style={{ marginBottom: 0, width: '130px', padding: '0.4rem', fontSize: '0.75rem' }} value={editingContributionData.date} onChange={e => setEditingContributionData({...editingContributionData, date: e.target.value})} required />
                                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                          <span style={{ position: 'absolute', left: '0.5rem', color: 'var(--text-light)', fontWeight: 600, fontSize: '0.75rem' }}>{currencySymbol}</span>
                                          <input type="number" step="0.01" className="input-field" style={{ paddingLeft: '1.5rem', marginBottom: 0, width: '100px', padding: '0.4rem 0.4rem 0.4rem 1.5rem', fontSize: '0.75rem' }} value={editingContributionData.amount} onChange={e => setEditingContributionData({...editingContributionData, amount: e.target.value})} required />
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
                                          <button type="submit" className="btn" style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem' }}>Save</button>
                                          <button type="button" className="btn btn-secondary" onClick={() => setEditingContributionId(null)} style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem' }}>Cancel</button>
                                        </div>
                                      </form>
                                    </td>
                                  </tr>
                                ) : (
                                  <tr key={c.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '0.75rem 0', fontWeight: 600 }}>{c.month_number}</td>
                                    <td style={{ padding: '0.75rem 0', color: 'var(--text-muted)' }}>{c.date}</td>
                                    <td style={{ padding: '0.75rem 0' }}>{chit.target_amount ? formatCurrency(standardContribution) : '-'}</td>
                                    <td style={{ padding: '0.75rem 0', fontWeight: 700, color: 'var(--text-main)' }}>{formatCurrency(amountPaid)}</td>
                                    <td style={{ padding: '0.75rem 0', fontWeight: 700, color: 'var(--success)' }}>{chit.target_amount ? `+${formatCurrency(dividend)}` : '-'}</td>
                                    <td style={{ padding: '0.75rem 0', fontWeight: 600 }}>{formatCurrency(totalPool)}</td>
                                    <td style={{ padding: '0.75rem 0', textAlign: 'right' }}>
                                      {isEditable ? (
                                        <button onClick={() => {
                                          setEditingContributionId(c.id);
                                          setEditingContributionData({
                                            amount: c.amount,
                                            date: c.date,
                                            month_number: c.month_number
                                          });
                                        }} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', padding: '0.2rem' }} title="Edit Contribution">
                                          <Edit2 size={14} />
                                        </button>
                                      ) : (
                                        <button disabled style={{ background: 'none', border: 'none', color: 'var(--text-muted)', opacity: 0.3, padding: '0.2rem' }} title="Can only edit within 24 hours of logging">
                                          <Edit2 size={14} />
                                        </button>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        )}
                      </div>
                    </div>
                  )}
                  
                </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChitFunds;
