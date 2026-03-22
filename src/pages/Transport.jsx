import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FiTruck, FiMapPin, FiDollarSign, FiCheck, FiClock,
  FiPackage, FiNavigation, FiPhone, FiMessageSquare,
  FiCheckCircle, FiAlertCircle, FiArrowRight
} from 'react-icons/fi';
import { transportOptions } from '../data/mockData';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Transport.css';

/* ═══════════ Transporter Trip Data ═══════════ */
const transporterTrips = [
  {
    id: 'TRP001', status: 'delivered',
    from: 'Nashik, Maharashtra', to: 'Mumbai, Maharashtra',
    cargo: 'Organic Tomatoes', weight: '500 kg', vehicle: '🛻 Mini Truck',
    amount: 3500, date: '2026-03-22', deliveredDate: '2026-03-22',
    buyer: { name: 'Fresh Mart Ltd.', role: 'Buyer', phone: '+91 98765 43210', avatar: '🏪' },
    farmer: { name: 'Rajesh Patil', role: 'Farmer', phone: '+91 90123 45678', avatar: '👨‍🌾' },
    distance: '180 km', duration: '4h 30m',
  },
  {
    id: 'TRP002', status: 'in-transit',
    from: 'Pune, Maharashtra', to: 'Delhi, NCR',
    cargo: 'Alphonso Mangoes', weight: '200 kg', vehicle: '🧊 Refrigerated Van',
    amount: 8200, date: '2026-03-21', deliveredDate: null,
    buyer: { name: 'Anand Hotels', role: 'Buyer', phone: '+91 87654 32109', avatar: '🏨' },
    farmer: { name: 'Suresh Deshmukh', role: 'Farmer', phone: '+91 91234 56789', avatar: '👨‍🌾' },
    distance: '1,450 km', duration: '24h',
  },
  {
    id: 'TRP003', status: 'pending',
    from: 'Indore, Madhya Pradesh', to: 'Bhopal, Madhya Pradesh',
    cargo: 'Organic Wheat', weight: '2000 kg', vehicle: '🚚 Large Truck',
    amount: 4100, date: '2026-03-21', deliveredDate: null,
    buyer: { name: 'Metro Wholesale', role: 'Buyer', phone: '+91 76543 21098', avatar: '🛒' },
    farmer: { name: 'Gopal Sharma', role: 'Farmer', phone: '+91 93456 78901', avatar: '👨‍🌾' },
    distance: '195 km', duration: '5h',
  },
  {
    id: 'TRP004', status: 'delivered',
    from: 'Erode, Tamil Nadu', to: 'Chennai, Tamil Nadu',
    cargo: 'Turmeric Powder', weight: '100 kg', vehicle: '🛻 Mini Truck',
    amount: 2800, date: '2026-03-20', deliveredDate: '2026-03-20',
    buyer: { name: 'Spice World Co.', role: 'Buyer', phone: '+91 65432 10987', avatar: '🏪' },
    farmer: { name: 'Karthik Raman', role: 'Farmer', phone: '+91 94567 89012', avatar: '👨‍🌾' },
    distance: '395 km', duration: '8h',
  },
  {
    id: 'TRP005', status: 'delivered',
    from: 'Anand, Gujarat', to: 'Ahmedabad, Gujarat',
    cargo: 'Fresh Milk', weight: '400 L', vehicle: '🧊 Refrigerated Van',
    amount: 1500, date: '2026-03-20', deliveredDate: '2026-03-20',
    buyer: { name: 'Green Basket Co.', role: 'Buyer', phone: '+91 54321 09876', avatar: '🛒' },
    farmer: { name: 'Bharat Patel', role: 'Farmer', phone: '+91 95678 90123', avatar: '👨‍🌾' },
    distance: '75 km', duration: '2h',
  },
  {
    id: 'TRP006', status: 'pending',
    from: 'Jalgaon, Maharashtra', to: 'Pune, Maharashtra',
    cargo: 'Sweet Bananas', weight: '800 kg', vehicle: '🚛 Pickup Truck',
    amount: 3200, date: '2026-03-22', deliveredDate: null,
    buyer: { name: 'FruitKart', role: 'Buyer', phone: '+91 43210 98765', avatar: '🏪' },
    farmer: { name: 'Dilip More', role: 'Farmer', phone: '+91 96789 01234', avatar: '👨‍🌾' },
    distance: '260 km', duration: '6h',
  },
];

/* ═══════════ Status Helpers ═══════════ */
const statusConfig = {
  delivered:   { label: 'Delivered',   icon: <FiCheckCircle />, color: '#16a34a', bg: '#f0fdf4', badge: 'badge-success' },
  'in-transit':{ label: 'In Transit',  icon: <FiNavigation />,  color: '#2563eb', bg: '#eff6ff', badge: 'badge-info' },
  pending:     { label: 'Pending',     icon: <FiClock />,       color: '#d97706', bg: '#fffbeb', badge: 'badge-warning' },
  processing:  { label: 'Processing',  icon: <FiAlertCircle />, color: '#7c3aed', bg: '#f5f3ff', badge: 'badge-info' },
};

/* ═══════════ TRANSPORTER VIEW ═══════════ */
function TransporterTripsView() {
  const [filter, setFilter] = useState('all');
  const [expandedTrip, setExpandedTrip] = useState(null);
  const navigate = useNavigate();

  const filteredTrips = filter === 'all'
    ? transporterTrips
    : transporterTrips.filter(t => t.status === filter);

  const stats = {
    total:     transporterTrips.length,
    delivered: transporterTrips.filter(t => t.status === 'delivered').length,
    inTransit: transporterTrips.filter(t => t.status === 'in-transit').length,
    pending:   transporterTrips.filter(t => t.status === 'pending').length,
  };

  const totalEarnings = transporterTrips
    .filter(t => t.status === 'delivered')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="transport-page">
      <div className="tp-header">
        <h1>🚛 My Trips</h1>
        <p>Manage your deliveries, track trips, and connect with buyers</p>
      </div>

      {/* ── Stats Summary ── */}
      <div className="trip-stats-grid">
        <motion.div className="trip-stat-card" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
          <div className="trip-stat-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}><FiCheckCircle /></div>
          <div className="trip-stat-info">
            <span className="trip-stat-value">{stats.delivered}</span>
            <span className="trip-stat-label">Completed</span>
          </div>
        </motion.div>
        <motion.div className="trip-stat-card" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="trip-stat-icon" style={{ background: '#eff6ff', color: '#2563eb' }}><FiNavigation /></div>
          <div className="trip-stat-info">
            <span className="trip-stat-value">{stats.inTransit}</span>
            <span className="trip-stat-label">In Transit</span>
          </div>
        </motion.div>
        <motion.div className="trip-stat-card" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="trip-stat-icon" style={{ background: '#fffbeb', color: '#d97706' }}><FiClock /></div>
          <div className="trip-stat-info">
            <span className="trip-stat-value">{stats.pending}</span>
            <span className="trip-stat-label">Pending</span>
          </div>
        </motion.div>
        <motion.div className="trip-stat-card" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="trip-stat-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}><FiDollarSign /></div>
          <div className="trip-stat-info">
            <span className="trip-stat-value">₹{totalEarnings.toLocaleString()}</span>
            <span className="trip-stat-label">Earnings</span>
          </div>
        </motion.div>
      </div>

      {/* ── Filter Tabs ── */}
      <div className="trip-filter-bar">
        {[
          { key: 'all', label: 'All Trips', count: stats.total },
          { key: 'pending', label: 'Pending', count: stats.pending },
          { key: 'in-transit', label: 'In Transit', count: stats.inTransit },
          { key: 'delivered', label: 'Completed', count: stats.delivered },
        ].map(f => (
          <button
            key={f.key}
            className={`trip-filter-btn ${filter === f.key ? 'active' : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label} <span className="filter-count">{f.count}</span>
          </button>
        ))}
      </div>

      {/* ── Trips List ── */}
      <div className="trips-list">
        {filteredTrips.length === 0 ? (
          <div className="trips-empty">
            <FiPackage size={48} />
            <h3>No trips found</h3>
            <p>No {filter === 'all' ? '' : filter} trips at the moment</p>
          </div>
        ) : (
          filteredTrips.map((trip, i) => {
            const sc = statusConfig[trip.status] || statusConfig.pending;
            const isExpanded = expandedTrip === trip.id;

            return (
              <motion.div
                key={trip.id}
                className={`trip-card ${isExpanded ? 'expanded' : ''}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                {/* Trip Header — always visible */}
                <div className="trip-card-header" onClick={() => setExpandedTrip(isExpanded ? null : trip.id)}>
                  <div className="trip-route">
                    <div className="trip-route-points">
                      <span className="route-dot from" />
                      <span className="route-line" />
                      <span className="route-dot to" />
                    </div>
                    <div className="trip-route-info">
                      <div className="trip-from">{trip.from}</div>
                      <div className="trip-to">{trip.to}</div>
                    </div>
                  </div>

                  <div className="trip-meta-row">
                    <span className="trip-cargo"><FiPackage /> {trip.cargo} · {trip.weight}</span>
                    <span className="trip-vehicle">{trip.vehicle}</span>
                  </div>

                  <div className="trip-footer-row">
                    <span className={`badge ${sc.badge}`}>{sc.label}</span>
                    <span className="trip-amount">₹{trip.amount.toLocaleString()}</span>
                    <span className="trip-date">{trip.date}</span>
                    <span className="trip-expand-hint">{isExpanded ? '▲' : '▼'}</span>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <motion.div
                    className="trip-details"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="trip-details-grid">
                      {/* Trip Info */}
                      <div className="trip-detail-section">
                        <h4>📦 Trip Details</h4>
                        <div className="detail-row"><span>Trip ID</span><strong>{trip.id}</strong></div>
                        <div className="detail-row"><span>Distance</span><strong>{trip.distance}</strong></div>
                        <div className="detail-row"><span>Duration</span><strong>{trip.duration}</strong></div>
                        <div className="detail-row"><span>Booked</span><strong>{trip.date}</strong></div>
                        {trip.deliveredDate && (
                          <div className="detail-row"><span>Delivered</span><strong>{trip.deliveredDate}</strong></div>
                        )}
                      </div>

                      {/* Buyer Connection */}
                      <div className="trip-detail-section">
                        <h4>🏪 Buyer</h4>
                        <div className="contact-card-inline">
                          <span className="contact-inline-avatar">{trip.buyer.avatar}</span>
                          <div>
                            <strong>{trip.buyer.name}</strong>
                            <span className="contact-inline-role">{trip.buyer.role}</span>
                          </div>
                        </div>
                        <div className="detail-row"><span><FiPhone /> Phone</span><strong>{trip.buyer.phone}</strong></div>
                        <button
                          className="btn btn-sm btn-secondary trip-msg-btn"
                          onClick={(e) => { e.stopPropagation(); navigate('/chat'); }}
                        >
                          <FiMessageSquare /> Message Buyer
                        </button>
                      </div>

                      {/* Farmer Connection */}
                      <div className="trip-detail-section">
                        <h4>👨‍🌾 Farmer</h4>
                        <div className="contact-card-inline">
                          <span className="contact-inline-avatar">{trip.farmer.avatar}</span>
                          <div>
                            <strong>{trip.farmer.name}</strong>
                            <span className="contact-inline-role">{trip.farmer.role}</span>
                          </div>
                        </div>
                        <div className="detail-row"><span><FiPhone /> Phone</span><strong>{trip.farmer.phone}</strong></div>
                        <button
                          className="btn btn-sm btn-secondary trip-msg-btn"
                          onClick={(e) => { e.stopPropagation(); navigate('/chat'); }}
                        >
                          <FiMessageSquare /> Message Farmer
                        </button>
                      </div>
                    </div>

                    {/* Progress Timeline */}
                    {trip.status !== 'delivered' && (
                      <div className="trip-progress">
                        <h4>📍 Delivery Progress</h4>
                        <div className="progress-steps">
                          {['Booked', 'Pickup', 'In Transit', 'Delivered'].map((step, si) => {
                            const activeStep = trip.status === 'pending' ? 0
                                             : trip.status === 'in-transit' ? 2 : 3;
                            return (
                              <div key={step} className={`progress-step ${si <= activeStep ? 'done' : ''} ${si === activeStep ? 'current' : ''}`}>
                                <div className="progress-dot" />
                                <span>{step}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}

/* ═══════════ FARMER/BUYER VIEW (Booking Form) ═══════════ */
function BookingView() {
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [weight, setWeight] = useState('');
  const [selectedTransport, setSelectedTransport] = useState(null);
  const [booked, setBooked] = useState(false);
  const { addToast } = useToast();

  const estimatedDistance = 120;
  const estimatedCost = selectedTransport
    ? (selectedTransport.pricePerKm * estimatedDistance).toLocaleString()
    : 0;

  const handleBook = () => {
    if (!pickup || !destination || !weight || !selectedTransport) {
      addToast('Please fill all details and select a vehicle', 'error');
      return;
    }
    setBooked(true);
    addToast('Transport booked successfully! 🚚', 'success');
  };

  return (
    <div className="transport-page">
      <motion.div className="tp-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1>🚚 Transport Booking</h1>
        <p>Book transport for your produce with real-time cost estimation</p>
      </motion.div>

      <div className="tp-layout">
        <motion.div className="tp-form-card" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <h3>📍 Booking Details</h3>

          <div className="input-group">
            <label>Pickup Location</label>
            <div className="input-with-icon">
              <FiMapPin className="input-icon" />
              <input className="input-field" placeholder="e.g. Nashik, Maharashtra" value={pickup} onChange={(e) => setPickup(e.target.value)} id="pickup-input" />
            </div>
          </div>

          <div className="input-group">
            <label>Destination</label>
            <div className="input-with-icon">
              <FiMapPin className="input-icon" />
              <input className="input-field" placeholder="e.g. Mumbai, Maharashtra" value={destination} onChange={(e) => setDestination(e.target.value)} id="destination-input" />
            </div>
          </div>

          <div className="input-group">
            <label>Cargo Weight (kg)</label>
            <input type="number" className="input-field" placeholder="Enter weight in kg" value={weight} onChange={(e) => setWeight(e.target.value)} id="weight-input" />
          </div>

          {selectedTransport && (
            <motion.div className="tp-estimate" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="estimate-row"><span>Vehicle</span><strong>{selectedTransport.icon} {selectedTransport.type}</strong></div>
              <div className="estimate-row"><span>Est. Distance</span><strong>{estimatedDistance} km</strong></div>
              <div className="estimate-row"><span>Rate</span><strong>₹{selectedTransport.pricePerKm}/km</strong></div>
              <div className="estimate-row total"><span>Estimated Cost</span><strong>₹{estimatedCost}</strong></div>
            </motion.div>
          )}

          <button className="btn btn-primary btn-lg tp-book-btn" onClick={handleBook} disabled={booked} id="book-transport">
            {booked ? <><FiCheck /> Booked Successfully!</> : <><FiTruck /> Book Transport</>}
          </button>
        </motion.div>

        <div className="tp-vehicles">
          <h3>🚛 Select Vehicle</h3>
          <div className="vehicle-grid">
            {transportOptions.map((t, i) => (
              <motion.div
                key={t.id}
                className={`vehicle-card ${selectedTransport?.id === t.id ? 'selected' : ''} ${!t.available ? 'unavailable' : ''}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.08 }}
                onClick={() => t.available && setSelectedTransport(t)}
              >
                <div className="vehicle-icon">{t.icon}</div>
                <div className="vehicle-info">
                  <h4>{t.type}</h4>
                  <p>Capacity: {t.capacity}</p>
                  <div className="vehicle-price">₹{t.pricePerKm}/km</div>
                </div>
                {!t.available && <span className="badge badge-error">Unavailable</span>}
                {selectedTransport?.id === t.id && (
                  <motion.div className="vehicle-check" initial={{ scale: 0 }} animate={{ scale: 1 }}><FiCheck /></motion.div>
                )}
              </motion.div>
            ))}
          </div>

          {booked && (
            <motion.div className="tp-tracking" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h3>📦 Booking Confirmed!</h3>
              <div className="tracking-timeline">
                {['Order Placed', 'Driver Assigned', 'Pickup', 'In Transit', 'Delivered'].map((step, i) => (
                  <div key={step} className={`timeline-step ${i === 0 ? 'active' : ''}`}>
                    <div className="timeline-dot" />
                    <div className="timeline-info">
                      <strong>{step}</strong>
                      <span>{i === 0 ? 'Just now' : 'Pending'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════ MAIN EXPORT — Role-aware ═══════════ */
export default function Transport() {
  const { userProfile } = useAuth();

  // Decide role: context → localStorage → default
  let role = userProfile?.role;
  if (!role) {
    try {
      const cached = JSON.parse(localStorage.getItem('fc_user_profile') || 'null');
      if (cached) role = cached.role;
    } catch (_) {}
  }
  role = role || 'buyer';

  // Transporters get the My Trips view
  if (role === 'transporter') return <TransporterTripsView />;

  // Farmers and Buyers get the booking form
  return <BookingView />;
}
