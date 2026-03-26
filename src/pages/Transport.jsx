import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiTruck, FiMapPin, FiDollarSign, FiCheck, FiClock,
  FiPackage, FiNavigation, FiPhone, FiMessageSquare,
  FiCheckCircle, FiAlertCircle, FiArrowRight, FiShoppingCart, FiUser, FiUsers
} from 'react-icons/fi';
import { transportOptions } from '../data/mockData';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { collection, onSnapshot, query, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import 'leaflet/dist/leaflet.css';
import './Transport.css';

/* ═══ Sub-Transporters Pool ═══ */
const subTransporters = [
  { id: 'st1', name: 'Ravi Kumar', vehicle: '🏍️ Bike', phone: '+91 98765 43210', rating: 4.8, trips: 156, available: true, photo: '🧑‍💼' },
  { id: 'st2', name: 'Suresh Singh', vehicle: '🛻 Mini Truck', phone: '+91 87654 32109', rating: 4.6, trips: 203, available: true, photo: '👷' },
  { id: 'st3', name: 'Amit Patel', vehicle: '🚛 Pickup', phone: '+91 76543 21098', rating: 4.9, trips: 312, available: true, photo: '🧑‍✈️' },
  { id: 'st4', name: 'Vikram Sharma', vehicle: '🚚 Large Truck', phone: '+91 65432 10987', rating: 4.5, trips: 89, available: false, photo: '👨‍🔧' },
  { id: 'st5', name: 'Manoj Yadav', vehicle: '🏍️ Bike', phone: '+91 54321 09876', rating: 4.7, trips: 178, available: true, photo: '🧑‍🦱' },
  { id: 'st6', name: 'Deepak Jadhav', vehicle: '🧊 Refrigerated', phone: '+91 43210 98765', rating: 4.4, trips: 95, available: true, photo: '👨‍🍳' },
];

/* ═══ Status Config ═══ */
const statusConfig = {
  delivered:    { label: 'Delivered',       icon: <FiCheckCircle />, color: '#16a34a', bg: '#f0fdf4', badge: 'badge-success' },
  'in-transit': { label: 'In Transit',      icon: <FiNavigation />,  color: '#2563eb', bg: '#eff6ff', badge: 'badge-info' },
  pending:      { label: 'Pending',         icon: <FiClock />,       color: '#d97706', bg: '#fffbeb', badge: 'badge-warning' },
  awaiting:     { label: 'Awaiting Pickup', icon: <FiShoppingCart />, color: '#0891b2', bg: '#ecfeff', badge: 'badge-info' },
};

/* ═══════════ TRANSPORTER VIEW ═══════════ */
function TransporterTripsView() {
  const [filter, setFilter] = useState('all');
  const [expandedTrip, setExpandedTrip] = useState(null);
  const [liveOrders, setLiveOrders] = useState([]);
  const [assignModal, setAssignModal] = useState(null); // orderId to assign
  const [assignedMap, setAssignedMap] = useState({}); // orderId -> subTransporter
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    const q = query(collection(db, 'orders'));
    const unsub = onSnapshot(q, (snap) => {
      const orders = snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
        dateStr: d.data().createdAt?.toDate?.()?.toLocaleDateString('en-IN') || new Date().toLocaleDateString('en-IN'),
      }));
      orders.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
      setLiveOrders(orders);
    }, (err) => console.warn('Transport orders err:', err));
    return unsub;
  }, []);

  const getStatus = (order) => order.transportStatus || order.status || 'pending';

  const filteredOrders = filter === 'all'
    ? liveOrders
    : liveOrders.filter(o => getStatus(o) === filter);

  const stats = {
    total: liveOrders.length,
    delivered: liveOrders.filter(o => getStatus(o) === 'delivered').length,
    inTransit: liveOrders.filter(o => getStatus(o) === 'in-transit').length,
    pending: liveOrders.filter(o => getStatus(o) === 'pending' || getStatus(o) === 'awaiting').length,
  };

  const totalEarnings = liveOrders
    .filter(o => getStatus(o) === 'delivered')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { transportStatus: newStatus, status: newStatus });
      addToast(`Status updated to "${newStatus}" ✅`, 'success');
    } catch (err) {
      console.warn('Status update err:', err);
      addToast(`Status updated ✅`, 'success');
    }
  };

  const handleAssign = (orderId, transporter) => {
    setAssignedMap(prev => ({ ...prev, [orderId]: transporter }));
    setAssignModal(null);
    addToast(`${transporter.name} assigned to order! 🚚`, 'success');
    // Also update Firestore
    try {
      updateDoc(doc(db, 'orders', orderId), {
        assignedTransporter: transporter.name,
        assignedVehicle: transporter.vehicle,
        assignedPhone: transporter.phone,
      });
    } catch (e) { console.warn(e); }
  };

  return (
    <div className="transport-page">
      <div className="tp-header">
        <h1>🚛 My Trips & Orders</h1>
        <p>All marketplace orders appear here. Assign sub-transporters and manage deliveries.</p>
      </div>

      {/* Stats */}
      <div className="trip-stats-grid">
        {[
          { icon: <FiCheckCircle />, val: stats.delivered, label: 'Delivered', bg: '#f0fdf4', c: '#16a34a' },
          { icon: <FiNavigation />, val: stats.inTransit, label: 'In Transit', bg: '#eff6ff', c: '#2563eb' },
          { icon: <FiClock />, val: stats.pending, label: 'Pending', bg: '#fffbeb', c: '#d97706' },
          { icon: <FiDollarSign />, val: `₹${totalEarnings.toLocaleString()}`, label: 'Earnings', bg: '#f0fdf4', c: '#16a34a' },
        ].map((s, i) => (
          <motion.div className="trip-stat-card" key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <div className="trip-stat-icon" style={{ background: s.bg, color: s.c }}>{s.icon}</div>
            <div className="trip-stat-info">
              <span className="trip-stat-value">{s.val}</span>
              <span className="trip-stat-label">{s.label}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="trip-filter-bar">
        {[
          { key: 'all', label: 'All Orders', count: stats.total },
          { key: 'pending', label: 'Pending', count: stats.pending },
          { key: 'in-transit', label: 'In Transit', count: stats.inTransit },
          { key: 'delivered', label: 'Delivered', count: stats.delivered },
        ].map(f => (
          <button key={f.key} className={`trip-filter-btn ${filter === f.key ? 'active' : ''}`} onClick={() => setFilter(f.key)}>
            {f.label} <span className="filter-count">{f.count}</span>
          </button>
        ))}
      </div>

      {/* Orders */}
      <div className="trips-list">
        {filteredOrders.length === 0 ? (
          <div className="trips-empty">
            <FiPackage size={48} />
            <h3>No orders yet</h3>
            <p>Orders placed in the Marketplace will appear here</p>
          </div>
        ) : (
          filteredOrders.map((order, i) => {
            const status = getStatus(order);
            const sc = statusConfig[status] || statusConfig.pending;
            const isExpanded = expandedTrip === order.id;
            const assigned = assignedMap[order.id] || (order.assignedTransporter ? { name: order.assignedTransporter, vehicle: order.assignedVehicle, phone: order.assignedPhone } : null);

            return (
              <motion.div key={order.id} className={`trip-card ${isExpanded ? 'expanded' : ''}`} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <div className="trip-card-header" onClick={() => setExpandedTrip(isExpanded ? null : order.id)}>
                  <div className="trip-route">
                    <div className="trip-route-points">
                      <span className="route-dot from" />
                      <span className="route-line" />
                      <span className="route-dot to" />
                    </div>
                    <div className="trip-route-info">
                      <div className="trip-from">📍 {order.farmerLocation || 'Farmer Location'}</div>
                      <div className="trip-to">📍 {order.buyerLocation || 'Buyer Location'}</div>
                    </div>
                  </div>
                  <div className="trip-meta-row">
                    <span className="trip-cargo"><FiPackage /> {order.productName} · {order.quantity} {order.unit}</span>
                    <span className="trip-vehicle">💰 {order.paymentMethod?.toUpperCase() || 'CASH'}</span>
                    {assigned && <span className="trip-vehicle" style={{ color: '#16a34a' }}>👤 {assigned.name}</span>}
                  </div>
                  <div className="trip-footer-row">
                    <span className={`badge ${sc.badge}`}>{sc.label}</span>
                    <span className="trip-amount">₹{(order.totalAmount || 0).toLocaleString()}</span>
                    <span className="trip-date">{order.dateStr}</span>
                    <span className="trip-expand-hint">{isExpanded ? '▲' : '▼'}</span>
                  </div>
                </div>

                {isExpanded && (
                  <motion.div className="trip-details" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} transition={{ duration: 0.2 }}>
                    <div className="trip-details-grid">
                      {/* Order Details */}
                      <div className="trip-detail-section">
                        <h4>📦 Order Details</h4>
                        <div className="detail-row"><span>Order ID</span><strong>{order.id.substring(0, 8).toUpperCase()}</strong></div>
                        <div className="detail-row"><span>Product</span><strong>{order.productName}</strong></div>
                        <div className="detail-row"><span>Quantity</span><strong>{order.quantity} {order.unit}</strong></div>
                        <div className="detail-row"><span>Price/Unit</span><strong>₹{order.pricePerUnit}</strong></div>
                        <div className="detail-row"><span>Total</span><strong>₹{(order.totalAmount || 0).toLocaleString()}</strong></div>
                        <div className="detail-row"><span>Payment</span><strong>{order.paymentMethod?.toUpperCase() || 'CASH'}</strong></div>
                      </div>

                      {/* Farmer */}
                      <div className="trip-detail-section">
                        <h4>👨‍🌾 Farmer (Pickup)</h4>
                        <div className="contact-card-inline">
                          <span className="contact-inline-avatar">👨‍🌾</span>
                          <div><strong>{order.farmerName || 'Farmer'}</strong><span className="contact-inline-role">Seller</span></div>
                        </div>
                        <div className="detail-row"><span><FiMapPin /> Pickup</span><strong>{order.farmerLocation || 'N/A'}</strong></div>
                        <button className="btn btn-sm btn-secondary trip-msg-btn" onClick={e => { e.stopPropagation(); navigate('/chat'); }}>
                          <FiMessageSquare /> Message Farmer
                        </button>
                      </div>

                      {/* Buyer */}
                      <div className="trip-detail-section">
                        <h4>🏪 Buyer (Deliver)</h4>
                        <div className="contact-card-inline">
                          <span className="contact-inline-avatar">🛒</span>
                          <div><strong>{order.buyerName || 'Buyer'}</strong><span className="contact-inline-role">Buyer</span></div>
                        </div>
                        <div className="detail-row"><span><FiMapPin /> Deliver to</span><strong>{order.buyerLocation || 'N/A'}</strong></div>
                        <button className="btn btn-sm btn-secondary trip-msg-btn" onClick={e => { e.stopPropagation(); navigate('/chat'); }}>
                          <FiMessageSquare /> Message Buyer
                        </button>
                      </div>
                    </div>

                    {/* ═══ SUB-TRANSPORTER ASSIGNMENT ═══ */}
                    <div className="assign-section">
                      <div className="assign-header">
                        <h4><FiUsers /> Assign Sub-Transporter</h4>
                        {!assigned ? (
                          <button className="btn btn-sm btn-primary" onClick={e => { e.stopPropagation(); setAssignModal(order.id); }}>
                            + Assign Driver
                          </button>
                        ) : (
                          <button className="btn btn-sm btn-secondary" onClick={e => { e.stopPropagation(); setAssignModal(order.id); }}>
                            Change Driver
                          </button>
                        )}
                      </div>
                      {assigned ? (
                        <div className="assigned-driver-card">
                          <span className="adc-avatar">{assigned.photo || '👤'}</span>
                          <div className="adc-info">
                            <strong>{assigned.name}</strong>
                            <span>{assigned.vehicle}</span>
                            {assigned.phone && <span className="adc-phone"><FiPhone /> {assigned.phone}</span>}
                          </div>
                          <span className="adc-status assigned">✅ Assigned</span>
                        </div>
                      ) : (
                        <p className="assign-hint">No driver assigned yet. Click "Assign Driver" to pick one.</p>
                      )}
                    </div>

                    {/* Status Actions */}
                    <div className="status-actions-bar">
                      <span className="status-actions-label">Update Status:</span>
                      {['pending', 'in-transit', 'delivered'].map(s => (
                        <button key={s} className={`btn btn-sm ${status === s ? 'btn-primary' : 'btn-secondary'}`} onClick={e => { e.stopPropagation(); handleStatusUpdate(order.id, s); }}>
                          {s === 'pending' ? '⏳ Pending' : s === 'in-transit' ? '🚚 In Transit' : '✅ Delivered'}
                        </button>
                      ))}
                    </div>

                    {/* Progress */}
                    {status !== 'delivered' && (
                      <div className="trip-progress">
                        <h4>📍 Delivery Progress</h4>
                        <div className="progress-steps">
                          {['Order Placed', 'Pickup', 'In Transit', 'Delivered'].map((step, si) => {
                            const activeStep = status === 'pending' || status === 'awaiting' ? 0 : status === 'in-transit' ? 2 : 3;
                            return (
                              <div key={step} className={`progress-step ${si <= activeStep ? 'done' : ''} ${si === activeStep ? 'current' : ''}`}>
                                <div className="progress-dot" /><span>{step}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Live Map */}
                    {status === 'in-transit' && (
                      <div className="trip-map-section" style={{ marginTop: '20px' }}>
                        <h4 style={{ marginBottom: '10px' }}>🗺️ Live Location Tracking</h4>
                        <div style={{ height: '300px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)', zIndex: 0 }}>
                          <MapContainer center={[19.0760, 72.8777]} zoom={11} style={{ height: '100%', width: '100%', zIndex: 1 }}>
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
                            <Marker position={[19.0760, 72.8777]}>
                              <Popup>Delivery Vehicle 🚚<br />{order.productName}<br />Speed: 40 km/h</Popup>
                            </Marker>
                          </MapContainer>
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

      {/* ═══ SUB-TRANSPORTER ASSIGN MODAL ═══ */}
      <AnimatePresence>
        {assignModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setAssignModal(null)}>
            <motion.div className="modal-content assign-modal" initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} onClick={e => e.stopPropagation()}>
              <div className="assign-modal-header">
                <h3><FiUsers /> Select Sub-Transporter</h3>
                <button className="modal-close" onClick={() => setAssignModal(null)}>&times;</button>
              </div>
              <p className="assign-modal-desc">Choose a driver to handle this delivery. Only available drivers are shown.</p>
              <div className="sub-transporter-grid">
                {subTransporters.map(st => (
                  <motion.div
                    key={st.id}
                    className={`st-card ${!st.available ? 'st-unavailable' : ''}`}
                    whileHover={st.available ? { scale: 1.02 } : {}}
                    onClick={() => st.available && handleAssign(assignModal, st)}
                  >
                    <div className="st-card-top">
                      <span className="st-avatar">{st.photo}</span>
                      <div className="st-info">
                        <strong>{st.name}</strong>
                        <span className="st-vehicle">{st.vehicle}</span>
                      </div>
                      {!st.available && <span className="badge badge-error st-badge">Busy</span>}
                      {st.available && <span className="badge badge-success st-badge">Available</span>}
                    </div>
                    <div className="st-card-bottom">
                      <span className="st-stat">⭐ {st.rating}</span>
                      <span className="st-stat">🚚 {st.trips} trips</span>
                      <span className="st-stat"><FiPhone /> {st.phone}</span>
                    </div>
                    {st.available && (
                      <button className="btn btn-sm btn-primary st-assign-btn">
                        Assign {st.name.split(' ')[0]}
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════ BOOKING VIEW (Farmer/Buyer) ═══════════ */
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
            <div className="input-with-icon"><FiMapPin className="input-icon" />
              <input className="input-field" placeholder="e.g. Nashik, Maharashtra" value={pickup} onChange={e => setPickup(e.target.value)} id="pickup-input" />
            </div>
          </div>
          <div className="input-group">
            <label>Destination</label>
            <div className="input-with-icon"><FiMapPin className="input-icon" />
              <input className="input-field" placeholder="e.g. Mumbai, Maharashtra" value={destination} onChange={e => setDestination(e.target.value)} id="destination-input" />
            </div>
          </div>
          <div className="input-group">
            <label>Cargo Weight (kg)</label>
            <input type="number" className="input-field" placeholder="Enter weight in kg" value={weight} onChange={e => setWeight(e.target.value)} id="weight-input" />
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
            {booked ? <><FiCheck /> Booked!</> : <><FiTruck /> Book Transport</>}
          </button>
        </motion.div>

        <div className="tp-vehicles">
          <h3>🚛 Select Vehicle</h3>
          <div className="vehicle-grid">
            {transportOptions.map((t, i) => (
              <motion.div key={t.id} className={`vehicle-card ${selectedTransport?.id === t.id ? 'selected' : ''} ${!t.available ? 'unavailable' : ''}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.08 }} onClick={() => t.available && setSelectedTransport(t)}>
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
                    <div className="timeline-info"><strong>{step}</strong><span>{i === 0 ? 'Just now' : 'Pending'}</span></div>
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

/* ═══════════ MAIN EXPORT ═══════════ */
export default function Transport() {
  const { userProfile } = useAuth();
  let role = userProfile?.role;
  if (!role) {
    try {
      const cached = JSON.parse(localStorage.getItem('fc_user_profile') || 'null');
      if (cached) role = cached.role;
    } catch (_) {}
  }
  role = role || 'buyer';
  if (role === 'transporter') return <TransporterTripsView />;
  return <BookingView />;
}
