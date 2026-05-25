import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { eventService } from '../services/api';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { toast } from '../components/Toast';
import { format } from 'date-fns';
import { Calendar, MapPin, Clock, ArrowLeft, Edit, Trash2, Users, Ticket, AlertTriangle, ShieldCheck } from 'lucide-react';

export const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuthStore();
  const eventId = Number(id);

  // Query single event data
  const { data: event, isLoading, isError } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => eventService.getEventById(eventId),
    enabled: !isNaN(eventId),
  });

  // Mutation to delete event
  const deleteMutation = useMutation({
    mutationFn: () => eventService.deleteEvent(eventId),
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Event deleted successfully!');
        queryClient.invalidateQueries({ queryKey: ['events'] });
        queryClient.invalidateQueries({ queryKey: ['organizerMetrics'] });
        queryClient.invalidateQueries({ queryKey: ['adminMetrics'] });
        navigate('/events');
      } else {
        toast.error(res.error || 'Failed to delete event');
      }
    },
    onError: () => {
      toast.error('An error occurred. Check connection settings.');
    },
  });

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this event? This action is permanent.')) {
      deleteMutation.mutate();
    }
  };

  if (isNaN(eventId)) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
        <h2 className="text-2xl font-bold text-white">Invalid Event ID</h2>
        <Link to="/events" className="text-primary mt-4 inline-block hover:underline">Return to Discovery</Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 pt-28">
        <SkeletonLoader type="detail" />
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center space-y-4">
        <AlertTriangle className="w-16 h-16 text-rose-400 mx-auto" />
        <h2 className="text-2xl font-bold text-white font-heading">Event Not Found</h2>
        <p className="text-text-secondary max-w-sm mx-auto">
          The event you are looking for may have been deleted, or does not exist.
        </p>
        <Link
          to="/events"
          className="px-6 py-2.5 bg-gradient-primary text-white text-sm font-semibold rounded-lg inline-block"
        >
          Back to Events
        </Link>
      </div>
    );
  }

  // Authorizations
  const isOwner = user && event.organizer_id === user.id;
  const isAdmin = user && user.role === 'Admin';
  const canManage = isOwner || isAdmin;
  const isOrganizer = user && user.role === 'Organizer';

  // Booking Guard Logic
  const getBookingGuardMessage = () => {
    if (!isAuthenticated) return null;
    if (isAdmin) {
      return '⛔ Platform Administrators are barred from event bookings to maintain logging hygiene.';
    }
    if (isOrganizer && event.organizer_id === user.id) {
      return '⛔ Organizers cannot book tickets for events they host.';
    }
    return null;
  };

  const bookingGuardMessage = getBookingGuardMessage();
  const canBook = !bookingGuardMessage;

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'EEEE, MMMM dd, yyyy');
    } catch (e) {
      return dateStr;
    }
  };

  const formatTime = (timeStr: string) => {
    // Standard format time (e.g. "09:00:00" -> "9:00 AM")
    try {
      const [h, m] = timeStr.split(':');
      const hour = Number(h);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const formattedHour = hour % 12 || 12;
      return `${formattedHour}:${m} ${ampm}`;
    } catch (e) {
      return timeStr;
    }
  };

  const defaultAvatar = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23818cf8'><rect width='100%' height='100%' fill='%23111827'/><circle cx='12' cy='8' r='4'/><path d='M12 14c-6.1 0-8 4-8 4v2h16v-2s-1.9-4-8-4z'/></svg>`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 pt-28 space-y-8">
      {/* Back Button */}
      <div>
        <Link
          to="/events"
          className="inline-flex items-center gap-2 text-sm font-semibold text-text-secondary hover:text-white transition-colors duration-300"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Events Discovery
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left Side: Event Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Banner Block */}
          <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
            <img
              src={event.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60'}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
            
            <div className="absolute bottom-6 left-6 z-10 space-y-2.5">
              <span className="inline-block text-[10px] font-extrabold tracking-wider uppercase bg-primary text-white border border-white/10 px-3 py-1.5 rounded-full shadow-md">
                {event.category}
              </span>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white font-heading">
                {event.title}
              </h1>
            </div>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-panel p-5 border border-white/5 rounded-xl flex items-center gap-4 bg-slate-900/30">
              <div className="p-2.5 rounded-lg bg-indigo-500/10 text-primary">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase font-bold text-text-muted">Event Date</p>
                <p className="text-xs sm:text-sm font-semibold text-white truncate">{formatDate(event.event_date)}</p>
              </div>
            </div>
            
            <div className="glass-panel p-5 border border-white/5 rounded-xl flex items-center gap-4 bg-slate-900/30">
              <div className="p-2.5 rounded-lg bg-indigo-500/10 text-primary">
                <Clock className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase font-bold text-text-muted">Event Time</p>
                <p className="text-xs sm:text-sm font-semibold text-white truncate">{formatTime(event.event_time)}</p>
              </div>
            </div>

            <div className="glass-panel p-5 border border-white/5 rounded-xl flex items-center gap-4 bg-slate-900/30">
              <div className="p-2.5 rounded-lg bg-indigo-500/10 text-primary">
                <Clock className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase font-bold text-text-muted">Duration</p>
                <p className="text-xs sm:text-sm font-semibold text-white truncate">{event.duration || '2 hours'}</p>
              </div>
            </div>

            <div className="glass-panel p-5 border border-white/5 rounded-xl flex items-center gap-4 bg-slate-900/30">
              <div className="p-2.5 rounded-lg bg-indigo-500/10 text-primary">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase font-bold text-text-muted">Venue</p>
                <p className="text-xs sm:text-sm font-semibold text-white truncate" title={event.venue}>
                  {event.venue.split(',')[0]}
                </p>
              </div>
            </div>
          </div>

          {/* Detailed description */}
          <div className="glass-panel p-8 border border-white/5 rounded-2xl space-y-4 bg-slate-900/10">
            <h3 className="text-xl font-bold font-heading text-white">Event Details</h3>
            <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-line">
              {event.description}
            </p>
          </div>
        </div>

        {/* Right Side: Host Info & Actions */}
        <div className="space-y-6">
          {/* Host Info Box */}
          <div className="glass-panel p-8 border border-white/5 rounded-2xl space-y-6 shadow-xl bg-slate-900/40">
            <h3 className="text-base font-bold uppercase tracking-wider text-text-muted font-heading">Event Host</h3>
            
            <div className="flex items-center gap-4 border-b border-white/5 pb-5">
              <Link to={`/users/${event.organizer_id}`}>
                <img
                  src={event.organizer_avatar || defaultAvatar}
                  alt={event.organizer_name}
                  className="w-14 h-14 rounded-full object-cover border border-white/10 hover:border-primary transition-all duration-300"
                />
              </Link>
              <div>
                <Link to={`/users/${event.organizer_id}`} className="font-bold text-white hover:text-primary transition-colors text-sm sm:text-base">
                  {event.organizer_name || 'Amelia Patel'}
                </Link>
                <p className="text-xs text-text-muted">{event.organizer_company || 'Symphony Coordinator'}</p>
              </div>
            </div>

            {event.organizer_bio && (
              <p className="text-xs text-text-secondary leading-relaxed">
                {event.organizer_bio}
              </p>
            )}

            {/* Direct Connect Link */}
            <div className="text-xs text-text-muted space-y-2">
              <p className="flex justify-between">
                <span>Contact Email:</span>
                <a href={`mailto:${event.organizer_email}`} className="text-white hover:text-primary transition-colors truncate max-w-[150px]">
                  {event.organizer_email || 'org@eventflow.com'}
                </a>
              </p>
              {event.organizer_phone && (
                <p className="flex justify-between">
                  <span>Phone Number:</span>
                  <span className="text-white font-semibold">{event.organizer_phone}</span>
                </p>
              )}
            </div>
          </div>

          {/* Action Callouts */}
          <div className="glass-panel p-8 border border-white/5 rounded-2xl space-y-5 bg-slate-900/20">
            <h4 className="text-sm font-bold uppercase tracking-wider text-text-muted">Tickets Booking</h4>
            
            {/* Conditional action buttons */}
            {canManage && (
              <div className="flex flex-col gap-3">
                <Link
                  to={`/events/${eventId}/attendees`}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 border border-indigo-500/30 text-indigo-400 hover:text-white hover:bg-indigo-500/10 text-sm font-semibold rounded-lg transition-all duration-300 cursor-pointer"
                >
                  <Users className="w-4 h-4" />
                  View Attendees Log
                </Link>
                <Link
                  to={`/events/${eventId}/edit`}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 border border-white/10 text-text-primary hover:text-white hover:bg-white/5 text-sm font-semibold rounded-lg transition-all duration-300"
                >
                  <Edit className="w-4 h-4 text-indigo-400" />
                  Edit Event Info
                </Link>
                <button
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 border border-rose-500/20 text-rose-400 hover:text-white hover:bg-rose-500/10 text-sm font-semibold rounded-lg transition-all duration-300 cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Event
                </button>
              </div>
            )}

            {/* Standard attendee actions */}
            {!canManage && (
              <>
                {event.raw_status === 'CLOSED' || event.raw_status === 'ENDED' ? (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs leading-relaxed rounded-xl flex gap-2">
                    <AlertTriangle className="w-6 h-6 shrink-0" />
                    <span>
                      {event.raw_status === 'CLOSED' 
                        ? '🔒 Bookings are closed for this event (bookings stop 30 minutes before start time).'
                        : '⌛ This event has already ended.'}
                    </span>
                  </div>
                ) : isAuthenticated ? (
                  canBook ? (
                    <Link
                      to={`/events/${eventId}/book`}
                      className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-primary text-white font-bold rounded-xl shadow-lg hover:scale-[1.02] transition-all duration-300"
                    >
                      <Ticket className="w-5 h-5" />
                      Book Tickets Now
                    </Link>
                  ) : (
                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs leading-relaxed rounded-xl flex gap-2">
                      <AlertTriangle className="w-6 h-6 shrink-0" />
                      <span>{bookingGuardMessage}</span>
                    </div>
                  )
                ) : (
                  <div className="space-y-4">
                    <Link
                      to="/auth/login"
                      className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-primary text-white font-bold rounded-xl shadow-lg hover:scale-[1.02] transition-all duration-300"
                    >
                      Sign In to Register
                    </Link>
                    <p className="text-[11px] text-text-muted text-center leading-relaxed">
                      Registering lets you generate ticket access codes, network with other attendees, and customize your professional profile!
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Platform rules guard visual badge */}
            <div className="pt-4 border-t border-white/5 flex items-center gap-2 text-[10px] text-text-muted">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>EventFlow Platform Verified Reservation</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
