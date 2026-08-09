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
  Bell,
  Menu,
  X
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Note: For a real app, you might use context or a store for this,
  // but we can fetch it periodically or on load here
  React.useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await fetch('http://localhost:8001/api/notifications/', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
        });
        const data = await res.json();
        const unread = data.filter(n => !n.is_read).length;
        setUnreadCount(unread);
      } catch (err) { }
    };
    fetchUnread();
    
    // Refresh unread count every 30 seconds
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

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
          <Link to="/notifications" onClick={closeMenu} className={`nav-item ${location.pathname === '/notifications' ? 'active' : ''}`} style={{ position: 'relative' }}>
            <Bell size={18} />
            Notifications
            {unreadCount > 0 && (
              <span style={{ 
                position: 'absolute', right: '1rem', background: 'var(--primary-color)', 
                color: 'white', fontSize: '0.75rem', padding: '0.1rem 0.4rem', 
                borderRadius: '10px', fontWeight: 'bold' 
              }}>
                {unreadCount}
              </span>
            )}
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
