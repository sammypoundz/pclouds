  // src/App.tsx
  // import React from 'react';
  import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
  import { ToastProvider, AuthProvider, Particles, Navbar, Footer, ScrollToTop, 
          HeroKlusters, ArchitectureKlusters, GlobalReachKlusters, KlustersModules,
          CodeScreenshotsKlusters, StartupBundleKlusters, CliPreviewKlusters,
          PartnersKlusters, TestimonialsKlusters, StatsKlusters, ProtectedRoute,
          GitHubCallback } from './shared';
  // import type { DisplayCurrency } from './shared'; // type-only import
  import DashboardRouter from './Dashboard';
  import SignInPage from './pages/SignInPage';
  import SignUpPage from './pages/SignUpPage';
  import ProfilePage from './pages/ProfilePage';
  import SettingsPage from './pages/SettingsPage';
  import Domains from './pages/Domains';
  import Hosting from './pages/Hosting';
  import ApiMarketplacePage from './pages/ApiMarketplace';
  import Library from './pages/Library';

  function App() {
    const location = useLocation();
    const isDashboard = location.pathname === '/dashboard';
    return (
      <ToastProvider>
        <AuthProvider>
          <div className="min-h-screen bg-gray-950 relative">
            <Particles />
            <div className="relative z-10">
              {!isDashboard && <Navbar />}
              <Routes>
                <Route path="/" element={
                  <>
                    <HeroKlusters />
                    <ArchitectureKlusters />
                    <GlobalReachKlusters />
                    <KlustersModules />
                    <CodeScreenshotsKlusters />
                    <StartupBundleKlusters />
                    <CliPreviewKlusters />
                    <PartnersKlusters />
                    <TestimonialsKlusters />
                    <StatsKlusters />
                  </>
                } />
                <Route path="/signin" element={<SignInPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                <Route path="/domains" element={<ProtectedRoute><Domains /></ProtectedRoute>} />
                <Route path="/hosting" element={<ProtectedRoute><Hosting /></ProtectedRoute>} />
                <Route path="/api-marketplace" element={<ProtectedRoute><ApiMarketplacePage /></ProtectedRoute>} />
                <Route path="/library" element={<ProtectedRoute><Library /></ProtectedRoute>} />
                <Route path="/auth/callback" element={<GitHubCallback />} />
                <Route path="/dashboard" element={<ProtectedRoute><DashboardRouter /></ProtectedRoute>} />
              </Routes>
              {!isDashboard && <Footer />}
              <ScrollToTop />
            </div>
          </div>
        </AuthProvider>
      </ToastProvider>
    );
  }

  export default function WrappedApp() {
    return (
      <Router>
        <App />
      </Router>
    );
  }