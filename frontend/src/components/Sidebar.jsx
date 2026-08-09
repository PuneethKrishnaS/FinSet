import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowRightLeft,
  History as HistoryIcon,
  Target,
  Users,
  Settings as SettingsIcon,
  LogOut,
  User,
  PieChart,
  Menu,
  X
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  const closeMenu = () => setIsOpen(false);

  return (
    <aside className="sidebar">
      <div className="sidebar-header" style={{ display: 'flex', alignItems: 'center' }}>
        <div className="logo-area" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <img src="/FinSet_Logo.svg" alt="FinSet" style={{ height: '32px' }} />
        </div>
        <button className="mobile-menu-btn" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div className={`sidebar-content ${isOpen ? 'open' : ''}`}>
        <nav className="nav-menu">
          <Link to="/dashboard" onClick={closeMenu} className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}>
            <LayoutDashboard size={18} />
            Dashboard
          </Link>
          <Link to="/log-transaction" onClick={closeMenu} className={`nav-item ${location.pathname === '/log-transaction' ? 'active' : ''}`}>
            <ArrowRightLeft size={18} />
            Transactions
          </Link>
          <Link to="/history" onClick={closeMenu} className={`nav-item ${location.pathname === '/history' ? 'active' : ''}`}>
            <HistoryIcon size={18} />
            History
          </Link>
          <Link to="/budgets" onClick={closeMenu} className={`nav-item ${location.pathname === '/budgets' ? 'active' : ''}`}>
            <Target size={18} />
            Budgets
          </Link>
          <Link to="/debts" onClick={closeMenu} className={`nav-item ${location.pathname === '/debts' ? 'active' : ''}`}>
            <Users size={18} />
            Debts
          </Link>
          <Link to="/chits" onClick={closeMenu} className={`nav-item ${location.pathname === '/chits' ? 'active' : ''}`}>
            <PieChart size={18} />
            Chit Funds
          </Link>
        </nav>

        <div className="bottom-nav">
          <Link to="/profile" onClick={closeMenu} className={`nav-item ${location.pathname === '/profile' ? 'active' : ''}`}>
            <User size={18} />
            Profile
          </Link>
          <Link to="/settings" onClick={closeMenu} className={`nav-item ${location.pathname === '/settings' ? 'active' : ''}`}>
            <SettingsIcon size={18} />
            Settings
          </Link>
          <button onClick={handleLogout} className="nav-item" style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}>
            <LogOut size={18} />
            Log out
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
