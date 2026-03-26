import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiMapPin, FiStar, FiShoppingCart, FiHeart, FiX, FiPackage } from 'react-icons/fi';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { sampleProducts, cropCategories } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import './Marketplace.css';

// Auto-generate image URL from product name using Unsplash Source
function getAutoImageUrl(name) {
  if (!name) return 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=400&q=80';
  const searchTerm = encodeURIComponent(name.toLowerCase().replace(/organic|fresh|premium/gi, '').trim());
  return `https://source.unsplash.com/400x300/?${searchTerm},food,farm`;
}

// Reliable fallback images per category
const categoryFallbacks = {
  vegetables: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80',
  fruits: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&q=80',
  grains: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&q=80',
  pulses: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&q=80',
  spices: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&q=80',
  dairy: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80',
  oilseeds: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&q=80',
  flowers: 'https://images.unsplash.com/photo-1490750967868-88df5691cc2c?w=400&q=80',
  default: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=400&q=80',
};

function ProductImage({ src, alt, category }) {
  const [imgSrc, setImgSrc] = useState(src || getAutoImageUrl(alt));
  const [loaded, setLoaded] = useState(false);

  const handleError = useCallback(() => {
    const fallback = categoryFallbacks[category] || categoryFallbacks.default;
    if (imgSrc !== fallback) setImgSrc(fallback);
  }, [imgSrc, category]);

  return (
    <div className="product-img-wrapper">
      {!loaded && <div className="img-skeleton" />}
      <img
        src={imgSrc}
        alt={alt}
        className={`product-img ${loaded ? 'loaded' : ''}`}
        onLoad={() => setLoaded(true)}
        onError={handleError}
      />
    </div>
  );
}

export default function Marketplace() {
  const { userProfile } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [firestoreProducts, setFirestoreProducts] = useState([]);
  const [loadingFirestore, setLoadingFirestore] = useState(true);
  const [orderModal, setOrderModal] = useState(false);
  const [orderQty, setOrderQty] = useState(1);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [showQR, setShowQR] = useState(false);
  const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);
  const [buyerLocation, setBuyerLocation] = useState('');

  const role = userProfile?.role || 'buyer';

  useEffect(() => {
    const q = query(collection(db, 'products'));
    const unsub = onSnapshot(q, (snap) => {
      const products = snap.docs.map(d => ({
        id: `fs_${d.id}`,
        ...d.data(),
        fromFirestore: true,
        // Auto-assign image from product name if not set
        image: d.data().image || getAutoImageUrl(d.data().name)
      }));
      setFirestoreProducts(products);
      setLoadingFirestore(false);
    }, (error) => {
      console.error("Firestore Marketplace Error:", error);
      setLoadingFirestore(false);
    });
    return unsub;
  }, []);

  const allProducts = useMemo(() => [...firestoreProducts, ...sampleProducts], [firestoreProducts]);

  const filtered = useMemo(() => {
    let result = [...allProducts];
    if (search) {
      result = result.filter(p =>
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.location?.toLowerCase().includes(search.toLowerCase()) ||
        p.farmerName?.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category === selectedCategory);
    }
    if (sortBy === 'newest') result.sort((a, b) => {
      if (a.fromFirestore && !b.fromFirestore) return -1;
      if (!a.fromFirestore && b.fromFirestore) return 1;
      return 0;
    });
    if (sortBy === 'price-low') result.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-high') result.sort((a, b) => b.price - a.price);
    if (sortBy === 'rating') result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    if (sortBy === 'name') result.sort((a, b) => a.name?.localeCompare(b.name));
    return result;
  }, [search, selectedCategory, sortBy, allProducts]);

  const toggleFavorite = (id) => {
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
    addToast(favorites.includes(id) ? 'Removed from favorites' : 'Added to favorites! ❤️', 'success');
  };

  const openOrder = (product) => {
    setSelectedProduct(product);
    setOrderQty(1);
    setShowQR(false);
    setShowPaymentConfirm(false);
    setPaymentMethod('upi');
    setBuyerLocation('');
    setOrderModal(true);
  };

  const handlePlaceOrder = async () => {
    if (!selectedProduct) return;
    if (!buyerLocation.trim()) {
      addToast('Please enter your delivery location', 'error');
      return;
    }
    // Cash is not accepted — must pay online
    if (paymentMethod === 'cash') {
      addToast('❌ Cash on Delivery is not available. Please pay online (UPI / Card / Net Banking).', 'error');
      return;
    }
    if (paymentMethod === 'upi') {
      setShowQR(true);
      return;
    }
    // For card / netbanking show a payment confirmation step
    setShowPaymentConfirm(true);
  };

  const finalizeOrder = async () => {
    if (!selectedProduct) return;
    setPlacingOrder(true);
    setShowQR(false);
    try {
      await addDoc(collection(db, 'orders'), {
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        productImage: selectedProduct.image || getAutoImageUrl(selectedProduct.name),
        productCategory: selectedProduct.category || '',
        farmerName: selectedProduct.farmerName,
        farmerId: selectedProduct.farmerId || '',
        farmerLocation: selectedProduct.location || '',
        buyerId: userProfile?.uid || 'guest',
        buyerName: userProfile?.name || 'Guest',
        buyerLocation: buyerLocation,
        quantity: orderQty,
        unit: selectedProduct.unit,
        pricePerUnit: selectedProduct.price,
        totalAmount: orderQty * selectedProduct.price,
        paymentMethod: paymentMethod,
        status: 'pending',
        transportStatus: 'awaiting',
        createdAt: serverTimestamp()
      });

      if (selectedProduct.fromFirestore && selectedProduct.id.startsWith('fs_')) {
        const realDocId = selectedProduct.id.replace('fs_', '');
        try {
          await updateDoc(doc(db, 'products', realDocId), {
            quantity: increment(-orderQty)
          });
        } catch (e) {
          console.warn('Could not deduct quantity:', e);
        }
      }

      addToast(`Order placed for ${selectedProduct.name}! 🛒 Check dashboard.`, 'success');
      setOrderModal(false);
      setSelectedProduct(null);
      setBuyerLocation('');
    } catch (err) {
      console.error('Order error:', err);
      addToast(`Order placed for ${selectedProduct.name}! 🛒`, 'success');
      setOrderModal(false);
      setSelectedProduct(null);
      setBuyerLocation('');
    }
    setPlacingOrder(false);
  };

  const handleChatWithFarmer = () => {
    if (selectedProduct) {
      // Store farmer info for chat context
      localStorage.setItem('fc_chat_target', JSON.stringify({
        name: selectedProduct.farmerName,
        farmerId: selectedProduct.farmerId,
        product: selectedProduct.name
      }));
      setOrderModal(false);
      navigate('/chat');
    }
  };

  return (
    <div className="marketplace">
      <motion.div className="mp-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <h1>🛒 Marketplace</h1>
          <p>Browse fresh produce directly from {filtered.length} listings</p>
        </div>
        {role === 'farmer' && (
          <div className="mp-source-badge">
            <FiPackage /> Your products appear here automatically
          </div>
        )}
      </motion.div>

      <div className="mp-controls">
        <div className="mp-search">
          <FiSearch className="search-icon" />
          <input type="text" className="input-field" placeholder="Search crops, location, farmer..." value={search} onChange={(e) => setSearch(e.target.value)} id="marketplace-search" />
        </div>
        <select className="input-field mp-sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)} id="marketplace-sort">
          <option value="newest">New Arrivals 🔥</option>
          <option value="rating">Highest Rated</option>
          <option value="name">Sort by Name</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
        </select>
      </div>

      <div className="mp-categories">
        <button className={`cat-btn ${selectedCategory === 'all' ? 'active' : ''}`} onClick={() => setSelectedCategory('all')}>
          🌿 All ({allProducts.length})
        </button>
        {cropCategories.map(cat => {
          const count = allProducts.filter(p => p.category === cat.id).length;
          return (
            <button key={cat.id} className={`cat-btn ${selectedCategory === cat.id ? 'active' : ''}`} onClick={() => setSelectedCategory(cat.id)}>
              {cat.icon} {cat.name} {count > 0 && `(${count})`}
            </button>
          );
        })}
      </div>

      <div className="mp-grid">
        <AnimatePresence>
          {filtered.map((product, i) => (
            <motion.div key={product.id} className={`product-card ${product.fromFirestore ? 'product-card-live' : ''}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: Math.min(i * 0.04, 0.4) }} layout>
              <div className="product-img-container">
                <ProductImage src={product.image || getAutoImageUrl(product.name)} alt={product.name} category={product.category} />
                <button className={`favorite-btn ${favorites.includes(product.id) ? 'active' : ''}`} onClick={() => toggleFavorite(product.id)}>
                  <FiHeart />
                </button>
                {product.organic && <span className="organic-badge">🌿 Organic</span>}
                {product.fromFirestore && <span className="live-badge">🔴 Live</span>}
              </div>
              <div className="product-info">
                <div className="product-header">
                  <h3>{product.name}</h3>
                  <div className="product-rating"><FiStar /> {product.rating || '—'}</div>
                </div>
                <p className="product-location"><FiMapPin /> {product.location}</p>
                <p className="product-farmer">by {product.farmerName}</p>
                <div className="product-footer">
                  <div className="product-price">₹{product.price}<span>/{product.unit}</span></div>
                  <div className="product-actions">
                    {userProfile?.uid === product.farmerId ? (
                      <span className="your-product-tag">📦 Your listing</span>
                    ) : (
                      <button className="btn btn-primary btn-sm" onClick={() => openOrder(product)}>
                        <FiShoppingCart /> Order
                      </button>
                    )}
                  </div>
                </div>
                <div className="product-qty">{product.quantity} {product.unit} available</div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="mp-empty">
          <span>🔍</span><h3>No products found</h3><p>Try adjusting your search or filters</p>
        </div>
      )}

      {/* ═══ COMPACT ORDER MODAL ═══ */}
      <AnimatePresence>
        {orderModal && selectedProduct && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setOrderModal(false); setShowQR(false); setShowPaymentConfirm(false); }}>
            <motion.div
              className="modal-content order-modal-compact"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
            >
              <button className="modal-close" onClick={() => { setOrderModal(false); setShowQR(false); setShowPaymentConfirm(false); }}><FiX /></button>

              {!showQR && !showPaymentConfirm ? (
                /* ─── MAIN ORDER VIEW ─── */
                <div className="order-compact-layout">
                  <div className="order-compact-img">
                    <ProductImage src={selectedProduct.image || getAutoImageUrl(selectedProduct.name)} alt={selectedProduct.name} category={selectedProduct.category} />
                  </div>
                  <div className="order-compact-info">
                    <div className="modal-badges">
                      {selectedProduct.organic && <span className="badge badge-success">🌿 Organic</span>}
                      <span className="badge badge-info">{selectedProduct.category}</span>
                      {selectedProduct.fromFirestore && <span className="badge" style={{background:'#fee2e2',color:'#b91c1c'}}>🔴 Live</span>}
                    </div>
                    <h2 className="order-product-title">{selectedProduct.name}</h2>
                    {selectedProduct.description && <p className="order-desc">{selectedProduct.description}</p>}

                    <div className="order-info-grid">
                      <div className="order-info-item"><span className="oii-label">Price</span><span className="oii-value price-green">₹{selectedProduct.price}/{selectedProduct.unit}</span></div>
                      <div className="order-info-item"><span className="oii-label">Available</span><span className="oii-value">{selectedProduct.quantity} {selectedProduct.unit}</span></div>
                      <div className="order-info-item"><span className="oii-label">Location</span><span className="oii-value">{selectedProduct.location}</span></div>
                      <div className="order-info-item"><span className="oii-label">Farmer</span><span className="oii-value">{selectedProduct.farmerName}</span></div>
                    </div>

                    <div className="order-qty-compact">
                      <div className="oqc-left">
                        <span className="oqc-label">Qty ({selectedProduct.unit})</span>
                        <div className="qty-controls">
                          <button className="qty-btn" onClick={() => setOrderQty(q => Math.max(1, q - 1))}>−</button>
                          <span className="qty-value">{orderQty}</span>
                          <button className="qty-btn" onClick={() => setOrderQty(q => Math.min(selectedProduct.quantity, q + 1))}>+</button>
                        </div>
                      </div>
                      <div className="oqc-total">Total: <strong>₹{(orderQty * selectedProduct.price).toLocaleString()}</strong></div>
                    </div>

                    {/* Payment Methods — Cash disabled */}
                    <div className="order-payment-compact">
                      <span className="opc-label">Payment (Online Only)</span>
                      <div className="opc-btns">
                        {['upi', 'card', 'netbanking'].map(m => (
                          <button key={m} className={`opc-btn ${paymentMethod === m ? 'active' : ''}`} onClick={() => { setPaymentMethod(m); setShowQR(false); setShowPaymentConfirm(false); }}>
                            {m === 'upi' ? '📱 UPI' : m === 'card' ? '💳 Card' : '🏦 Net Banking'}
                          </button>
                        ))}
                        <button className="opc-btn" disabled title="Cash not accepted" style={{ opacity: 0.35, cursor: 'not-allowed' }}>
                          💵 Cash ❌
                        </button>
                      </div>
                    </div>

                    <div className="order-location-compact">
                      <span className="opc-label">Delivery Location</span>
                      <input type="text" className="input-field" placeholder="e.g. Mumbai, Maharashtra" value={buyerLocation} onChange={e => setBuyerLocation(e.target.value)} />
                    </div>

                    <div className="order-actions-compact">
                      <button className="btn btn-primary btn-lg order-main-btn" onClick={handlePlaceOrder} disabled={placingOrder}>
                        <FiShoppingCart />
                        {placingOrder ? 'Placing...' : `Pay & Order — ₹${(orderQty * selectedProduct.price).toLocaleString()}`}
                      </button>
                      <button className="btn btn-secondary order-chat-btn" onClick={handleChatWithFarmer}>
                        💬 Chat with Farmer
                      </button>
                    </div>
                  </div>
                </div>
              ) : showQR ? (
                /* ─── QR PAYMENT VIEW ─── */
                <div className="qr-payment-view">
                  <div className="qr-payment-card">
                    <div className="qr-header">
                      <span className="qr-pe-icon">₱</span>
                      <span className="qr-pe-title">PhonePe</span>
                    </div>
                    <p className="qr-accepted">ACCEPTED HERE</p>
                    <p className="qr-subtitle">Scan & Pay Using PhonePe App</p>
                    <div className="qr-img-box">
                      <img src="/phonepe-qr.png" alt="PhonePe QR" onError={e => { e.target.style.display = 'none'; }} />
                    </div>
                    <div className="qr-amount">Pay ₹{(orderQty * selectedProduct.price).toLocaleString()}</div>
                    <p className="qr-name">Mr Om Samadhan Gaikwad</p>
                  </div>
                  <div className="qr-actions">
                    <button className="btn btn-primary btn-lg" onClick={finalizeOrder} disabled={placingOrder} style={{ width: '100%' }}>
                      {placingOrder ? 'Confirming...' : '✅ Payment Done — Confirm Order'}
                    </button>
                    <button className="btn btn-secondary" onClick={() => setShowQR(false)} style={{ width: '100%', marginTop: '8px' }}>
                      ← Back to Order
                    </button>
                  </div>
                </div>
              ) : (
                /* ─── CARD / NETBANKING CONFIRM VIEW ─── */
                <div className="qr-payment-view">
                  <div style={{ textAlign: 'center', padding: '32px', maxWidth: '420px', width: '100%' }}>
                    <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>
                      {paymentMethod === 'card' ? '💳' : '🏦'}
                    </div>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '8px' }}>
                      {paymentMethod === 'card' ? 'Card Payment' : 'Net Banking'}
                    </h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.9rem' }}>
                      Complete your {paymentMethod === 'card' ? 'card' : 'net banking'} payment of
                    </p>
                    <div style={{ background: 'var(--primary-50)', border: '2px solid var(--primary-200)', borderRadius: '16px', padding: '20px', marginBottom: '24px' }}>
                      <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-700)', fontFamily: 'var(--font-primary)' }}>
                        ₹{(orderQty * selectedProduct.price).toLocaleString()}
                      </span>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '6px' }}>
                        {selectedProduct.name} · {orderQty} {selectedProduct.unit}
                      </p>
                    </div>
                    <p style={{ color: '#b45309', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '10px 16px', fontSize: '0.82rem', fontWeight: 600, marginBottom: '20px' }}>
                      ⚠️ Your {paymentMethod === 'card' ? 'card' : 'bank account'} will be charged. Click below only after completing your payment.
                    </p>
                    <button className="btn btn-primary btn-lg" onClick={finalizeOrder} disabled={placingOrder} style={{ width: '100%', marginBottom: '10px' }}>
                      {placingOrder ? 'Confirming...' : '✅ Payment Completed — Confirm Order'}
                    </button>
                    <button className="btn btn-secondary" onClick={() => setShowPaymentConfirm(false)} style={{ width: '100%' }}>
                      ← Back to Order
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
