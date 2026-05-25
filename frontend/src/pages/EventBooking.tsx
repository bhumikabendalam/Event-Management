import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { eventService, registrationService } from '../services/api';
import type { Registration } from '../services/api';
import { toast } from '../components/Toast';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { QRCodeSVG } from 'qrcode.react';
import { format } from 'date-fns';
import { Calendar, MapPin, Clock, ArrowLeft, Ticket, Check, ShieldCheck, Mail, Phone, Users } from 'lucide-react';

export const EventBooking: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const eventId = Number(id);
  const queryClient = useQueryClient();

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [participants, setParticipants] = useState(1);
  const [createdRegistration, setCreatedRegistration] = useState<Registration | null>(null);
  const [emailAlerts, setEmailAlerts] = useState(true);

  // Load preferences when user is available
  useEffect(() => {
    if (user?.id) {
      const saved = localStorage.getItem(`eventflow_settings_${user.id}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed.emailAlerts === 'boolean') {
            setEmailAlerts(parsed.emailAlerts);
          }
        } catch (e) {}
      }
    }
  }, [user]);

  // Load user info into form on mount/change
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhone(user.contact_number || '');
    }
  }, [user]);

  // Query event details
  const { data: event, isLoading, isError } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => eventService.getEventById(eventId),
    enabled: !isNaN(eventId),
  });

  // Ticket booking mutation
  const bookingMutation = useMutation({
    mutationFn: () =>
      registrationService.registerForEvent({
        event_id: eventId,
        name,
        email,
        phone,
        participants,
      }),
    onSuccess: (res) => {
      if (res.success && res.data) {
        setCreatedRegistration(res.data);
        setStep(2);
        toast.success('Tickets booked successfully!');
        
        // Invalidate queries to trigger background updates and synchronize state
        queryClient.invalidateQueries({ queryKey: ['event', eventId] });
        queryClient.invalidateQueries({ queryKey: ['events'] });
        queryClient.invalidateQueries({ queryKey: ['myRegistrations'] });
        queryClient.invalidateQueries({ queryKey: ['eventRegistrations', eventId] });
        queryClient.invalidateQueries({ queryKey: ['organizerMetrics'] });
        queryClient.invalidateQueries({ queryKey: ['adminMetrics'] });
      } else {
        toast.error(res.error || 'Failed to complete ticket booking.');
      }
    },
    onError: () => {
      toast.error('An error occurred during booking transaction.');
    },
  });

  const getFormattedDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      return format(new Date(dateStr), 'MMM dd, yyyy');
    } catch (e) {
      return dateStr;
    }
  };

  const getQRPayload = () => {
    if (!createdRegistration) return '';
    return `🎟️ EVENTFLOW DIGITAL ENTRY PASS 🎟️
====================================
EVENT: ${event?.title || ''}
DATE: ${getFormattedDate(event?.event_date)}
VENUE: ${event?.venue || ''}

ATTENDEE: ${createdRegistration.name}
RESERVATIONS: ${createdRegistration.participants} Seat(s)
TICKET REFERENCE: #REG-${createdRegistration.id}
GATE STATUS: CONFIRMED VERIFIED

SCAN VERIFICATION URL:
${window.location.origin}/tickets/${createdRegistration.id}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim()) {
      toast.error('Please enter all details.');
      return;
    }
    bookingMutation.mutate();
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
        <h2 className="text-2xl font-bold text-white">Event Not Found</h2>
        <Link to="/events" className="px-6 py-2.5 bg-gradient-primary text-white text-sm font-semibold rounded-lg inline-block">
          Return to Events
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 pt-28 space-y-8">
      {/* Back button */}
      <div>
        <Link
          to={`/events/${eventId}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-text-secondary hover:text-white transition-colors duration-300"
        >
          <ArrowLeft className="w-4 h-4" />
          Cancel and return to event details
        </Link>
      </div>

      {/* Stepper visual progress */}
      <div className="max-w-md mx-auto flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
            step >= 1 ? 'bg-primary text-white' : 'bg-slate-900 text-text-muted border border-white/5'
          }`}>
            {step > 1 ? <Check className="w-4 h-4" /> : '1'}
          </span>
          <span className={`text-xs font-bold ${step >= 1 ? 'text-white' : 'text-text-muted'}`}>Details Form</span>
        </div>
        <div className="w-16 h-[2px] bg-white/10 flex-grow mx-4"></div>
        <div className="flex items-center gap-2">
          <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
            step === 2 ? 'bg-secondary text-white shadow-lg' : 'bg-slate-900 text-text-muted border border-white/5'
          }`}>
            2
          </span>
          <span className={`text-xs font-bold ${step === 2 ? 'text-white' : 'text-text-muted'}`}>Ticket Issued</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Booking forms */}
        <div className="lg:col-span-2 space-y-6">
          {step === 1 && (
            <div className="glass-panel p-8 border border-white/5 rounded-2xl shadow-xl bg-slate-900/10">
              <form onSubmit={handleSubmit} className="space-y-6">
                <h3 className="text-xl font-bold font-heading text-white border-b border-white/5 pb-4">
                  Attendee Entry Registration
                </h3>

                {/* Attendee Name */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-indigo-400" />
                    Attendee Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-white/5 rounded-xl text-text-primary text-sm focus:border-primary outline-none transition-all duration-300"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-indigo-400" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-white/5 rounded-xl text-text-primary text-sm focus:border-primary outline-none transition-all duration-300"
                      required
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-indigo-400" />
                      Contact Phone
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full px-4 py-3 bg-slate-950 border border-white/5 rounded-xl text-text-primary text-sm focus:border-primary outline-none transition-all duration-300"
                      required
                    />
                  </div>
                </div>

                {/* Seat tickets */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-indigo-400" />
                    Seats to Reserve (Qty)
                  </label>
                  <select
                    value={participants}
                    onChange={(e) => setParticipants(Number(e.target.value))}
                    className="w-full px-4 py-3.5 bg-slate-950 border border-white/5 rounded-xl text-text-primary text-sm focus:border-primary outline-none transition-all duration-300"
                  >
                    {[1, 2, 3, 4, 5].map((num) => (
                      <option key={num} value={num} className="bg-slate-950">
                        {num} Ticket / Seat{num > 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Stepper buttons */}
                <div className="pt-4 border-t border-white/5 flex justify-end">
                  <button
                    type="submit"
                    disabled={bookingMutation.isPending}
                    className="px-8 py-4 bg-gradient-primary hover:scale-[1.02] text-white font-bold rounded-xl shadow-lg transition-all duration-300 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Ticket className="w-5 h-5" />
                    {bookingMutation.isPending ? 'Processing Tickets...' : 'Book Tickets Now'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {step === 2 && createdRegistration && (
            <div className="glass-panel p-8 border border-white/5 rounded-2xl shadow-xl bg-slate-900/10 text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 mx-auto">
                <Check className="w-8 h-8" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-extrabold font-heading text-white">Tickets Booked Successfully!</h3>
                <p className="text-sm text-text-secondary">
                  Your ticket has been registered under invoice ID <span className="text-white font-bold">#REG-{createdRegistration.id}</span>.
                </p>
                <p className="text-xs text-text-muted mt-2 leading-relaxed max-w-md mx-auto">
                  {emailAlerts ? (
                    <span>
                      An entry pass, booking logs, and receipt logs have been successfully sent to <span className="text-indigo-400 font-bold">{createdRegistration.email}</span>.
                    </span>
                  ) : (
                    <span>
                      Email notifications are currently disabled in your settings preferences. No invoice was dispatched, but your digital pass is fully active.
                    </span>
                  )}
                </p>
              </div>

              {/* QR display block */}
              <div className="p-5 bg-white rounded-2xl inline-block shadow-lg border border-slate-200">
                <QRCodeSVG
                  value={getQRPayload()}
                  size={200}
                  level="M"
                />
              </div>

              <div className="max-w-sm mx-auto p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl space-y-2 text-left text-xs">
                <p className="flex justify-between">
                  <span className="text-text-muted">Attendee:</span>
                  <span className="text-white font-bold">{createdRegistration.name}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-text-muted">Registered Email:</span>
                  <span className="text-white font-bold">{createdRegistration.email}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-text-muted">Seats Reserved:</span>
                  <span className="text-indigo-400 font-bold">{createdRegistration.participants} Seat(s)</span>
                </p>
              </div>

              <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/dashboard"
                  className="px-6 py-3.5 bg-gradient-primary text-white text-xs font-bold rounded-xl shadow-md transition-all duration-300"
                >
                  Go to Dashboard
                </Link>
                <Link
                  to="/events"
                  className="px-6 py-3.5 bg-slate-950 border border-white/5 text-text-secondary hover:text-white text-xs font-bold rounded-xl transition-all duration-300"
                >
                  Explore More Events
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Event visual recap card */}
        <div className="glass-panel p-6 border border-white/5 rounded-2xl shadow-xl bg-slate-900/40 space-y-6 h-fit">
          <h4 className="text-sm font-bold text-text-muted uppercase tracking-wider">Event Details</h4>
          
          <div className="relative aspect-video rounded-xl overflow-hidden border border-white/5">
            <img
              src={event.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60'}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white font-heading leading-snug">{event.title}</h3>
            
            <div className="space-y-2.5 text-xs text-text-secondary">
              <p className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>{getFormattedDate(event.event_date)}</span>
              </p>
              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>{event.event_time.slice(0, 5)} {event.duration ? `(${event.duration})` : ''}</span>
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="truncate" title={event.venue}>{event.venue}</span>
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 flex items-center gap-2 text-[10px] text-text-muted">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>EventFlow Verified Secure Booking Transaction</span>
          </div>
        </div>

      </div>
    </div>
  );
};
