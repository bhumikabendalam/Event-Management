import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { eventService } from '../services/api';
import { EventCard } from '../components/EventCard';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { useAuthStore } from '../store/authStore';
import { Calendar, ArrowRight, Shield, Award, Users, Compass } from 'lucide-react';

export const Landing: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();

  const getDashboardPath = () => {
    if (!user) return '/dashboard';
    if (user.role === 'Admin') return '/admin';
    if (user.role === 'Organizer') return '/organizer';
    return '/dashboard';
  };
  // Query to fetch first 3 featured events
  const { data: events = [], isLoading, isError } = useQuery({
    queryKey: ['featuredEvents'],
    queryFn: () => eventService.getEvents('All'),
    select: (data) => data.slice(0, 3), // Show first 3 events
  });

  return (
    <div className="space-y-24 pb-20 pt-28 overflow-hidden">
      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Glow decorative items */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl -z-10 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/15 rounded-full blur-3xl -z-10"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Content Column */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="space-y-6 lg:col-span-7 text-left"
          >
            <span className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 text-xs font-bold uppercase tracking-wider">
              <Compass className="w-4 h-4 animate-spin-slow text-indigo-400" />
              Discover & Host Elite Gatherings
            </span>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight font-heading text-white">
              Discover Exceptional <br />
              <span className="text-gradient">Experiences</span> Tailored to You
            </h1>
            <p className="text-text-secondary text-base sm:text-lg leading-relaxed max-w-xl">
              Explore, register, and experience world-class conferences, immersive acoustic concerts, culinary masterclasses, and modern art exhibitions. Elevated designs, seamless bookings.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                to="/events"
                className="px-8 py-4 bg-gradient-primary hover:scale-105 text-white font-bold rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
              >
                Explore Events
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to={isAuthenticated ? "/events/new" : "/auth/register"}
                className="px-8 py-4 glass-panel bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center"
              >
                Host an Event
              </Link>
            </div>
          </motion.div>

          {/* Right Artwork Column */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }}
            className="lg:col-span-5 relative flex justify-center lg:justify-end"
          >
            {/* Image Wrapper with 3D tilted effect */}
            <div className="relative group w-full max-w-[480px]">
              <div 
                className="relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl transition-all duration-700 ease-out transform lg:perspective-1000 lg:rotate-y-[-8deg] lg:rotate-x-[4deg] lg:group-hover:rotate-y-[0deg] lg:group-hover:rotate-x-[0deg] lg:group-hover:scale-[1.02] aspect-4/3 bg-slate-900"
              >
                <img 
                  src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80" 
                  alt="Beautiful Event Atmosphere" 
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent"></div>
              </div>

              {/* Floating Verified Glass Card */}
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 4,
                  ease: 'easeInOut',
                }}
                className="absolute -bottom-6 -left-6 sm:-left-10 glass-panel bg-bg-glass/80 backdrop-blur-md border border-border-glass p-5 rounded-2xl shadow-2xl flex items-center gap-4 max-w-[280px]"
              >
                <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0">
                  <Shield className="w-5.5 h-5.5" />
                </div>
                <div className="text-left">
                  <h4 className="text-sm font-bold text-white leading-snug">100% Secured Bookings</h4>
                  <p className="text-[11px] text-text-muted mt-0.5 font-semibold">Direct verification & instant pass</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Metrics Strips */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 glass-panel border border-white/5 p-8 rounded-2xl shadow-xl bg-slate-900/40 text-center"
        >
          <div className="space-y-1 border-r border-white/5 last:border-0 pr-4 last:pr-0">
            <p className="text-3xl sm:text-4xl font-extrabold text-white font-heading">5,000+</p>
            <p className="text-xs text-text-muted font-semibold uppercase tracking-wider">Tickets Booked</p>
          </div>
          <div className="space-y-1 md:border-r border-white/5 last:border-0 px-4 last:px-0">
            <p className="text-3xl sm:text-4xl font-extrabold text-primary font-heading">120+</p>
            <p className="text-xs text-text-muted font-semibold uppercase tracking-wider">Annual Events</p>
          </div>
          <div className="space-y-1 border-r border-white/5 last:border-0 px-4 last:px-0">
            <p className="text-3xl sm:text-4xl font-extrabold text-secondary font-heading">50+</p>
            <p className="text-xs text-text-muted font-semibold uppercase tracking-wider">Verified Hosts</p>
          </div>
          <div className="space-y-1 pl-4 last:pl-0">
            <p className="text-3xl sm:text-4xl font-extrabold text-accent font-heading">99.8%</p>
            <p className="text-xs text-text-muted font-semibold uppercase tracking-wider">Satisfaction</p>
          </div>
        </motion.div>
      </section>

      {/* Featured Events Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div className="space-y-2">
            <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-white">
              Featured <span className="text-gradient">Experiences</span>
            </h2>
            <p className="text-text-secondary text-sm sm:text-base">
              Handpicked premium gatherings happening around your area.
            </p>
          </div>
          <Link
            to="/events"
            className="flex items-center gap-1 text-sm font-bold text-primary hover:gap-2 transition-all duration-300"
          >
            Browse all events
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <SkeletonLoader type="card" count={3} />
        ) : isError ? (
          <div className="glass-panel p-12 border border-white/5 rounded-2xl text-center">
            <p className="text-rose-400 font-semibold mb-2">Error loading featured events</p>
            <p className="text-text-muted text-sm">Please check your local database connection status.</p>
          </div>
        ) : events.length === 0 ? (
          <div className="glass-panel p-16 border border-white/5 rounded-2xl text-center space-y-4">
            <Calendar className="w-12 h-12 text-text-muted mx-auto" />
            <h3 className="text-xl font-bold text-white">No active events found</h3>
            <p className="text-text-muted text-sm max-w-sm mx-auto">
              Check back later or become a host to create the first gathering!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>

      {/* Features Value Proposition */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-white">
            Designed for <span className="text-gradient">Modern Innovators</span>
          </h2>
          <p className="text-text-secondary max-w-xl mx-auto text-sm sm:text-base">
            Whether you are booking a ticket or coordinating a summit, EventFlow provides top-tier tools.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-panel p-8 border border-white/5 rounded-2xl space-y-4 hover:border-indigo-500/20 transition-all duration-300 bg-slate-900/30"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-primary">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white font-heading">Secure Tickets</h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              Generate unique digital QR tickets and access cards. Secure gate checks and hassle-free verify dashboards.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="glass-panel p-8 border border-white/5 rounded-2xl space-y-4 hover:border-pink-500/20 transition-all duration-300 bg-slate-900/30"
          >
            <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/25 flex items-center justify-center text-secondary">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white font-heading">Seamless Hosting</h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              Create, update, and manage bookings metrics in real-time. Export attendee list rosters into standard CSV records.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="glass-panel p-8 border border-white/5 rounded-2xl space-y-4 hover:border-cyan-500/20 transition-all duration-300 bg-slate-900/30"
          >
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-accent">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white font-heading">Attendee Networking</h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              Browse public profiles of co-attendees registered for the events you join. Expand your professional directory.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel border border-white/5 rounded-3xl p-12 sm:p-16 relative overflow-hidden text-center space-y-6 shadow-2xl bg-gradient-to-br from-indigo-950/20 via-slate-950 to-slate-950">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -z-10"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-pink-500/5 rounded-full blur-3xl -z-10"></div>

          <h2 className="text-3xl sm:text-5xl font-extrabold font-heading text-white">
            Ready to Begin Your <br />
            <span className="text-gradient">EventFlow Journey?</span>
          </h2>
          <p className="text-text-secondary max-w-md mx-auto text-sm sm:text-base leading-relaxed">
            {isAuthenticated 
              ? "Access your dashboard to coordinate, discover exceptional gatherings, or manage your bookings."
              : "Create an account, search curated gatherings, or establish your host credentials within minutes."}
          </p>
          <div className="pt-4">
            <Link
              to={isAuthenticated ? getDashboardPath() : "/auth/register"}
              className="px-8 py-4 bg-gradient-primary hover:scale-105 text-white font-bold rounded-xl shadow-lg transition-all duration-300 inline-flex items-center gap-2"
            >
              {isAuthenticated ? "Go to Dashboard" : "Sign Up For Free"}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
