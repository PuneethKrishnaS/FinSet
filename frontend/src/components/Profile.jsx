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

  if (loading) return <div className="loading-state">Loading profile...</div>;
  if (!profileData) return <div className="loading-state">Error loading profile.</div>;

  const btnOutlineStyle = {
    background: 'transparent',
    border: '1px solid var(--border-color)',
    color: 'var(--text-main)',
    padding: '0.6rem 1.2rem',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    fontWeight: '600',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s',
  };

  const labelStyle = {
    display: 'block',
    fontWeight: '600',
    color: 'var(--text-main)',
    marginBottom: '0.5rem',
    fontSize: '0.9rem'
  };

  return (
    <div className="page-container" style={{ paddingBottom: '3rem' }}>
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">Manage your personal information and security</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Personal Details Card */}
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{ 
                width: '80px', height: '80px', borderRadius: '50%', 
                background: 'linear-gradient(135deg, #6366f1, #a855f7)', 
                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                fontSize: '2rem', fontWeight: 'bold', boxShadow: '0 10px 25px -5px rgba(168, 85, 247, 0.4)' 
              }}>
                {profileData.first_name ? profileData.first_name[0].toUpperCase() : <User size={36} />}
              </div>
              <div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                  {(profileData.first_name || profileData.last_name) ? `${profileData.first_name} ${profileData.last_name}` : 'FinSet User'}
                </h2>
                <p style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
                  <Mail size={16} /> {profileData.email}
                </p>
              </div>
            </div>
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                style={btnOutlineStyle}
                onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-main)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <Edit2 size={16} /> Edit Profile
              </button>
            )}
          </div>

          {isEditing && (
            <form onSubmit={handleEditSubmit} style={{ marginTop: '2.5rem', background: 'var(--bg-main)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: 'var(--text-main)' }}>Update Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={labelStyle}>First Name</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    style={{ marginBottom: 0 }}
                    value={editForm.first_name}
                    onChange={(e) => setEditForm({...editForm, first_name: e.target.value})}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Last Name</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    style={{ marginBottom: 0 }}
                    value={editForm.last_name}
                    onChange={(e) => setEditForm({...editForm, last_name: e.target.value})}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setIsEditing(false)} style={btnOutlineStyle}>
                  Cancel
                </button>
                <button type="submit" className="btn" disabled={editLoading}>
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Security & Password Card */}
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              <div style={{ padding: '0.5rem', background: 'var(--primary-light)', color: 'var(--primary-color)', borderRadius: '10px' }}><Lock size={20} /></div>
              Security & Password
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Keep your account secure by updating your password regularly.</p>
          </div>
          
          {passwordMessage.text && (
            <div style={{ 
              padding: '1rem 1.25rem', 
              borderRadius: 'var(--radius-md)', 
              marginBottom: '1.5rem',
              display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: '500',
              background: passwordMessage.type === 'success' ? 'var(--success-light)' : 'var(--danger-light)',
              color: passwordMessage.type === 'success' ? 'var(--success)' : 'var(--danger)',
              border: `1px solid ${passwordMessage.type === 'success' ? '#bbf7d0' : '#fecaca'}`
            }}>
              {passwordMessage.type === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
              {passwordMessage.text}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} style={{ maxWidth: '100%' }}>
            <div style={{ marginBottom: '1.5rem', maxWidth: '50%' }}>
              <label style={labelStyle}>Current Password</label>
              <input 
                type="password" 
                className="input-field" 
                style={{ marginBottom: 0 }}
                placeholder="••••••••"
                required
                value={passwordForm.old_password}
                onChange={(e) => setPasswordForm({...passwordForm, old_password: e.target.value})}
              />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
              <div>
                <label style={labelStyle}>New Password</label>
                <input 
                  type="password" 
                  className="input-field" 
                  style={{ marginBottom: 0 }}
                  placeholder="••••••••"
                  required
                  value={passwordForm.new_password}
                  onChange={(e) => setPasswordForm({...passwordForm, new_password: e.target.value})}
                />
              </div>
              <div>
                <label style={labelStyle}>Confirm New Password</label>
                <input 
                  type="password" 
                  className="input-field" 
                  style={{ marginBottom: 0 }}
                  placeholder="••••••••"
                  required
                  value={passwordForm.confirm_password}
                  onChange={(e) => setPasswordForm({...passwordForm, confirm_password: e.target.value})}
                />
              </div>
            </div>
            
            <button type="submit" className="btn" disabled={passwordLoading}>
              {passwordLoading ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Data & Privacy Card */}
        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '2rem' }}>
            Data & Privacy
          </h3>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-main)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
            <div>
              <p style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '1.05rem', margin: '0 0 0.5rem 0' }}>Export Financial Data</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0, lineHeight: '1.5' }}>
                Download all your incomes, expenses, budgets, and chit fund data in a clean JSON format for your own records.
              </p>
            </div>
            <button 
              className="btn" 
              onClick={handleExportData}
              disabled={exportLoading}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap', marginLeft: '1rem' }}
            >
              <Download size={18} /> {exportLoading ? 'Exporting...' : 'Export Data'}
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--danger-light)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid #fecaca' }}>
            <div>
              <p style={{ fontWeight: '600', color: 'var(--danger)', fontSize: '1.05rem', margin: '0 0 0.5rem 0' }}>Delete Account</p>
              <p style={{ color: 'var(--danger)', opacity: 0.8, fontSize: '0.9rem', margin: 0, lineHeight: '1.5' }}>
                Permanently delete your account and all associated financial data. This action is irreversible.
              </p>
            </div>
            <button 
              className="btn" 
              onClick={() => setShowDeleteConfirm(true)}
              style={{ background: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap', marginLeft: '1rem', boxShadow: '0 4px 14px 0 rgba(239, 68, 68, 0.39)' }}
            >
              <Trash2 size={18} /> Delete Account
            </button>
          </div>
        </div>

      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal" style={{ background: 'var(--bg-panel)', padding: '2.5rem', borderRadius: '24px', maxWidth: '450px', width: '90%', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--danger-light)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AlertTriangle size={24} />
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>Delete Account?</h2>
              </div>
              <button onClick={() => setShowDeleteConfirm(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>
            
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '2rem' }}>
              Are you absolutely sure you want to delete your account? All your transactions, budgets, and settings will be permanently destroyed. <strong style={{ color: 'var(--danger)' }}>This cannot be reversed.</strong>
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <button 
                style={{ ...btnOutlineStyle, justifyContent: 'center', width: '100%' }}
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button 
                className="btn" 
                style={{ background: 'var(--danger)', width: '100%', justifyContent: 'center' }}
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
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
