import React, { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import { Moon, Sun, Globe, Save, Plus, Trash2, Bell, Settings as SettingsIcon, Layout, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { ICON_MAP, PREDEFINED_CATEGORIES, getCategoryIcon, getIconForCategory } from '../utils/CategoryIcons';
import useFinanceStore from '../store/useFinanceStore';

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
  const [newCategoryIcon, setNewCategoryIcon] = useState('DollarSign');
  const [showIconPicker, setShowIconPicker] = useState(false);
  const { markDataDirty } = useFinanceStore();

  // UI State
  const [activeTab, setActiveTab] = useState('general');

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
      const res = await api.post('/categories/', { name: newCategoryName.trim(), type: 'expense', icon: newCategoryIcon });
      setCategories([...categories, res.data]);
      setNewCategoryName('');
      setNewCategoryIcon('DollarSign');
      setShowIconPicker(false);
      markDataDirty();
      toast.success('Category added');
    } catch (err) {
      toast.error('Failed to add category');
    }
  };

  const handleAddPredefined = async (predef) => {
    if (categories.some(c => c.name.toLowerCase() === predef.name.toLowerCase())) {
      toast.error(`${predef.name} already exists`);
      return;
    }
    try {
      const res = await api.post('/categories/', { name: predef.name, type: 'expense', icon: predef.icon });
      setCategories([...categories, res.data]);
      markDataDirty();
      toast.success(`${predef.name} added`);
    } catch (err) {
      toast.error(`Failed to add ${predef.name}`);
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      await api.delete(`/categories/${id}/`);
      setCategories(categories.filter(c => c.id !== id));
      markDataDirty();
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

  const ToggleSwitch = ({ checked, onChange }) => (
    <div
      onClick={onChange}
      className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors shadow-inner ${checked ? 'bg-primary' : 'bg-muted-foreground/30'}`}
    >
      <div 
        className={`w-5 h-5 rounded-full bg-white absolute top-0.5  transition-all ${checked ? 'left-[22px]' : 'left-0.5'}`}
      />
    </div>
  );

  return (
    <div className="flex flex-col w-full h-full pb-10">


      <div className="max-w-4xl w-full mx-auto flex flex-col gap-6">

        {/* Tabs */}
        <div className="flex gap-4 border-b border-border mb-2 overflow-x-auto">
          <button 
            className={`py-3 px-6 text-sm flex items-center gap-2 whitespace-nowrap transition-all border-b-2 font-bold ${
              activeTab === 'general' 
                ? 'border-primary text-primary bg-primary/5 rounded-t-xl' 
                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded-t-xl'
            }`} 
            onClick={() => setActiveTab('general')}
          >
            <SettingsIcon size={16} /> General
          </button>
          <button 
            className={`py-3 px-6 text-sm flex items-center gap-2 whitespace-nowrap transition-all border-b-2 font-bold ${
              activeTab === 'categories' 
                ? 'border-primary text-primary bg-primary/5 rounded-t-xl' 
                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded-t-xl'
            }`} 
            onClick={() => setActiveTab('categories')}
          >
            <Layout size={16} /> Categories
          </button>
        </div>

        {/* General Tab */}
        {activeTab === 'general' && (
          <div className="flex flex-col gap-6 md:gap-8">

            <div className="bg-card border border-border rounded-2xl p-6 md:p-8 ">
              <h3 className="flex items-center gap-3 text-xl font-bold text-foreground mb-6">
                <div className="p-2 bg-primary/10 text-primary rounded-xl"><Sun size={20} /></div>
                Appearance
              </h3>

              <div className="flex justify-between items-center p-5 bg-background rounded-xl border border-border ">
                <div>
                  <p className="font-bold text-foreground text-base mb-1">Theme Mode</p>
                  <p className="text-muted-foreground text-sm font-medium">Choose between light and dark modes.</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{theme === 'light' ? 'Light Mode' : 'Dark Mode'}</span>
                  <ToggleSwitch checked={theme === 'dark'} onChange={toggleTheme} />
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 md:p-8 ">
              <h3 className="flex items-center gap-3 text-xl font-bold text-foreground mb-6">
                <div className="p-2 bg-primary/10 text-primary rounded-xl"><Globe size={20} /></div>
                Regional Preferences
              </h3>

              <div className="p-5 bg-background rounded-xl border border-border ">
                <label className="block font-bold text-foreground mb-1">Base Currency</label>
                <p className="text-sm text-muted-foreground font-medium mb-4">This currency is used globally across your dashboard and transaction history.</p>

                <select
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                  className="w-full max-w-sm bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 "
                >
                  {CURRENCIES.map(c => (
                    <option key={c.code} value={c.code}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end mt-2">
              <button
                onClick={handleSave}
                disabled={saving || selectedCurrency === currency}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-8 rounded-xl transition-colors  text-sm flex items-center gap-2"
              >
                <Save size={18} /> {saving ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 ">
            <div className="mb-8">
              <h3 className="flex items-center gap-3 text-xl font-bold text-foreground mb-2">
                <div className="p-2 bg-primary/10 text-primary rounded-xl"><Layout size={20} /></div>
                Manage Categories
              </h3>
              <p className="text-muted-foreground font-medium text-sm">Organize your transactions with custom categories.</p>
            </div>

            {/* Predefined Categories Grid */}
            <div className="mb-8">
              <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Quick Add Predefined Categories</h4>
              <div className="flex flex-wrap gap-3">
                {PREDEFINED_CATEGORIES.map(predef => {
                  const alreadyAdded = categories.some(c => c.name.toLowerCase() === predef.name.toLowerCase());
                  return (
                    <button
                      key={predef.name}
                      onClick={() => handleAddPredefined(predef)}
                      disabled={alreadyAdded}
                      className={`flex items-center gap-2 py-2 px-4 rounded-xl text-sm font-bold transition-all ${
                        alreadyAdded 
                          ? 'bg-muted/30 border border-border text-muted-foreground cursor-not-allowed opacity-60' 
                          : 'bg-primary/5 border border-primary/20 text-primary hover:bg-primary/10 hover:border-primary/40 '
                      }`}
                    >
                      {getCategoryIcon(predef.icon, 16, 'currentColor')}
                      {predef.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <hr className="border-border my-8" />

            <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Add Custom Category</h4>
            <form onSubmit={handleAddCategory} className="flex flex-col gap-4 mb-8 bg-background p-6 rounded-2xl border border-border ">

              <div className="flex flex-col md:flex-row gap-4">
                <button
                  type="button"
                  onClick={() => setShowIconPicker(!showIconPicker)}
                  className="w-12 h-12 flex items-center justify-center bg-card border border-border rounded-xl text-primary hover:bg-muted/50 transition-colors  shrink-0"
                  title="Choose Icon"
                >
                  {getCategoryIcon(newCategoryIcon, 20)}
                </button>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                  placeholder="Enter custom category name..."
                  className="flex-1 bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 "
                  required
                />
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-6 rounded-xl transition-colors  text-sm flex items-center justify-center gap-2 shrink-0"
                >
                  <Plus size={18} /> Add
                </button>
              </div>

              {showIconPicker && (
                <div className="flex flex-wrap gap-2 p-4 bg-card rounded-xl border border-border mt-2 ">
                  {Object.keys(ICON_MAP).map(iconName => (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => { setNewCategoryIcon(iconName); setShowIconPicker(false); }}
                      className={`p-2.5 rounded-lg border transition-all ${
                        newCategoryIcon === iconName 
                          ? 'border-primary bg-primary/10 text-primary' 
                          : 'border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                      }`}
                    >
                      {getCategoryIcon(iconName, 20)}
                    </button>
                  ))}
                </div>
              )}
            </form>

            <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Your Categories</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map(cat => (
                <div key={cat.id} className="flex justify-between items-center p-4 bg-background rounded-xl border border-border  group">
                  <span className="font-bold text-sm text-foreground flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center bg-primary/10 text-primary rounded-lg">
                      {getIconForCategory(cat, 18)}
                    </div>
                    <span className="truncate">{cat.name}</span>
                  </span>
                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Delete Category"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {categories.length === 0 && (
                <div className="col-span-full text-center p-12 text-muted-foreground bg-background rounded-xl border border-border">
                  No categories yet. Add one above!
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Settings;
