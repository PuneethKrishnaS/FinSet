import React, { useState, useEffect, useRef } from 'react';
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
  MoreVertical,
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    <>
      {/* Sidebar acts as header on mobile, actual sidebar on desktop */}
      <aside className="sidebar">
        <div className="sidebar-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="logo-area" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 0 }}>
            <img src="/FinSet_Logo.svg" alt="FinSet" style={{ height: '32px' }} />
            <span style={{ fontSize: '1.4rem', fontWeight: '800' }}>FinSet</span>
          </div>
          
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button className="mobile-menu-btn" onClick={() => setIsOpen(!isOpen)}>
              <MoreVertical size={24} />
              {unreadCount > 0 && !isOpen && (
                <span style={{ 
                  position: 'absolute', top: '-2px', right: '-2px', width: '10px', height: '10px', 
                  background: 'var(--danger)', borderRadius: '50%', border: '2px solid var(--bg-main)' 
                }} />
              )}
            </button>
            
            {/* 3-Dot Mobile Dropdown Menu */}
            {isOpen && (
              <div className="mobile-dropdown-menu">
                <Link to="/profile" onClick={closeMenu} className="dropdown-item">
                  <User size={18} /> Profile
                </Link>
                <Link to="/notifications" onClick={closeMenu} className="dropdown-item" style={{ position: 'relative' }}>
                  <Bell size={18} /> Notifications
                  {unreadCount > 0 && (
                    <span style={{ 
                      background: 'var(--primary-color)', color: 'white', fontSize: '0.7rem', 
                      padding: '0.1rem 0.4rem', borderRadius: '10px', fontWeight: 'bold', marginLeft: 'auto'
                    }}>
                      {unreadCount}
                    </span>
                  )}
                </Link>
                <Link to="/settings" onClick={closeMenu} className="dropdown-item">
                  <SettingsIcon size={18} /> Settings
                </Link>
                <div style={{ height: '1px', background: 'var(--border-color)', margin: '0.5rem 0' }} />
                <button onClick={handleLogout} className="dropdown-item" style={{ color: 'var(--danger)' }}>
                  <LogOut size={18} /> Log out
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="sidebar-content">
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
          <Link to="/profile" className={`nav-item ${location.pathname === '/profile' ? 'active' : ''}`}>
            <User size={18} />
            Profile
          </Link>
          <Link to="/notifications" className={`nav-item ${location.pathname === '/notifications' ? 'active' : ''}`} style={{ position: 'relative' }}>
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
          <Link to="/settings" className={`nav-item ${location.pathname === '/settings' ? 'active' : ''}`}>
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

    {/* Mobile Bottom Navigation Bar */}
    <div className="mobile-bottom-navbar">
      <Link to="/dashboard" className={`mobile-nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}>
        <LayoutDashboard size={22} />
        <span>Home</span>
      </Link>
      <Link to="/log-transaction" className={`mobile-nav-item ${location.pathname === '/log-transaction' ? 'active' : ''}`}>
        <ArrowRightLeft size={22} />
        <span>Log</span>
      </Link>
      <Link to="/history" className={`mobile-nav-item ${location.pathname === '/history' ? 'active' : ''}`}>
        <HistoryIcon size={22} />
        <span>History</span>
      </Link>
      <Link to="/budgets" className={`mobile-nav-item ${location.pathname === '/budgets' ? 'active' : ''}`}>
        <Target size={22} />
        <span>Budgets</span>
      </Link>
      <Link to="/debts" className={`mobile-nav-item ${location.pathname === '/debts' ? 'active' : ''}`}>
        <Users size={22} />
        <span>Debts</span>
      </Link>
      <Link to="/chits" className={`mobile-nav-item ${location.pathname === '/chits' ? 'active' : ''}`}>
        <PieChart size={22} />
        <span>Chits</span>
      </Link>
    </div>
    </>
  );
};

export default Sidebar;
