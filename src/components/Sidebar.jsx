import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiHome, FiShoppingBag, FiTruck, FiBarChart2,
  FiLogOut, FiMenu, FiX, FiSun, FiMessageSquare,
  FiPackage, FiTrendingUp, FiUser, FiStar,
  FiDollarSign, FiNavigation
} from 'react-icons/fi';
import './Sidebar.css';

// Nav items by role — strictly scoped to each role
const getNavItems = (role) => {
  if (role === 'farmer') {
    return [
      { path: '/dashboard',     icon: <FiHome />,         label: 'Dashboard' },
      { path: '/my-products',   icon: <FiPackage />,      label: 'My Products' },
      { path: '/price-insights',icon: <FiTrendingUp />,   label: 'Price Insights' },
      { path: '/weather',       icon: <FiSun />,          label: 'Weather' },
      { path: '/transport',     icon: <FiTruck />,        label: 'Transport' },
      { path: '/chat',          icon: <FiMessageSquare />,label: 'Messages' },
      { path: '/analytics',     icon: <FiBarChart2 />,    label: 'Analytics' },
      { path: '/ratings',       icon: <FiStar />,         label: 'Ratings' },
      { path: '/profile',       icon: <FiUser />,         label: 'Profile' },
    ];
  }

  if (role === 'buyer') {
    return [
      { path: '/dashboard',   icon: <FiHome />,         label: 'Dashboard' },
      { path: '/marketplace', icon: <FiShoppingBag />,  label: 'Marketplace' },
      { path: '/transport',   icon: <FiTruck />,        label: 'Transport' },
      { path: '/chat',        icon: <FiMessageSquare />,label: 'Messages' },
      { path: '/ratings',     icon: <FiStar />,         label: 'Ratings' },
      { path: '/profile',     icon: <FiUser />,         label: 'Profile' },
    ];
  }

  if (role === 'transporter') {
    return [
      { path: '/dashboard', icon: <FiHome />,         label: 'Dashboard' },
      { path: '/transport', icon: <FiNavigation />,   label: 'My Trips' },
      { path: '/chat',      icon: <FiMessageSquare />,label: 'Messages' },
      { path: '/analytics', icon: <FiBarChart2 />,    label: 'Analytics' },
      { path: '/ratings',   icon: <FiStar />,         label: 'Ratings' },
      { path: '/profile',   icon: <FiUser />,         label: 'Profile' },
    ];
  }

  // Fallback — minimal set
  return [
    { path: '/dashboard',   icon: <FiHome />,        label: 'Dashboard' },
    { path: '/marketplace', icon: <FiShoppingBag />, label: 'Marketplace' },
  ];
};

const roleConfig = {
  farmer:      { label: '👨‍🌾 Farmer',     color: '#22c55e', bg: 'rgba(34,197,94,0.15)' },
  buyer:       { label: '🏪 Buyer',       color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
  transporter: { label: '🚛 Transporter', color: '#f97316', bg: 'rgba(249,115,22,0.15)' },
};

export default function Sidebar() {
  // On desktop: collapsed = icon-only sidebar
  // On mobile:  collapsed = sidebar hidden off-screen; !collapsed = sidebar open
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();

  // Detect screen size
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1024px)');
    const handle = (e) => {
      setIsMobile(e.matches);
      // On mobile, start collapsed (hidden)
      if (e.matches) setCollapsed(true);
      else setCollapsed(false);
    };
    handle(mq);
    mq.addEventListener('change', handle);
    return () => mq.removeEventListener('change', handle);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const closeSidebar = () => {
    if (isMobile) setCollapsed(true);
  };

  // Get role: userProfile → localStorage cache → 'buyer' fallback
  let role = userProfile?.role;
  if (!role) {
    try {
      const cached = JSON.parse(localStorage.getItem('fc_user_profile') || 'null');
      if (cached) role = cached.role;
    } catch (_) {}
  }
  role = role || 'buyer';

  const navItems = getNavItems(role);
  const rc = roleConfig[role] || roleConfig.buyer;

  return (
    <>
      {/* Hamburger toggle — visible only on mobile */}
      <button
        className="sidebar-toggle"
        onClick={() => setCollapsed(!collapsed)}
        id="sidebar-toggle"
        aria-label={collapsed ? 'Open menu' : 'Close menu'}
      >
        {collapsed ? <FiMenu /> : <FiX />}
      </button>

      <aside className={`sidebar${collapsed ? ' collapsed' : ''}`} role="navigation" aria-label="Main navigation">
        {/* Logo */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span className="logo-icon">🌱</span>
            {!collapsed && <span className="logo-text">FarmConnect</span>}
          </div>
        </div>

        {/* Role Badge */}
        {!collapsed && (
          <div
            className="sidebar-role-badge"
            style={{ background: rc.bg, color: rc.color }}
          >
            {rc.label}
          </div>
        )}

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              title={collapsed && !isMobile ? item.label : ''}
              onClick={closeSidebar}
            >
              <span className="nav-icon">{item.icon}</span>
              {!collapsed && <span className="nav-label">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Footer — user info + logout */}
        <div className="sidebar-footer">
          {!collapsed && userProfile && (
            <div className="user-info">
              <div className="user-avatar">
                {userProfile.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="user-details">
                <span className="user-name">{userProfile.name || 'User'}</span>
                <span className="user-role" style={{ color: rc.color }}>{role}</span>
              </div>
            </div>
          )}
          <button
            className="nav-item logout-btn"
            onClick={handleLogout}
            id="logout-button"
            title={collapsed && !isMobile ? 'Logout' : ''}
          >
            <span className="nav-icon"><FiLogOut /></span>
            {!collapsed && <span className="nav-label">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Backdrop overlay — only on mobile when sidebar is open */}
      {isMobile && !collapsed && (
        <div className="sidebar-overlay" onClick={closeSidebar} aria-hidden="true" />
      )}
    </>
  );
}
