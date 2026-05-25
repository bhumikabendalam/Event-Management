import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventService } from '../services/api';
import type { Event } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { toast } from '../components/Toast';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { ArrowLeft, Landmark, Calendar, MapPin, Clock, Image as ImageIcon, AlignLeft, ShieldAlert, Upload, Trash2, ChevronDown, Check } from 'lucide-react';

const CATEGORIES = ['Technology', 'Music', 'Food', 'Art', 'Business', 'Design'];

const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

const CustomDatePicker: React.FC<{
  value: string;
  onChange: (val: string) => void;
}> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const today = new Date();
  const initialDate = value ? new Date(value + 'T00:00:00') : today;
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const mm = String(currentMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    onChange(`${currentYear}-${mm}-${dd}`);
    setIsOpen(false);
  };

  const getDisplayValue = () => {
    if (!value) return "Select date...";
    try {
      const d = new Date(value + 'T00:00:00');
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return value;
    }
  };

  const dayCells = [];
  for (let i = 0; i < firstDay; i++) {
    dayCells.push(<div key={`empty-${i}`} className="w-8 h-8" />);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const isSelected = value === dateStr;
    const isToday = today.getDate() === d && today.getMonth() === currentMonth && today.getFullYear() === currentYear;
    
    dayCells.push(
      <button
        key={`day-${d}`}
        type="button"
        onClick={() => handleSelectDay(d)}
        className={`w-8 h-8 text-xs rounded-lg transition-colors flex items-center justify-center cursor-pointer ${
          isSelected
            ? 'bg-indigo-600 text-white font-bold'
            : isToday
            ? 'border border-indigo-500 text-indigo-400 font-semibold hover:bg-indigo-500/10'
            : 'text-text-primary hover:bg-white/5 hover:text-white'
        }`}
      >
        {d}
      </button>
    );
  }

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className="w-full px-4 py-3 bg-slate-950 border border-white/5 rounded-xl text-text-primary text-sm focus:border-primary outline-none transition-all duration-300 text-left flex items-center justify-between cursor-pointer"
      >
        <span>{getDisplayValue()}</span>
        <Calendar className="w-4 h-4 text-indigo-400" />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-[100] mt-2 bg-slate-950 border border-white/10 rounded-2xl p-4 shadow-2xl backdrop-blur-xl w-72 select-none animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-xs text-text-secondary hover:text-white cursor-pointer"
            >
              &lt;
            </button>
            <span className="text-sm font-bold text-white">
              {monthNames[currentMonth]} {currentYear}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-xs text-text-secondary hover:text-white cursor-pointer"
            >
              &gt;
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(day => (
              <div key={day} className="text-[10px] font-bold text-text-secondary uppercase">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 justify-items-center">
            {dayCells}
          </div>
        </div>
      )}
    </div>
  );
};

const CustomCategorySelect: React.FC<{
  value: string;
  onChange: (val: string) => void;
  categories: string[];
}> = ({ value, onChange, categories }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className="w-full px-4 py-3 bg-slate-950 border border-white/5 rounded-xl text-text-primary text-sm focus:border-primary outline-none transition-all duration-300 text-left flex items-center justify-between cursor-pointer"
      >
        <span>{value}</span>
        <ChevronDown className={`w-4 h-4 text-indigo-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-[100] mt-2 bg-slate-950 border border-white/10 rounded-2xl py-1 shadow-2xl backdrop-blur-xl w-full max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                onChange(cat);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2.5 text-left text-sm transition-all duration-200 flex items-center justify-between cursor-pointer ${
                value === cat
                  ? 'bg-indigo-600/20 text-indigo-400 font-bold border-l-2 border-indigo-500'
                  : 'text-text-secondary hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{cat}</span>
              {value === cat && <Check className="w-4 h-4 text-indigo-400" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const ManageEvent: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuthStore();
  const eventId = id ? Number(id) : null;
  const isEditMode = !!eventId;

  // Local Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Technology');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [days, setDays] = useState(1);
  const [endTime, setEndTime] = useState('');
  const [venue, setVenue] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [imageTab, setImageTab] = useState<'upload' | 'url'>('upload');
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be under 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      setImage(base64Url);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImage('');
  };

  // Fetch event details if in Edit Mode
  const { data: event, isLoading, isError } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => eventService.getEventById(eventId!),
    enabled: isEditMode && !isNaN(eventId!),
  });

  // Load existing details into inputs
  useEffect(() => {
    if (isEditMode && event) {
      setTitle(event.title || '');
      setCategory(event.category || 'Technology');
      // Format YYYY-MM-DD
      try {
        const d = new Date(event.event_date);
        const formattedDate = d.toISOString().split('T')[0];
        setEventDate(formattedDate);
      } catch (e) {
        setEventDate(event.event_date || '');
      }
      // Format HH:MM
      setEventTime(event.event_time ? event.event_time.slice(0, 5) : '');

      // Calculate days duration from dates
      if (event.event_date && event.end_date) {
        try {
          const d1 = new Date(event.event_date.split('T')[0] + 'T00:00:00');
          const d2 = new Date(event.end_date.split('T')[0] + 'T00:00:00');
          const diffTime = d2.getTime() - d1.getTime();
          const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
          setDays(diffDays > 0 ? diffDays : 1);
        } catch (e) {
          setDays(1);
        }
      } else {
        setDays(1);
      }

      setEndTime(event.end_time ? event.end_time.slice(0, 5) : '');
      setVenue(event.venue || '');
      setDescription(event.description || '');
      setImage(event.image || '');
      if (event.image) {
        if (event.image.startsWith('data:image/')) {
          setImageTab('upload');
        } else {
          setImageTab('url');
        }
      }
    }
  }, [isEditMode, event]);

  // Mutation to create event
  const createMutation = useMutation({
    mutationFn: (payload: Partial<Event>) => eventService.createEvent(payload),
    onSuccess: (res) => {
      if (res.success && res.data) {
        toast.success('Event created successfully!');
        queryClient.invalidateQueries({ queryKey: ['events'] });
        queryClient.invalidateQueries({ queryKey: ['organizerMetrics'] });
        queryClient.invalidateQueries({ queryKey: ['adminMetrics'] });
        navigate(`/events/${res.data.id}`);
      } else {
        toast.error(res.error || 'Failed to create event');
      }
    },
    onError: () => {
      toast.error('An error occurred during event creation.');
    },
  });

  // Mutation to update event
  const updateMutation = useMutation({
    mutationFn: (payload: Partial<Event>) => eventService.updateEvent(eventId!, payload),
    onSuccess: (res) => {
      if (res.success && res.data) {
        toast.success('Event updated successfully!');
        queryClient.invalidateQueries({ queryKey: ['events'] });
        queryClient.invalidateQueries({ queryKey: ['event', eventId] });
        queryClient.invalidateQueries({ queryKey: ['organizerMetrics'] });
        queryClient.invalidateQueries({ queryKey: ['adminMetrics'] });
        navigate(`/events/${eventId}`);
      } else {
        toast.error(res.error || 'Failed to update event');
      }
    },
    onError: () => {
      toast.error('An error occurred during event update.');
    },
  });

  const getCalculatedEndDate = (startDateStr: string, numDays: number): string => {
    if (!startDateStr) return '';
    try {
      const date = new Date(startDateStr + 'T00:00:00');
      date.setDate(date.getDate() + (numDays - 1));
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      return `${date.getFullYear()}-${mm}-${dd}`;
    } catch {
      return startDateStr;
    }
  };

  const getCalculatedEndDateDisplay = () => {
    const end = getCalculatedEndDate(eventDate, days);
    if (!end) return 'Select Event Date...';
    try {
      const d = new Date(end + 'T00:00:00');
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return end;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !eventDate || !eventTime || !endTime || !venue || !description || !image) {
      toast.error('Please enter all event parameters.');
      return;
    }

    const calculatedEndDate = getCalculatedEndDate(eventDate, days);

    const payload: Partial<Event> = {
      title,
      category,
      event_date: eventDate,
      event_time: eventTime,
      end_date: calculatedEndDate,
      end_time: endTime,
      venue,
      description,
      image,
      status: 'Active',
    };

    if (isEditMode) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  // Authorization guards
  const isAuthorized = isAuthenticated && user && (user.role === 'Admin' || user.role === 'Organizer');
  const isOwner = isEditMode && event && user && (event.organizer_id === user.id || user.role === 'Admin');

  if (!isAuthorized) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center space-y-4">
        <ShieldAlert className="w-16 h-16 text-rose-400 mx-auto" />
        <h2 className="text-2xl font-bold text-white">Access Denied</h2>
        <p className="text-text-secondary max-w-sm mx-auto">
          You must be logged in as an Organizer or Admin to manage events.
        </p>
        <Link to="/auth/login" className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg inline-block">
          Login
        </Link>
      </div>
    );
  }

  if (isEditMode && isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 pt-28">
        <SkeletonLoader type="profile" />
      </div>
    );
  }

  if (isEditMode && (isError || !event || !isOwner)) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center space-y-4">
        <ShieldAlert className="w-16 h-16 text-rose-400 mx-auto" />
        <h2 className="text-2xl font-bold text-white">Unauthorized Action</h2>
        <p className="text-text-secondary max-w-md mx-auto">
          You are not permitted to edit events hosted by other accounts.
        </p>
        <button onClick={() => navigate(-1)} className="px-6 py-2.5 bg-slate-800 text-white font-semibold rounded-lg">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 pt-28 space-y-8">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-text-secondary hover:text-white transition-colors duration-300 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </button>
      </div>

      <div className="glass-panel p-8 border border-white/5 rounded-3xl shadow-xl bg-slate-900/10">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <h2 className="text-xl sm:text-2xl font-bold font-heading text-white border-b border-white/5 pb-4">
            {isEditMode ? 'Edit Gathering Details' : 'Orchestrate New Gathering'}
          </h2>

          {/* Event Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
              <Landmark className="w-3.5 h-3.5 text-indigo-400" />
              Event Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Symphony Acoustic Terrace Session"
              className="w-full px-4 py-3 bg-slate-950 border border-white/5 rounded-xl text-text-primary text-sm focus:border-primary outline-none transition-all duration-300"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Category selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Category</label>
              <CustomCategorySelect
                value={category}
                onChange={setCategory}
                categories={CATEGORIES}
              />
            </div>
          </div>

          {/* Banner Image Section */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
              Event Banner Image
            </label>

            <div className="border border-white/5 rounded-2xl bg-slate-950/50 p-4 space-y-4">
              {/* Tab headers */}
              <div className="flex gap-2 border-b border-white/5 pb-2">
                <button
                  type="button"
                  onClick={() => setImageTab('upload')}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-300 cursor-pointer ${
                    imageTab === 'upload'
                      ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                      : 'text-text-secondary hover:text-white'
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setImageTab('url')}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-300 cursor-pointer ${
                    imageTab === 'url'
                      ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                      : 'text-text-secondary hover:text-white'
                  }`}
                >
                  Web Image URL
                </button>
              </div>

              {/* Tab 1: Upload */}
              {imageTab === 'upload' && (
                <div className="space-y-4">
                  {!image ? (
                    <div
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
                        dragActive
                          ? 'border-indigo-500 bg-indigo-500/10'
                          : 'border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/5'
                      }`}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <Upload className="w-10 h-10 text-indigo-400 mx-auto mb-3" />
                      <p className="text-sm text-text-primary font-medium">
                        Drag & drop your banner image here, or <span className="text-indigo-400 font-bold underline">browse</span>
                      </p>
                      <p className="text-xs text-text-muted mt-1">Supports JPG, PNG, GIF up to 2MB</p>
                    </div>
                  ) : (
                    <div className="relative group rounded-xl overflow-hidden border border-white/5">
                      <img
                        src={image}
                        alt="Event Banner Preview"
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="p-3 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow-lg transition-transform duration-300 transform hover:scale-110 cursor-pointer"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: URL */}
              {imageTab === 'url' && (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      placeholder="Paste absolute Unsplash or web image address..."
                      className="w-full px-4 py-3 bg-slate-950 border border-white/5 rounded-xl text-text-primary text-sm focus:border-primary outline-none transition-all duration-300"
                    />
                    {image && (
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="px-4 py-3 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-400 rounded-xl transition-all duration-300 cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  {image && (
                    <div className="relative rounded-xl overflow-hidden border border-white/5">
                      <img
                        src={image}
                        alt="URL Preview"
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23f43f5e"><rect width="100%" height="100%" fill="%23111827"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="1">Invalid Image URL</text></svg>';
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {/* Row 1: Event Date, Days (Duration), End Date (Fixed) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Start Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  Event Date (Start)
                </label>
                <CustomDatePicker
                  value={eventDate}
                  onChange={setEventDate}
                />
              </div>

              {/* Days duration input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  Duration (Days)
                </label>
                <div className="flex items-center bg-slate-950 border border-white/5 rounded-xl overflow-hidden h-[46px] w-full">
                  <button
                    type="button"
                    onClick={() => setDays(Math.max(1, days - 1))}
                    className="px-4 h-full text-text-secondary hover:text-white hover:bg-white/5 transition-all text-lg font-bold border-r border-white/5 cursor-pointer select-none"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={1}
                    value={days}
                    onChange={(e) => setDays(Math.max(1, Number(e.target.value)))}
                    className="w-full text-center bg-transparent text-text-primary text-sm focus:outline-none outline-none border-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setDays(days + 1)}
                    className="px-4 h-full text-text-secondary hover:text-white hover:bg-white/5 transition-all text-lg font-bold border-l border-white/5 cursor-pointer select-none"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* End Date display (Fixed) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500/50" />
                  End Date (Calculated)
                </label>
                <input
                  type="text"
                  value={getCalculatedEndDateDisplay()}
                  disabled
                  className="w-full px-4 py-3 bg-slate-905 border border-white/5 rounded-xl text-text-muted text-sm outline-none cursor-not-allowed select-none opacity-80"
                />
              </div>
            </div>

            {/* Row 2: Start Time, End Time, Venue Location */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Start Time */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  Start Time
                </label>
                <input
                  type="time"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-white/5 rounded-xl text-text-primary text-sm focus:border-primary outline-none transition-all duration-300"
                  required
                />
              </div>

              {/* End Time (Manual) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  End Time
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-white/5 rounded-xl text-text-primary text-sm focus:border-primary outline-none transition-all duration-300"
                  required
                />
              </div>

              {/* Venue Location */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                  Venue Location
                </label>
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="e.g. Symphony Hall, Bangalore"
                  className="w-full px-4 py-3 bg-slate-950 border border-white/5 rounded-xl text-text-primary text-sm focus:border-primary outline-none transition-all duration-300"
                  required
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
              <AlignLeft className="w-3.5 h-3.5 text-indigo-400" />
              Detailed Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              placeholder="What should guests expect? Outline agendas, guest speakers, dress codes, or general guidelines..."
              className="w-full px-4 py-3 bg-slate-950 border border-white/5 rounded-xl text-text-primary text-sm focus:border-primary outline-none transition-all duration-300 resize-none"
              required
            />
          </div>

          {/* Submits */}
          <div className="pt-4 border-t border-white/5 flex justify-end">
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="px-8 py-4 bg-gradient-primary hover:scale-[1.02] text-white font-bold rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center cursor-pointer disabled:opacity-50"
            >
              {createMutation.isPending || updateMutation.isPending
                ? 'Processing details...'
                : isEditMode
                ? 'Save Event Updates'
                : 'Create and Orchestrate Event'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
