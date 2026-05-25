import { create } from 'zustand';
import { authService } from '../services/api';
import type { User, LoginResponse } from '../services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<LoginResponse>;
  signup: (signupData: { name: string; email: string; password: string; role: 'User' | 'Organizer' }) => Promise<{ success: boolean; message: string; error?: string }>;
  logout: () => void;
  updateUser: (updatedUser: User) => void;
  initializeAuth: (token?: string) => Promise<void>;
}

const getInitialSession = () => {
  try {
    const sessionStr = localStorage.getItem('eventflow_auth_session');
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      if (session.user) {
        // Retrieve locally stored extra fields for the user
        const extraStr = localStorage.getItem(`eventflow_extra_${session.user.id}`);
        const extraFields = extraStr ? JSON.parse(extraStr) : {};
        return {
          user: { ...session.user, ...extraFields },
          token: session.token || 'eventflow_token_cookie',
          isAuthenticated: true,
        };
      }
    }
  } catch (e) {
    // Ignore
  }
  return {
    user: null,
    token: null,
    isAuthenticated: false,
  };
};

const initialSession = getInitialSession();

export const useAuthStore = create<AuthState>((set) => ({

  user: initialSession.user,
  token: initialSession.token,
  isAuthenticated: initialSession.isAuthenticated,
  loading: false,

  login: async (email, password) => {
    set({ loading: true });
    try {
      const res = await authService.login(email, password);
      if (res.success && res.user) {
        // Merge with local extra fields if they exist
        const extraStr = localStorage.getItem(`eventflow_extra_${res.user.id}`);
        const extraFields = extraStr ? JSON.parse(extraStr) : {};
        const mergedUser = { ...res.user, ...extraFields };

        localStorage.setItem(
          'eventflow_auth_session',
          JSON.stringify({
            user: mergedUser,
            token: res.token,
          })
        );
        window.dispatchEvent(new CustomEvent('eventflow-auth-change'));
        
        set({
          user: mergedUser,
          token: res.token || 'eventflow_token_cookie',
          isAuthenticated: true,
          loading: false,
        });
        return res;
      } else {
        set({ loading: false });
        return res;
      }
    } catch (e) {
      set({ loading: false });
      return { success: false, error: 'Network error occurred.' };
    }
  },

  signup: async (signupData) => {
    return authService.signup(signupData);
  },

  logout: async () => {
    // 1. Instantly clear local credentials, session caches and update Zustand state optimistically
    localStorage.removeItem('eventflow_auth_session');
    set({ user: null, token: null, isAuthenticated: false });
    window.dispatchEvent(new CustomEvent('eventflow-auth-change'));

    // 2. Perform backend API cleanup asynchronously in the background without delaying UI transition
    try {
      await authService.logout();
    } catch (e) {
      console.error('Error logging out on backend', e);
    }
  },

  updateUser: (updatedUser) => {
    if (updatedUser && updatedUser.id) {
      try {
        const extraFields = {
          avatar: updatedUser.avatar || '',
          company: updatedUser.company || '',
          contact_number: updatedUser.contact_number || '',
          secondary_contact: updatedUser.secondary_contact || '',
          bio: updatedUser.bio || '',
        };
        localStorage.setItem(`eventflow_extra_${updatedUser.id}`, JSON.stringify(extraFields));
      } catch (e) {
        console.error('Error saving extra fields', e);
      }
    }

    const sessionStr = localStorage.getItem('eventflow_auth_session');
    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr);
        session.user = updatedUser;
        localStorage.setItem('eventflow_auth_session', JSON.stringify(session));
      } catch (e) {
        console.error('Error updating auth session cache', e);
      }
    }
    set({ user: updatedUser });
  },

  initializeAuth: async (token) => {
    set({ loading: true });

    if (token) {
      localStorage.setItem(
        'eventflow_auth_session',
        JSON.stringify({
          user: null,
          token: token,
        })
      );
      set({ token });
    }

    try {
      // Direct call to /api/auth/me using the HttpOnly cookie or Authorization header
      const user = await authService.getCurrentUser();
      if (user) {
        const sessionStr = localStorage.getItem('eventflow_auth_session');
        let currentToken = token;
        if (sessionStr) {
          try {
            const session = JSON.parse(sessionStr);
            currentToken = session.token || currentToken;
          } catch (e) {}
        }

        // Merge with local extra fields if they exist
        const extraStr = localStorage.getItem(`eventflow_extra_${user.id}`);
        const extraFields = extraStr ? JSON.parse(extraStr) : {};
        const mergedUser = { ...user, ...extraFields };

        localStorage.setItem(
          'eventflow_auth_session',
          JSON.stringify({
            user: mergedUser,
            token: currentToken || 'eventflow_token_cookie'
          })
        );

        set({
          user: mergedUser,
          token: currentToken || 'eventflow_token_cookie',
          isAuthenticated: true,
          loading: false
        });
      } else {
        localStorage.removeItem('eventflow_auth_session');
        set({ user: null, token: null, isAuthenticated: false, loading: false });
      }
    } catch (e) {
      localStorage.removeItem('eventflow_auth_session');
      set({ user: null, token: null, isAuthenticated: false, loading: false });
    }
  },
}));
