import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  const [currency, setCurrency] = useState('INR');
  const [theme, setTheme] = useState('light');
  const [loading, setLoading] = useState(true);

  // Define currency formatters
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

    useEffect(() => {
    // Load theme from local storage if available
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
    if (savedTheme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');

    // Fetch user profile for currency
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (token) {
          const res = await api.get('/auth/profile/');
          if (res.data.profile) {
            if (res.data.profile.preferred_currency) {
              setCurrency(res.data.profile.preferred_currency);
            }
            if (res.data.profile.theme) {
              setTheme(res.data.profile.theme);
              localStorage.setItem('theme', res.data.profile.theme);
              document.documentElement.setAttribute('data-theme', res.data.profile.theme);
              if (res.data.profile.theme === 'dark') document.documentElement.classList.add('dark');
              else document.documentElement.classList.remove('dark');
            }
          }
        }
      } catch (err) {
        console.error('Failed to load profile', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    if (newTheme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');

    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        await api.put('/auth/profile/', { theme: newTheme });
      }
    } catch (err) {
      console.error('Failed to sync theme to DB', err);
    }
  };

  const updateCurrency = async (newCurrency) => {
    try {
      await api.put('/auth/profile/', { preferred_currency: newCurrency });
      setCurrency(newCurrency);
    } catch (err) {
      console.error('Failed to update currency', err);
      throw err;
    }
  };

  return (
    <SettingsContext.Provider value={{ currency, theme, toggleTheme, updateCurrency, formatCurrency, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};
