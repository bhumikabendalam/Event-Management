import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { Bell, Check, Trash2, Mail, ShieldAlert, Sparkles, Star, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '../components/Toast';

interface NotificationItem {
  id: string;
  category: 'booking' | 'system' | 'security' | 'announcement';
  title: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export const Notifications: React.FC = () => {
  const { user } = useAuthStore();

  // Preset mockup notifications based on role
  const getInitialNotifications = (): NotificationItem[] => {
    const defaultLogs: NotificationItem[] = [
      {
        id: '1',
        category: 'booking',
        title: 'Ticket booking confirmed',
        content: 'Your ticket reservation for "Symphony Acoustic Terrace Session" was verified successfully. Check your dashboard to view the QR pass.',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
        read: false,
      },
      {
        id: '2',
        category: 'security',
        title: 'Verified profile badge enabled',
        content: 'Congratulations! Your profile has been upgraded to Verified Status following authentication sync.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
        read: false,
      },
      {
        id: '3',
        category: 'system',
        title: 'EventFlow v1.4 Release notes',
        content: 'Interactive QR gate tickets and multi-seat select dropdown registers are now live across all discover channels.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        read: true,
      },
    ];

    if (user?.role === 'Organizer') {
      defaultLogs.unshift({
        id: 'org-1',
        category: 'announcement',
        title: 'New attendee registration log',
        content: 'Amelia Patel registered for your event "Symphony Acoustic Terrace Session". Roster lists updated.',
        timestamp: new Date().toISOString(),
        read: false,
      });
    } else if (user?.role === 'Admin') {
      defaultLogs.unshift({
        id: 'adm-1',
        category: 'security',
        title: 'System database health report',
        content: 'MySQL database connections are running optimally. Connection query latency is 4ms.',
        timestamp: new Date().toISOString(),
        read: false,
      });
    }

    return defaultLogs;
  };

  // Load from localStorage or initialize presets
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('eventflow_notifications');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return getInitialNotifications();
  });

  const [filter, setFilter] = useState<'all' | 'unread' | 'system' | 'security'>('all');
  const [isTransitioning, setIsTransitioning] = useState(false);

  React.useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 280); // 280ms perfectly covers the spring layout transition
    return () => clearTimeout(timer);
  }, [filter]);

  // Save to localStorage and notify other components when state updates
  React.useEffect(() => {
    localStorage.setItem('eventflow_notifications', JSON.stringify(notifications));
    window.dispatchEvent(new CustomEvent('eventflow-notification-change'));
  }, [notifications]);

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    toast.success('Notification marked as read.');
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success('All notifications marked as read.');
  };

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    toast.success('Notification deleted.');
  };

  const getCategoryIcon = (category: NotificationItem['category']) => {
    switch (category) {
      case 'booking':
        return <Calendar className="w-5 h-5 text-indigo-400" />;
      case 'security':
        return <ShieldAlert className="w-5 h-5 text-emerald-400" />;
      case 'announcement':
        return <Star className="w-5 h-5 text-pink-400" />;
      case 'system':
        return <Sparkles className="w-5 h-5 text-cyan-400" />;
    }
  };

  const getCategoryColorClass = (category: NotificationItem['category']) => {
    switch (category) {
      case 'booking':
        return 'bg-indigo-500/10 border-indigo-500/20';
      case 'security':
        return 'bg-emerald-500/10 border-emerald-500/20';
      case 'announcement':
        return 'bg-pink-500/10 border-pink-500/20';
      case 'system':
        return 'bg-cyan-500/10 border-cyan-500/20';
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    if (filter === 'system') return n.category === 'system';
    if (filter === 'security') return n.category === 'security';
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 pt-28 space-y-8">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 glass-panel border border-white/5 p-8 rounded-3xl bg-slate-900/30">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/25">
            <Bell className="w-3.5 h-3.5" />
            Alerts Inbox
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white">
            Notifications Center
          </h1>
          <p className="text-text-secondary text-xs sm:text-sm">
            You have {unreadCount} unread system notifications matching your account credentials logs.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 px-4.5 py-2.5 bg-indigo-500/10 border border-indigo-500/25 hover:bg-indigo-500/20 text-indigo-300 text-xs font-semibold rounded-lg transition-all duration-300 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            Mark All Read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-white/5 pb-2 relative">
        {(['all', 'unread', 'security', 'system'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`relative px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors duration-300 cursor-pointer ${
              filter === tab
                ? 'text-white'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            <span className="relative z-10">{tab}</span>
            {filter === tab && (
              <motion.span
                key={tab}
                layoutId="activeNotificationFilterHighlight"
                className="absolute inset-0 bg-indigo-500/10 border-b-2 border-indigo-500 rounded-md z-0"
                initial={{ scale: 0.95 }}
                animate={{ scale: isTransitioning ? 0.95 : 1 }}
                transition={{
                  layout: { type: 'spring', stiffness: 380, damping: 28 },
                  scale: { duration: 0.18, ease: 'easeOut' },
                }}
              >
                {/* Butter-Smooth GPU-Accelerated Shadow Glow Layer */}
                <motion.span
                  className="absolute inset-0 rounded-md shadow-[0_2px_14px_-2px_rgba(99,102,241,0.35)] -z-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isTransitioning ? 0 : 1 }}
                  transition={{ duration: 0.22, ease: 'easeInOut' }}
                />
              </motion.span>
            )}
          </button>
        ))}
      </div>

      {/* Notifications Stack */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="glass-panel p-16 border border-white/5 rounded-2xl text-center space-y-4 max-w-xl mx-auto">
            <Mail className="w-12 h-12 text-text-muted mx-auto" />
            <h3 className="text-lg font-bold text-white">All Caught Up</h3>
            <p className="text-text-muted text-sm leading-relaxed">
              No notifications matching the selected filter query were found.
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredNotifications.map((notif) => (
              <motion.div
                key={notif.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{
                  layout: { type: 'spring', stiffness: 500, damping: 40 },
                  opacity: { duration: 0.2 },
                  x: { duration: 0.2 }
                }}
                className={`glass-panel p-5 border border-white/5 rounded-xl flex gap-4 items-start transition-colors duration-300 ${
                  notif.read ? 'bg-slate-900/5 opacity-70' : 'bg-slate-900/20 border-l-2 border-l-indigo-500'
                }`}
              >
                {/* Category circle badge */}
                <div className={`p-2.5 rounded-lg border ${getCategoryColorClass(notif.category)} shrink-0`}>
                  {getCategoryIcon(notif.category)}
                </div>

                {/* Details */}
                <div className="flex-grow space-y-1.5 min-w-0">
                  <div className="flex justify-between items-start gap-4">
                    <h4 className={`font-bold text-white text-sm sm:text-base leading-snug ${!notif.read ? 'text-indigo-300' : ''}`}>
                      {notif.title}
                    </h4>
                    <span className="text-[10px] text-text-muted whitespace-nowrap">
                      {format(new Date(notif.timestamp), 'MMM dd, hh:mm a')}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                    {notif.content}
                  </p>
                  
                  {/* Item action controls */}
                  <div className="flex items-center gap-4 pt-2 text-[11px] font-bold text-text-muted">
                    {!notif.read && (
                      <button
                        onClick={() => handleMarkAsRead(notif.id)}
                        className="hover:text-indigo-400 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Mark Read
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notif.id)}
                      className="hover:text-rose-400 flex items-center gap-1 transition-colors cursor-pointer ml-auto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};
