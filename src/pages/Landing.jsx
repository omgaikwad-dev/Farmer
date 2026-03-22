import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { FiArrowRight, FiChevronDown } from 'react-icons/fi';
import './Landing.css';

/* ─────── Static data ─────── */
const features = [
  { icon: '📈', title: 'AI Price Insights',   desc: 'Get real-time AI-powered price predictions to maximize your profit margins.',          color: '#22c55e', bg: '#f0fdf4' },
  { icon: '🚫', title: 'No Middlemen',         desc: 'Connect directly with buyers and sellers. Keep 100% of your hard-earned profit.',       color: '#3b82f6', bg: '#eff6ff' },
  { icon: '🚚', title: 'Logistics Support',    desc: 'Book transport, track deliveries, and estimate costs all in one place.',                color: '#f97316', bg: '#fff7ed' },
  { icon: '📱', title: 'Easy to Use',          desc: 'Simple interface designed for everyone. List products in under 60 seconds.',            color: '#a855f7', bg: '#faf5ff' },
  { icon: '⭐', title: 'Trust System',         desc: 'Verified ratings and reviews build transparent farmer-buyer relationships.',            color: '#eab308', bg: '#fefce8' },
  { icon: '🌍', title: 'Growing Community',    desc: 'Join thousands of farmers and buyers already transforming agriculture.',               color: '#06b6d4', bg: '#ecfeff' },
];

const stats = [
  { number: '10,000+', label: 'Active Farmers', icon: '👨‍🌾' },
  { number: '5,000+',  label: 'Happy Buyers',   icon: '🏪' },
  { number: '₹50Cr+',  label: 'Transactions',   icon: '💰' },
  { number: '500+',    label: 'Cities Covered',  icon: '🗺️' },
];

const steps = [
  { num: '01', title: 'Register',        desc: 'Create your account as a farmer, buyer or transporter in minutes', icon: '📝', color: '#22c55e' },
  { num: '02', title: 'List & Browse',   desc: 'Farmers list produce, buyers browse thousands of fresh offerings',  icon: '🛒', color: '#3b82f6' },
  { num: '03', title: 'Connect & Order', desc: 'Direct communication and transparent, fair pricing for all',        icon: '🤝', color: '#f97316' },
  { num: '04', title: 'Deliver & Earn',  desc: 'Book transport, track delivery, receive payments instantly',        icon: '💰', color: '#a855f7' },
];

const testimonials = [
  { name: 'Rajesh Patil',  role: 'Farmer, Maharashtra', text: 'FarmConnect helped me increase my income by 40%. No more depending on mandis!',           avatar: '👨‍🌾', rating: 5 },
  { name: 'Priya Sharma',  role: 'Retailer, Delhi',     text: "I get the freshest produce at the best prices. The quality is absolutely unmatched.",     avatar: '🏪',  rating: 5 },
  { name: 'Amit Kumar',    role: 'Farmer, Punjab',       text: 'The AI price insights helped me decide when to sell. Complete game changer!',             avatar: '👨‍🌾', rating: 5 },
  { name: 'Sunita Devi',   role: 'Buyer, Mumbai',        text: 'Direct farm connection means I always get the freshest produce. Love it!',               avatar: '👩‍💼', rating: 5 },
  { name: 'Mohan Lal',     role: 'Transporter, Gujarat', text: "Earning extra income by transporting produce. The app made it so simple.",               avatar: '🚛',  rating: 5 },
  { name: 'Kavita Nair',   role: 'Hotel Owner, Kochi',   text: 'Our hotel now sources directly from farmers. Food quality has gone up significantly!',   avatar: '🏨',  rating: 5 },
];

/* ─────── Lightweight InView hook (replaces framer-motion viewport tracking) ─────── */
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect(); // trigger once and stop
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, visible];
}

/* ─────── Hero Cards — static positions, pure CSS animation ─────── */
function HeroVisual() {
  return (
    <div className="hero-visual" aria-hidden="true">
      <div className="hero-card hero-card-1 hc-float-a">
        <div className="hero-card-icon">📈</div>
        <div>
          <div className="hero-card-title">Today's Best Price</div>
          <div className="hero-card-value hero-price-rising">Tomato — ₹58/kg ↑</div>
        </div>
      </div>
      <div className="hero-card hero-card-2 hc-float-b">
        <div className="hero-card-icon">🌾</div>
        <div>
          <div className="hero-card-title">Active Listings</div>
          <div className="hero-card-value">2,450+ Products</div>
        </div>
      </div>
      <div className="hero-card hero-card-3 hc-float-a" style={{ animationDelay: '1.5s' }}>
        <div className="hero-card-icon">🚚</div>
        <div>
          <div className="hero-card-title">Delivery Available</div>
          <div className="hero-card-value">Same Day · 500+ Cities</div>
        </div>
      </div>
      <div className="hero-card hero-card-4 hc-float-b" style={{ animationDelay: '0.8s' }}>
        <div className="hero-card-icon">⭐</div>
        <div>
          <div className="hero-card-title">Avg Rating</div>
          <div className="hero-card-value">4.8 / 5.0</div>
        </div>
      </div>
    </div>
  );
}

/* ─────── Testimonials (CSS transitions, no AnimatePresence) ─────── */
function Testimonials() {
  const [active, setActive] = useState(0);
  const t = testimonials[active];

  // Auto-rotate — long interval to reduce re-renders
  useEffect(() => {
    const id = setInterval(() => setActive(p => (p + 1) % testimonials.length), 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="testimonials-section" id="testimonials">
      <div className="container">
        <div className="section-header reveal-item reveal-visible">
          <span className="section-badge">💬 Testimonials</span>
          <h2 className="section-title">Loved by <span className="gradient-text">Farmers & Buyers</span></h2>
        </div>

        {/* Featured — CSS opacity/transform transition, no AnimatePresence */}
        <div className="testimonial-feature-wrap">
          <div className="testimonial-feature">
            <div className="tf-stars">{'⭐'.repeat(t.rating)}</div>
            <p className="tf-text">"{t.text}"</p>
            <div className="tf-author">
              <span className="tf-avatar">{t.avatar}</span>
              <div>
                <div className="tf-name">{t.name}</div>
                <div className="tf-role">{t.role}</div>
              </div>
            </div>
          </div>
          <div className="testimonial-dots">
            {testimonials.map((_, i) => (
              <button
                key={i}
                className={`t-dot${i === active ? ' active' : ''}`}
                onClick={() => setActive(i)}
                aria-label={`Testimonial ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="testimonials-grid">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className={`testimonial-card${i === active ? ' testimonial-active' : ''}`}
              onClick={() => setActive(i)}
            >
              <div className="testimonial-stars">{'⭐'.repeat(t.rating)}</div>
              <p className="testimonial-text">"{t.text}"</p>
              <div className="testimonial-author">
                <span className="testimonial-avatar">{t.avatar}</span>
                <div>
                  <div className="testimonial-name">{t.name}</div>
                  <div className="testimonial-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────── Reveal wrapper — single IntersectionObserver per section ─────── */
function RevealSection({ children, className = '' }) {
  const [ref, visible] = useInView(0.1);
  return (
    <div ref={ref} className={`reveal-section ${visible ? 'reveal-visible' : ''} ${className}`}>
      {children}
    </div>
  );
}

/* ═══════════════ MAIN COMPONENT ═══════════════ */
export default function Landing() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  // Throttled scroll for nav shadow only — replaces useScroll + useTransform
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 40);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const goRegister = useCallback(() => navigate('/register'), [navigate]);
  const goLogin    = useCallback(() => navigate('/login'),    [navigate]);

  return (
    <div className="landing">

      {/* ══ NAV ══ */}
      <header className={`landing-header${scrolled ? ' scrolled' : ''}`}>
        <nav className="landing-nav">
          <div className="landing-brand">
            <span className="brand-icon">🌱</span>
            <span className="brand-name">FarmConnect</span>
          </div>
          <div className="landing-nav-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How it Works</a>
            <a href="#testimonials">Testimonials</a>
            <button className="btn btn-primary btn-sm" onClick={goLogin} id="nav-login-btn">
              Get Started <FiArrowRight />
            </button>
          </div>
        </nav>
      </header>

      {/* ══ HERO ══ */}
      <section className="hero" aria-label="Hero">
        {/* Pure-CSS decorative background — no JS, no heavy blur animation */}
        <div className="hero-bg" aria-hidden="true">
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
        </div>

        <div className="hero-content lp-fadein">
          <div className="hero-badge">
            <span className="badge-pulse" />
            🚀 Revolutionizing Indian Agriculture
          </div>

          <h1 className="hero-title">
            Farm Fresh,<br />
            <span className="hero-highlight">Direct to You</span>
          </h1>

          <p className="hero-subtitle">
            Empowering farmers with technology. Connecting buyers to the source.
            No middlemen, no markups — just fresh produce at fair prices.
          </p>

          <div className="hero-actions">
            <button
              className="btn btn-primary btn-lg hero-btn-main"
              onClick={goRegister}
              id="hero-register-btn"
            >
              Start Selling <FiArrowRight />
            </button>
            <button
              className="btn btn-secondary btn-lg"
              onClick={goRegister}
              id="hero-buy-btn"
            >
              Start Buying
            </button>
          </div>

          <div className="hero-trust">
            <div className="trust-avatars">
              {['👨‍🌾', '🏪', '👩‍💼', '🚛', '👩‍🌾'].map((a, i) => (
                <span key={i} className="trust-avatar">{a}</span>
              ))}
            </div>
            <span>Trusted by <strong>15,000+</strong> users</span>
          </div>
        </div>

        <HeroVisual />

        <a href="#stats" className="hero-scroll-hint" aria-label="Scroll down">
          <FiChevronDown />
        </a>
      </section>

      {/* ══ STATS ══ */}
      <section className="stats-section" id="stats">
        <div className="container">
          <div className="stats-grid">
            {stats.map((s, i) => (
              <div key={i} className="stat-item" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="stat-icon">{s.icon}</div>
                <div className="stat-number">{s.number}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FEATURES ══ */}
      <section className="features-section" id="features">
        <div className="container">
          <RevealSection>
            <div className="section-header">
              <span className="section-badge">✨ Features</span>
              <h2 className="section-title">
                Everything You Need to <span className="gradient-text">Grow & Sell</span>
              </h2>
              <p className="section-desc">Powerful tools designed for Indian agriculture</p>
            </div>
          </RevealSection>

          <div className="features-grid">
            {features.map((f, i) => (
              <RevealSection key={i}>
                <div className="feature-card" style={{ '--feature-color': f.color, '--feature-bg': f.bg }}>
                  <div className="feature-icon-wrap" style={{ background: f.bg }}>
                    <span className="feature-emoji">{f.icon}</span>
                  </div>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section className="how-section" id="how-it-works">
        <div className="container">
          <RevealSection>
            <div className="section-header">
              <span className="section-badge">🔄 Process</span>
              <h2 className="section-title">How It <span className="gradient-text">Works</span></h2>
              <p className="section-desc">Get started in 4 simple steps</p>
            </div>
          </RevealSection>

          <div className="steps-grid">
            {steps.map((step, i) => (
              <RevealSection key={i}>
                <div className="step-card" style={{ '--step-color': step.color }}>
                  <div className="step-num" style={{ color: step.color }}>{step.num}</div>
                  <div className="step-icon-wrap" style={{ background: `${step.color}18` }}>
                    <span className="step-emoji">{step.icon}</span>
                  </div>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ══ */}
      <Testimonials />

      {/* ══ CTA ══ */}
      <section className="cta-section">
        <div className="container">
          <RevealSection>
            <div className="cta-content">
              <h2>Ready to Transform Your Farming?</h2>
              <p>Join thousands of farmers and buyers on India's fastest-growing farm marketplace.</p>
              <div className="cta-actions">
                <button
                  className="btn btn-primary btn-lg"
                  onClick={goRegister}
                  id="cta-register-btn"
                >
                  Join FarmConnect <FiArrowRight />
                </button>
                <button className="btn cta-secondary-btn" onClick={goLogin}>
                  Already a member? Sign in
                </button>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer className="landing-footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="landing-brand">
                <span className="brand-icon">🌱</span>
                <span className="brand-name">FarmConnect</span>
              </div>
              <p>Connecting farmers directly to buyers. Empowering Indian agriculture with technology.</p>
              <div className="footer-socials">
                <span role="img" aria-label="Facebook">📘</span>
                <span role="img" aria-label="Twitter">🐦</span>
                <span role="img" aria-label="Instagram">📸</span>
              </div>
            </div>
            <div className="footer-links">
              <h4>Platform</h4>
              <a href="#features">Features</a>
              <a href="#how-it-works">How it Works</a>
              <a href="#testimonials">Testimonials</a>
            </div>
            <div className="footer-links">
              <h4>Support</h4>
              <a href="#">Help Center</a>
              <a href="#">Contact Us</a>
              <a href="#">FAQ</a>
            </div>
            <div className="footer-links">
              <h4>Legal</h4>
              <a href="#">Terms of Service</a>
              <a href="#">Privacy Policy</a>
              <a href="#">Refund Policy</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2026 FarmConnect. Made with ❤️ for Indian Farmers.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
