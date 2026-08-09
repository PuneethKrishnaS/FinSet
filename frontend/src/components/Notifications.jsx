import React, { useState, useEffect } from 'react';
import { Bell, Check, Trash2 } from 'lucide-react';
import api from '../services/api';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications/');
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.post('/notifications/', { action: 'mark_read_single', id });
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/', { action: 'mark_read' });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const clearAll = async () => {
    try {
      await api.post('/notifications/', { action: 'clear_all' });
      setNotifications([]);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <h1 className="page-title">Notifications</h1>
        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="page-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Bell size={28} style={{ color: 'var(--primary-color)' }} />
          Notifications
        </h1>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={markAllAsRead} className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Check size={18} /> Mark all read
          </button>
          <button onClick={clearAll} className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderColor: 'var(--danger)', color: 'var(--danger)' }}>
            <Trash2 size={18} /> Clear all
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: '1rem' }}>
        {notifications.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Bell size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
            <p>You have no notifications right now.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {notifications.map(notif => (
              <div 
                key={notif.id} 
                style={{ 
                  padding: '1.25rem', 
                  borderRadius: 'var(--radius-md)', 
                  border: '1px solid var(--border-color)',
                  background: notif.is_read ? 'var(--bg-main)' : 'var(--primary-light)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <h4 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
                    {!notif.is_read && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary-color)' }}></span>}
                    {notif.title}
                  </h4>
                  <p style={{ margin: 0, color: 'var(--text-muted)' }}>{notif.message}</p>
                  <small style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.5rem', display: 'block' }}>
                    {new Date(notif.created_at).toLocaleString()}
                  </small>
                </div>
                {!notif.is_read && (
                  <button 
                    onClick={() => markAsRead(notif.id)}
                    className="btn"
                    style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                  >
                    Mark read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
