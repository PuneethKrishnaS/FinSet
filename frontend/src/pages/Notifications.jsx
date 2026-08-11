import React, { useState, useEffect } from 'react';
import { Bell, Check, Trash2, Smartphone } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import useFinanceStore from '../store/useFinanceStore';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPushEnabled, setIsPushEnabled] = useState(true); // default true to avoid flicker
  const { dataVersion, markDataDirty } = useFinanceStore();

  useEffect(() => {
    fetchNotifications();
    checkPushStatus();
  }, [dataVersion]);

  const checkPushStatus = async () => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          const subscription = await registration.pushManager.getSubscription();
          setIsPushEnabled(!!subscription);
        } else {
          setIsPushEnabled(false);
        }
      } catch (e) {
        setIsPushEnabled(false);
      }
    } else {
      setIsPushEnabled(false);
    }
  };

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
      markDataDirty();
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/', { action: 'mark_read' });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      markDataDirty();
    } catch (err) {
      console.error(err);
    }
  };

  const clearAll = async () => {
    try {
      await api.post('/notifications/', { action: 'clear_all' });
      setNotifications([]);
      markDataDirty();
    } catch (err) {
      console.error(err);
    }
  };

  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const subscribeToPush = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      toast.error('Push notifications are not supported in this browser.');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        toast.error('Permission denied for notifications.');
        return false;
      }

      const registration = await navigator.serviceWorker.ready;

      const vapidRes = await api.get('/notifications/vapid-public-key/');
      const vapidPublicKey = vapidRes.data.public_key;

      if (!vapidPublicKey) {
        toast.error('Push notifications are not configured on the server yet.');
        return false;
      }

      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });

      await api.post('/notifications/subscribe/', {
        subscription: subscription.toJSON()
      });

      setIsPushEnabled(true);
      toast.success('Successfully enabled mobile push notifications!');
    } catch (error) {
      console.error('Failed to subscribe', error);
      toast.error('Failed to enable: ' + (error.message || 'Unknown error'));
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
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="header-title">Notifications</h1>
          <p className="header-subtitle">Stay updated with your financial alerts</p>
        </div>
        {notifications.length > 0 && (
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button onClick={markAllAsRead} className="btn" style={{ background: 'transparent', border: '1px solid var(--primary-color)', color: 'var(--primary-color)', fontSize: '0.85rem', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Check size={16} /> Mark read
            </button>
            <button onClick={clearAll} className="btn" style={{ background: 'transparent', border: '1px solid var(--danger)', color: 'var(--danger)', fontSize: '0.85rem', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Trash2 size={16} /> Clear all
            </button>
          </div>
        )}
      </div>

      {!isPushEnabled && (
        <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h4 style={{ margin: '0 0 0.25rem 0', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
              <Smartphone size={18} color="var(--primary-color)" /> Enable Push Alerts
            </h4>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Get instant alerts on this device when important updates happen.</p>
          </div>
          <button onClick={subscribeToPush} className="btn" style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
            Enable
          </button>
        </div>
      )}

      <div style={{ padding: '0' }}>
        {notifications.length === 0 ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
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
                    style={{
                      padding: '0.4rem 0.6rem',
                      fontSize: '0.75rem',
                      background: 'transparent',
                      color: 'var(--primary-color)',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
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
