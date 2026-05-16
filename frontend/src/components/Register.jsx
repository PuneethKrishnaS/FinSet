import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { UserPlus, User, Lock, Mail, ArrowRight, Wallet } from 'lucide-react';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/register/', {
        username,
        email,
        password
      });
      // Automatically login after register
      const res = await api.post('/auth/login/', {
        username,
        password
      });
      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);
      navigate('/dashboard');
    } catch (err) {
      setError('Registration failed. This username may already be taken.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split-card">
      {/* Left Abstract Illustration Panel */}
      <div className="auth-left">
        <img src="/auth-bg.png" alt="Abstract Wealth" className="auth-bg-img" />
        <div className="auth-left-content">
          <div className="auth-logo">
            <div className="auth-logo-icon">
              <Wallet size={20} />
            </div>
            ExpenseTracker
          </div>
          
          <div className="auth-quote-container">
            <p className="auth-quote">"A budget is telling your money where to go instead of wondering where it went."</p>
            <div className="auth-author">
              <div style={{ width: '20px', height: '2px', backgroundColor: 'white', borderRadius: '2px' }}></div>
              John C. Maxwell
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="auth-right">
        <div className="auth-header">
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Join us and start managing your finances effectively.</p>
        </div>

        {error && (
          <div style={{ padding: '0.8rem 1rem', background: 'var(--danger-light)', color: 'var(--danger)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: '500', border: '1px solid #fecaca' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div className="auth-form-group">
            <label className="auth-label">Username</label>
            <div className="auth-input-wrapper">
              <User size={18} className="auth-input-icon" />
              <input 
                type="text" 
                className="auth-input" 
                placeholder="Choose a username" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

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

          <div className="auth-form-group">
            <label className="auth-label">Password</label>
            <div className="auth-input-wrapper">
              <Lock size={18} className="auth-input-icon" />
              <input 
                type="password" 
                className="auth-input" 
                placeholder="Create a strong password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Creating account...' : (
              <>Sign Up <UserPlus size={18} /></>
            )}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login" className="auth-link">Log in instead</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
