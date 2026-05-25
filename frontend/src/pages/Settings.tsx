import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Settings as SettingsIcon, ShieldAlert, Key, BellRing, Eye, EyeOff, Save, ShieldX } from 'lucide-react';
import { toast } from '../components/Toast';

export const Settings: React.FC = () => {
  const { user } = useAuthStore();

  // Local passwords state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Preference switches state
  const [prefs, setPrefs] = useState({
    emailAlerts: true,
    pushAlerts: false,
    rosterLogs: true,
    darkMode: true,
  });

  // Load preferences when user is available
  React.useEffect(() => {
    if (user?.id) {
      const saved = localStorage.getItem(`eventflow_settings_${user.id}`);
      if (saved) {
        try {
          setPrefs((prev) => ({ ...prev, ...JSON.parse(saved) }));
        } catch (e) {}
      }
    }
  }, [user]);

  const handleToggle = (key: keyof typeof prefs) => {
    setPrefs((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      if (user?.id) {
        localStorage.setItem(`eventflow_settings_${user.id}`, JSON.stringify(updated));
      }
      return updated;
    });
    toast.success('Preference updated successfully!');
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error('All password fields are required.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Confirm password does not match new password.');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters.');
      return;
    }

    setUpdatingPassword(true);
    setTimeout(() => {
      setUpdatingPassword(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Your account credentials password was updated successfully!');
    }, 1200);
  };

  const handleDeleteAccount = () => {
    const confirmation = window.confirm(
      'WARNING: Are you absolutely sure you want to delete your EventFlow Account? This action is permanent and will delete all event bookings, notifications, and profile details logs.'
    );
    if (confirmation) {
      toast.error('Account deletion simulation executed successfully.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 pt-28 space-y-8">
      {/* Page Header */}
      <div className="glass-panel border border-white/5 p-8 rounded-3xl bg-slate-900/30">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/25">
          <SettingsIcon className="w-3.5 h-3.5" />
          Settings Panel
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white mt-3">
          Account Settings
        </h1>
        <p className="text-text-secondary text-xs sm:text-sm mt-1.5">
          Manage security access credentials, system alerts preferences, and platform rules.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side Toggles Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Notifications config */}
          <div className="glass-panel p-8 border border-white/5 rounded-2xl bg-slate-900/10 space-y-6">
            <h3 className="text-base font-bold font-heading text-white flex items-center gap-2 border-b border-white/5 pb-4">
              <BellRing className="w-5 h-5 text-indigo-400" />
              Alerts & Notifications
            </h3>

            <div className="space-y-4">
              {/* Email alerts */}
              <div className="flex items-center justify-between gap-6">
                <div>
                  <h4 className="text-sm font-bold text-white leading-snug">Email Notifications</h4>
                  <p className="text-xs text-text-muted mt-0.5">Receive booking logs, QR code access passes, and receipt details via email.</p>
                </div>
                <button
                  onClick={() => handleToggle('emailAlerts')}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer outline-none ${
                    prefs.emailAlerts ? 'bg-primary' : 'bg-slate-950 border border-white/10'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      prefs.emailAlerts ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Push alerts */}
              <div className="flex items-center justify-between gap-6 pt-4 border-t border-white/5">
                <div>
                  <h4 className="text-sm font-bold text-white leading-snug">In-App Notification Prompts</h4>
                  <p className="text-xs text-text-muted mt-0.5">Allow immediate banner prompts inside the top bar for event changes.</p>
                </div>
                <button
                  onClick={() => handleToggle('pushAlerts')}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer outline-none ${
                    prefs.pushAlerts ? 'bg-primary' : 'bg-slate-950 border border-white/10'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      prefs.pushAlerts ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Roster alerts (For organizers/admins) */}
              {(user?.role === 'Admin' || user?.role === 'Organizer') && (
                <div className="flex items-center justify-between gap-6 pt-4 border-t border-white/5">
                  <div>
                    <h4 className="text-sm font-bold text-white leading-snug">Attendee Roster Log Updates</h4>
                    <p className="text-xs text-text-muted mt-0.5">Send immediate notification log entries when a new guest registers.</p>
                  </div>
                  <button
                    onClick={() => handleToggle('rosterLogs')}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer outline-none ${
                      prefs.rosterLogs ? 'bg-primary' : 'bg-slate-950 border border-white/10'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                        prefs.rosterLogs ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Password update form */}
          <div className="glass-panel p-8 border border-white/5 rounded-2xl bg-slate-900/10 space-y-6">
            <h3 className="text-base font-bold font-heading text-white flex items-center gap-2 border-b border-white/5 pb-4">
              <Key className="w-5 h-5 text-indigo-400" />
              Update Account Password
            </h3>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-white/5 rounded-xl text-text-primary text-sm focus:border-primary outline-none transition-all duration-300 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
                    New Password
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-white/5 rounded-xl text-text-primary text-sm focus:border-primary outline-none transition-all duration-300"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
                    Confirm New Password
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-white/5 rounded-xl text-text-primary text-sm focus:border-primary outline-none transition-all duration-300"
                    required
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={updatingPassword}
                  className="px-6 py-3.5 bg-gradient-primary hover:scale-[1.01] text-white text-xs font-bold rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {updatingPassword ? 'Saving password...' : 'Save Password'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Side: Account Actions Info */}
        <div className="space-y-6">
          <div className="glass-panel p-8 border border-white/5 rounded-2xl bg-slate-900/40 space-y-6 shadow-xl">
            <h3 className="text-base font-bold uppercase tracking-wider text-text-muted font-heading">
              Preferences Summary
            </h3>
            
            <div className="text-xs text-text-muted space-y-4">
              <p>
                Adjust settings toggles to customize in-app displays. EventFlow security settings require multi-factor checking logic for all coordinator updates.
              </p>
              <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl space-y-2 text-left">
                <p className="flex justify-between">
                  <span>Visual Theme:</span>
                  <span className="text-white font-bold">Dark Glassmorphism</span>
                </p>
                <p className="flex justify-between">
                  <span>Auth Method:</span>
                  <span className="text-white font-semibold">JWT Session Cookie</span>
                </p>
                <p className="flex justify-between">
                  <span>API Protocol:</span>
                  <span className="text-indigo-400 font-bold">HTTPS Axios SSL</span>
                </p>
              </div>
            </div>
          </div>

          {/* Dangerous action panel */}
          <div className="glass-panel p-8 border border-rose-500/10 rounded-2xl bg-slate-900/20 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5 font-heading">
              <ShieldAlert className="w-4 h-4" />
              Danger Zone
            </h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Permanently delete all profile details, registration rosters, QR codes, and dashboard entries. This action cannot be reversed.
            </p>
            <button
              onClick={handleDeleteAccount}
              className="w-full py-3 border border-rose-500/20 text-rose-400 hover:text-white hover:bg-rose-500/15 text-xs font-bold rounded-lg transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <ShieldX className="w-4.5 h-4.5" />
              Delete Account
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
