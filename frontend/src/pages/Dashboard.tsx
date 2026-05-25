import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { registrationService } from '../services/api';
import type { Registration } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { Modal } from '../components/Modal';
import { format } from 'date-fns';
import { QRCodeSVG } from 'qrcode.react';
import { Ticket, Calendar, MapPin, QrCode, User, ShieldCheck, Mail, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [selectedTicket, setSelectedTicket] = useState<Registration | null>(null);

  // Fetch registrations for current user
  const { data: bookings = [], isLoading, isError } = useQuery({
    queryKey: ['myRegistrations'],
    queryFn: () => registrationService.getMyRegistrations(),
  });

  const groupedBookings = React.useMemo(() => {
    const groups: { [key: number]: Registration[] } = {};
    bookings.forEach((booking) => {
      if (!groups[booking.event_id]) {
        groups[booking.event_id] = [];
      }
      groups[booking.event_id].push(booking);
    });

    return Object.values(groups).map((eventBookings) => {
      const first = eventBookings[0];
      const totalSeats = eventBookings.reduce((sum, b) => sum + (b.participants || 0), 0);
      const seatsFormula = eventBookings.length > 1
        ? ` (${eventBookings.map(b => b.participants).join(' + ')})`
        : '';
      return {
        ...first,
        totalSeats,
        seatsFormula,
        allBookings: eventBookings,
      };
    });
  }, [bookings]);

  const getFormattedDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      return format(new Date(dateStr), 'MMM dd, yyyy');
    } catch (e) {
      return dateStr;
    }
  };

  const getQRPayload = (reg: Registration) => {
    return `🎟️ EVENTFLOW DIGITAL ENTRY PASS 🎟️
====================================
EVENT: ${reg.event_title}
DATE: ${getFormattedDate(reg.event_date)}
VENUE: ${reg.event_venue}

ATTENDEE: ${reg.name}
RESERVATIONS: ${reg.participants} Seat(s)
TICKET REFERENCE: #REG-${reg.id}
GATE STATUS: CONFIRMED VERIFIED

SCAN VERIFICATION URL:
${window.location.origin}/tickets/${reg.id}`;
  };

  const defaultAvatar = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23818cf8'><rect width='100%' height='100%' fill='%23111827'/><circle cx='12' cy='8' r='4'/><path d='M12 14c-6.1 0-8 4-8 4v2h16v-2s-1.9-4-8-4z'/></svg>`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 pt-28 space-y-10">
      
      {/* Welcome Banner */}
      <div className="glass-panel border border-white/5 rounded-3xl p-8 relative overflow-hidden bg-slate-900/30">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <img
              src={user?.avatar || defaultAvatar}
              alt={user?.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500/30 shadow-md"
            />
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white">
                Welcome Back, <span className="text-gradient">{user?.name.split(' ')[0]}</span>
              </h1>
              <p className="text-xs sm:text-sm text-text-secondary flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
                {user?.email}
              </p>
            </div>
          </div>
          
          <Link
            to="/profile"
            className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-500/10 border border-indigo-500/25 hover:bg-indigo-500/20 text-indigo-300 text-xs font-semibold rounded-lg transition-all duration-300"
          >
            <User className="w-4 h-4" />
            Edit Profile
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-panel p-6 border border-white/5 rounded-2xl flex items-center gap-5">
          <div className="w-12 h-12 bg-indigo-500/10 text-primary border border-indigo-500/25 rounded-xl flex items-center justify-center">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-white font-heading">{groupedBookings.length}</h3>
            <p className="text-xs text-text-muted">Events Booked</p>
          </div>
        </div>

        <div className="glass-panel p-6 border border-white/5 rounded-2xl flex items-center gap-5">
          <div className="w-12 h-12 bg-pink-500/10 text-secondary border border-pink-500/25 rounded-xl flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-white font-heading">
              {groupedBookings.filter(b => b.event_date && new Date(b.event_date) >= new Date()).length}
            </h3>
            <p className="text-xs text-text-muted">Upcoming Gatherings</p>
          </div>
        </div>

        <div className="glass-panel p-6 border border-white/5 rounded-2xl flex items-center gap-5">
          <div className="w-12 h-12 bg-cyan-500/10 text-accent border border-cyan-500/25 rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-white font-heading">Active</h3>
            <p className="text-xs text-text-muted">Account Standing</p>
          </div>
        </div>
      </div>

      {/* Bookings Section */}
      <div className="space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold font-heading text-white">Your Registered Tickets</h2>

        {isLoading ? (
          <SkeletonLoader type="table" count={3} />
        ) : isError ? (
          <div className="glass-panel p-12 border border-white/5 rounded-2xl text-center">
            <p className="text-rose-400 font-semibold mb-2">Error loading registrations</p>
            <p className="text-text-muted text-sm">Please verify database status.</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="glass-panel p-16 border border-white/5 rounded-2xl text-center space-y-4 max-w-2xl mx-auto">
            <Ticket className="w-12 h-12 text-text-muted mx-auto" />
            <h3 className="text-lg font-bold text-white">No Tickets Booked Yet</h3>
            <p className="text-text-muted text-sm max-w-sm mx-auto leading-relaxed">
              You haven't booked any event tickets yet. Explore active events and register within seconds!
            </p>
            <div className="pt-2">
              <Link
                to="/events"
                className="px-6 py-3 bg-gradient-primary text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 max-w-[200px] mx-auto hover:scale-105 transition-all duration-300"
              >
                Find Events
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {groupedBookings.map((group) => (
              <motion.div
                key={group.event_id}
                whileHover={{ y: -4 }}
                className="glass-panel border border-white/5 hover:border-indigo-500/20 rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between h-full bg-slate-900/10"
              >
                {/* Event visual headers */}
                <div className="relative h-32 bg-slate-950 overflow-hidden shrink-0">
                  {group.event_image && (
                    <img
                      src={group.event_image}
                      alt={group.event_title}
                      className="w-full h-full object-cover opacity-60"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
                  <span className="absolute top-3 left-3 text-[9px] font-extrabold uppercase bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 px-2 py-1 rounded-full">
                    {group.category || 'Gathering'}
                  </span>
                </div>

                {/* Info details */}
                <div className="p-6 space-y-4 flex-grow flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-white font-heading line-clamp-2 leading-snug">
                      <Link to={`/events/${group.event_id}`} className="hover:text-primary transition-colors">
                        {group.event_title}
                      </Link>
                    </h3>
                    <div className="space-y-1.5 text-xs text-text-secondary">
                      <p className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>{getFormattedDate(group.event_date)}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="truncate max-w-[200px]">{group.event_venue?.split(',')[0]}</span>
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex items-center justify-between mt-auto">
                    <div className="text-left">
                      <p className="text-[9px] uppercase font-bold text-text-muted">Seats Booked</p>
                      <p className="text-sm font-bold text-white">
                        {group.totalSeats} Seat(s){group.seatsFormula}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => setSelectedTicket(group.allBookings[0])}
                      className="flex items-center gap-1.5 px-3 py-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-primary hover:text-white transition-all duration-300 text-xs font-semibold rounded-lg cursor-pointer"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      View QR Ticket
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* QR Ticket Modal */}
      <Modal
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        title="Your Digital Ticket Access Card"
        size="sm"
      >
        {selectedTicket && (() => {
          // Get all bookings for the same event to support side-switching navigation
          const eventBookings = bookings.filter((b) => b.event_id === selectedTicket.event_id);
          const currentIndex = eventBookings.findIndex((b) => b.id === selectedTicket.id);

          return (
            <div className="text-center space-y-6 py-4">
              {/* Navigation Chevrons inside Modal */}
              {eventBookings.length > 1 && (
                <div className="flex justify-between items-center bg-slate-950/50 border border-white/5 p-3 rounded-xl mb-2">
                  <button
                    type="button"
                    disabled={currentIndex === 0}
                    onClick={() => setSelectedTicket(eventBookings[currentIndex - 1])}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 hover:text-indigo-400 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer text-white"
                    title="Previous Booking Pass"
                  >
                    <ChevronLeft className="w-4.5 h-4.5" />
                  </button>
                  <span className="text-[11px] font-bold text-text-secondary">
                    Ticket Pass <span className="text-indigo-400">{currentIndex + 1}</span> of {eventBookings.length}
                  </span>
                  <button
                    type="button"
                    disabled={currentIndex === eventBookings.length - 1}
                    onClick={() => setSelectedTicket(eventBookings[currentIndex + 1])}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 hover:text-indigo-400 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer text-white"
                    title="Next Booking Pass"
                  >
                    <ChevronRight className="w-4.5 h-4.5" />
                  </button>
                </div>
              )}

              <div className="p-4 bg-white rounded-xl inline-block shadow-lg border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
                <QRCodeSVG
                  value={getQRPayload(selectedTicket)}
                  size={180}
                  level="M"
                  includeMargin={false}
                />
              </div>
              
              <div className="space-y-2">
                <h4 className="text-lg font-bold text-white font-heading">{selectedTicket.event_title}</h4>
                <p className="text-xs text-text-secondary font-semibold">
                  Venue: {selectedTicket.event_venue}
                </p>
                <p className="text-xs text-text-muted">
                  Date: {getFormattedDate(selectedTicket.event_date)}
                </p>
              </div>

              <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl space-y-2 text-left text-xs">
                <p className="flex justify-between">
                  <span className="text-text-muted">Ticket ID:</span>
                  <span className="text-white font-bold font-mono">#REG-{selectedTicket.id}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-text-muted">Attendee:</span>
                  <span className="text-white font-semibold">{selectedTicket.name}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-text-muted">Attendee Email:</span>
                  <span className="text-white font-medium">{selectedTicket.user_email || 'N/A'}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-text-muted">Seats Reserved:</span>
                  <span className="text-indigo-400 font-bold">{selectedTicket.participants} Seat(s)</span>
                </p>
                <p className="flex justify-between border-t border-white/5 pt-2 mt-2">
                  <span className="text-text-muted font-semibold">Organizer Support:</span>
                  <span className="text-indigo-300 font-medium">{selectedTicket.organizer_email || 'support@eventflow.org'}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-text-muted font-semibold">Contact Phone:</span>
                  <span className="text-indigo-300 font-medium">+91 98765 43210</span>
                </p>
              </div>

              {/* Secure QR access explanation */}
              <div className="p-4 bg-slate-950/60 border border-white/5 rounded-xl text-left space-y-2 text-[10px] leading-relaxed text-text-muted relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/5 rounded-full blur-xl -z-10"></div>
                <p className="font-bold text-white flex items-center gap-1 text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  Secure Gate Access Pass
                </p>
                <p>
                  This QR code contains an encrypted unique Booking ID. Turnstile scanners or ushers at the venue will scan this code to communicate with the check-in database, instantly verifying your seat reservations ({selectedTicket.participants} seats) and marking your ticket as redeemed for a smooth paperless entry.
                </p>
              </div>

              <p className="text-[10px] text-text-muted leading-relaxed">
                Show this QR code at the gates to authenticate entry. Verification requires valid matching ID logs.
              </p>
            </div>
          );
        })()}
      </Modal>

    </div>
  );
};
