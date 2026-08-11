import React from 'react';
import { useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  
  const getPageInfo = (path) => {
    if (path.startsWith('/dashboard')) return { title: 'Dashboard', desc: 'Your financial overview' };
    if (path.startsWith('/log-transaction')) return { title: 'Log Transaction', desc: 'Add new income or expense' };
    if (path.startsWith('/history')) return { title: 'History', desc: 'View your transaction history' };
    if (path.startsWith('/budgets')) return { title: 'Budgets', desc: 'Manage your monthly budgets' };
    if (path.startsWith('/debts')) return { title: 'Debts', desc: 'Track who owes you and who you owe' };
    if (path.startsWith('/chits')) return { title: 'Chit Funds', desc: 'Manage your chit fund investments' };
    if (path.startsWith('/profile')) return { title: 'Profile', desc: 'Manage your personal information' };
    if (path.startsWith('/settings')) return { title: 'Settings', desc: 'App preferences and configurations' };
    if (path.startsWith('/notifications')) return { title: 'Notifications', desc: 'Recent alerts and updates' };
    return { title: 'FinSet', desc: '' };
  };

  const { title, desc } = getPageInfo(location.pathname);

  // Exclude navbar from auth pages and landing page
  const isAuthPage = ['/login', '/register', '/forgot-password'].includes(location.pathname) || location.pathname.startsWith('/reset-password') || location.pathname === '/';
  if (isAuthPage) return null;

  return (
    <header className="flex items-center justify-between px-6 md:px-8 h-16 md:h-20 border-b border-border bg-background shrink-0 w-full z-20">
      <div>
        <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground m-0 leading-none">{title}</h1>
        {desc && <p className="text-xs md:text-sm text-muted-foreground font-medium mt-1">{desc}</p>}
      </div>
    </header>
  );
};

export default Navbar;
