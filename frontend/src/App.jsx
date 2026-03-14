import { AnimatePresence, motion } from 'framer-motion';
import { Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ParticleBackground from './components/ParticleBackground';
import LandingPage from './pages/LandingPage';
import DetectionPage from './pages/DetectionPage';
import DashboardPage from './pages/DashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AboutPage from './pages/AboutPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import FeedPage from './pages/FeedPage';
import ProfilePage from './pages/ProfilePage';
import ChatPage from './pages/ChatPage';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import GuestRoute from './components/GuestRoute';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -12 },
};

function AnimatedPage({ children }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  const location = useLocation();

  return (
    <AuthProvider>
      <div className="min-h-screen text-slate-100 relative overflow-x-hidden bg-[#05060F]">
        <ParticleBackground />
        <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/"          element={<AnimatedPage><LandingPage /></AnimatedPage>} />
              <Route path="/login"     element={<GuestRoute><AnimatedPage><LoginPage /></AnimatedPage></GuestRoute>} />
              <Route path="/signup"    element={<GuestRoute><AnimatedPage><SignupPage /></AnimatedPage></GuestRoute>} />
              
              <Route path="/feed"      element={
                <ProtectedRoute>
                  <AnimatedPage><FeedPage /></AnimatedPage>
                </ProtectedRoute>
              } />
              <Route path="/profile"   element={
                <ProtectedRoute>
                  <AnimatedPage><ProfilePage /></AnimatedPage>
                </ProtectedRoute>
              } />
              <Route path="/chat"      element={
                <ProtectedRoute>
                  <AnimatedPage><ChatPage /></AnimatedPage>
                </ProtectedRoute>
              } />
              
              <Route path="/detect"    element={<AnimatedPage><DetectionPage /></AnimatedPage>} />
              <Route path="/about"     element={<AnimatedPage><AboutPage /></AnimatedPage>} />
              
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <AnimatedPage><DashboardPage /></AnimatedPage>
                </ProtectedRoute>
              } />

              <Route path="/admin" element={
                <AdminRoute>
                  <AnimatedPage><AdminDashboardPage /></AnimatedPage>
                </AdminRoute>
              } />
            </Routes>
          </AnimatePresence>
        </main>
        <Footer />
      </div>
    </div>
    </AuthProvider>
  );
}
