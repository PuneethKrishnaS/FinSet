import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { UserPlus, User, Lock, Mail, Sun, Moon } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useSettings();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/register/', {
        first_name: firstName,
        last_name: lastName,
        email,
        password
      });
      // Automatically login after register
      const res = await api.post('/auth/login/', {
        username: email,
        password
      });
      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);
      navigate('/dashboard');
    } catch (err) {
      setError('Registration failed. This email may already be in use or password is too simple.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col md:flex-row bg-background md:bg-card md:rounded-3xl md:shadow-2xl overflow-hidden md:max-w-5xl md:min-h-[600px] border-border md:border relative z-10">
      
      {/* Left Abstract Illustration Panel (Desktop Only) */}
      <div className="hidden md:flex md:w-1/2 relative bg-primary items-center justify-center overflow-hidden">
        <img src="/auth-bg.png" alt="Abstract Wealth" className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay" />
        <div className="relative z-10 p-12 flex flex-col justify-between h-full text-primary-foreground">
          <div className="flex items-center">
            <img src="/FinSet_Logo.svg" alt="FinSet" className="h-8 brightness-0 invert" />
          </div>
          
          <div className="mt-auto">
            <p className="text-xl font-bold leading-relaxed mb-4">"A budget is telling your money where to go instead of wondering where it went."</p>
            <div className="flex items-center gap-3 text-sm font-semibold opacity-80">
              <div className="w-5 h-0.5 bg-white rounded-full"></div>
              John C. Maxwell
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
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
        
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-black text-foreground mb-2">Create Account</h2>
          <p className="text-sm font-medium text-muted-foreground">Join us and start managing your finances effectively.</p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-destructive/10 border border-destructive/20 text-destructive text-sm font-bold rounded-xl flex items-center gap-2">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-foreground uppercase tracking-wider">First Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="John" 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-full bg-background md:bg-muted/30 border border-border rounded-xl pl-10 pr-3 py-2.5 text-sm text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-foreground uppercase tracking-wider">Last Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Doe" 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="w-full bg-background md:bg-muted/30 border border-border rounded-xl pl-10 pr-3 py-2.5 text-sm text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-foreground uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input 
                type="email" 
                placeholder="name@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-background md:bg-muted/30 border border-border rounded-xl pl-10 pr-3 py-2.5 text-sm text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-foreground uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input 
                type="password" 
                placeholder="Create a strong password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-background md:bg-muted/30 border border-border rounded-xl pl-10 pr-3 py-2.5 text-sm text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3.5 rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2 mt-4">
            {loading ? 'Creating account...' : (
              <>Sign Up <UserPlus size={18} /></>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm font-medium text-muted-foreground">
          Already have an account? <Link to="/login" className="font-bold text-primary hover:text-primary/80 transition-colors ml-1">Log in instead</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
