import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { toast } from '../components/Toast';
import { Loader2 } from 'lucide-react';

export const AuthSuccess: React.FC = () => {
  const navigate = useNavigate();
  const { initializeAuth, isAuthenticated } = useAuthStore();

  useEffect(() => {
    const handleAuthRedirect = async () => {
      try {
        // Retrieve token from query params
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token') || undefined;

        // Run the session validation check with the token
        await initializeAuth(token);
      } catch (err) {
        console.error('OAuth token validation error', err);
        toast.error('Session authentication failed. Please try again.');
        navigate('/auth/login');
      }
    };

    handleAuthRedirect();
  }, [initializeAuth, navigate]);

  // Hook to handle transition on success state change
  useEffect(() => {
    if (isAuthenticated) {
      toast.success('Social Sign In successful!');
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center relative px-4">
      {/* Decorative Glow background */}
      <div className="absolute w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -z-10 animate-pulse"></div>

      <div className="glass-panel border border-white/5 p-10 rounded-3xl shadow-2xl space-y-6 text-center max-w-sm w-full bg-slate-900/30">
        <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl font-extrabold font-heading text-white">
            Syncing Session...
          </h1>
          <p className="text-text-secondary text-xs sm:text-sm">
            Retrieving secure authentication keys. Please wait a moment.
          </p>
        </div>
      </div>
    </div>
  );
};
