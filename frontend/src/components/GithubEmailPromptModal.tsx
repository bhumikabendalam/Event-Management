import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { userService } from '../services/api';
import { toast } from './Toast';
import { Mail, ShieldCheck, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const GithubEmailPromptModal: React.FC = () => {
  const { user, isAuthenticated, updateUser } = useAuthStore();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  // Trigger modal ONLY if authenticated and has a dummy GitHub email
  const showPrompt = isAuthenticated && user && user.email && user.email.toLowerCase().endsWith('@github.com');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter a valid email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error('Please enter a correctly formatted email address.');
      return;
    }

    setLoading(false);
    setLoading(true);

    try {
      const res = await userService.updateProfile({ email: email.trim() });
      if (res.success && res.data) {
        // Sync local storage session credentials cache
        const sessionStr = localStorage.getItem('eventflow_auth_session');
        const session = sessionStr ? JSON.parse(sessionStr) : {};
        localStorage.setItem(
          'eventflow_auth_session',
          JSON.stringify({
            user: res.data,
            token: res.token || session.token || 'eventflow_token_cookie',
          })
        );

        // Sync Zustand store state immediately
        if (res.token) {
          useAuthStore.setState({ token: res.token });
        }
        updateUser(res.data);

        toast.success('Your real email has been linked successfully!');
      } else {
        toast.error(res.error || 'Failed to update email address. It may already be in use.');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'An error occurred while linking your email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 350, damping: 26 }}
            className="relative w-full max-w-md glass-panel border border-white/10 rounded-3xl p-8 bg-slate-900/90 shadow-2xl space-y-6 text-center overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -z-10 animate-pulse"></div>

            {/* Icon */}
            <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-primary mx-auto animate-bounce">
              <Mail className="w-7 h-7 text-indigo-400" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-extrabold font-heading text-white">
                Complete Your Account
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                You've successfully signed in via <span className="text-white font-bold">GitHub</span>! However, we couldn't retrieve your email.
              </p>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Please link your actual email address to receive secure booking confirmations, invoice receipts, and digital QR gate passes.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                  Link Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. yourname@gmail.com"
                    className="w-full px-4 py-3 bg-slate-950 border border-white/5 rounded-xl text-text-primary text-sm focus:border-primary outline-none transition-all duration-300"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-primary hover:scale-[1.02] text-white text-xs font-bold rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Saving Email...' : 'Complete Profile'}
                <ArrowRight className="w-4.5 h-4.5" />
              </button>
            </form>

            <div className="flex items-center justify-center gap-1.5 text-[9px] text-text-muted">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Verified encrypted SSL connection</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
