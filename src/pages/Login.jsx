import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import './Auth.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (window.innerWidth <= 768) return;
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX / innerWidth - 0.5) * 10;
    const y = (clientY / innerHeight - 0.5) * -10;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      addToast('Please fill in all fields', 'error');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      addToast('Welcome back! 🌱', 'success');
      navigate('/dashboard');
    } catch (error) {
      addToast(error.message || 'Login failed', 'error');
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      addToast('Welcome! 🌱', 'success');
      navigate('/dashboard');
    } catch (error) {
      if (error.code === 'auth/unauthorized-domain') {
        addToast('Please add this domain to Firebase Console > Authentication > Settings > Authorized Domains', 'error');
      } else {
        addToast(error.message || 'Google login failed', 'error');
      }
    }
  };

  return (
    <div className="auth-page" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      <div className="auth-bg">
        <video className="auth-video" autoPlay loop muted playsInline preload="none">
          <source src="https://www.pexels.com/download/video/5285672/" type="video/mp4" />
        </video>
        <div className="auth-video-overlay"></div>
      </div>

      <motion.div
        className="auth-container"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          transform: `perspective(1000px) rotateY(${mousePos.x}deg) rotateX(${mousePos.y}deg)`,
        }}
      >
        <div className="auth-left">
          <div className="auth-welcome">
            <span className="auth-logo">🌱</span>
            <h2>Welcome to FarmConnect</h2>
            <p>Connecting farmers directly to buyers. Better prices, fresher produce.</p>
            <div className="auth-features-list">
              <div className="auth-feature"><span>✓</span> No middlemen</div>
              <div className="auth-feature"><span>✓</span> AI price insights</div>
              <div className="auth-feature"><span>✓</span> Fast delivery</div>
              <div className="auth-feature"><span>✓</span> Trusted community</div>
            </div>
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-form-container">
            <h1>Sign In</h1>
            <p className="auth-subtitle">Enter your credentials to access your account</p>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="input-group">
                <label htmlFor="email">Email</label>
                <div className="input-with-icon">
                  <FiMail className="input-icon" />
                  <input
                    id="email"
                    type="email"
                    className="input-field"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="password">Password</label>
                <div className="input-with-icon">
                  <FiLock className="input-icon" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className="input-field"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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

              <button
                type="submit"
                className="btn btn-primary btn-lg auth-submit"
                disabled={loading}
                id="login-submit"
              >
                {loading ? <span className="spinner" style={{ width: 20, height: 20 }}></span> : 'Sign In'}
              </button>
            </form>

            <div className="auth-divider">
              <span>or continue with</span>
            </div>

            <button className="btn-google" onClick={handleGoogleLogin} id="google-login">
              <FcGoogle size={20} />
              Sign in with Google
            </button>

            <p className="auth-switch">
              Don't have an account? <Link to="/register">Create New</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
