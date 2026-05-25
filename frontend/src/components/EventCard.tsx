import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import type { Event } from '../services/api';
import { format } from 'date-fns';

interface EventCardProps {
  event: Event;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  // Safe date parsing
  const getFormattedDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'MMM dd, yyyy');
    } catch (e) {
      return dateStr;
    }
  };

  const cleanVenueName = (venueStr: string) => {
    return venueStr.split(',')[0];
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className="glass-panel rounded-2xl overflow-hidden flex flex-col group border border-white/5 hover:border-indigo-500/30 shadow-lg hover:shadow-indigo-500/5 duration-300 h-full"
    >
      {/* Event Banner */}
      <div className="relative aspect-video overflow-hidden shrink-0">
        <span className="absolute top-4 left-4 z-10 text-[10px] font-extrabold tracking-wider uppercase bg-slate-950/85 text-primary border border-white/5 px-3 py-1.5 rounded-full shadow-md">
          {event.category}
        </span>
        <img
          src={event.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60'}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
      </div>

      {/* Card Details Body */}
      <div className="p-6 flex flex-col flex-grow">
        {/* Meta Row */}
        <div className="flex items-center gap-4 text-xs text-text-muted mb-3.5">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            <span>{getFormattedDate(event.event_date)}</span>
          </div>
          <div className="flex items-center gap-1.5 truncate max-w-[150px]">
            <MapPin className="w-3.5 h-3.5 text-primary" />
            <span className="truncate">{cleanVenueName(event.venue)}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-white mb-2.5 font-heading leading-snug group-hover:text-primary transition-colors duration-300">
          <Link to={`/events/${event.id}`}>
            {event.title}
          </Link>
        </h3>

        {/* Description snippet */}
        <p className="text-text-secondary text-sm leading-relaxed mb-6 line-clamp-3 flex-grow">
          {event.description}
        </p>

        {/* Footer actions */}
        <div className="pt-4 border-t border-white/5 flex items-center justify-between mt-auto">
          {event.raw_status === 'CLOSED' ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
              Closed
            </span>
          ) : event.raw_status === 'ENDED' ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 bg-slate-500/10 px-2.5 py-1 rounded-full border border-slate-500/20">
              Ended
            </span>
          ) : event.raw_status === 'CANCELLED' ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
              Cancelled
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
              Active
            </span>
          )}
          
          <Link
            to={`/events/${event.id}`}
            className="flex items-center gap-1 text-sm font-semibold text-primary group-hover:gap-2 transition-all duration-300"
          >
            Details
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
};
