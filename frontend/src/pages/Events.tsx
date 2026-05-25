import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { eventService } from '../services/api';
import { EventCard } from '../components/EventCard';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { Search, Inbox } from 'lucide-react';

const CATEGORIES = ['All', 'Technology', 'Music', 'Food', 'Art', 'Business', 'Design'];

export const Events: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search query to prevent excessive API requests
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Query events with category and debounced search
  const { data: events = [], isLoading, isError } = useQuery({
    queryKey: ['events', selectedCategory, debouncedSearch],
    queryFn: () => eventService.getEvents(selectedCategory, debouncedSearch),
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 pt-28 space-y-12">
      {/* Header Banner */}
      <div className="glass-panel border border-white/5 rounded-3xl p-8 sm:p-12 relative overflow-hidden bg-slate-900/30">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -z-10"></div>
        <div className="relative z-10 space-y-4 max-w-2xl">
          <h1 className="text-3xl sm:text-5xl font-extrabold font-heading text-white">
            Find Your Next <span className="text-gradient">Experience</span>
          </h1>
          <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
            Search, discover, and instantly secure tickets to elite summits, acoustic terraces, and hands-on workshops globally.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-6">
        {/* Search */}
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search by title, description, or venue..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 bg-slate-950 border border-white/5 rounded-xl text-text-primary text-sm focus:border-primary outline-none transition-all duration-300 shadow-sm shadow-black/20"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 items-center">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4.5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                selectedCategory === category
                  ? 'bg-gradient-primary text-white shadow-md'
                  : 'bg-slate-950 text-text-secondary border border-white/5 hover:text-text-primary hover:bg-slate-900'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Events Discovery Grid */}
      {isLoading ? (
        <SkeletonLoader type="card" count={6} />
      ) : isError ? (
        <div className="glass-panel p-16 border border-white/5 rounded-2xl text-center space-y-2">
          <p className="text-rose-400 font-semibold">Error retrieving events catalog</p>
          <p className="text-text-muted text-sm">Please verify backend server status and try again.</p>
        </div>
      ) : events.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-panel p-20 border border-white/5 rounded-2xl text-center space-y-5"
        >
          <Inbox className="w-14 h-14 text-text-muted mx-auto" />
          <div className="space-y-1.5">
            <h3 className="text-xl font-bold text-white">No events match your criteria</h3>
            <p className="text-text-muted text-sm max-w-md mx-auto">
              We couldn't find any events for category "{selectedCategory}" {debouncedSearch ? `matching "${debouncedSearch}"` : ''}. Try broadening your criteria.
            </p>
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
};
