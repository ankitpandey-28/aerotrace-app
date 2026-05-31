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
import DashboardPage from './pages/DashboardPage';
import StartJourneyPage from './pages/StartJourneyPage';
import LiveJourneyPage from './pages/LiveJourneyPage';
import JourneySummaryPage from './pages/JourneySummaryPage';
import JourneyDetailsPage from './pages/JourneyDetailsPage';
import MemoriesPage from './pages/MemoriesPage';
import DiscoverPage from './pages/DiscoverPage';
import LifeMapPage from './pages/LifeMapPage';
import SafetyCenterPage from './pages/SafetyCenterPage';
import ProfilePage from './pages/ProfilePage';

// Framer Motion spring and easing curves (70% Apple, 10% Futuristic Magic)
const pageVariants = {
  initial: { opacity: 0, y: 16, filter: 'blur(8px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -10, filter: 'blur(6px)' },
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
        {isPublicPage ? (
          activeContent
        ) : (
          <AppShell>
            {activeContent}
          </AppShell>
        )}
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