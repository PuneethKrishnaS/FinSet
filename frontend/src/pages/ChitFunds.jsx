import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useSettings } from '../context/SettingsContext';
import { PiChartPieDuotone, PiPlus, PiCalendarDuotone, PiCaretRight, PiTargetDuotone, PiInfo, PiPencilSimple } from "react-icons/pi";
import useFinanceStore from '../store/useFinanceStore';

const ChitFunds = () => {
  const { formatCurrency, currency } = useSettings();
  const { chitFunds: chits, chitFundsLoaded, fetchChitFunds, dataVersion, markDataDirty } = useFinanceStore();

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
  }, [fetchChitFunds, dataVersion]);

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
      markDataDirty();
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
      markDataDirty();
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
      markDataDirty();
    } catch (err) {
      toast.error('Failed to update contribution.');
    }
  };

  return (
    <div className="flex flex-col w-full h-full pb-10">
      
      <div className="flex flex-col gap-4 mb-6 relative z-10">
        <div className="flex justify-end">
          <button 
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold py-2 px-4 rounded transition-colors  active:scale-[0.98] flex items-center gap-2"
          >
            {showCreateForm ? 'Cancel' : <><PiPlus size={16} /> New Chit Fund</>}
          </button>
        </div>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-card border border-border rounded p-6  mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50"></div>
          <div className="relative z-10">
            <h3 className="text-lg font-bold text-foreground mb-5 flex items-center gap-2">
              <PiTargetDuotone size={20} className="text-primary" /> Start a New Chit Fund
            </h3>
            <form onSubmit={handleCreateChit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              <div className="lg:col-span-2">
                <label className="block text-xs font-semibold text-foreground mb-1.5">Name (e.g. 5L Kuugo Cheeti)</label>
                <input 
                  type="text" 
                  required
                  value={newChit.name} 
                  onChange={e => setNewChit({...newChit, name: e.target.value})} 
                  className="w-full bg-background border border-border rounded px-4 py-2.5 text-sm text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">PiTargetDuotone Amount</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-muted-foreground font-bold">{currencySymbol}</span>
                  <input 
                    type="number" 
                    step="0.01"
                    value={newChit.target_amount} 
                    onChange={e => setNewChit({...newChit, target_amount: e.target.value})} 
                    className="w-full bg-background border border-border rounded pl-8 pr-4 py-2.5 text-sm text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Start Date</label>
                <input 
                  type="date" 
                  required
                  value={newChit.start_date} 
                  onChange={e => setNewChit({...newChit, start_date: e.target.value})} 
                  className="w-full bg-background border border-border rounded px-4 py-2.5 text-sm text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Duration (Months)</label>
                <input 
                  type="number" 
                  required
                  value={newChit.duration_months} 
                  onChange={e => setNewChit({...newChit, duration_months: parseInt(e.target.value)})} 
                  className="w-full bg-background border border-border rounded px-4 py-2.5 text-sm text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div className="lg:col-span-5 flex justify-end mt-2">
                <button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2.5 px-6 rounded transition-colors ">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Chit Funds List */}
      <div className="flex flex-col gap-6">
        {!chitFundsLoaded ? (
          <div className="text-center p-8 text-muted-foreground bg-card border border-border rounded">Loading...</div>
        ) : chits.length === 0 ? (
          <div className="bg-card border border-border rounded p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
              <PiChartPieDuotone size={32} className="text-muted-foreground/50" />
            </div>
            <p className="font-bold text-lg text-foreground mb-2">No Chit Funds yet</p>
            <p className="text-sm text-muted-foreground">Create one to start tracking your monthly community contributions.</p>
          </div>
        ) : (
          chits.map(chit => {
            const totalContributed = chit.contributions.reduce((sum, c) => sum + parseFloat(c.amount), 0);
            const monthsPaid = chit.contributions.length;
            const progressPercent = Math.min((monthsPaid / chit.duration_months) * 100, 100);
            const targetStr = chit.target_amount ? formatCurrency(chit.target_amount) : 'Flexible';
            
            return (
              <div key={chit.id} className="bg-card border border-border rounded overflow-hidden hover: transition-shadow">
                <div 
                  onClick={() => setExpandedChitId(expandedChitId === chit.id ? null : chit.id)}
                  className="p-5 md:p-6 flex flex-wrap gap-6 justify-between items-center cursor-pointer group hover:bg-muted/10 transition-colors"
                >
                  
                  {/* Left PiInfo */}
                  <div className="flex-1 min-w-[280px]">
                    <h2 className="text-lg md:text-xl font-bold text-foreground mb-1.5 flex items-center gap-2">
                      <PiChartPieDuotone className="text-primary shrink-0" size={22} />
                      {chit.name}
                    </h2>
                    <div className="flex gap-4 text-xs font-semibold text-muted-foreground mt-2">
                      <span className="flex items-center gap-1.5">
                        <PiCalendarDuotone size={14} /> Started {chit.start_date}
                      </span>
                      <span className="flex items-center gap-1.5 bg-muted/50 px-2 py-0.5 rounded">
                        <PiTargetDuotone size={14} /> PiTargetDuotone: <strong className="text-foreground">{targetStr}</strong>
                      </span>
                    </div>
                  </div>
                  
                  {/* Stats */}
                  <div className="flex gap-6 items-center">
                    <div className="text-right">
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Total Saved</div>
                      <div className="text-2xl font-black text-emerald-500">
                        {formatCurrency(totalContributed)}
                      </div>
                    </div>
                    
                    {/* Progress Circle */}
                    <div className="w-14 h-14 relative shrink-0">
                      <svg width="56" height="56" className="-rotate-90">
                        <circle cx="28" cy="28" r="24" className="stroke-muted" strokeWidth="5" fill="none" />
                        <circle 
                          cx="28" cy="28" r="24" 
                          className="stroke-primary transition-all duration-1000 ease-in-out" 
                          strokeWidth="5" 
                          strokeDasharray="150" 
                          strokeDashoffset={150 - (progressPercent / 100) * 150} 
                          strokeLinecap="round" fill="none" 
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-foreground">
                        {monthsPaid}/{chit.duration_months}
                      </div>
                    </div>
                    <div className="text-muted-foreground group-hover:text-foreground transition-colors shrink-0">
                      <PiCaretRight size={24} className={`transition-transform duration-200 ${expandedChitId === chit.id ? 'rotate-90' : ''}`} />
                    </div>
                  </div>
                  
                </div>
                
                {/* Expandable Contribution Area */}
                {expandedChitId === chit.id && (
                <div className="bg-background border-t border-border p-5 md:p-6">
                  
                  {selectedChitId === chit.id ? (
                    <div className="bg-card border border-border p-5 rounded mb-6">
                      <h4 className="text-sm font-bold mb-4">Log New Contribution</h4>
                      <form onSubmit={(e) => handleAddContribution(e, chit.id)} className="flex flex-wrap gap-4 items-end">
                        <div>
                          <label className="block text-xs font-semibold text-foreground mb-1.5">Month Num</label>
                          <input type="number" min="1" max={chit.duration_months} required value={contribution.month_number} onChange={e => setContribution({...contribution, month_number: e.target.value})} className="w-20 bg-background border border-border rounded px-3 py-2.5 text-sm text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/50" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-foreground mb-1.5">Amount Paid</label>
                          <div className="relative flex items-center">
                            <span className="absolute left-3 text-muted-foreground font-bold">{currencySymbol}</span>
                            <input type="number" step="0.01" required value={contribution.amount} onChange={e => setContribution({...contribution, amount: e.target.value})} className="w-32 bg-background border border-border rounded pl-8 pr-3 py-2.5 text-sm text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/50" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-foreground mb-1.5">Payment Date</label>
                          <input type="date" required value={contribution.date} onChange={e => setContribution({...contribution, date: e.target.value})} className="w-40 bg-background border border-border rounded px-3 py-2.5 text-sm text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/50" />
                        </div>
                        <div className="flex gap-2">
                          <button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2.5 px-5 rounded transition-colors text-sm">Save</button>
                          <button type="button" onClick={() => setSelectedChitId(null)} className="bg-muted hover:bg-muted/80 text-foreground font-bold py-2.5 px-5 rounded transition-colors text-sm">Cancel</button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      <div className="flex justify-between items-center">
                        <h4 className="text-base font-bold text-foreground">Contribution Log</h4>
                        <button onClick={() => {
                          setSelectedChitId(chit.id);
                          setContribution({ ...contribution, month_number: monthsPaid + 1 });
                        }} className="bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold py-1.5 px-3 rounded transition-colors flex items-center gap-1.5">
                          <PiPlus size={14} /> Log Payment
                        </button>
                      </div>
                      
                      <div className="overflow-x-auto rounded border border-border">
                        {chit.contributions.length === 0 ? (
                          <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground bg-muted/20">
                            <PiInfo size={16} /> No contributions logged yet.
                          </div>
                        ) : (
                          <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-muted/50 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                              <tr>
                                <th className="px-4 py-3">Mth</th>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3">Standard ({chit.target_amount ? formatCurrency(chit.target_amount / chit.duration_months) : 'N/A'})</th>
                                <th className="px-4 py-3 text-foreground">You Paid</th>
                                <th className="px-4 py-3 text-emerald-500">Div Saved</th>
                                <th className="px-4 py-3">Total Pool</th>
                                <th className="px-4 py-3 w-10"></th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border bg-card/50">
                              {chit.contributions.sort((a, b) => a.month_number - b.month_number).map(c => {
                                const standardContribution = chit.target_amount ? (chit.target_amount / chit.duration_months) : 0;
                                const amountPaid = parseFloat(c.amount);
                                const dividend = chit.target_amount ? (standardContribution - amountPaid) : 0;
                                const totalPool = amountPaid * chit.duration_months;
                                const isEditable = c.created_at ? (new Date() - new Date(c.created_at)) <= 24 * 60 * 60 * 1000 : true;
                                
                                return editingContributionId === c.id ? (
                                  <tr key={`edit-${c.id}`} className="bg-primary/5">
                                    <td colSpan={7} className="p-3">
                                      <form onSubmit={(e) => handleEditContributionSubmit(e, c.id)} className="flex gap-2 items-center">
                                        <input type="number" min="1" max={chit.duration_months} required value={editingContributionData.month_number} onChange={e => setEditingContributionData({...editingContributionData, month_number: e.target.value})} className="w-16 bg-background border border-border rounded px-2 py-1.5 text-xs text-foreground font-medium" />
                                        <input type="date" required value={editingContributionData.date} onChange={e => setEditingContributionData({...editingContributionData, date: e.target.value})} className="w-32 bg-background border border-border rounded px-2 py-1.5 text-xs text-foreground font-medium" />
                                        <div className="relative flex items-center">
                                          <span className="absolute left-2 text-muted-foreground font-bold text-xs">{currencySymbol}</span>
                                          <input type="number" step="0.01" required value={editingContributionData.amount} onChange={e => setEditingContributionData({...editingContributionData, amount: e.target.value})} className="w-24 bg-background border border-border rounded pl-6 pr-2 py-1.5 text-xs text-foreground font-medium" />
                                        </div>
                                        <div className="flex gap-1 ml-auto">
                                          <button type="submit" className="bg-primary text-primary-foreground text-xs font-bold py-1.5 px-3 rounded">Save</button>
                                          <button type="button" onClick={() => setEditingContributionId(null)} className="bg-muted text-foreground text-xs font-bold py-1.5 px-3 rounded">Cancel</button>
                                        </div>
                                      </form>
                                    </td>
                                  </tr>
                                ) : (
                                  <tr key={c.id} className="hover:bg-muted/20 transition-colors">
                                    <td className="px-4 py-3 font-bold">{c.month_number}</td>
                                    <td className="px-4 py-3 text-muted-foreground font-medium">{c.date}</td>
                                    <td className="px-4 py-3 font-medium text-muted-foreground">{chit.target_amount ? formatCurrency(standardContribution) : '-'}</td>
                                    <td className="px-4 py-3 font-bold text-foreground">{formatCurrency(amountPaid)}</td>
                                    <td className="px-4 py-3 font-bold text-emerald-500">{chit.target_amount ? `+${formatCurrency(dividend)}` : '-'}</td>
                                    <td className="px-4 py-3 font-semibold text-muted-foreground">{formatCurrency(totalPool)}</td>
                                    <td className="px-4 py-3 text-right">
                                      {isEditable ? (
                                        <button onClick={() => {
                                          setEditingContributionId(c.id);
                                          setEditingContributionData({ amount: c.amount, date: c.date, month_number: c.month_number });
                                        }} className="text-primary hover:text-primary/80 transition-colors p-1" title="Edit Contribution">
                                          <PiPencilSimple size={14} />
                                        </button>
                                      ) : (
                                        <button disabled className="text-muted-foreground opacity-30 p-1 cursor-not-allowed" title="Can only edit within 24 hours">
                                          <PiPencilSimple size={14} />
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
