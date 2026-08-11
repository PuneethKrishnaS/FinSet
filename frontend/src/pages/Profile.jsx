import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { User, Mail, Lock, Download, Trash2, CheckCircle2, AlertTriangle, X, Edit2 } from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // States for Edit Profile
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ first_name: '', last_name: '' });
  const [editLoading, setEditLoading] = useState(false);
  
  // States for Change Password
  const [passwordForm, setPasswordForm] = useState({ old_password: '', new_password: '', confirm_password: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
  
  // States for Export & Delete
  const [exportLoading, setExportLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/profile/');
      setProfileData(res.data);
      setEditForm({
        first_name: res.data.first_name || '',
        last_name: res.data.last_name || ''
      });
    } catch (err) {
      console.error('Error fetching profile', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      const res = await api.put('/auth/profile/', editForm);
      setProfileData(res.data);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update profile', err);
    } finally {
      setEditLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    
    setPasswordLoading(true);
    setPasswordMessage({ type: '', text: '' });
    
    try {
      await api.post('/auth/change-password/', {
        old_password: passwordForm.old_password,
        new_password: passwordForm.new_password
      });
      setPasswordMessage({ type: 'success', text: 'Password updated successfully!' });
      setPasswordForm({ old_password: '', new_password: '', confirm_password: '' });
      setTimeout(() => setPasswordMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setPasswordMessage({ type: 'error', text: err.response?.data?.error || 'Failed to update password.' });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleExportData = async () => {
    setExportLoading(true);
    try {
      const res = await api.get('/export-data/');
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(res.data, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "finset_data.json");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    } catch (err) {
      console.error('Failed to export data', err);
      alert('Failed to export data. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      await api.delete('/auth/profile/');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      navigate('/login');
    } catch (err) {
      console.error('Failed to delete account', err);
      alert('Failed to delete account. Please try again.');
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col w-full h-full pb-10">
      <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground mb-6">My Profile</h1>
      <div className="p-8 text-center text-muted-foreground bg-card rounded-xl border border-border">Loading profile...</div>
    </div>
  );
  
  if (!profileData) return (
    <div className="flex flex-col w-full h-full pb-10">
      <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground mb-6">My Profile</h1>
      <div className="p-8 text-center text-destructive bg-card rounded-xl border border-destructive/20">Error loading profile.</div>
    </div>
  );

  return (
    <div className="flex flex-col w-full h-full pb-10">
      <header className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground mb-1">My Profile</h1>
        <p className="text-sm md:text-base text-muted-foreground font-medium">Manage your personal information and security</p>
      </header>

      <div className="flex flex-col gap-6 md:gap-8 max-w-4xl mx-auto w-full">
        
        {/* Personal Details Card */}
        <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center text-3xl font-bold shadow-lg shadow-purple-500/20 shrink-0">
                {profileData.first_name ? profileData.first_name[0].toUpperCase() : <User size={36} />}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-1">
                  {(profileData.first_name || profileData.last_name) ? `${profileData.first_name} ${profileData.last_name}` : 'FinSet User'}
                </h2>
                <p className="text-muted-foreground flex items-center gap-2 font-medium">
                  <Mail size={16} /> {profileData.email}
                </p>
              </div>
            </div>
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="bg-transparent border border-border hover:bg-muted text-foreground text-sm font-bold py-2.5 px-5 rounded-xl transition-colors flex items-center gap-2 shadow-sm"
              >
                <Edit2 size={16} /> Edit Profile
              </button>
            )}
          </div>

          {isEditing && (
            <form onSubmit={handleEditSubmit} className="mt-8 bg-muted/30 p-6 rounded-xl border border-border/50">
              <h3 className="text-base font-bold text-foreground mb-5">Update Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">First Name</label>
                  <input 
                    type="text" 
                    value={editForm.first_name}
                    onChange={(e) => setEditForm({...editForm, first_name: e.target.value})}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Last Name</label>
                  <input 
                    type="text" 
                    value={editForm.last_name}
                    onChange={(e) => setEditForm({...editForm, last_name: e.target.value})}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm"
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <button 
                  type="button" 
                  onClick={() => setIsEditing(false)} 
                  className="bg-transparent border border-border hover:bg-background text-foreground text-sm font-bold py-2.5 px-6 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={editLoading}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold py-2.5 px-6 rounded-xl transition-colors shadow-sm"
                >
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Security & Password Card */}
        <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm">
          <div className="mb-8">
            <h3 className="flex items-center gap-3 text-xl font-bold text-foreground mb-2">
              <div className="p-2 bg-primary/10 text-primary rounded-xl"><Lock size={20} /></div>
              Security & Password
            </h3>
            <p className="text-muted-foreground font-medium text-sm">Keep your account secure by updating your password regularly.</p>
          </div>
          
          {passwordMessage.text && (
            <div className={`flex items-center gap-3 p-4 rounded-xl mb-6 font-bold text-sm border ${
              passwordMessage.type === 'success' 
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                : 'bg-destructive/10 text-destructive border-destructive/20'
            }`}>
              {passwordMessage.type === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
              {passwordMessage.text}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="max-w-2xl">
            <div className="mb-6 md:w-1/2">
              <label className="block text-xs font-semibold text-foreground mb-1.5">Current Password</label>
              <input 
                type="password" 
                placeholder="••••••••"
                required
                value={passwordForm.old_password}
                onChange={(e) => setPasswordForm({...passwordForm, old_password: e.target.value})}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">New Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  required
                  value={passwordForm.new_password}
                  onChange={(e) => setPasswordForm({...passwordForm, new_password: e.target.value})}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Confirm New Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  required
                  value={passwordForm.confirm_password}
                  onChange={(e) => setPasswordForm({...passwordForm, confirm_password: e.target.value})}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm"
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={passwordLoading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2.5 px-6 rounded-xl transition-colors shadow-sm text-sm"
            >
              {passwordLoading ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Data & Privacy Card */}
        <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm">
          <h3 className="text-xl font-bold text-foreground mb-6">
            Data & Privacy
          </h3>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-6 bg-background rounded-xl border border-border mb-4">
            <div>
              <p className="font-bold text-foreground text-base mb-1">Export Financial Data</p>
              <p className="text-muted-foreground text-sm font-medium leading-relaxed max-w-xl">
                Download all your incomes, expenses, budgets, and chit fund data in a clean JSON format for your own records.
              </p>
            </div>
            <button 
              onClick={handleExportData}
              disabled={exportLoading}
              className="bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border font-bold py-2.5 px-5 rounded-xl transition-colors shadow-sm text-sm flex items-center gap-2 whitespace-nowrap shrink-0"
            >
              <Download size={18} /> {exportLoading ? 'Exporting...' : 'Export Data'}
            </button>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-6 bg-destructive/5 rounded-xl border border-destructive/20">
            <div>
              <p className="font-bold text-destructive text-base mb-1">Delete Account</p>
              <p className="text-destructive/80 text-sm font-medium leading-relaxed max-w-xl">
                Permanently delete your account and all associated financial data. This action is irreversible.
              </p>
            </div>
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold py-2.5 px-5 rounded-xl transition-colors shadow-sm text-sm flex items-center gap-2 whitespace-nowrap shrink-0"
            >
              <Trash2 size={18} /> Delete Account
            </button>
          </div>
        </div>

      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card p-8 rounded-3xl max-w-md w-full shadow-2xl border border-border relative">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center">
                  <AlertTriangle size={24} />
                </div>
                <h2 className="text-xl font-bold text-foreground">Delete Account?</h2>
              </div>
              <button 
                onClick={() => setShowDeleteConfirm(false)} 
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
              >
                <X size={24} />
              </button>
            </div>
            
            <p className="text-muted-foreground text-sm font-medium leading-relaxed mb-8">
              Are you absolutely sure you want to delete your account? All your transactions, budgets, and settings will be permanently destroyed. <strong className="text-destructive font-bold">This cannot be reversed.</strong>
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleteLoading}
                className="bg-transparent border border-border hover:bg-muted text-foreground text-sm font-bold py-3 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground text-sm font-bold py-3 rounded-xl transition-colors shadow-sm shadow-destructive/20"
              >
                {deleteLoading ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Profile;
