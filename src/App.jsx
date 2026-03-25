import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingScreen from './components/LoadingScreen';
import RateLimitIndicator from './components/RateLimitIndicator';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Scan from './pages/Scan';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import About from './pages/About';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  const handleLoadComplete = () => {
    setIsLoading(false);
  };

  return (
    <AuthProvider>
      <Router>
        <AnimatePresence mode="wait">
          {isLoading ? (
            <LoadingScreen key="loading" onLoadComplete={handleLoadComplete} />
          ) : (
            <div key="app" className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 transition-colors flex flex-col">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/about" element={<About />} />
                  <Route
                    path="/scan"
                    element={
                      <ProtectedRoute>
                        <Scan />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <Footer />
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  className: 'dark:bg-black dark:text-white dark:border dark:border-gray-800',
                  style: {
                    background: '#fff',
                    color: '#1f2937',
                  },
                }}
              />
              <RateLimitIndicator />
            </div>
          )}
        </AnimatePresence>
      </Router>
    </AuthProvider>
  );
}

export default App;
