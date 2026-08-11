import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Mail, ArrowRight, Sun, Moon, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const { theme, toggleTheme } = useSettings();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/password-reset/', { email });
      setSuccess(true);
    } catch (err) {
      setError('An error occurred. Please try again.');
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
          <h2 className="auth-title">Reset Password</h2>
          <p className="auth-subtitle">Enter your email and we'll send you a link to reset your password.</p>
        </div>

        {error && (
          <div style={{ padding: '0.8rem 1rem', background: 'var(--danger-light)', color: 'var(--danger)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: '500', border: '1px solid #fecaca' }}>
            {error}
          </div>
        )}

        {success ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <CheckCircle2 size={48} className="text-success" style={{ margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Check your email</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
              We've sent a password reset link to <strong>{email}</strong>. Please check your inbox (and terminal in dev mode).
            </p>
            <Link to="/login" className="btn" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <ArrowLeft size={16} /> Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="auth-form-group">
              <label className="auth-label">Email Address</label>
              <div className="auth-input-wrapper">
                <Mail size={18} className="auth-input-icon" />
                <input 
                  type="email" 
                  className="auth-input" 
                  placeholder="name@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Sending link...' : (
                <>Send Reset Link <ArrowRight size={18} /></>
              )}
            </button>
          </form>
        )}

        {!success && (
          <div className="auth-footer" style={{ marginTop: '2rem' }}>
            Remembered your password? <Link to="/login" className="auth-link">Sign in</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
