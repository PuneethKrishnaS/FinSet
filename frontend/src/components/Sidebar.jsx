import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { PiSquaresFourDuotone, PiArrowsLeftRight, PiClockCounterClockwiseDuotone as HistoryIcon, PiTargetDuotone, PiUsersDuotone, PiGear as SettingsIcon, PiSignOut, PiUserDuotone, PiChartPieDuotone, PiBellDuotone, PiDotsThreeVertical } from "react-icons/pi";
import api from '../services/api';
import useFinanceStore from '../store/useFinanceStore';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { dataVersion } = useFinanceStore();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await api.get('/notifications/');
        const unread = res.data.filter(n => !n.is_read).length;
        setUnreadCount(unread);
      } catch (err) { }
    };
    fetchUnread();
    
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [dataVersion]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  const closeMenu = () => setIsOpen(false);

  const navItems = [
    { name: 'Dashboard', icon: PiSquaresFourDuotone, path: '/dashboard' },
    { name: 'Transactions', icon: PiArrowsLeftRight, path: '/log-transaction' },
    { name: 'PiClockCounterClockwiseDuotone', icon: HistoryIcon, path: '/history' },
    { name: 'Budgets', icon: PiTargetDuotone, path: '/budgets' },
    { name: 'Debts', icon: PiUsersDuotone, path: '/debts' },
    { name: 'Chits', icon: PiChartPieDuotone, path: '/chits' },
  ];

  return (
    <>
      {/* --- MOBILE HEADER --- */}
      <header className="md:hidden flex items-center justify-between px-5 h-16 bg-sidebar border-b border-sidebar-border shrink-0">
        <div className="flex items-center gap-2">
          <img src="/FinSet_Logo.svg" alt="FinSet" className="h-8" />
          <span className="text-xl font-bold text-sidebar-foreground">FinSet</span>
        </div>
        
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="p-2 text-sidebar-foreground relative hover:bg-sidebar-accent rounded-full transition-colors"
          >
            <PiDotsThreeVertical size={24} />
            {unreadCount > 0 && !isOpen && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-destructive rounded-full border-2 border-sidebar"></span>
            )}
          </button>
          
          {isOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-popover border border-border rounded  py-2 z-50">
              <Link to="/profile" onClick={closeMenu} className="flex items-center gap-3 px-4 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
                <PiUserDuotone size={16} /> Profile
              </Link>
              <Link to="/notifications" onClick={closeMenu} className="flex items-center justify-between px-4 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
                <div className="flex items-center gap-3">
                  <PiBellDuotone size={16} /> Notifications
                </div>
                {unreadCount > 0 && (
                  <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </Link>
              <Link to="/settings" onClick={closeMenu} className="flex items-center gap-3 px-4 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
                <SettingsIcon size={16} /> PiGear
              </Link>
              <div className="h-px bg-border my-1"></div>
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors">
                <PiSignOut size={16} /> Log out
              </button>
            </div>
          )}
        </div>
      </header>

      {/* --- DESKTOP SIDEBAR --- */}
      <aside className="hidden md:flex flex-col w-[260px] bg-sidebar border-r border-sidebar-border h-screen shrink-0">
        <div className="flex items-center gap-3 px-6 h-20 border-b border-sidebar-border shrink-0 w-full justify-center">
          <img src="/FinSet_Logo.svg" alt="FinSet" className="h-8" />
          <span className="text-2xl font-bold text-sidebar-foreground tracking-tight ">FinSet</span>
        </div>

        <nav className="flex-1  py-6 flex flex-col gap-1 overflow-y-auto">
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path}
                to={item.path} 
                className={`flex items-center gap-3 px-4 py-3 rounded text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground' 
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                }`}
              >
                <item.icon size={18} className={isActive ? 'text-sidebar-primary-foreground ' : 'text-sidebar-foreground/70'} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-sidebar-border flex flex-col gap-1 shrink-0">
          <Link to="/profile" className={`flex items-center gap-3 px-4 py-2.5 rounded text-sm font-medium transition-colors ${location.pathname === '/profile' ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'}`}>
            <PiUserDuotone size={18} /> Profile
          </Link>
          <Link to="/notifications" className={`flex items-center justify-between px-4 py-2.5 rounded text-sm font-medium transition-colors ${location.pathname === '/notifications' ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'}`}>
            <div className="flex items-center gap-3">
              <PiBellDuotone size={18} /> Notifications
            </div>
            {unreadCount > 0 && (
              <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </Link>
          <Link to="/settings" className={`flex items-center gap-3 px-4 py-2.5 rounded text-sm font-medium transition-colors ${location.pathname === '/settings' ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'}`}>
            <SettingsIcon size={18} /> PiGear
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded text-sm font-medium text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
            <PiSignOut size={18} /> Log out
          </button>
        </div>
      </aside>

      {/* --- MOBILE BOTTOM NAVIGATION --- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[68px] bg-background border-t border-border flex justify-around items-center px-2 z-50 pb-safe">
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path}
              to={item.path} 
              className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[10px] font-medium ${isActive ? 'font-bold' : ''}`}>{item.name === 'Transactions' ? 'Log' : item.name}</span>
            </Link>
          )
        })}
      </nav>
    </>
  );
};

export default Sidebar;
