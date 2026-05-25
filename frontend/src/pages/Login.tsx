import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { toast } from '../components/Toast';
import { LogIn, Mail, Lock, Shield, User, Landmark } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Get error or redirects parameters
  const params = new URLSearchParams(location.search);
  const expired = params.get('error') === 'expired';

  useEffect(() => {
    if (expired) {
      toast.error('Session expired. Please log in again.');
    }
  }, [expired]);

  // If already authenticated, redirect away
  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleDemoSelect = (role: 'User' | 'Organizer' | 'Admin') => {
    switch (role) {
      case 'User':
        setEmail('participant@eventflow.org');
        setPassword('password');
        break;
      case 'Organizer':
        setEmail('organizer@eventflow.org');
        setPassword('password');
        break;
      case 'Admin':
        setEmail('admin@eventflow.org');
        setPassword('password');
        break;
    }
    toast.success(`${role} demo credentials pre-filled!`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all credentials.');
      return;
    }

    setSubmitting(true);
    const res = await login(email, password);
    setSubmitting(false);

    if (res.success) {
      toast.success('Successfully logged in! Welcome.');
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
    } else {
      toast.error(res.error || 'Invalid credentials.');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 pb-24 pt-32 space-y-8 relative">
      {/* Decorative Blur glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -z-10"></div>

      <div className="glass-panel border border-white/5 p-8 rounded-3xl shadow-2xl space-y-6 bg-slate-900/30">
        
        {/* Header Title */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white">
            Log In to <span className="text-gradient">EventFlow</span>
          </h1>
          <p className="text-text-secondary text-xs sm:text-sm">
            Enter your credentials or click a demo account below.
          </p>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-indigo-400" />
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. user@eventflow.com"
              className="w-full px-4 py-3 bg-slate-950 border border-white/5 rounded-xl text-text-primary text-sm focus:border-primary outline-none transition-all duration-300"
              required
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-indigo-400" />
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-slate-950 border border-white/5 rounded-xl text-text-primary text-sm focus:border-primary outline-none transition-all duration-300"
              required
            />
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-gradient-primary hover:scale-[1.01] text-white text-sm font-bold rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            {submitting ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Social Authentication */}
        <div className="space-y-3 pt-2">
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-white/5"></div>
            <span className="flex-shrink mx-4 text-text-muted text-[10px] uppercase font-bold tracking-wider">Or Social Sign In</span>
            <div className="flex-grow border-t border-white/5"></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <a
              href={`${(import.meta.env.VITE_API_BASE_URL as string || 'http://localhost:8080/api').replace('/api', '')}/oauth2/authorization/google`}
              className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-white/5 hover:bg-indigo-500/10 border border-white/5 hover:border-indigo-500/30 text-text-secondary hover:text-white transition-all duration-300 text-sm font-bold text-center cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </a>
            <a
              href={`${(import.meta.env.VITE_API_BASE_URL as string || 'http://localhost:8080/api').replace('/api', '')}/oauth2/authorization/github`}
              className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-white/5 hover:bg-indigo-500/10 border border-white/5 hover:border-indigo-500/30 text-text-secondary hover:text-white transition-all duration-300 text-sm font-bold text-center cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
              GitHub
            </a>
          </div>
        </div>


        {/* Demo Accounts Panel */}
        <div className="space-y-3.5 pt-4 border-t border-white/5">
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider text-center">
            Or Quick Select Demo Role
          </p>
          
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleDemoSelect('User')}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/20 text-text-secondary hover:text-white transition-all duration-300 text-center cursor-pointer"
            >
              <User className="w-4 h-4 text-indigo-400" />
              <span className="text-[10px] font-bold">User</span>
            </button>
            
            <button
              onClick={() => handleDemoSelect('Organizer')}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-pink-500/5 hover:bg-pink-500/10 border border-pink-500/20 text-text-secondary hover:text-white transition-all duration-300 text-center cursor-pointer"
            >
              <Landmark className="w-4 h-4 text-pink-400" />
              <span className="text-[10px] font-bold">Organizer</span>
            </button>

            <button
              onClick={() => handleDemoSelect('Admin')}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-cyan-500/5 hover:bg-cyan-500/10 border border-cyan-500/20 text-text-secondary hover:text-white transition-all duration-300 text-center cursor-pointer"
            >
              <Shield className="w-4 h-4 text-cyan-400" />
              <span className="text-[10px] font-bold">Admin</span>
            </button>
          </div>
        </div>

        {/* Sign up link */}
        <p className="text-center text-xs text-text-secondary">
          Don't have an account?{' '}
          <Link to="/auth/register" className="text-primary hover:underline font-bold">
            Sign Up Now
          </Link>
        </p>

      </div>
    </div>
  );
};
