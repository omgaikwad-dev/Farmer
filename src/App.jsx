import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Sidebar from './components/Sidebar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Marketplace from './pages/Marketplace';
import MyProducts from './pages/MyProducts';
import PriceInsights from './pages/PriceInsights';
import Weather from './pages/Weather';
import Transport from './pages/Transport';
import Chat from './pages/Chat';
import Analytics from './pages/Analytics';
import Ratings from './pages/Ratings';
import Profile from './pages/Profile';
import './App.css';

// ——— Role access map ———
const roleAccess = {
  '/my-products':    ['farmer'],
  '/price-insights': ['farmer'],
  '/weather':        ['farmer'],
  '/analytics':      ['farmer', 'transporter'],
};

// ——— Loading Screen ———
function LoadingScreen() {
  return (
    <div className="loading-overlay">
      <div className="loading-content">
        <div className="spinner" />
        <p style={{ marginTop: 4, color: 'var(--text-muted)', fontWeight: 500 }}>
          Loading FarmConnect...
        </p>
      </div>
    </div>
  );
}

// ——— Protected Layout ———
function ProtectedRoute() {
  const { currentUser, loading } = useAuth();

  // Only block on auth loading — profile loading is handled per-page
  if (loading) return <LoadingScreen />;
  if (!currentUser) return <Navigate to="/login" replace />;

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}

// ——— Role Guard ———
// Wraps a page and redirects if the user's role isn't allowed
function RoleRoute({ allowedRoles, children }) {
  const { userProfile, loading, profileLoading } = useAuth();

  if (loading) return <LoadingScreen />;
  // While profile is loading, show a brief spinner but don't block indefinitely
  if (profileLoading) return <LoadingScreen />;

  const role = userProfile?.role || 'buyer';

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

// ——— Public Route (redirect to dashboard if already logged in) ———
function PublicRoute({ children }) {
  const { currentUser, loading } = useAuth();

  if (loading) return <div className="loading-overlay"><div className="spinner" /></div>;
  if (currentUser) return <Navigate to="/dashboard" replace />;

  return children;
}

// ——— Routes ———
function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"        element={<PublicRoute><Landing /></PublicRoute>} />
      <Route path="/login"   element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register"element={<PublicRoute><Register /></PublicRoute>} />

      {/* Protected — accessible by all roles */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard"  element={<Dashboard />} />
        <Route path="/marketplace"element={<Marketplace />} />
        <Route path="/transport"  element={<Transport />} />
        <Route path="/chat"       element={<Chat />} />
        <Route path="/ratings"    element={<Ratings />} />
        <Route path="/profile"    element={<Profile />} />

        {/* Farmer-only routes */}
        <Route path="/my-products" element={
          <RoleRoute allowedRoles={['farmer']}>
            <MyProducts />
          </RoleRoute>
        } />
        <Route path="/price-insights" element={
          <RoleRoute allowedRoles={['farmer']}>
            <PriceInsights />
          </RoleRoute>
        } />
        <Route path="/weather" element={
          <RoleRoute allowedRoles={['farmer']}>
            <Weather />
          </RoleRoute>
        } />

        {/* Farmer + Transporter */}
        <Route path="/analytics" element={
          <RoleRoute allowedRoles={['farmer', 'transporter']}>
            <Analytics />
          </RoleRoute>
        } />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}
