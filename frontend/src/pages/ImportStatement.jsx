import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, CheckCircle, X, Trash2, ArrowRight, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import useFinanceStore from '../store/useFinanceStore';
import { useSettings } from '../context/SettingsContext';

const ImportStatement = () => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [step, setStep] = useState(1); // 1: Upload, 2: Review
  
  const { markDataDirty } = useFinanceStore();
  const { formatCurrency } = useSettings();
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return toast.error('Please select a file first.');
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await api.post('/parse-statement/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setTransactions(res.data.transactions);
      setStep(2);
      toast.success(`Successfully parsed ${res.data.transactions.length} transactions`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to parse statement. Please ensure it is a valid PDF.');
    } finally {
      setIsUploading(false);
    }
  };

  const toggleSelect = (id) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, selected: !t.selected } : t));
  };

  const handleBulkImport = async () => {
    const selectedTxns = transactions.filter(t => t.selected);
    if (selectedTxns.length === 0) return toast.error('No transactions selected.');
    
    setIsUploading(true);
    try {
      const res = await api.post('/bulk-import/', { transactions: selectedTxns });
      toast.success(`Successfully imported ${res.data.imported_count} transactions!`);
      markDataDirty();
      navigate('/history');
    } catch (err) {
      console.error(err);
      toast.error('Failed to import transactions.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="header-title">Import Statement</h1>
          <p className="header-subtitle">Upload your bank statement PDF to automatically extract and log transactions.</p>
        </div>
      </div>

      {step === 1 && (
        <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
          <div style={{ maxWidth: '400px', margin: '0 auto' }}>
            <div style={{ 
              width: '80px', height: '80px', borderRadius: '50%', background: 'var(--primary-light)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' 
            }}>
              <UploadCloud size={40} color="var(--primary-color)" />
            </div>
            
            <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-main)' }}>Upload Bank Statement</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
              Currently supports Bank of Baroda PDF statements. Ensure your PDF is text-based and not scanned images.
            </p>
            
            <input 
              type="file" 
              accept="application/pdf" 
              id="file-upload" 
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            
            <label htmlFor="file-upload" className="btn btn-secondary" style={{ width: '100%', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
              {file ? file.name : 'Select PDF File'}
            </label>
            
            <button 
              className="btn" 
              style={{ width: '100%', opacity: file ? 1 : 0.5, cursor: file ? 'pointer' : 'not-allowed' }}
              onClick={handleUpload}
              disabled={!file || isUploading}
            >
              {isUploading ? <><Loader size={18} className="spin" /> Parsing...</> : 'Parse Statement'}
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ margin: '0 0 0.25rem 0', color: 'var(--text-main)' }}>Review Transactions</h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Found {transactions.length} transactions. Uncheck any you don't want to import.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn btn-secondary" onClick={() => setStep(1)}>Cancel</button>
              <button className="btn" onClick={handleBulkImport} disabled={isUploading}>
                {isUploading ? <Loader size={16} className="spin" /> : <><CheckCircle size={16} /> Import Selected ({transactions.filter(t => t.selected).length})</>}
              </button>
            </div>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '1rem 0.5rem', width: '40px' }}>
                    <input 
                      type="checkbox" 
                      checked={transactions.every(t => t.selected)}
                      onChange={(e) => setTransactions(prev => prev.map(t => ({ ...t, selected: e.target.checked })))}
                    />
                  </th>
                  <th style={{ padding: '1rem 0.5rem' }}>Date</th>
                  <th style={{ padding: '1rem 0.5rem' }}>Description</th>
                  <th style={{ padding: '1rem 0.5rem' }}>Category</th>
                  <th style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(t => (
                  <tr key={t.id} style={{ borderBottom: '1px solid var(--border-color)', opacity: t.selected ? 1 : 0.5 }}>
                    <td style={{ padding: '1rem 0.5rem' }}>
                      <input 
                        type="checkbox" 
                        checked={t.selected}
                        onChange={() => toggleSelect(t.id)}
                      />
                    </td>
                    <td style={{ padding: '1rem 0.5rem', whiteSpace: 'nowrap' }}>{t.date}</td>
                    <td style={{ padding: '1rem 0.5rem' }}>
                      <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '250px' }} title={t.description}>
                        {t.description}
                      </div>
                    </td>
                    <td style={{ padding: '1rem 0.5rem' }}>
                      <span style={{ 
                        background: 'var(--bg-panel)', padding: '0.2rem 0.5rem', borderRadius: '4px', 
                        fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-main)', textTransform: 'capitalize' 
                      }}>
                        {t.category}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 0.5rem', textAlign: 'right', fontWeight: 600, color: t.type === 'income' ? 'var(--success)' : 'var(--text-main)' }}>
                      {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportStatement;
