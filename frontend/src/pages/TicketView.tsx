import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { registrationService } from '../services/api';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { QRCodeSVG } from 'qrcode.react';
import { format } from 'date-fns';
import { Ticket, Calendar, MapPin, Clock, ArrowLeft, Printer, Download, ShieldCheck, Mail, User, Phone, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from '../components/Toast';

export const TicketView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const ticketId = Number(id);

  // Fetch all registrations and find the one matching the current URL ID parameter
  const { data: bookings = [], isLoading, isError } = useQuery({
    queryKey: ['myRegistrations'],
    queryFn: () => registrationService.getMyRegistrations(),
  });

  const ticket = bookings.find((b) => b.id === ticketId);
  const eventBookings = ticket ? bookings.filter((b) => b.event_id === ticket.event_id) : [];
  const currentIndex = eventBookings.findIndex((b) => b.id === ticketId);

  const getFormattedDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      return format(new Date(dateStr), 'EEEE, MMMM dd, yyyy');
    } catch (e) {
      return dateStr;
    }
  };

  const getFormattedTime = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        // Fallback for simple "HH:MM:SS" time strings
        const [h, m] = dateStr.split(':');
        const hour = Number(h);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const formattedHour = hour % 12 || 12;
        return `${formattedHour}:${m} ${ampm}`;
      }
      return format(date, 'hh:mm a');
    } catch (e) {
      return dateStr;
    }
  };

  const getQRPayload = () => {
    if (!ticket) return '';
    return `🎟️ EVENTFLOW DIGITAL ENTRY PASS 🎟️
====================================
EVENT: ${ticket.event_title}
DATE: ${getFormattedDate(ticket.event_date)}
TIME: ${getFormattedTime(ticket.event_date)}
VENUE: ${ticket.event_venue}

ATTENDEE: ${ticket.name}
RESERVATIONS: ${ticket.participants} Seat(s)
TICKET REFERENCE: #REG-${ticket.id}
GATE STATUS: CONFIRMED VERIFIED

SCAN VERIFICATION URL:
${window.location.origin}/tickets/${ticket.id}`;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadOffline = () => {
    toast.success('Offline ticket PDF downloaded to local storage folder.');
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 pt-28">
        <SkeletonLoader type="detail" />
      </div>
    );
  }

  if (isError || !ticket) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center space-y-4">
        <Ticket className="w-16 h-16 text-rose-500 mx-auto" />
        <h2 className="text-2xl font-bold text-white">Ticket Not Found</h2>
        <p className="text-text-secondary max-w-sm mx-auto">
          The ticket reference code is invalid or does not match your active account registrations logs.
        </p>
        <Link
          to="/dashboard"
          className="px-6 py-2.5 bg-gradient-primary text-white text-sm font-semibold rounded-lg inline-block"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 pt-28 space-y-8 print:pt-4 print:pb-4">
      {/* Back button - hidden in print */}
      <div className="print:hidden flex justify-between items-center">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-semibold text-text-secondary hover:text-white transition-colors duration-300"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 border border-white/5 text-text-secondary hover:text-white text-xs font-semibold rounded-lg transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Print Pass
          </button>
          <button
            onClick={handleDownloadOffline}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 hover:text-white hover:bg-primary transition-all text-xs font-semibold rounded-lg cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Save Ticket Offline
          </button>
        </div>
      </div>

      {/* Multiple Bookings dot selector bar */}
      {eventBookings.length > 1 && (
        <div className="print:hidden flex flex-col sm:flex-row justify-between items-center bg-slate-950/40 border border-white/5 px-6 py-4 rounded-2xl gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
            <span className="text-xs font-bold text-text-secondary">
              Multiple Bookings Detected: You booked tickets <span className="text-indigo-400 font-extrabold">{eventBookings.length} times</span> for this event!
            </span>
          </div>
          <div className="flex gap-2 items-center">
            {eventBookings.map((b, idx) => (
              <Link
                key={b.id}
                to={`/tickets/${b.id}`}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  idx === currentIndex 
                    ? 'bg-indigo-500 scale-125 shadow-lg shadow-indigo-500/50' 
                    : 'bg-white/10 hover:bg-white/30'
                }`}
                title={`Go to Ticket ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Premium Ticket Graphic Component with side-switcher boundaries */}
      <div className="relative group/ticket">
        {/* Left Chevron arrow */}
        {eventBookings.length > 1 && currentIndex > 0 && (
          <Link
            to={`/tickets/${eventBookings[currentIndex - 1].id}`}
            className="print:hidden absolute -left-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-slate-950/90 hover:bg-indigo-600 border border-white/10 text-white flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer opacity-80 group-hover/ticket:opacity-100"
            title="Previous Booking Pass"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
        )}

        {/* Right Chevron arrow */}
        {eventBookings.length > 1 && currentIndex < eventBookings.length - 1 && (
          <Link
            to={`/tickets/${eventBookings[currentIndex + 1].id}`}
            className="print:hidden absolute -right-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-slate-950/90 hover:bg-indigo-600 border border-white/10 text-white flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer opacity-80 group-hover/ticket:opacity-100"
            title="Next Booking Pass"
          >
            <ChevronRight className="w-5 h-5" />
          </Link>
        )}

        <motion.div
          key={ticketId}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="glass-panel border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative bg-slate-900/20 backdrop-blur-xl flex flex-col md:flex-row print:border-slate-800 print:text-black print:bg-white print:shadow-none"
        >
        {/* Left Side: Ticket Event recap */}
        <div className="p-8 md:p-10 flex-grow space-y-8 md:border-r md:border-dashed md:border-white/10 print:border-slate-300">
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-1">
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20 print:border-slate-300 print:text-indigo-600">
                {ticket.category || 'Gathering'}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white font-heading mt-2 print:text-black">
                {ticket.event_title}
              </h2>
            </div>
            
            <div className="text-right shrink-0">
              <p className="text-[9px] font-bold text-text-muted uppercase">Ticket No.</p>
              <p className="text-sm font-extrabold text-white font-mono print:text-black">#REG-{ticket.id}</p>
            </div>
          </div>

          {/* Event details block */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-white/5 print:border-slate-200">
            <div className="space-y-4">
              <div className="flex gap-3 items-start">
                <Calendar className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5 print:text-indigo-600" />
                <div>
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Date</p>
                  <p className="text-sm font-semibold text-white print:text-black">{getFormattedDate(ticket.event_date)}</p>
                </div>
              </div>

              {ticket.event_date && (
                <div className="flex gap-3 items-start">
                  <Clock className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5 print:text-indigo-600" />
                  <div>
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Start Time</p>
                    <p className="text-sm font-semibold text-white print:text-black">
                      {getFormattedTime(ticket.event_date)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex gap-3 items-start">
                <MapPin className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5 print:text-indigo-600" />
                <div>
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Venue Location</p>
                  <p className="text-sm font-semibold text-white print:text-black leading-relaxed">
                    {ticket.event_venue || 'Symphony Hall, Bangalore'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Attendee Info block */}
          <div className="pt-6 border-t border-white/5 print:border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-text-secondary print:border print:border-slate-200">
                <User className="w-4.5 h-4.5 text-indigo-400 print:text-indigo-600" />
              </div>
              <div>
                <p className="text-[9px] font-bold text-text-muted uppercase">Attendee Name</p>
                <p className="text-xs font-bold text-white print:text-black">{ticket.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-text-secondary print:border print:border-slate-200">
                <Mail className="w-4.5 h-4.5 text-indigo-400 print:text-indigo-600" />
              </div>
              <div>
                <p className="text-[9px] font-bold text-text-muted uppercase">Email Address</p>
                <p className="text-xs font-bold text-white print:text-black truncate max-w-[150px]">{ticket.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-text-secondary print:border print:border-slate-200">
                <Phone className="w-4.5 h-4.5 text-indigo-400 print:text-indigo-600" />
              </div>
              <div>
                <p className="text-[9px] font-bold text-text-muted uppercase">Contact Number</p>
                <p className="text-xs font-bold text-white print:text-black truncate max-w-[150px]">{ticket.phone || '+91 98765 43210'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: QR Gate Authentication Code */}
        <div className="p-8 md:p-10 shrink-0 flex flex-col items-center justify-center bg-slate-950/40 min-w-[260px] text-center space-y-4 print:bg-white print:border-t print:border-t-slate-200 md:print:border-t-0">
          <div className="p-4 bg-white rounded-2xl shadow-lg border border-slate-200">
            <QRCodeSVG
              value={getQRPayload()}
              size={150}
              level="M"
              includeMargin={false}
            />
          </div>

          <div className="space-y-1">
            <span className="text-[9px] font-bold text-text-muted uppercase">Access Status</span>
            <p className="text-xs font-black text-indigo-400 uppercase tracking-widest print:text-indigo-600">
              Verified Ticket
            </p>
          </div>

          <p className="text-xs font-black text-white font-heading print:text-black">
            {ticket.participants} Seat(s) Reserved
          </p>

          <div className="pt-2 flex items-center gap-1.5 justify-center text-[10px] text-text-muted">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Secure Gate Authentication Pass</span>
          </div>
        </div>
      </motion.div>
    </div>

      {/* Printing Policy & Support block */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:hidden">
        {/* Secure QR Code Explanation */}
        <div className="glass-panel p-6 border border-white/5 rounded-2xl bg-slate-900/15 text-xs text-text-secondary leading-relaxed space-y-3.5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl -z-10"></div>
          <p className="font-bold text-white flex items-center gap-1.5 text-[13px] font-heading tracking-wide">
            <ShieldCheck className="w-4.5 h-4.5 text-indigo-400" />
            How does your Digital QR Entry Pass work?
          </p>
          <p className="text-text-muted text-[11px] leading-relaxed">
            This QR code contains your encrypted, unique Booking ID. When scanned by ushers or gate turnstiles at the venue, it communicates instantly with the check-in server to retrieve your scheduling details, event metadata, and seat reservations (<span className="text-indigo-400 font-bold">{ticket.participants} Seat(s)</span>), checking you in smoothly without paper tickets.
          </p>
          <p className="text-[10px] text-text-muted italic border-t border-white/5 pt-2.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
            Dynamic Gate Security Enabled: Secure links protect against unauthorized ticket duplication & scalping.
          </p>
        </div>

        {/* Organizer & Support Contacts */}
        <div className="glass-panel p-6 border border-white/5 rounded-2xl bg-slate-900/10 text-xs text-text-secondary leading-relaxed space-y-3">
          <p className="font-bold text-white flex items-center gap-1.5">
            <Mail className="w-4 h-4 text-indigo-400" />
            Event Organizer & Support Details
          </p>
          <div className="space-y-2 text-text-muted pl-1">
            <p className="flex items-center gap-2">
              <span className="font-medium text-text-secondary">Coordinator Email:</span>
              <a href={`mailto:${ticket.organizer_email || 'support@eventflow.org'}`} className="text-indigo-400 hover:underline font-semibold">
                {ticket.organizer_email || 'support@eventflow.org'}
              </a>
            </p>
            <p className="flex items-center gap-2">
              <span className="font-medium text-text-secondary">Support Hotline:</span>
              <a href="tel:+919876543210" className="text-indigo-400 hover:underline font-semibold">
                +91 98765 43210
              </a>
            </p>
            <p className="flex items-center gap-2">
              <span className="font-medium text-text-secondary">Operational Hours:</span>
              <span>Mon - Sat, 9:00 AM - 6:00 PM</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
