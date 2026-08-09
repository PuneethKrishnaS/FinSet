import React, { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import { Moon, Sun, Globe, Save, Plus, Trash2, Bell, Settings as SettingsIcon, Layout, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const CURRENCIES = [
  { code: 'USD', label: 'US Dollar ($)' },
  { code: 'EUR', label: 'Euro (€)' },
  { code: 'GBP', label: 'British Pound (£)' },
  { code: 'INR', label: 'Indian Rupee (₹)' },
  { code: 'JPY', label: 'Japanese Yen (¥)' },
  { code: 'AUD', label: 'Australian Dollar (A$)' },
  { code: 'CAD', label: 'Canadian Dollar (C$)' },
];

const Settings = () => {
  const { currency, updateCurrency, theme, toggleTheme } = useSettings();
  const [selectedCurrency, setSelectedCurrency] = useState(currency);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  // UI State
  const [activeTab, setActiveTab] = useState('general');
  
  // Mock local preferences for UI richness
  const [notifications, setNotifications] = useState({
    budgetAlerts: true,
    weeklySummary: false,
    chitFundReminders: true
  });

  React.useEffect(() => {
    setSelectedCurrency(currency);
  }, [currency]);

  React.useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories/');
      setCategories(res.data);
    } catch (err) {
      console.error('Failed to fetch categories', err);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      const res = await api.post('/categories/', { name: newCategoryName.trim(), type: 'expense' });
      setCategories([...categories, res.data]);
      setNewCategoryName('');
      toast.success('Category added');
    } catch (err) {
      toast.error('Failed to add category');
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      await api.delete(`/categories/${id}/`);
      setCategories(categories.filter(c => c.id !== id));
      toast.success('Category deleted');
    } catch (err) {
      toast.error('Failed to delete category');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateCurrency(selectedCurrency);
      toast.success('Preferences saved successfully!');
    } catch (err) {
      toast.error('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const toggleNotification = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Styles
  const tabBtnStyle = (isActive) => ({
    padding: '0.75rem 1.5rem',
    background: isActive ? 'var(--bg-panel)' : 'transparent',
    border: 'none',
    color: isActive ? 'var(--primary-color)' : 'var(--text-muted)',
    fontWeight: isActive ? '700' : '600',
    cursor: 'pointer',
    borderBottom: isActive ? '3px solid var(--primary-color)' : '3px solid transparent',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s ease',
    fontSize: '0.95rem'
  });

  const ToggleSwitch = ({ checked, onChange }) => (
    <div 
      onClick={onChange}
      style={{
        width: '44px', height: '24px', borderRadius: '12px',
        background: checked ? 'var(--primary-color)' : 'var(--border-color)',
        position: 'relative', cursor: 'pointer', transition: 'background 0.3s'
      }}
    >
      <div style={{
        width: '20px', height: '20px', borderRadius: '50%', background: 'white',
        position: 'absolute', top: '2px', left: checked ? '22px' : '2px',
        transition: 'left 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
      }} />
    </div>
  );

  return (
    <div className="page-container" style={{ paddingBottom: '3rem' }}>
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">Application Settings</h1>
        <p className="page-subtitle">Customize your FinSet experience</p>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem' }}>
          <button style={tabBtnStyle(activeTab === 'general')} onClick={() => setActiveTab('general')}>
            <SettingsIcon size={18} /> General
          </button>
          <button style={tabBtnStyle(activeTab === 'categories')} onClick={() => setActiveTab('categories')}>
            <Layout size={18} /> Categories
          </button>
          <button style={tabBtnStyle(activeTab === 'notifications')} onClick={() => setActiveTab('notifications')}>
            <Bell size={18} /> Notifications
          </button>
        </div>

        {/* General Tab */}
        {activeTab === 'general' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div className="card" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ padding: '0.5rem', background: 'var(--primary-light)', color: 'var(--primary-color)', borderRadius: '10px' }}><Sun size={20} /></div>
                Appearance
              </h3>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div>
                  <p style={{ fontWeight: '600', color: 'var(--text-main)', margin: '0 0 0.25rem 0', fontSize: '1.05rem' }}>Theme Mode</p>
                  <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>Choose between light and dark modes.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>{theme === 'light' ? 'Light Mode' : 'Dark Mode'}</span>
                  <ToggleSwitch checked={theme === 'dark'} onChange={toggleTheme} />
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ padding: '0.5rem', background: 'var(--primary-light)', color: 'var(--primary-color)', borderRadius: '10px' }}><Globe size={20} /></div>
                Regional Preferences
              </h3>
              
              <div style={{ padding: '1.5rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <label style={{ display: 'block', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Base Currency</label>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>This currency is used globally across your dashboard and transaction history.</p>
                
                <select 
                  value={selectedCurrency} 
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                  className="input-field"
                  style={{ marginBottom: '0', maxWidth: '300px' }}
                >
                  {CURRENCIES.map(c => (
                    <option key={c.code} value={c.code}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button 
                className="btn" 
                onClick={handleSave} 
                disabled={saving || selectedCurrency === currency}
                style={{ padding: '0.75rem 2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Save size={18} /> {saving ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <div style={{ padding: '0.5rem', background: 'var(--primary-light)', color: 'var(--primary-color)', borderRadius: '10px' }}><Layout size={20} /></div>
                  Manage Categories
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Organize your transactions with custom categories.</p>
              </div>
            </div>

            <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
              <input 
                type="text" 
                value={newCategoryName}
                onChange={e => setNewCategoryName(e.target.value)}
                placeholder="Enter new category name..."
                className="input-field"
                style={{ marginBottom: 0, flex: 1 }}
              />
              <button 
                type="submit"
                className="btn"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}
              >
                <Plus size={18} /> Add Category
              </button>
            </form>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
              {categories.map(cat => (
                <div key={cat.id} style={{ 
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                  padding: '1rem 1.25rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', 
                  border: '1px solid var(--border-color)' 
                }}>
                  <span style={{ fontWeight: '600', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <DollarSign size={16} style={{ color: 'var(--primary-color)' }} />
                    {cat.name}
                  </span>
                  <button 
                    onClick={() => handleDeleteCategory(cat.id)} 
                    style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', opacity: 0.7, padding: '0.25rem' }}
                    onMouseOver={(e) => e.currentTarget.style.opacity = 1}
                    onMouseOut={(e) => e.currentTarget.style.opacity = 0.7}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              {categories.length === 0 && (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)' }}>
                  No custom categories yet. Add one above!
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ padding: '0.5rem', background: 'var(--primary-light)', color: 'var(--primary-color)', borderRadius: '10px' }}><Bell size={20} /></div>
              Email & Push Alerts
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div>
                  <p style={{ fontWeight: '600', color: 'var(--text-main)', margin: '0 0 0.25rem 0', fontSize: '1.05rem' }}>Budget Alerts</p>
                  <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>Get notified when you exceed 80% of any budget.</p>
                </div>
                <ToggleSwitch checked={notifications.budgetAlerts} onChange={() => toggleNotification('budgetAlerts')} />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div>
                  <p style={{ fontWeight: '600', color: 'var(--text-main)', margin: '0 0 0.25rem 0', fontSize: '1.05rem' }}>Weekly Financial Summary</p>
                  <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>Receive a weekly digest of your spending habits.</p>
                </div>
                <ToggleSwitch checked={notifications.weeklySummary} onChange={() => toggleNotification('weeklySummary')} />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div>
                  <p style={{ fontWeight: '600', color: 'var(--text-main)', margin: '0 0 0.25rem 0', fontSize: '1.05rem' }}>Chit Fund Reminders</p>
                  <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>Get reminded 3 days before a chit fund payment is due.</p>
                </div>
                <ToggleSwitch checked={notifications.chitFundReminders} onChange={() => toggleNotification('chitFundReminders')} />
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Settings;
