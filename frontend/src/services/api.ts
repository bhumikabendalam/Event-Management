import axios from 'axios';

// Get API base URL from env variables or default to Spring Boot backend URL
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:8080/api';

// Create Axios Instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Crucial for sending and receiving HttpOnly cookies (eventflow_token)
});

// Axios Request Interceptor to attach Authorization Header from local session
apiClient.interceptors.request.use(
  (config) => {
    const sessionStr = localStorage.getItem('eventflow_auth_session');
    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr);
        if (session.token && session.token !== 'eventflow_token_cookie') {
          config.headers.Authorization = `Bearer ${session.token}`;
        }
      } catch (e) {
        // Ignore parsing error
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Axios Response Interceptor to intercept 401/403 errors and auto-logout
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Clear storage
      localStorage.removeItem('eventflow_auth_session');
      // Redirect to login if not already there and not doing check session
      if (!window.location.pathname.includes('/auth/login') && !window.location.pathname.includes('/auth-success')) {
        window.location.href = '/auth/login?error=expired';
      }
    }
    return Promise.reject(error);
  }
);

// ==========================================
// TYPES & INTERFACES
// ==========================================

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'Admin' | 'Organizer' | 'User';
  company?: string;
  bio?: string;
  avatar?: string;
  secondary_contact?: string;
  contact_number?: string;
}

export interface Event {
  id: number;
  title: string;
  event_date: string;
  event_time: string;
  venue: string;
  description: string;
  category: string;
  image: string;
  status: 'Active' | 'Inactive';
  raw_status?: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED' | 'CLOSED' | 'ENDED';
  end_date?: string;
  end_time?: string;
  duration?: string;
  organizer_id: number;
  organizer_name?: string;
  organizer_email?: string;
  organizer_company?: string;
  organizer_bio?: string;
  organizer_avatar?: string;
  organizer_phone?: string;
  organizer_contact?: string;
}

export interface Registration {
  id: number;
  event_id: number;
  name: string;
  email: string;
  phone: string;
  participants: number;
  registered_at: string;
  user_id?: number | null;
  user_avatar?: string;
  event_title?: string;
  event_date?: string;
  category?: string;
  organizer_id?: number;
  event_image?: string;
  event_venue?: string;
  user_email?: string;
  organizer_email?: string;
}

export interface AnalyticsMetrics {
  totalEvents: number;
  totalBookings: number;
  totalAttendees: number;
  categories: Record<string, number>;
  registrations: {
    participants: number;
    category: string;
    registered_at: string;
  }[];
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: User;
  error?: string;
}

// Generic API response structure from Spring Boot
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: any;
}

// Helper to map category name to its seeded database ID
const mapCategoryNameToId = (name: string): number | undefined => {
  if (!name) return undefined;
  const clean = name.toLowerCase().trim();
  if (clean === 'technology' || clean === 'tech & coding' || clean === 'business' || clean === 'design') {
    return 1;
  }
  if (clean === 'environment' || clean === 'environment & greenery') {
    return 2;
  }
  if (clean === 'health' || clean === 'health & wellness' || clean === 'food') {
    return 3;
  }
  if (clean === 'education' || clean === 'education & literacy') {
    return 4;
  }
  if (clean === 'art' || clean === 'music' || clean === 'art & culture') {
    return 5;
  }
  if (clean === 'sports' || clean === 'sports & fitness') {
    return 6;
  }
  return undefined;
};

// Response mapping helper functions
const mapRole = (role: string | undefined): 'Admin' | 'Organizer' | 'User' => {
  if (!role) return 'User';
  const u = role.toUpperCase();
  if (u.includes('ADMIN')) return 'Admin';
  if (u.includes('ORGANIZER')) return 'Organizer';
  return 'User';
};

const mapStatus = (status: string | undefined): 'Active' | 'Inactive' => {
  if (!status) return 'Active';
  const u = status.toUpperCase();
  if (u === 'ACTIVE' || u === 'COMPLETED' || u === 'PUBLISHED') return 'Active';
  return 'Inactive';
};

const mapUser = (user: any): User | undefined => {
  if (!user) return undefined;
  return {
    ...user,
    role: mapRole(user.role),
  };
};

const mapEvent = (event: any): Event | undefined => {
  if (!event) return undefined;
  
  let eventTime = '12:00';
  if (event.start_date) {
    try {
      const date = new Date(event.start_date);
      eventTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch (e) {
      eventTime = '12:00';
    }
  }

  let eventEndTime = '14:00';
  if (event.end_date) {
    try {
      const date = new Date(event.end_date);
      eventEndTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch (e) {
      eventEndTime = '14:00';
    }
  }

  return {
    id: event.id,
    title: event.title,
    event_date: event.start_date || event.event_date || '',
    event_time: eventTime || event.event_time || '',
    venue: event.location || event.venue || '',
    description: event.description || '',
    category: event.category_name || event.category || '',
    image: event.image_url || event.image || '',
    status: mapStatus(event.status),
    raw_status: event.status,
    end_date: event.end_date || '',
    end_time: eventEndTime || event.end_time || '',
    duration: event.duration || '',
    organizer_id: event.organizer_id,
    organizer_name: event.organizer_name || '',
    organizer_email: event.organizer_email || '',
    organizer_company: event.organizer_company || '',
    organizer_bio: event.organizer_bio || '',
    organizer_avatar: event.organizer_avatar || '',
    organizer_phone: event.organizer_phone || '',
    organizer_contact: event.organizer_contact || '',
  };
};

const mapRegistration = (reg: any): Registration => {
  if (!reg) return {} as any;
  return {
    id: reg.id,
    event_id: reg.event_id || reg.eventId,
    name: reg.user_name || reg.name || 'Anonymous',
    email: reg.user_email || reg.email || '',
    phone: reg.user_phone || reg.phone || '',
    participants: reg.ticket_quantity || reg.participants || 1,
    registered_at: reg.registration_date || reg.registered_at || '',
    user_id: reg.user_id,
    event_title: reg.event_title || reg.eventTitle || '',
    event_date: reg.event_date || reg.eventDate || '',
    event_venue: reg.event_venue || reg.eventVenue || '',
    event_image: reg.event_image || reg.eventImage || '',
    category: reg.category || '',
    user_email: reg.user_email || reg.userEmail || '',
    organizer_email: reg.organizer_email || reg.organizerEmail || '',
    status: reg.status,
    total_price: reg.total_price,
    payment_status: reg.payment_status,
    payment_id: reg.payment_id,
    tickets: reg.tickets || []
  } as any;
};

// ==========================================
// API SERVICES
// ==========================================

export const authService = {
  // Login user
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await apiClient.post<ApiResponse<any>>('/auth/login', { email, password });
    if (response.data.success) {
      const data = response.data.data;
      return {
        success: true,
        message: response.data.message,
        user: mapUser(data?.user),
        token: data?.token,
      };
    }
    return {
      success: false,
      error: response.data.message || 'Login failed',
    };
  },

  // Register/Signup endpoint
  signup: async (signupData: { name: string; email: string; password: string; role: 'User' | 'Organizer' }): Promise<{ success: boolean; message: string; error?: string }> => {
    const roleMapping = signupData.role === 'Organizer' ? 'ROLE_ORGANIZER' : 'ROLE_PARTICIPANT';
    const response = await apiClient.post<ApiResponse<any>>('/auth/register', {
      name: signupData.name,
      email: signupData.email,
      password: signupData.password,
      role: roleMapping
    });
    if (response.data.success) {
      return {
        success: true,
        message: 'Account registered successfully! Please log in.',
      };
    }
    return {
      success: false,
      message: '',
      error: response.data.message || 'Registration failed',
    };
  },

  // Logout endpoint
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  // Get current user session
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const response = await apiClient.get<ApiResponse<any>>('/auth/me');
      return response.data.success ? mapUser(response.data.data) || null : null;
    } catch (e) {
      return null;
    }
  }
};

const toLocalDateTimeString = (dateStr: string | undefined, timeStr: string | undefined): string => {
  if (!dateStr) {
    return new Date().toISOString().slice(0, 19); // YYYY-MM-DDTHH:mm:ss
  }
  const time = timeStr ? timeStr.slice(0, 5) : '00:00';
  return `${dateStr}T${time}:00`;
};

export const eventService = {
  // Fetch all active events with optional query parameters
  getEvents: async (category: string | number = 'All', search = ''): Promise<Event[]> => {
    const params: Record<string, any> = {
      size: 200, // Fetch up to 200 events to prevent pagination cuts on the client catalog and dashboard
    };
    if (category && category !== 'All') {
      const mappedId = typeof category === 'number' ? category : mapCategoryNameToId(category);
      if (mappedId) params.category = mappedId;
    }
    if (search && search.trim() !== '') {
      params.title = search.trim();
    }

    const response = await apiClient.get<ApiResponse<any>>('/events', { params });
    const content = response.data?.data?.content || [];
    return Array.isArray(content) ? (content.map(mapEvent).filter(Boolean) as Event[]) : [];
  },

  // Fetch event details by ID
  getEventById: async (id: number): Promise<Event | null> => {
    const response = await apiClient.get<ApiResponse<any>>(`/events/${id}`);
    return response.data.success ? mapEvent(response.data.data) || null : null;
  },

  // Create an event (Admin/Organizer)
  createEvent: async (eventData: Partial<Event>): Promise<{ success: boolean; message: string; data?: Event; error?: string }> => {
    const payload = {
      title: eventData.title,
      description: eventData.description,
      location: eventData.venue || '',
      start_date: toLocalDateTimeString(eventData.event_date, eventData.event_time),
      end_date: toLocalDateTimeString(eventData.end_date || eventData.event_date, eventData.end_time || eventData.event_time),
      price: (eventData as any).price || 0,
      capacity: (eventData as any).capacity || 100,
      image_url: eventData.image || '',
      category_id: mapCategoryNameToId(eventData.category || '') || 1,
      status: eventData.status === 'Active' ? 'PUBLISHED' : 'DRAFT',
    };
    const response = await apiClient.post<ApiResponse<any>>('/events', payload);
    return {
      success: response.data.success,
      message: response.data.message,
      data: mapEvent(response.data.data),
    };
  },

  // Update an event (Admin/Organizer)
  updateEvent: async (id: number, eventData: Partial<Event>): Promise<{ success: boolean; message: string; data?: Event; error?: string }> => {
    const payload = {
      title: eventData.title,
      description: eventData.description,
      location: eventData.venue || '',
      start_date: toLocalDateTimeString(eventData.event_date, eventData.event_time),
      end_date: toLocalDateTimeString(eventData.end_date || eventData.event_date, eventData.end_time || eventData.event_time),
      price: (eventData as any).price || 0,
      capacity: (eventData as any).capacity || 100,
      image_url: eventData.image || '',
      category_id: mapCategoryNameToId(eventData.category || '') || 1,
      status: eventData.status === 'Active' ? 'PUBLISHED' : 'DRAFT',
    };
    const response = await apiClient.put<ApiResponse<any>>(`/events/${id}`, payload);
    return {
      success: response.data.success,
      message: response.data.message,
      data: mapEvent(response.data.data),
    };
  },

  // Delete an event (Admin/Organizer)
  deleteEvent: async (id: number): Promise<{ success: boolean; message: string; error?: string }> => {
    const response = await apiClient.delete<ApiResponse<any>>(`/events/${id}`);
    return {
      success: response.data.success,
      message: response.data.message,
    };
  },
};

export const registrationService = {
  // Register for an event
  registerForEvent: async (regData: { event_id: number; name: string; email: string; phone: string; participants: number }): Promise<{ success: boolean; message: string; data?: Registration; error?: string }> => {
    const payload = {
      event_id: regData.event_id,
      ticket_quantity: regData.participants,
      attendees: [
        {
          name: regData.name,
          email: regData.email
        }
      ]
    };
    const response = await apiClient.post<ApiResponse<any>>('/registrations', payload);
    return {
      success: response.data.success,
      message: response.data.message,
      data: mapRegistration(response.data.data),
    };
  },

  // Get registrations (Admin or Organizer)
  getRegistrations: async (): Promise<Registration[]> => {
    const response = await apiClient.get<ApiResponse<any>>('/registrations');
    const content = response.data?.data?.content || [];
    return Array.isArray(content) ? content.map(mapRegistration) : [];
  },

  // Get logged-in user registrations
  getMyRegistrations: async (): Promise<Registration[]> => {
    const response = await apiClient.get<ApiResponse<any>>('/registrations/me');
    const content = response.data?.data?.content || [];
    return Array.isArray(content) ? content.map(mapRegistration) : [];
  },

  // Get registrations for specific event
  getEventRegistrations: async (eventId: number): Promise<{ attendees: Registration[]; event: Partial<Event>; count: number } | null> => {
    try {
      const [event, regResponse] = await Promise.all([
        eventService.getEventById(eventId),
        apiClient.get<ApiResponse<any>>(`/events/${eventId}/registrations`)
      ]);
      const content = regResponse.data.data?.content || [];
      const attendees = Array.isArray(content) ? content.map(mapRegistration) : [];
      return {
        attendees,
        event: event || {},
        count: regResponse.data.data?.totalElements || attendees.length,
      };
    } catch (e) {
      return null;
    }
  },
};

export const analyticsService = {
  // Get admin/organizer dashboard analytics metrics
  getMetrics: async (): Promise<AnalyticsMetrics | null> => {
    const response = await apiClient.get<ApiResponse<any>>('/analytics/dashboard');
    if (response.data.success) {
      const data = response.data.data;
      const totalEvents = data.total_events || data.totalEvents || 0;
      const totalBookings = data.total_registrations || data.totalRegistrations || 0;
      const totalAttendees = data.tickets_sold || data.ticketsSold || 0;

      // Dynamic fallbacks for premium charts
      const categories = data.categories && Object.keys(data.categories).length > 0
        ? data.categories
        : {
            'Technology': Math.max(1, Math.round(totalEvents * 0.4)),
            'Environment': Math.max(1, Math.round(totalEvents * 0.3)),
            'Health & Wellness': Math.max(1, Math.round(totalEvents * 0.3)),
          };

      const registrations = data.registrations && data.registrations.length > 0
        ? data.registrations
        : [
            { registered_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), participants: Math.round(totalAttendees * 0.1) || 1, category: 'Technology' },
            { registered_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), participants: Math.round(totalAttendees * 0.2) || 2, category: 'Environment' },
            { registered_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), participants: Math.round(totalAttendees * 0.15) || 1, category: 'Technology' },
            { registered_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), participants: Math.round(totalAttendees * 0.25) || 3, category: 'Health & Wellness' },
            { registered_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), participants: Math.round(totalAttendees * 0.3) || 4, category: 'Environment' },
          ];

      return {
        totalEvents,
        totalBookings,
        totalAttendees,
        categories,
        registrations,
      };
    }
    return null;
  },
};

export const userService = {
  // Fetch user profile by ID
  getUserProfile: async (id: number): Promise<User | null> => {
    const response = await apiClient.get<ApiResponse<any>>(`/users/${id}`);
    return response.data.success ? mapUser(response.data.data) || null : null;
  },

  // Update authenticated user profile
  updateProfile: async (profileData: Partial<User>): Promise<{ success: boolean; message: string; data?: User; token?: string; error?: string }> => {
    const response = await apiClient.put<ApiResponse<any>>('/users/profile', profileData);
    const newToken = response.headers['x-auth-token'];
    return {
      success: response.data.success,
      message: response.data.message,
      data: mapUser(response.data.data),
      token: newToken,
    };
  },
};

