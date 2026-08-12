import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { PiEnvelopeDuotone, PiArrowRight, PiSunDuotone, PiMoonDuotone, PiArrowLeft, PiCheckCircle } from "react-icons/pi";
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
    <div className="w-full flex-1 flex flex-col md:flex-row bg-background md:bg-card md:rounded md: overflow-hidden md:max-w-5xl md:min-h-[600px] border-border md:border relative z-10">
      
      {/* Left Abstract Illustration Panel (Desktop Only) */}
      <div className="hidden md:flex md:w-1/2 relative bg-primary items-center justify-center overflow-hidden">
        <img src="/auth-bg.png" alt="Abstract Wealth" className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay" />
        <div className="relative z-10 p-12 flex flex-col justify-between h-full text-primary-foreground">
          <div className="flex items-center">
            <img src="/FinSet_Logo.svg" alt="FinSet" className="h-8 brightness-0 invert" />
          </div>
          
          <div className="mt-auto">
            <p className="text-xl font-bold leading-relaxed mb-4">"Security is paramount. We make sure you always have safe access to your financial data."</p>
            <div className="flex items-center gap-3 text-sm font-semibold opacity-80">
              <div className="w-5 h-0.5 bg-white rounded-full"></div>
              FinSet Team
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Panel (Full screen mobile, half screen desktop) */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-6 py-12 md:px-16 md:py-12 relative min-h-screen md:min-h-0 bg-background md:bg-card">
        
        {/* Mobile Logo */}
        <div className="md:hidden flex items-center mb-8">
          <img src="/FinSet_Logo.svg" alt="FinSet" className="h-8" />
        </div>

        <button 
          type="button"
          onClick={toggleTheme} 
          className="absolute top-6 right-6 p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full transition-colors"
          title="Toggle Theme"
        >
          {theme === 'light' ? <PiMoonDuotone size={20} /> : <PiSunDuotone size={20} />}
        </button>
        
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-black text-foreground mb-2">Reset Password</h2>
          <p className="text-sm font-medium text-muted-foreground">Enter your email and we'll send you a link to reset your password.</p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-destructive/10 border border-destructive/20 text-destructive text-sm font-bold rounded flex items-center gap-2">
            {error}
          </div>
        )}

        {success ? (
          <div className="text-center py-8 px-4">
            <PiCheckCircle size={48} className="text-emerald-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2 text-foreground">PiCheck your email</h3>
            <p className="text-sm font-medium text-muted-foreground mb-8">
              We've sent a password reset link to <strong className="text-foreground">{email}</strong>. Please check your inbox (and terminal in dev mode).
            </p>
            <Link to="/login" className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-6 rounded transition-all  active:scale-[0.98]">
              <PiArrowLeft size={16} /> Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <PiEnvelopeDuotone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input 
                  type="email" 
                  placeholder="name@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-background md:bg-muted/30 border border-border rounded pl-11 pr-4 py-3 text-sm text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3.5 rounded transition-all  active:scale-[0.98] flex items-center justify-center gap-2 mt-2">
              {loading ? 'Sending link...' : (
                <>Send Reset Link <PiArrowRight size={18} /></>
              )}
            </button>
          </form>
        )}

        {!success && (
          <div className="mt-8 text-center text-sm font-medium text-muted-foreground">
            Remembered your password? <Link to="/login" className="font-bold text-primary hover:text-primary/80 transition-colors ml-1">Sign in</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
