import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Mail } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export const Footer: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();

  const getDashboardPath = () => {
    if (!user) return '/dashboard';
    if (user.role === 'Admin') return '/admin';
    if (user.role === 'Organizer') return '/organizer';
    return '/dashboard';
  };
  return (
    <footer
      style={{ backgroundColor: 'var(--bg-secondary)', borderTopColor: 'var(--border-glass)' }}
      className="border-t pt-16 pb-8"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        
        {/* Brand */}
        <div className="flex flex-col space-y-4">
          <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-2xl font-extrabold tracking-wide font-heading">
            <span className="text-text-primary">Event</span>
            <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block mx-0.5"></span>
            <span className="text-gradient">Flow</span>
          </Link>
          <p className="text-text-muted text-sm leading-relaxed max-w-xs">
            Designing modern, memorable experiences for attendees and event hosts globally with state-of-the-art booking channels.
          </p>
          <div className="flex space-x-3 pt-2">
            <a
              href="#"
              style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-glass)' }}
              className="p-2 border rounded-full text-text-secondary hover:text-primary hover:border-primary/50 transition-all duration-300"
              aria-label="Twitter"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a
              href="#"
              style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-glass)' }}
              className="p-2 border rounded-full text-text-secondary hover:text-primary hover:border-primary/50 transition-all duration-300"
              aria-label="LinkedIn"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0z"/>
              </svg>
            </a>
            <a
              href="#"
              style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-glass)' }}
              className="p-2 border rounded-full text-text-secondary hover:text-primary hover:border-primary/50 transition-all duration-300"
              aria-label="Instagram"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-heading font-bold text-text-primary text-base mb-6 uppercase tracking-wider">Quick Links</h4>
          <ul className="space-y-3.5 text-sm">
            <li>
              <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-text-secondary hover:text-primary transition-colors duration-300">Home</Link>
            </li>
            <li>
              <Link to="/events" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-text-secondary hover:text-primary transition-colors duration-300">Find Events</Link>
            </li>
            {isAuthenticated ? (
              <>
                <li>
                  <Link to="/events/new" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-text-secondary hover:text-primary transition-colors duration-300">Host an Event</Link>
                </li>
                <li>
                  <Link to={getDashboardPath()} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-text-secondary hover:text-primary transition-colors duration-300">My Dashboard</Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/auth/register" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-text-secondary hover:text-primary transition-colors duration-300">Register Account</Link>
                </li>
                <li>
                  <Link to="/auth/login" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-text-secondary hover:text-primary transition-colors duration-300">Host / Organizer Login</Link>
                </li>
              </>
            )}
          </ul>
        </div>

        {/* Company Links */}
        <div>
          <h4 className="font-heading font-bold text-text-primary text-base mb-6 uppercase tracking-wider">Company</h4>
          <ul className="space-y-3.5 text-sm">
            <li>
              <Link to="/about" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-text-secondary hover:text-primary transition-colors duration-300">About Us</Link>
            </li>
            <li>
              <Link to="/contact" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-text-secondary hover:text-primary transition-colors duration-300">Contact Support</Link>
            </li>
            <li>
              <a href="#" className="text-text-secondary hover:text-primary transition-colors duration-300">Privacy Policy</a>
            </li>
            <li>
              <a href="#" className="text-text-secondary hover:text-primary transition-colors duration-300">Terms of Service</a>
            </li>
          </ul>
        </div>

        {/* Contact details */}
        <div>
          <h4 className="font-heading font-bold text-text-primary text-base mb-6 uppercase tracking-wider">Contact Details</h4>
          <ul className="space-y-4 text-sm text-text-secondary">
            <li className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <span>Symphony Tower, 24th Floor, Bangalore, Karnataka, IN</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-primary shrink-0" />
              <a href="mailto:hello@eventflow.com" className="hover:text-primary transition-colors duration-300">
                hello@eventflow.com
              </a>
            </li>
          </ul>
        </div>

      </div>

      <div
        style={{ borderTopColor: 'var(--border-glass)' }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t flex flex-col md:flex-row justify-between items-center text-xs text-text-muted gap-4"
      >
        <p>&copy; {new Date().getFullYear()} EventFlow. All rights reserved.</p>
        <p>Designed with ❤️ for modern creators.</p>
      </div>
    </footer>
  );
};
