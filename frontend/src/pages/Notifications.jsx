import React, { useState, useEffect } from 'react';
import { PiBellDuotone, PiCheck, PiTrash, PiDeviceMobileDuotone } from "react-icons/pi";
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
      <div className="flex flex-col w-full h-full pb-10">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground mb-6">Notifications</h1>
        <div className="p-8 text-center text-muted-foreground bg-card rounded border border-border">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full pb-10">
      <div className="flex justify-end mb-6">
        {notifications.length > 0 && (
          <div className="flex gap-4 items-center">
            <button 
              onClick={markAllAsRead} 
              className="bg-transparent border border-primary text-primary hover:bg-primary/10 text-xs font-bold py-2 px-4 rounded transition-colors flex items-center gap-2"
            >
              <Check size={16} /> Mark read
            </button>
            <button 
              onClick={clearAll} 
              className="bg-transparent border border-destructive text-destructive hover:bg-destructive/10 text-xs font-bold py-2 px-4 rounded transition-colors flex items-center gap-2"
            >
              <Trash2 size={16} /> Clear all
            </button>
          </div>
        )}
      </div>

      {!isPushEnabled && (
        <div className="bg-card border border-border rounded p-5 flex flex-wrap justify-between items-center gap-4 mb-6 ">
          <div>
            <h4 className="flex items-center gap-2 text-foreground font-bold text-sm mb-1">
              <Smartphone size={18} className="text-primary" /> Enable Push Alerts
            </h4>
            <p className="text-xs font-medium text-muted-foreground">Get instant alerts on this device when important updates happen.</p>
          </div>
          <button 
            onClick={subscribeToPush} 
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2 px-5 rounded transition-colors text-sm whitespace-nowrap "
          >
            Enable
          </button>
        </div>
      )}

      <div className="flex-1">
        {notifications.length === 0 ? (
          <div className="bg-card border border-border rounded p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
              <Bell size={32} className="text-muted-foreground/30" />
            </div>
            <p className="font-bold text-lg text-foreground mb-2">You're all caught up!</p>
            <p className="text-sm text-muted-foreground">You have no notifications right now.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {notifications.map(notif => (
              <div
                key={notif.id}
                className={`flex justify-between items-start p-5 rounded border transition-all ${
                  notif.is_read 
                    ? 'bg-card border-border hover:' 
                    : 'bg-primary/5 border-primary/20 '
                }`}
              >
                <div className="flex-1 pr-4">
                  <h4 className="flex items-center gap-2 font-bold text-sm text-foreground mb-1.5">
                    {!notif.is_read && <span className="w-2 h-2 rounded-full bg-primary shrink-0"></span>}
                    {notif.title}
                  </h4>
                  <p className="text-sm font-medium text-muted-foreground leading-relaxed mb-2">
                    {notif.message}
                  </p>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    {new Date(notif.created_at).toLocaleString('en-US', { 
                      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' 
                    })}
                  </span>
                </div>
                {!notif.is_read && (
                  <button
                    onClick={() => markAsRead(notif.id)}
                    className="text-primary hover:text-primary/80 text-xs font-bold whitespace-nowrap py-1 px-2 transition-colors shrink-0"
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
