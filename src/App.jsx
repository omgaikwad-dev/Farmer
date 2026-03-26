import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Sidebar from './components/Sidebar';
import { lazy, Suspense } from 'react';
import './App.css';

// ——— Lazy-load ALL page components ———
// This means the browser only downloads the code for the page the user is actually visiting
const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Marketplace = lazy(() => import('./pages/Marketplace'));
const MyProducts = lazy(() => import('./pages/MyProducts'));
const PriceInsights = lazy(() => import('./pages/PriceInsights'));
const Weather = lazy(() => import('./pages/Weather'));
const Transport = lazy(() => import('./pages/Transport'));
const Chat = lazy(() => import('./pages/Chat'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Ratings = lazy(() => import('./pages/Ratings'));
const Profile = lazy(() => import('./pages/Profile'));
const Chatbot = lazy(() => import('./components/Chatbot'));

// ——— Lightweight Suspense Fallback ———
function PageLoader() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      flexDirection: 'column',
      gap: '12px'
    }}>
      <div className="spinner" style={{ width: 36, height: 36 }} />
      <p style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.9rem' }}>Loading…</p>
    </div>
  );
}

// ——— Loading Screen (for auth check only) ———
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

  if (loading) return <LoadingScreen />;
  if (!currentUser) return <Navigate to="/login" replace />;

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-main">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}

// ——— Role Guard ———
function RoleRoute({ allowedRoles, children }) {
  const { userProfile, loading, profileLoading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (profileLoading) return <LoadingScreen />;

  const role = userProfile?.role || 'buyer';

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

// ——— Public Route ———
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
      <Route path="/" element={
        <PublicRoute>
          <Suspense fallback={<PageLoader />}><Landing /></Suspense>
        </PublicRoute>
      } />
      <Route path="/login" element={
        <PublicRoute>
          <Suspense fallback={<PageLoader />}><Login /></Suspense>
        </PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute>
          <Suspense fallback={<PageLoader />}><Register /></Suspense>
        </PublicRoute>
      } />

      {/* Protected — accessible by all roles */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard"  element={<Dashboard />} />
        <Route path="/transport"  element={<Transport />} />
        <Route path="/chat"       element={<Chat />} />
        <Route path="/ratings"    element={<Ratings />} />
        <Route path="/profile"    element={<Profile />} />

        {/* Buyer-only routes */}
        <Route path="/marketplace" element={
          <RoleRoute allowedRoles={['buyer']}>
            <Marketplace />
          </RoleRoute>
        } />

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
          <Suspense fallback={null}>
            <Chatbot />
          </Suspense>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}
