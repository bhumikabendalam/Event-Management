import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';

// Component Imports
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Toaster } from './components/Toast';
import { useAuthStore } from './store/authStore';
import { GithubEmailPromptModal } from './components/GithubEmailPromptModal';

// Page Imports
import { Landing } from './pages/Landing';
import { Events } from './pages/Events';
import { EventDetail } from './pages/EventDetail';
import { Dashboard } from './pages/Dashboard';
import { OrganizerDashboard } from './pages/OrganizerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { EventAttendees } from './pages/EventAttendees';
import { UserProfile } from './pages/UserProfile';
import { PublicProfile } from './pages/PublicProfile';
import { Login } from './pages/Login';
import { RegisterAccount } from './pages/RegisterAccount';
import { AuthSuccess } from './pages/AuthSuccess';
import { EventBooking } from './pages/EventBooking';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { ManageEvent } from './pages/ManageEvent';
import { TicketView } from './pages/TicketView';
import { Notifications } from './pages/Notifications';
import { Settings } from './pages/Settings';

// Create React Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Page transition animator container wrapper
const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="min-h-[80vh]"
    >
      {children}
    </motion.div>
  );
};

// Animated Route Layout switcher
const AnimatedRoutes: React.FC = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public routes */}
        <Route path="/" element={<PageWrapper><Landing /></PageWrapper>} />
        <Route path="/events" element={<PageWrapper><Events /></PageWrapper>} />
        <Route path="/events/:id" element={<PageWrapper><EventDetail /></PageWrapper>} />
        <Route path="/about" element={<PageWrapper><About /></PageWrapper>} />
        <Route path="/contact" element={<PageWrapper><Contact /></PageWrapper>} />
        <Route path="/auth/login" element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/auth/register" element={<PageWrapper><RegisterAccount /></PageWrapper>} />
        <Route path="/auth-success" element={<PageWrapper><AuthSuccess /></PageWrapper>} />

        {/* Authenticated user routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['User', 'Organizer']}>
              <PageWrapper><Dashboard /></PageWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <PageWrapper><UserProfile /></PageWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/:id"
          element={
            <ProtectedRoute>
              <PageWrapper><PublicProfile /></PageWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/events/:id/book"
          element={
            <ProtectedRoute allowedRoles={['User', 'Organizer']}>
              <PageWrapper><EventBooking /></PageWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tickets/:id"
          element={
            <ProtectedRoute>
              <PageWrapper><TicketView /></PageWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <PageWrapper><Notifications /></PageWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <PageWrapper><Settings /></PageWrapper>
            </ProtectedRoute>
          }
        />

        {/* Organizer / Admin routes */}
        <Route
          path="/organizer"
          element={
            <ProtectedRoute allowedRoles={['Organizer']}>
              <PageWrapper><OrganizerDashboard /></PageWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <PageWrapper><AdminDashboard /></PageWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/events/new"
          element={
            <ProtectedRoute allowedRoles={['Admin', 'Organizer']}>
              <PageWrapper><ManageEvent /></PageWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/events/:id/edit"
          element={
            <ProtectedRoute allowedRoles={['Admin', 'Organizer']}>
              <PageWrapper><ManageEvent /></PageWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/events/:id/attendees"
          element={
            <ProtectedRoute allowedRoles={['Admin', 'Organizer']}>
              <PageWrapper><EventAttendees /></PageWrapper>
            </ProtectedRoute>
          }
        />

        {/* Wildcard redirects back home */}
        <Route path="*" element={<PageWrapper><Landing /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
};

// ScrollToTop component to reset viewport scroll position on route changes
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  return null;
};

function App() {
  const { initializeAuth } = useAuthStore();

  React.useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ScrollToTop />
        <div className="flex flex-col min-h-screen bg-bg-primary text-text-primary overflow-x-hidden selection:bg-indigo-500 selection:text-white">
          <Navbar />
          <main className="flex-grow">
            <AnimatedRoutes />
          </main>
          <Footer />
          <Toaster />
          <GithubEmailPromptModal />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
