import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';
import { Lock, ArrowRight, Sun, Moon, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

const ResetPassword = () => {
  const { uid, token } = useParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const { theme, toggleTheme } = useSettings();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await api.post(`/auth/password-reset-confirm/${uid}/${token}/`, { 
        new_password: newPassword 
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid or expired reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split-card">
      <div className="auth-left">
        <img src="/auth-bg.png" alt="Abstract Wealth" className="auth-bg-img" />
        <div className="auth-left-content">
          <div className="auth-logo" style={{ display: 'flex', alignItems: 'center' }}>
            <img src="/FinSet_Logo.svg" alt="FinSet" style={{ height: '32px' }} />
          </div>
          
          <div className="auth-quote-container">
            <p className="auth-quote">"Security is paramount. We make sure you always have safe access to your financial data."</p>
            <div className="auth-author">
              <div style={{ width: '20px', height: '2px', backgroundColor: 'white', borderRadius: '2px' }}></div>
              FinSet Team
            </div>
          </div>
        </div>
      </div>

      <div className="auth-right" style={{ position: 'relative' }}>
        <button 
          type="button"
          onClick={toggleTheme} 
          style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.5rem' }}
          title="Toggle Theme"
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
        
        <div className="auth-header">
          <h2 className="auth-title">Create New Password</h2>
          <p className="auth-subtitle">Your new password must be different from previous used passwords.</p>
        </div>

        {error && (
          <div style={{ padding: '0.8rem 1rem', background: 'var(--danger-light)', color: 'var(--danger)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: '500', border: '1px solid #fecaca' }}>
            {error}
          </div>
        )}

        {success ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <CheckCircle2 size={48} style={{ color: 'var(--success)', margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Password Reset Successful</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
              Your password has been changed successfully. You can now log in with your new credentials.
            </p>
            <Link to="/login" className="btn" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <ArrowLeft size={16} /> Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="auth-form-group">
              <label className="auth-label">New Password</label>
              <div className="auth-input-wrapper">
                <Lock size={18} className="auth-input-icon" />
                <input 
                  type="password" 
                  className="auth-input" 
                  placeholder="••••••••" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="auth-form-group">
              <label className="auth-label">Confirm New Password</label>
              <div className="auth-input-wrapper">
                <Lock size={18} className="auth-input-icon" />
                <input 
                  type="password" 
                  className="auth-input" 
                  placeholder="••••••••" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Resetting...' : (
                <>Reset Password <ArrowRight size={18} /></>
              )}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};

export default ResetPassword;
