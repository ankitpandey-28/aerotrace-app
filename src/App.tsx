import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { NavigationProvider, useNavigation } from './context/NavigationContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { JourneyProvider } from './context/JourneyContext';
import { MemoryProvider } from './context/MemoryContext';

// Import Layouts
import AppShell from './components/layout/AppShell';

// Import Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import SafetyCenterPage from './pages/SafetyCenterPage';

// Lazy-loaded pages (route-level code-splitting)
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const StartJourneyPage = React.lazy(() => import('./pages/StartJourneyPage'));
const LiveJourneyPage = React.lazy(() => import('./pages/LiveJourneyPage'));
const JourneySummaryPage = React.lazy(() => import('./pages/JourneySummaryPage'));
const JourneyDetailsPage = React.lazy(() => import('./pages/JourneyDetailsPage'));
const MemoriesPage = React.lazy(() => import('./pages/MemoriesPage'));
const DiscoverPage = React.lazy(() => import('./pages/DiscoverPage'));
const LifeMapPage = React.lazy(() => import('./pages/LifeMapPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));

// Framer Motion spring and easing curves (70% Apple, 10% Futuristic Magic)
const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

const pageTransition = {
  type: 'spring',
  stiffness: 300,
  damping: 28,
};

function RootContent() {
  const { page, go } = useNavigation();
  const { isAuthenticated } = useAuth();

  // Protected routes - require authentication
  const protectedRoutes = [
    'dashboard',
    'start-journey',
    'live-journey',
    'journey-summary',
    'journey-details',
    'memories',
    'discover',
    'life-map',
    'profile',
  ];

  // Public routes - accessible without authentication
  const publicRoutes = ['landing', 'login', 'signup', 'safety'];

  // Check if current route is protected
  const isProtectedRoute = protectedRoutes.includes(page);
  const isPublicPage = publicRoutes.includes(page);

  // Redirect to landing if trying to access protected route without auth
  React.useEffect(() => {
    if (isProtectedRoute && !isAuthenticated) {
      go('landing');
    }
  }, [page, isAuthenticated, isProtectedRoute, go]);

  // Route mapping for Sprint 1
  const renderPageContent = () => {
    switch (page) {
      case 'landing':
        return <LandingPage />;
      case 'login':
        return <LoginPage />;
      case 'signup':
        return <SignupPage />;
      case 'dashboard':
        return <DashboardPage />;
      case 'start-journey':
        return <StartJourneyPage />;
      case 'live-journey':
        return <LiveJourneyPage />;
      case 'journey-summary':
        return <JourneySummaryPage />;
      case 'journey-details':
        return <JourneyDetailsPage />;
      case 'memories':
        return <MemoriesPage />;
      case 'discover':
        return <DiscoverPage />;
      case 'life-map':
        return <LifeMapPage />;
      case 'safety':
        return <SafetyCenterPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <LandingPage />;
    }
  };

  const activeContent = renderPageContent();

  // If on a protected route and not authenticated, don't render the content
  if (isProtectedRoute && !isAuthenticated) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={page}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={pageTransition}
        className="w-full min-h-screen bg-[#050505] text-white"
      >
        <React.Suspense fallback={<div className="p-6">Loading...</div>}>
          {isPublicPage ? (
            activeContent
          ) : (
            <AppShell>
              {activeContent}
            </AppShell>
          )}
        </React.Suspense>
      </motion.div>
    </AnimatePresence>
  );
}

export function App() {
  return (
    <NavigationProvider>
      <AuthProvider>
        <JourneyProvider>
          <MemoryProvider>
            <RootContent />
          </MemoryProvider>
        </JourneyProvider>
      </AuthProvider>
    </NavigationProvider>
  );
}

export default App;