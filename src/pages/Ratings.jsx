import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiStar, FiSend, FiAward } from 'react-icons/fi';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './Ratings.css';

const seedRatings = [
  { id: 1, from: 'Fresh Mart Ltd.', avatar: '🏪', role: 'Buyer', rating: 5, review: 'Excellent quality tomatoes! Very fresh and delivered on time.', date: '2026-03-22', crop: 'Tomatoes', recipientId: 'farmer_demo1' },
  { id: 2, from: 'Anand Hotels', avatar: '🏨', role: 'Buyer', rating: 4, review: 'Good rice quality. Slightly delayed delivery but overall great.', date: '2026-03-21', crop: 'Rice', recipientId: 'farmer_demo1' },
  { id: 3, from: 'Kiran Stores', avatar: '🏪', role: 'Buyer', rating: 5, review: "Best mangoes I've ever bought! Will order again.", date: '2026-03-20', crop: 'Mangoes', recipientId: 'farmer_demo1' },
  { id: 4, from: 'Metro Wholesale', avatar: '🛒', role: 'Buyer', rating: 4, review: 'Consistent quality and fair pricing. Reliable farmer.', date: '2026-03-19', crop: 'Wheat', recipientId: 'farmer_demo1' },
  { id: 5, from: 'Green Basket', avatar: '🥬', role: 'Buyer', rating: 5, review: 'Amazing organic spinach. My customers loved it!', date: '2026-03-18', crop: 'Spinach', recipientId: 'farmer_demo1' }
];

function StarRating({ rating, onRate, interactive = false }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map(star => (
        <FiStar
          key={star}
          className={`star ${star <= (interactive ? hover || rating : rating) ? 'filled' : ''}`}
          onClick={() => interactive && onRate(star)}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        />
      ))}
    </div>
  );
}

export default function Ratings() {
  const { currentUser, userProfile } = useAuth();
  const { addToast } = useToast();
  const [ratings, setRatings] = useState([]);
  const [newRating, setNewRating] = useState(0);
  const [newReview, setNewReview] = useState('');
  const [newCrop, setNewCrop] = useState('');
  const [ratingTarget, setRatingTarget] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load ratings from Firestore + merge with seed data
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'ratings'),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const firestoreRatings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().createdAt?.toDate?.()?.toLocaleDateString('en-IN') || 'Recent',
        isFirestore: true
      }));
      // Merge seed + firestore
      setRatings([...firestoreRatings, ...seedRatings]);
      setLoading(false);
    }, (error) => {
      console.error('Ratings load error:', error);
      setRatings(seedRatings);
      setLoading(false);
    });

    return unsub;
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newRating) { addToast('Please select a star rating', 'error'); return; }
    if (!newReview.trim()) { addToast('Please write a review', 'error'); return; }
    if (!newCrop.trim()) { addToast('Please enter the product/crop name', 'error'); return; }

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'ratings'), {
        from: userProfile?.name || 'Anonymous',
        avatar: userProfile?.role === 'farmer' ? '👨‍🌾' : userProfile?.role === 'buyer' ? '🏪' : '🚛',
        role: userProfile?.role || 'user',
        rating: newRating,
        review: newReview.trim(),
        crop: newCrop.trim(),
        ratingTarget: ratingTarget.trim() || 'General',
        senderId: currentUser.uid,
        recipientId: 'farmer_demo1',
        createdAt: serverTimestamp()
      });
      addToast('Rating submitted successfully! ⭐', 'success');
      setNewRating(0);
      setNewReview('');
      setNewCrop('');
      setRatingTarget('');
      setShowForm(false);
    } catch (err) {
      console.error('Rating submit error:', err);
      addToast('Failed to submit rating', 'error');
    }
    setSubmitting(false);
  };

  const avgRating = ratings.length
    ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
    : '0.0';

  const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: ratings.filter(r => r.rating === star).length,
    percentage: ratings.length ? (ratings.filter(r => r.rating === star).length / ratings.length * 100).toFixed(0) : 0
  }));

  return (
    <div className="ratings-page">
      <motion.div className="rt-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <h1>⭐ Ratings & Reviews</h1>
          <p>Your reputation in the marketplace</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(s => !s)} id="add-rating-btn">
          {showForm ? '✕ Cancel' : '+ Give Rating'}
        </button>
      </motion.div>

      {/* Give Rating Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="rating-form-card"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <h3>✍️ Submit a Rating</h3>
            <form onSubmit={handleSubmit} className="rating-form">
              <div className="rating-form-row">
                <div className="input-group">
                  <label>Your Rating</label>
                  <StarRating rating={newRating} onRate={setNewRating} interactive />
                  <span className="rating-hint">
                    {newRating === 0 ? 'Click a star' : ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][newRating]}
                  </span>
                </div>
                <div className="input-group">
                  <label>Product / Crop</label>
                  <input
                    className="input-field"
                    placeholder="e.g. Organic Tomatoes"
                    value={newCrop}
                    onChange={e => setNewCrop(e.target.value)}
                    id="rating-crop"
                  />
                </div>
                <div className="input-group">
                  <label>Reviewing (Name/Business)</label>
                  <input
                    className="input-field"
                    placeholder="e.g. Rajesh Patil"
                    value={ratingTarget}
                    onChange={e => setRatingTarget(e.target.value)}
                    id="rating-target"
                  />
                </div>
              </div>
              <div className="input-group">
                <label>Your Review</label>
                <textarea
                  className="input-field"
                  placeholder="Share your experience..."
                  value={newReview}
                  onChange={e => setNewReview(e.target.value)}
                  rows={3}
                  id="rating-review"
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={submitting} id="submit-rating">
                <FiSend /> {submitting ? 'Submitting...' : 'Submit Rating'}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overview */}
      <div className="rt-overview">
        <motion.div className="rt-score" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
          <div className="rt-big-score">{avgRating}</div>
          <StarRating rating={Math.round(parseFloat(avgRating))} />
          <p>{ratings.length} {ratings.length === 1 ? 'review' : 'reviews'}</p>
          <div className="rt-award">
            <FiAward /> {parseFloat(avgRating) >= 4.5 ? 'Top Rated Seller' : parseFloat(avgRating) >= 4 ? 'Trusted Seller' : 'Growing Reputation'}
          </div>
        </motion.div>

        <motion.div className="rt-distribution" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          {ratingDistribution.map(({ star, count, percentage }) => (
            <div key={star} className="rt-bar-row">
              <span className="rt-bar-label">{star} ⭐</span>
              <div className="rt-bar-track">
                <motion.div
                  className="rt-bar-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ delay: 0.3 + star * 0.05, duration: 0.6 }}
                />
              </div>
              <span className="rt-bar-count">{count}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Reviews List */}
      <div className="rt-reviews">
        <h3>All Reviews <span className="reviews-count">({ratings.length})</span></h3>
        {loading ? (
          <div className="reviews-loading">Loading reviews...</div>
        ) : (
          ratings.map((review, i) => (
            <motion.div
              key={review.id}
              className={`review-card ${review.isFirestore ? 'review-card-new' : ''}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
            >
              <div className="review-header">
                <div className="review-author">
                  <span className="review-avatar">{review.avatar}</span>
                  <div>
                    <span className="review-name">{review.from}</span>
                    <span className="review-crop">Ordered: {review.crop}</span>
                  </div>
                </div>
                <div className="review-meta">
                  <StarRating rating={review.rating} />
                  <span className="review-date">{review.date}</span>
                </div>
              </div>
              <p className="review-text">{review.review}</p>
              {review.isFirestore && <span className="new-badge">✓ Verified Review</span>}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
