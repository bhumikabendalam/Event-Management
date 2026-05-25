import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogIn, LogOut, User, LayoutDashboard, Bell, Settings, Sun, Moon } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 280); // 280ms perfectly covers the spring layout transition
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Load theme from localStorage or default to dark, and apply immediately to <html>
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('eventflow_theme');
    const initial = (saved === 'light' || saved === 'dark') ? saved : 'dark';
    // Apply synchronously on mount — no flicker
    document.documentElement.setAttribute('data-theme', initial);
    return initial;
  });

  // Persist theme to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('eventflow_theme', theme);
  }, [theme]);

  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    const checkUnread = () => {
      const saved = localStorage.getItem('eventflow_notifications');
      if (saved) {
        try {
          const list = JSON.parse(saved);
          setHasUnread(list.some((n: any) => !n.read));
          return;
        } catch (e) {}
      }
      setHasUnread(true);
    };

    checkUnread();
    window.addEventListener('storage', checkUnread);
    window.addEventListener('eventflow-notification-change', checkUnread);
    window.addEventListener('eventflow-auth-change', checkUnread);

    return () => {
      window.removeEventListener('storage', checkUnread);
      window.removeEventListener('eventflow-notification-change', checkUnread);
      window.removeEventListener('eventflow-auth-change', checkUnread);
    };
  }, [user]);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';

    // 1. Add the transition class FIRST so CSS has it ready before anything changes
    document.documentElement.classList.add('theme-transitioning');

    // 2. Apply data-theme synchronously — no React re-render delay
    document.documentElement.setAttribute('data-theme', next);

    // 3. Update React state (keeps icon in sync)
    setTheme(next);

    // 4. Remove transition class after 450ms — Framer Motion is never affected outside this window
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
    }, 450);
  };


  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const getDashboardPath = () => {
    if (!user) return '/dashboard';
    if (user.role === 'Admin') return '/admin';
    if (user.role === 'Organizer') return '/organizer';
    return '/dashboard';
  };

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Events', path: '/events' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
    ...(isAuthenticated ? [{ name: 'Dashboard', path: getDashboardPath() }] : []),
  ];

  const defaultAvatar = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23818cf8'><rect width='100%' height='100%' fill='%23111827'/><circle cx='12' cy='8' r='4'/><path d='M12 14c-6.1 0-8 4-8 4v2h16v-2s-1.9-4-8-4z'/></svg>`;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-white/5 shadow-lg backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-xl font-extrabold tracking-wide font-heading animate-in fade-in slide-in-from-left-3 duration-500">
            <span className="text-text-primary">Event</span>
            <span className="w-2 h-2 rounded-full bg-primary mt-3 animate-pulse"></span>
            <span className="text-gradient">Flow</span>
          </Link>

          {/* Desktop Navigation Link items */}
          <nav className="hidden md:flex space-x-1 items-center animate-in fade-in slide-in-from-top-3 duration-500 relative">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `relative px-4 py-2 text-sm font-semibold transition-colors duration-300 rounded-md cursor-pointer ${
                    isActive
                      ? 'text-primary'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/40'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className="relative z-10">{item.name}</span>
                    {isActive && (
                      <motion.span
                        key={item.path}
                        layoutId="activeNavHighlight"
                        className="absolute inset-0 bg-indigo-500/10 border-b-2 border-primary rounded-md z-0"
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
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Action Row: Theme Switcher & Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {/* High-Fidelity Theme Switcher Button */}
            <button
              onClick={toggleTheme}
              className="p-2.5 text-text-secondary hover:text-primary hover:bg-white/5 border border-white/5 rounded-full transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95"
              title={theme === 'dark' ? 'Switch to Light Appearance' : 'Switch to Dark Appearance'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4.5 h-4.5 text-amber-400 shrink-0" />
              ) : (
                <Moon className="w-4.5 h-4.5 text-indigo-500 shrink-0" />
              )}
            </button>

            {/* AnimatePresence guarantees a perfectly smooth auth transition */}
            <div className="flex items-center gap-3 min-h-[42px]">
              <AnimatePresence mode="wait">
                {isAuthenticated && user ? (
                  <motion.div
                    key="authenticated"
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    transition={{ duration: 0.22, ease: 'easeInOut' }}
                    className="flex items-center gap-4"
                  >
                    <Link to="/notifications" className="p-2 text-text-secondary hover:text-primary hover:bg-white/5 rounded-full transition-colors relative" title="Notifications Center">
                      <Bell className="w-4.5 h-4.5 text-indigo-400" />
                      {hasUnread && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
                      )}
                    </Link>
                    <Link to="/settings" className="p-2 text-text-secondary hover:text-primary hover:bg-white/5 rounded-full transition-colors" title="Account Settings">
                      <Settings className="w-4.5 h-4.5 text-indigo-400" />
                    </Link>

                    <Link to="/profile" className="flex items-center gap-2.5 group">
                      <img
                        src={user.avatar || defaultAvatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-indigo-500/30 group-hover:border-indigo-500 group-hover:scale-105 transition-all duration-300 shadow-md"
                      />
                      <div className="text-left hidden lg:block">
                        <p className="text-[10px] text-text-muted">Hello,</p>
                        <p className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors duration-300">
                          {user.name.split(' ')[0]}
                        </p>
                      </div>
                    </Link>
                    
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-1.5 px-4.5 py-2.5 border border-rose-500/30 hover:border-rose-500 text-rose-400 hover:text-white hover:bg-rose-500/10 text-xs font-bold rounded-xl transition-all duration-300 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 shrink-0" />
                      Logout
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="guest"
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    transition={{ duration: 0.22, ease: 'easeInOut' }}
                    className="flex items-center gap-3"
                  >
                    <Link
                      to="/auth/login"
                      className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors duration-300"
                    >
                      <LogIn className="w-4 h-4" />
                      Login
                    </Link>
                    <Link
                      to="/auth/register"
                      className="px-5 py-2.5 bg-gradient-primary hover:scale-105 text-white text-sm font-bold rounded-xl shadow-md transition-all duration-300"
                    >
                      Sign Up
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile hamburger menu with theme toggle */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 text-text-secondary hover:text-primary rounded-full transition-colors cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-500" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-bg-tertiary outline-none cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-b border-white/5 py-4 px-6 animate-fade-in absolute w-full left-0 bg-bg-secondary/95 shadow-2xl">
          <div className="flex flex-col space-y-3">
            <Link
              to="/"
              className="text-text-secondary hover:text-primary py-2 text-base font-semibold border-b border-white/5"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/events"
              className="text-text-secondary hover:text-primary py-2 text-base font-semibold border-b border-white/5"
              onClick={() => setMobileMenuOpen(false)}
            >
              Events
            </Link>
            <Link
              to="/about"
              className="text-text-secondary hover:text-primary py-2 text-base font-semibold border-b border-white/5"
              onClick={() => setMobileMenuOpen(false)}
            >
              About Us
            </Link>
            <Link
              to="/contact"
              className="text-text-secondary hover:text-primary py-2 text-base font-semibold border-b border-white/5"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  to={getDashboardPath()}
                  className="text-text-secondary hover:text-primary py-2 text-base font-semibold border-b border-white/5 flex items-center gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LayoutDashboard className="w-4 h-4 text-indigo-400" />
                  Dashboard
                </Link>
                <Link
                  to="/profile"
                  className="text-text-secondary hover:text-primary py-2 text-base font-semibold border-b border-white/5 flex items-center gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="w-4 h-4 text-indigo-400" />
                  Edit Profile
                </Link>
                <Link
                  to="/notifications"
                  className="text-text-secondary hover:text-primary py-2 text-base font-semibold border-b border-white/5 flex items-center justify-between"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-indigo-400" />
                    <span>Notifications</span>
                  </div>
                  {hasUnread && (
                    <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse mr-2"></span>
                  )}
                </Link>
                <Link
                  to="/settings"
                  className="text-text-secondary hover:text-primary py-2 text-base font-semibold border-b border-white/5 flex items-center gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Settings className="w-4.5 h-4.5 text-indigo-400" />
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left text-rose-400 py-3 text-base font-semibold flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            )}

            {!isAuthenticated && (
              <div className="flex flex-col gap-2 pt-2">
                <Link
                  to="/auth/login"
                  className="w-full text-center py-2.5 border border-white/10 text-text-primary rounded-lg text-sm font-semibold"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/auth/register"
                  className="w-full text-center py-2.5 bg-gradient-primary text-white rounded-lg text-sm font-semibold"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
