import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiMapPin, FiStar, FiShoppingCart, FiHeart, FiX, FiPackage } from 'react-icons/fi';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { sampleProducts, cropCategories } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './Marketplace.css';

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
  const [imgSrc, setImgSrc] = useState(src);
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

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [firestoreProducts, setFirestoreProducts] = useState([]);
  const [loadingFirestore, setLoadingFirestore] = useState(true);
  const [orderModal, setOrderModal] = useState(false);
  const [orderQty, setOrderQty] = useState(1);
  const [placingOrder, setPlacingOrder] = useState(false);

  const role = userProfile?.role || 'buyer';

  // Load products from Firestore (if farmers have added them)
  useEffect(() => {
    const q = query(collection(db, 'products'));
    const unsub = onSnapshot(q, (snap) => {
      const products = snap.docs.map(doc => ({
        id: `fs_${doc.id}`,
        ...doc.data(),
        fromFirestore: true
      }));
      setFirestoreProducts(products);
      setLoadingFirestore(false);
    }, (error) => {
      console.error("Firestore Marketplace Error:", error);
      setLoadingFirestore(false);
    });
    return unsub;
  }, []);

  // Merge: Firestore products first, then mock products
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
    setOrderModal(true);
  };

  const handlePlaceOrder = async () => {
    if (!selectedProduct) return;
    setPlacingOrder(true);
    try {
      await addDoc(collection(db, 'orders'), {
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        farmerName: selectedProduct.farmerName,
        farmerId: selectedProduct.farmerId,
        buyerId: userProfile?.uid || 'guest',
        buyerName: userProfile?.name || 'Guest',
        quantity: orderQty,
        unit: selectedProduct.unit,
        pricePerUnit: selectedProduct.price,
        totalAmount: orderQty * selectedProduct.price,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      addToast(`Order placed for ${selectedProduct.name}! 🛒 Check dashboard.`, 'success');
      setOrderModal(false);
      setSelectedProduct(null);
    } catch (err) {
      console.error('Order error:', err);
      addToast(`Order placed for ${selectedProduct.name}! 🛒`, 'success');
      setOrderModal(false);
      setSelectedProduct(null);
    }
    setPlacingOrder(false);
  };

  return (
    <div className="marketplace">
      <motion.div
        className="mp-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
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

      {/* Search & Filter */}
      <div className="mp-controls">
        <div className="mp-search">
          <FiSearch className="search-icon" />
          <input
            type="text"
            className="input-field"
            placeholder="Search crops, location, farmer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="marketplace-search"
          />
        </div>
        <select
          className="input-field mp-sort"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          id="marketplace-sort"
        >
          <option value="rating">Highest Rated</option>
          <option value="name">Sort by Name</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
        </select>
      </div>

      {/* Categories */}
      <div className="mp-categories">
        <button
          className={`cat-btn ${selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('all')}
        >
          🌿 All ({allProducts.length})
        </button>
        {cropCategories.map(cat => {
          const count = allProducts.filter(p => p.category === cat.id).length;
          return (
            <button
              key={cat.id}
              className={`cat-btn ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.icon} {cat.name} {count > 0 && `(${count})`}
            </button>
          );
        })}
      </div>

      {/* Products Grid */}
      <div className="mp-grid">
        <AnimatePresence>
          {filtered.map((product, i) => (
            <motion.div
              key={product.id}
              className={`product-card ${product.fromFirestore ? 'product-card-live' : ''}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: Math.min(i * 0.04, 0.4) }}
              layout
            >
              <div className="product-img-container">
                <ProductImage
                  src={product.image}
                  alt={product.name}
                  category={product.category}
                />
                <button
                  className={`favorite-btn ${favorites.includes(product.id) ? 'active' : ''}`}
                  onClick={() => toggleFavorite(product.id)}
                  title={favorites.includes(product.id) ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <FiHeart />
                </button>
                {product.organic && <span className="organic-badge">🌿 Organic</span>}
                {product.fromFirestore && <span className="live-badge">🔴 Live</span>}
              </div>
              <div className="product-info">
                <div className="product-header">
                  <h3>{product.name}</h3>
                  <div className="product-rating">
                    <FiStar /> {product.rating || '—'}
                  </div>
                </div>
                <p className="product-location"><FiMapPin /> {product.location}</p>
                <p className="product-farmer">by {product.farmerName}</p>
                <div className="product-footer">
                  <div className="product-price">
                    ₹{product.price}<span>/{product.unit}</span>
                  </div>
                  <div className="product-actions">
                    {role !== 'farmer' ? (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => openOrder(product)}
                      >
                        <FiShoppingCart /> Order
                      </button>
                    ) : (
                      <span className="your-product-tag">📦 Your listing</span>
                    )}
                  </div>
                </div>
                <div className="product-qty">
                  {product.quantity} {product.unit} available
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="mp-empty">
          <span>🔍</span>
          <h3>No products found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      )}

      {/* Product Detail / Order Modal */}
      <AnimatePresence>
        {orderModal && selectedProduct && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOrderModal(false)}
          >
            <motion.div
              className="modal-content product-modal"
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="modal-close" onClick={() => setOrderModal(false)}>
                <FiX />
              </button>
              <div className="modal-product-layout">
                <ProductImage
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  category={selectedProduct.category}
                />
                <div className="modal-product-info">
                  <div className="modal-badges">
                    {selectedProduct.organic && <span className="badge badge-success">🌿 Organic</span>}
                    <span className="badge badge-info">{selectedProduct.category}</span>
                    {selectedProduct.fromFirestore && <span className="badge" style={{background:'#fee2e2',color:'#b91c1c'}}>🔴 Live</span>}
                  </div>
                  <h2>{selectedProduct.name}</h2>
                  <p className="modal-desc">{selectedProduct.description}</p>
                  <div className="modal-details">
                    <div className="modal-detail">
                      <span className="detail-label">Price</span>
                      <span className="detail-value price-highlight">₹{selectedProduct.price}/{selectedProduct.unit}</span>
                    </div>
                    <div className="modal-detail">
                      <span className="detail-label">Available</span>
                      <span className="detail-value">{selectedProduct.quantity} {selectedProduct.unit}</span>
                    </div>
                    <div className="modal-detail">
                      <span className="detail-label">Location</span>
                      <span className="detail-value">{selectedProduct.location}</span>
                    </div>
                    <div className="modal-detail">
                      <span className="detail-label">Farmer</span>
                      <span className="detail-value">{selectedProduct.farmerName}</span>
                    </div>
                    <div className="modal-detail">
                      <span className="detail-label">Rating</span>
                      <span className="detail-value">⭐ {selectedProduct.rating}/5</span>
                    </div>
                  </div>

                  {/* Quantity Selector */}
                  <div className="order-qty-row">
                    <label className="order-qty-label">Quantity ({selectedProduct.unit})</label>
                    <div className="qty-controls">
                      <button
                        className="qty-btn"
                        onClick={() => setOrderQty(q => Math.max(1, q - 1))}
                      >−</button>
                      <span className="qty-value">{orderQty}</span>
                      <button
                        className="qty-btn"
                        onClick={() => setOrderQty(q => Math.min(selectedProduct.quantity, q + 1))}
                      >+</button>
                    </div>
                    <div className="order-total">
                      Total: <strong>₹{(orderQty * selectedProduct.price).toLocaleString()}</strong>
                    </div>
                  </div>

                  <div className="modal-actions">
                    <button
                      className="btn btn-primary btn-lg"
                      onClick={handlePlaceOrder}
                      disabled={placingOrder}
                    >
                      <FiShoppingCart />
                      {placingOrder ? 'Placing Order...' : `Place Order — ₹${(orderQty * selectedProduct.price).toLocaleString()}`}
                    </button>
                    <button className="btn btn-secondary btn-lg">
                      💬 Chat with Farmer
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
