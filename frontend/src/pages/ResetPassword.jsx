import Button from '../components/Button';
import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';
import { PiLock, PiArrowRight, PiSunDuotone, PiMoonDuotone, PiArrowLeft, PiCheckCircle , PiSpinnerGap } from "react-icons/pi";
import { useSettings } from '../context/SettingsContext';

const ResetPassword = () => {
  const { uid, token } = useParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isChecking, setIsChecking] = useState(true);
  const [isInvalidLink, setIsInvalidLink] = useState(false);
  const { theme, toggleTheme } = useSettings();

  React.useEffect(() => {
    const checkToken = async () => {
      try {
        await api.get(`/auth/password-reset-confirm/${uid}/${token}/`);
        setIsChecking(false);
      } catch (err) {
        setError('The reset link is invalid or has expired. You may have already used it.');
        setIsInvalidLink(true);
        setIsChecking(false);
      }
    };
    checkToken();
  }, [uid, token]);

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

        <Button 
          type="button"
          onClick={toggleTheme} 
          className="absolute top-6 right-6 p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full transition-colors"
          title="Toggle Theme"
        >
          {theme === 'light' ? <PiMoonDuotone size={20} /> : <PiSunDuotone size={20} />}
        </Button>
        
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-black text-foreground mb-2">Create New Password</h2>
          <p className="text-sm font-medium text-muted-foreground">Your new password must be different from previous used passwords.</p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-destructive/10 border border-destructive/20 text-destructive text-sm font-bold rounded flex items-center gap-2">
            {error}
          </div>
        )}

        {success ? (
          <div className="text-center py-8 px-4">
            <PiCheckCircle size={48} className="text-emerald-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2 text-foreground">Password Reset Successful</h3>
            <p className="text-sm font-medium text-muted-foreground mb-8">
              Your password has been changed successfully. You can now log in with your new credentials.
            </p>
            <Link to="/login" className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-6 rounded transition-all  active:scale-[0.98]">
              <PiArrowLeft size={16} /> Back to Login
            </Link>
          </div>
        ) : isChecking ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-sm font-medium text-muted-foreground">Validating link...</p>
          </div>
        ) : isInvalidLink ? (
          <div className="text-center py-8 px-4">
            <p className="text-sm font-medium text-muted-foreground mb-8">
              Please request a new password reset link if you still need to change your password.
            </p>
            <Link to="/forgot-password" className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-6 rounded transition-all  active:scale-[0.98]">
              Request New Link
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider">New Password</label>
              <div className="relative">
                <PiLock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full bg-background md:bg-muted/30 border border-border rounded pl-11 pr-4 py-3 text-sm text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider">Confirm New Password</label>
              <div className="relative">
                <PiLock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full bg-background md:bg-muted/30 border border-border rounded pl-11 pr-4 py-3 text-sm text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                />
              </div>
            </div>

            <Button type="submit" isLoading={loading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3.5 rounded transition-all  active:scale-[0.98] flex items-center justify-center gap-2 mt-2">
              {loading && <PiSpinnerGap className="animate-spin" size={18} />}
              
                <>Reset Password <PiArrowRight size={18} /></>
              
            </Button>
          </form>
        )}

      </div>
    </div>
  );
};

export default ResetPassword;
