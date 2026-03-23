import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import './Auth.css';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('farmer');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signup, loginWithGoogle } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      addToast('Please fill in all fields', 'error');
      return;
    }
    if (password !== confirmPassword) {
      addToast('Passwords do not match', 'error');
      return;
    }
    if (password.length < 6) {
      addToast('Password must be at least 6 characters', 'error');
      return;
    }
    setLoading(true);
    try {
      await signup(email, password, name, role);
      addToast(`Welcome to FarmConnect, ${name}! 🌱`, 'success');
      navigate('/dashboard');
    } catch (error) {
      addToast(error.message || 'Registration failed', 'error');
    }
    setLoading(false);
  };

  const handleGoogleSignup = async () => {
    try {
      await loginWithGoogle(role);
      addToast('Welcome to FarmConnect! 🌱', 'success');
      navigate('/dashboard');
    } catch (error) {
      if (error.code === 'auth/unauthorized-domain') {
        addToast('Please add this domain to Firebase Console > Authentication > Settings > Authorized Domains', 'error');
      } else {
        addToast(error.message || 'Google signup failed', 'error');
      }
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-shape auth-shape-1"></div>
        <div className="auth-shape auth-shape-2"></div>
      </div>

      <motion.div
        className="auth-container"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="auth-left">
          <div className="auth-welcome">
            <span className="auth-logo">🌱</span>
            <h2>Join FarmConnect</h2>
            <p>Create your account and start connecting with the agricultural community.</p>
            <div className="auth-features-list">
              <div className="auth-feature"><span>🌾</span> List your produce in seconds</div>
              <div className="auth-feature"><span>📊</span> AI-powered price insights</div>
              <div className="auth-feature"><span>🚚</span> Integrated logistics</div>
              <div className="auth-feature"><span>💬</span> Direct communication</div>
            </div>
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-form-container">
            <h1>Create Account</h1>
            <p className="auth-subtitle">Fill in details to get started</p>

            {/* Role Selection */}
            <div className="role-selector">
              <button
                type="button"
                className={`role-btn ${role === 'farmer' ? 'active' : ''}`}
                onClick={() => setRole('farmer')}
                id="role-farmer"
              >
                <span>👨‍🌾</span> Farmer
              </button>
              <button
                type="button"
                className={`role-btn ${role === 'buyer' ? 'active' : ''}`}
                onClick={() => setRole('buyer')}
                id="role-buyer"
              >
                <span>🏪</span> Buyer
              </button>
              <button
                type="button"
                className={`role-btn ${role === 'transporter' ? 'active' : ''}`}
                onClick={() => setRole('transporter')}
                id="role-transporter"
              >
                <span>🚚</span> Transporter
              </button>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="input-group">
                <label htmlFor="reg-name">Full Name</label>
                <div className="input-with-icon">
                  <FiUser className="input-icon" />
                  <input
                    id="reg-name"
                    type="text"
                    className="input-field"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="reg-email">Email</label>
                <div className="input-with-icon">
                  <FiMail className="input-icon" />
                  <input
                    id="reg-email"
                    type="email"
                    className="input-field"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="auth-form-row">
                <div className="input-group">
                  <label htmlFor="reg-password">Password</label>
                  <div className="input-with-icon">
                    <FiLock className="input-icon" />
                    <input
                      id="reg-password"
                      type={showPassword ? 'text' : 'password'}
                      className="input-field"
                      placeholder="Min 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
                <div className="input-group">
                  <label htmlFor="reg-confirm">Confirm Password</label>
                  <div className="input-with-icon">
                    <FiLock className="input-icon" />
                    <input
                      id="reg-confirm"
                      type={showPassword ? 'text' : 'password'}
                      className="input-field"
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg auth-submit"
                disabled={loading}
                id="register-submit"
              >
                {loading ? <span className="spinner" style={{ width: 20, height: 20 }}></span> : 'Create Account'}
              </button>
            </form>

            <div className="auth-divider">
              <span>or continue with</span>
            </div>

            <button className="btn-google" onClick={handleGoogleSignup} id="google-register">
              <FcGoogle size={20} />
              Sign up with Google
            </button>

            <p className="auth-switch">
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
