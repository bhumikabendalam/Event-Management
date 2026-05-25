import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { analyticsService, eventService } from '../services/api';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { toast } from '../components/Toast';
import { format } from 'date-fns';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Users, Plus, ShieldCheck, LayoutGrid, FileSpreadsheet, Edit, Trash2 } from 'lucide-react';

const getChartTooltipStyle = () => {
  const root = document.documentElement;
  const styles = getComputedStyle(root);
  return {
    backgroundColor: styles.getPropertyValue('--bg-secondary').trim() || '#111827',
    border: `1px solid ${styles.getPropertyValue('--border-glass').trim() || 'rgba(255,255,255,0.08)'}`,
    borderRadius: '8px',
    color: styles.getPropertyValue('--text-primary').trim() || '#f8fafc',
  };
};

export const AdminDashboard: React.FC = () => {
  const queryClient = useQueryClient();

  // Query global platform analytics metrics
  const { data: metrics, isLoading: isMetricsLoading } = useQuery({
    queryKey: ['adminMetrics'],
    queryFn: () => analyticsService.getMetrics(),
  });

  // Query all events in catalog
  const { data: events = [], isLoading: isEventsLoading } = useQuery({
    queryKey: ['events'],
    queryFn: () => eventService.getEvents(),
  });

  // Invalidate queries on delete
  const deleteMutation = useMutation({
    mutationFn: (id: number) => eventService.deleteEvent(id),
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Event deleted from platform catalog');
        queryClient.invalidateQueries({ queryKey: ['events'] });
        queryClient.invalidateQueries({ queryKey: ['adminMetrics'] });
      } else {
        toast.error(res.error || 'Failed to delete event');
      }
    },
    onError: () => {
      toast.error('An error occurred during transaction');
    },
  });

  const handleDelete = (id: number) => {
    if (window.confirm('WARNING: Are you sure you want to delete this event? This will remove all associated ticket registrations.')) {
      deleteMutation.mutate(id);
    }
  };

  const getFormattedDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'MMM dd, yyyy');
    } catch (e) {
      return dateStr;
    }
  };

  // Recharts Data Prep
  const categoryData = metrics?.categories
    ? Object.keys(metrics.categories).map((name) => ({
        name,
        value: metrics.categories[name],
      }))
    : [];

  const trendData = metrics?.registrations
    ? metrics.registrations.map((reg) => ({
        date: format(new Date(reg.registered_at), 'MM/dd'),
        attendees: reg.participants || 1,
      })).slice(-15) // Take last 15
    : [];

  const COLORS = ['#6366f1', '#ec4899', '#14b8a6', '#f59e0b', '#10b981', '#a855f7'];

  const isLoading = isMetricsLoading || isEventsLoading;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 pt-28 space-y-10">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 glass-panel border border-white/5 p-8 rounded-3xl bg-slate-900/30">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold tracking-wider uppercase text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            Platform Control Room
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-text-primary mt-3">
            Admin Dashboard
          </h1>
          <p className="text-text-secondary text-xs sm:text-sm mt-1.5">
            Oversee all bookings, view categories spread charts, and update global event registers.
          </p>
        </div>

        <Link
          to="/events/new"
          className="flex items-center gap-2 px-5 py-3 bg-gradient-primary hover:scale-[1.02] text-white font-bold rounded-xl shadow-lg transition-all duration-300"
        >
          <Plus className="w-5 h-5" />
          Create New Event
        </Link>
      </div>

      {isLoading ? (
        <SkeletonLoader type="table" count={5} />
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="glass-panel p-6 border border-white/5 rounded-2xl flex items-center gap-5">
              <div className="w-12 h-12 bg-indigo-500/10 text-primary border border-indigo-500/25 rounded-xl flex items-center justify-center">
                <LayoutGrid className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-text-primary font-heading">{metrics?.totalEvents || 0}</h3>
                <p className="text-xs text-text-muted">Global Active Events</p>
              </div>
            </div>

            <div className="glass-panel p-6 border border-white/5 rounded-2xl flex items-center gap-5">
              <div className="w-12 h-12 bg-pink-500/10 text-secondary border border-pink-500/25 rounded-xl flex items-center justify-center">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-text-primary font-heading">{metrics?.totalBookings || 0}</h3>
                <p className="text-xs text-text-muted">Global Bookings Logs</p>
              </div>
            </div>

            <div className="glass-panel p-6 border border-white/5 rounded-2xl flex items-center gap-5">
              <div className="w-12 h-12 bg-cyan-500/10 text-accent border border-cyan-500/25 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-text-primary font-heading">{metrics?.totalAttendees || 0}</h3>
                <p className="text-xs text-text-muted">Total Reserved Seats</p>
              </div>
            </div>
          </div>

          {/* Recharts Analytics Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Area chart */}
            <div className="lg:col-span-2 glass-panel p-6 border border-white/5 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-text-primary font-heading uppercase tracking-wider">
                Platform-wide Registration Trends
              </h3>
              <div className="h-64">
                {trendData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-text-muted text-xs">
                    No registrations activity logs.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                      <defs>
                        <linearGradient id="colorAdminAttendees" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#818cf8" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                      <Tooltip contentStyle={getChartTooltipStyle()} />
                      <Area
                        type="monotone"
                        dataKey="attendees"
                        stroke="#818cf8"
                        fillOpacity={1}
                        fill="url(#colorAdminAttendees)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Pie chart */}
            <div className="glass-panel p-6 border border-white/5 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-text-primary font-heading uppercase tracking-wider">
                Categories Distribution
              </h3>
              <div className="h-64 flex items-center justify-center">
                {categoryData.length === 0 ? (
                  <div className="text-text-muted text-xs">No active category statistics.</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '8px',
                          color: '#f8fafc',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* Master Table */}
          <div className="glass-panel border border-white/5 rounded-2xl overflow-hidden shadow-xl bg-slate-900/10">
            <div className="px-6 py-5 border-b border-white/5 bg-slate-950/20">
              <h3 className="text-base font-bold font-heading text-white">Global Events Registry</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-950/40 text-text-secondary font-semibold border-b border-white/5">
                    <th className="p-4 pl-6">Event Title</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Venue</th>
                    <th className="p-4">Host Name</th>
                    <th className="p-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {events.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-text-muted">
                        No events found in the database.
                      </td>
                    </tr>
                  ) : (
                    events.map((event) => (
                      <tr key={event.id} className="hover:bg-indigo-500/5 transition-colors">
                        <td className="p-4 pl-6 font-bold text-white max-w-[200px] truncate">
                          <Link to={`/events/${event.id}`} className="hover:text-primary transition-colors">
                            {event.title}
                          </Link>
                        </td>
                        <td className="p-4 text-text-secondary">{getFormattedDate(event.event_date)}</td>
                        <td className="p-4 text-text-secondary">{event.category}</td>
                        <td className="p-4 text-text-secondary truncate max-w-[150px]" title={event.venue}>
                          {event.venue.split(',')[0]}
                        </td>
                        <td className="p-4 text-text-secondary">
                          <Link to={`/users/${event.organizer_id}`} className="hover:text-primary font-semibold transition-colors">
                            {event.organizer_name || 'Amelia Patel'}
                          </Link>
                        </td>
                        <td className="p-4 pr-6 text-right space-x-1.5 whitespace-nowrap">
                          <Link
                            to={`/events/${event.id}/attendees`}
                            title="View Attendees Roster"
                            className="inline-flex items-center justify-center p-2 rounded-lg border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                          >
                            <Users className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/events/${event.id}/edit`}
                            title="Edit Event"
                            className="inline-flex items-center justify-center p-2 rounded-lg border border-white/5 text-text-secondary hover:text-white hover:bg-white/5 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(event.id)}
                            title="Delete Event"
                            className="inline-flex items-center justify-center p-2 rounded-lg border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

    </div>
  );
};
