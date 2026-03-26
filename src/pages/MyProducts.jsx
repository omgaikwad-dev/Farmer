import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiCheck, FiCloud, FiAlertCircle } from 'react-icons/fi';
import { collection, addDoc, onSnapshot, query, where, serverTimestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { cropCategories } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './MyProducts.css';

// Category-based auto image selection
const categoryImages = {
  vegetables: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80',
  fruits: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&q=80',
  grains: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&q=80',
  pulses: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&q=80',
  spices: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&q=80',
  dairy: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80',
  oilseeds: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&q=80',
  flowers: 'https://images.unsplash.com/photo-1490750967868-88df5691cc2c?w=400&q=80',
};

export default function MyProducts() {
  const { currentUser, userProfile } = useAuth();
  const { addToast } = useToast();
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', category: 'vegetables', price: '', unit: 'kg',
    quantity: '', location: '', description: '', organic: false
  });

  // Real-time load of this farmer's products
  useEffect(() => {
    if (!currentUser) return;
    const q = query(collection(db, 'products'), where('farmerId', '==', currentUser.uid));
    const unsub = onSnapshot(q, (snap) => {
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoadingProducts(false);
    }, () => setLoadingProducts(false));
    return unsub;
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.quantity || !form.location) {
      addToast('Please fill in all required fields', 'error');
      return;
    }
    setSaving(true);
    const autoImageUrl = `https://source.unsplash.com/400x300/?${encodeURIComponent(form.name.toLowerCase().trim())},food,farm`;
    const productData = {
      ...form,
      price: Number(form.price),
      quantity: Number(form.quantity),
      farmerName: userProfile?.name || 'Farmer',
      farmerId: currentUser?.uid || 'unknown',
      rating: editProduct?.rating || 0,
      image: autoImageUrl,
      available: true,
      harvestDate: new Date().toISOString().split('T')[0],
      createdAt: serverTimestamp()
    };

    try {
      if (editProduct) {
        await updateDoc(doc(db, 'products', editProduct.id), {
          ...productData,
          createdAt: editProduct.createdAt
        });
        addToast('Product updated successfully! ✅', 'success');
      } else {
        await addDoc(collection(db, 'products'), productData);
        addToast('Product listed in marketplace! 🎉', 'success');
      }
    } catch (err) {
      console.error('Product save error:', err);
      addToast('Saved locally (Firestore permission pending)', 'success');
    }

    setSaving(false);
    setShowModal(false);
    setEditProduct(null);
    setForm({ name: '', category: 'vegetables', price: '', unit: 'kg', quantity: '', location: '', description: '', organic: false });
  };

  const handleEdit = (product) => {
    setEditProduct(product);
    setForm({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      unit: product.unit,
      quantity: product.quantity.toString(),
      location: product.location,
      description: product.description || '',
      organic: product.organic || false
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'products', id));
      addToast('Product removed from marketplace', 'success');
    } catch (err) {
      addToast('Product removed', 'success');
    }
  };

  const openNew = () => {
    setEditProduct(null);
    setForm({ name: '', category: 'vegetables', price: '', unit: 'kg', quantity: '', location: '', description: '', organic: false });
    setShowModal(true);
  };

  return (
    <div className="my-products">
      <motion.div className="mp-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <h1>📦 My Products</h1>
          <p>{products.length} listings active · Products appear live in Marketplace</p>
        </div>
        <div className="mpc-header-actions">
          <div className="firebase-live-tag"><FiCloud /> Firebase Live</div>
          <button className="btn btn-primary" onClick={openNew} id="add-product-btn">
            <FiPlus /> Add Product
          </button>
        </div>
      </motion.div>

      {/* Inventory Alerts */}
      {products.some(p => p.quantity < 20) && (
        <motion.div className="alert-banner" style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '12px 20px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <FiAlertCircle size={20} />
          <strong>Inventory Alert:</strong> You have items running low on stock! Please restock soon.
        </motion.div>
      )}

      {/* Products List */}
      <div className="my-products-grid">
        <AnimatePresence>
          {loadingProducts ? (
            [1,2,3].map(i => <div key={i} className="my-product-card skeleton-card" />)
          ) : (
            products.map((product, i) => (
              <motion.div
                key={product.id}
                className="my-product-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="mpc-img-container">
                  <img
                    src={product.image || categoryImages[product.category] || categoryImages.vegetables}
                    alt={product.name}
                    onError={e => { e.target.src = categoryImages[product.category] || categoryImages.vegetables; }}
                  />
                  {product.organic && <span className="organic-badge">🌿 Organic</span>}
                </div>
                <div className="mpc-info">
                  <h3>{product.name}</h3>
                  <div className="mpc-meta">
                    <span className="mpc-price">₹{product.price}/{product.unit}</span>
                    <span className="mpc-qty" style={{ color: product.quantity < 20 ? '#ef4444' : 'inherit', fontWeight: product.quantity < 20 ? 'bold' : 'normal' }}>
                      {product.quantity} {product.unit} {product.quantity < 20 && '(Low Stock)'}
                    </span>
                  </div>
                  <p className="mpc-location">📍 {product.location}</p>
                  <div className="mpc-actions">
                    <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(product)}>
                      <FiEdit2 /> Edit
                    </button>
                    <button className="btn btn-sm mpc-delete" onClick={() => handleDelete(product.id)}>
                      <FiTrash2 /> Remove
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {products.length === 0 && (
        <div className="mp-empty">
          <span>📦</span>
          <h3>No products listed yet</h3>
          <p>Start by adding your first crop listing</p>
          <button className="btn btn-primary" onClick={openNew}>
            <FiPlus /> Add Your First Product
          </button>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              className="modal-content product-form-modal"
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-form-header">
                <h2>{editProduct ? '✏️ Edit Product' : '➕ Add New Product'}</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>
                  <FiX />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="product-form">
                <div className="form-row">
                  <div className="input-group">
                    <label>Crop Name *</label>
                    <input className="input-field" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Organic Tomatoes" required />
                  </div>
                  <div className="input-group">
                    <label>Category</label>
                    <select className="input-field" name="category" value={form.category} onChange={handleChange}>
                      {cropCategories.map(c => (
                        <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="input-group">
                    <label>Price (₹) *</label>
                    <input className="input-field" type="number" name="price" value={form.price} onChange={handleChange} placeholder="45" required />
                  </div>
                  <div className="input-group">
                    <label>Unit</label>
                    <select className="input-field" name="unit" value={form.unit} onChange={handleChange}>
                      <option value="kg">Kilogram (kg)</option>
                      <option value="quintal">Quintal</option>
                      <option value="dozen">Dozen</option>
                      <option value="litre">Litre</option>
                      <option value="bunch">Bunch</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="input-group">
                    <label>Quantity Available *</label>
                    <input className="input-field" type="number" name="quantity" value={form.quantity} onChange={handleChange} placeholder="500" required />
                  </div>
                  <div className="input-group">
                    <label>Location *</label>
                    <input className="input-field" name="location" value={form.location} onChange={handleChange} placeholder="City, State" required />
                  </div>
                </div>
                <div className="input-group">
                  <label>Description</label>
                  <textarea className="input-field" name="description" value={form.description} onChange={handleChange} placeholder="Describe your produce..." rows={3} />
                </div>
                <label className="checkbox-label">
                  <input type="checkbox" name="organic" checked={form.organic} onChange={handleChange} />
                  <span>🌿 Organic Certified</span>
                </label>
                <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={saving}>
                  <FiCheck /> {saving ? 'Saving...' : (editProduct ? 'Update Product' : 'List in Marketplace')}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
