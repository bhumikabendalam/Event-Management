import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { registrationService } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { toast } from '../components/Toast';
import { format } from 'date-fns';
import { Users, Mail, Phone, Calendar, ArrowLeft, Search, Download, ShieldCheck, MapPin, AlertCircle } from 'lucide-react';

export const EventAttendees: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const eventId = Number(id);

  const [searchQuery, setSearchQuery] = useState('');

  // Fetch attendees list and event details
  const { data: result, isLoading, isError } = useQuery({
    queryKey: ['eventRegistrations', eventId],
    queryFn: () => registrationService.getEventRegistrations(eventId),
    enabled: !isNaN(eventId),
  });

  const getFormattedDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      return format(new Date(dateStr), 'EEEE, MMMM dd, yyyy');
    } catch (e) {
      return dateStr;
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

  // Authorization Guard
  const isAuthorized = isAuthenticated && user && (user.role === 'Admin' || user.role === 'Organizer');

  if (!isAuthorized) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center space-y-4">
        <AlertCircle className="w-16 h-16 text-rose-400 mx-auto" />
        <h2 className="text-2xl font-bold text-white">Access Restricted</h2>
        <p className="text-text-secondary max-w-sm mx-auto">
          You must be logged in as an Admin or the hosting Organizer to access registration logs.
        </p>
        <Link
          to="/auth/login"
          className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg inline-block"
        >
          Sign In
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 pt-28">
        <SkeletonLoader type="table" count={5} />
      </div>
    );
  }

  if (isError || !result) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center space-y-4">
        <AlertCircle className="w-16 h-16 text-rose-400 mx-auto" />
        <h2 className="text-2xl font-bold text-white">Access Denied</h2>
        <p className="text-text-secondary max-w-sm mx-auto">
          You are not authorized to view registrations for events hosted by other accounts.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2.5 bg-slate-800 text-white text-sm font-semibold rounded-lg"
        >
          Go Back
        </button>
      </div>
    );
  }

  const { attendees = [], event } = result;

  // Filter attendees
  const filteredAttendees = attendees.filter((a) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      a.name.toLowerCase().includes(query) ||
      a.email.toLowerCase().includes(query) ||
      (a.phone && a.phone.toLowerCase().includes(query))
    );
  });

  // Calculate Metrics Summary
  const totalRegistrations = attendees.length;
  const totalSeats = attendees.reduce((sum, a) => sum + (a.participants || 1), 0);
  const profilesConnected = attendees.filter((a) => a.user_id !== null).length;

  // Export CSV Handler
  const handleExportCSV = () => {
    if (attendees.length === 0) {
      toast.error('No attendees available to export.');
      return;
    }
    const headers = ['#', 'Name', 'Email', 'Phone', 'Seats', 'Registered At'];
    const rows = attendees.map((a, i) => [
      i + 1,
      a.name,
      a.email,
      a.phone || '—',
      a.participants || 1,
      format(new Date(a.registered_at), 'yyyy-MM-dd HH:mm:ss'),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `attendees_event_${eventId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Attendee roster exported successfully!');
  };

  const defaultAvatar = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23818cf8'><rect width='100%' height='100%' fill='%23111827'/><circle cx='12' cy='8' r='4'/><path d='M12 14c-6.1 0-8 4-8 4v2h16v-2s-1.9-4-8-4z'/></svg>`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 pt-28 space-y-8">
      {/* Back button */}
      <div>
        <Link
          to={`/events/${eventId}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-text-secondary hover:text-white transition-colors duration-300"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Event Details
        </Link>
      </div>

      {/* Header Info */}
      <div className="glass-panel border border-white/5 rounded-3xl p-8 relative overflow-hidden bg-slate-900/30">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-3">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/25">
              Registration Desk
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold font-heading text-white mt-2">
              Attendees for <span className="text-gradient">{event?.title}</span>
            </h1>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-text-secondary">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-indigo-400" />
                {getFormattedDate(event?.event_date)}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-indigo-400" />
                {event?.venue}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 shrink-0">
            <span className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 font-bold text-xs rounded-lg shadow-sm">
              {totalRegistrations} Bookings
            </span>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-primary hover:scale-[1.02] text-white text-xs font-bold rounded-lg shadow-md transition-all duration-300 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Stats Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-panel p-6 border border-white/5 rounded-2xl flex items-center gap-5">
          <div className="w-12 h-12 bg-indigo-500/10 text-primary border border-indigo-500/25 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-white font-heading">{totalRegistrations}</h3>
            <p className="text-xs text-text-muted">Total Registrations</p>
          </div>
        </div>

        <div className="glass-panel p-6 border border-white/5 rounded-2xl flex items-center gap-5">
          <div className="w-12 h-12 bg-pink-500/10 text-secondary border border-pink-500/25 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-white font-heading">{totalSeats}</h3>
            <p className="text-xs text-text-muted">Total Attendees (Seats)</p>
          </div>
        </div>

        <div className="glass-panel p-6 border border-white/5 rounded-2xl flex items-center gap-5">
          <div className="w-12 h-12 bg-cyan-500/10 text-accent border border-cyan-500/25 rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-white font-heading">{profilesConnected}</h3>
            <p className="text-xs text-text-muted">Have EventFlow Profiles</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          type="text"
          placeholder="Search attendee by name, email, or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3.5 bg-slate-950 border border-white/5 rounded-xl text-text-primary text-sm focus:border-primary outline-none transition-all duration-300"
        />
      </div>

      {/* Grid of Attendees */}
      {filteredAttendees.length === 0 ? (
        <div className="glass-panel p-16 border border-white/5 rounded-2xl text-center space-y-4 max-w-xl mx-auto">
          <Users className="w-12 h-12 text-text-muted mx-auto" />
          <h3 className="text-lg font-bold text-white">No Attendees Found</h3>
          <p className="text-text-muted text-sm leading-relaxed">
            {searchQuery ? 'No registrations match your search filter.' : 'No one has registered for this event yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAttendees.map((attendee) => {
            const avatarSrc = attendee.user_avatar || defaultAvatar;
            return (
              <div
                key={attendee.id}
                className="glass-panel p-6 border border-white/5 rounded-2xl flex gap-4 items-start bg-slate-900/10 relative overflow-hidden group"
              >
                <div className="absolute top-0 left-0 w-[3px] h-full bg-gradient-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Avatar and seat badge */}
                <div className="relative shrink-0">
                  <img
                    src={avatarSrc}
                    alt={attendee.name}
                    className="w-14 h-14 rounded-full object-cover border border-white/10"
                  />
                  <span
                    className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-indigo-500 border border-slate-950 text-white font-extrabold text-[10px] flex items-center justify-center shadow-md"
                    title={`${attendee.participants} seat(s) reserved`}
                  >
                    {attendee.participants}
                  </span>
                </div>

                {/* Attendee Info */}
                <div className="space-y-2 flex-grow min-w-0">
                  <h4 className="font-bold text-white text-sm sm:text-base leading-snug truncate">
                    {attendee.user_id ? (
                      <Link
                        to={`/users/${attendee.user_id}`}
                        className="hover:text-primary transition-colors text-gradient"
                        title="View EventFlow Profile"
                      >
                        {attendee.name}
                      </Link>
                    ) : (
                      attendee.name
                    )}
                  </h4>

                  <div className="space-y-1 text-xs text-text-secondary">
                    <p className="flex items-center gap-1.5 truncate">
                      <Mail className="w-3.5 h-3.5 text-text-muted shrink-0" />
                      <a href={`mailto:${attendee.email}`} className="hover:text-primary transition-colors truncate">
                        {attendee.email}
                      </a>
                    </p>
                    {attendee.phone && (
                      <p className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-text-muted shrink-0" />
                        <span>{attendee.phone}</span>
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-text-muted">
                    <span>Reg At:</span>
                    <span>
                      {format(new Date(attendee.registered_at), 'MMM dd, hh:mm a')}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
