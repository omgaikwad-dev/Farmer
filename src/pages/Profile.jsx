import { useState, useEffect } from 'react';
import { FiUser, FiMail, FiPhone, FiMapPin, FiEdit2, FiSave, FiShield } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import './Profile.css';

export default function Profile() {
  const { currentUser, userProfile, profileLoading, fetchUserProfile } = useAuth();
  const { addToast } = useToast();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', location: '' });

  // Sync form whenever userProfile loads / changes
  useEffect(() => {
    if (userProfile) {
      setForm({
        name:     userProfile.name     || '',
        phone:    userProfile.phone    || '',
        location: userProfile.location || '',
      });
    }
  }, [userProfile]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      addToast('Name cannot be empty', 'error');
      return;
    }
    setSaving(true);
    try {
      const updates = {
        name:     form.name.trim(),
        phone:    form.phone.trim(),
        location: form.location.trim(),
      };

      // Use setDoc with merge — works offline with persistent cache
      // (updateDoc fails when Firestore can't verify the doc exists)
      await setDoc(doc(db, 'users', currentUser.uid), updates, { merge: true });

      // Update localStorage cache immediately so sidebar/dashboard stay in sync
      try {
        const cached = JSON.parse(localStorage.getItem('fc_user_profile') || '{}');
        localStorage.setItem('fc_user_profile', JSON.stringify({ ...cached, ...updates }));
      } catch (_) {}

      // Refresh the context profile
      await fetchUserProfile(currentUser.uid);
      addToast('Profile updated successfully! ✅', 'success');
      setEditing(false);
    } catch (error) {
      console.error('[Profile] Save error:', error);
      addToast('Failed to update profile. Please check your connection.', 'error');
    }
    setSaving(false);
  };

  const handleCancel = () => {
    // Reset form to current profile values
    if (userProfile) {
      setForm({
        name:     userProfile.name     || '',
        phone:    userProfile.phone    || '',
        location: userProfile.location || '',
      });
    }
    setEditing(false);
  };

  // Role metadata
  const roleIcon  = userProfile?.role === 'farmer' ? '👨‍🌾'
                  : userProfile?.role === 'transporter' ? '🚚'
                  : '🏪';
  const roleName  = userProfile?.role
    ? userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1)
    : 'User';

  // Joined date — support both ISO string and Firestore Timestamp
  const joinedDate = (() => {
    const raw = userProfile?.createdAt;
    if (!raw) return null;
    const d = raw?.toDate ? raw.toDate() : new Date(raw);
    return isNaN(d) ? null : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  })();

  // Avatar initials
  const initials = (userProfile?.name || currentUser?.displayName || currentUser?.email || 'U')
    .trim()
    .split(' ')
    .map(w => w[0]?.toUpperCase())
    .slice(0, 2)
    .join('');

  if (profileLoading) {
    return (
      <div className="profile-page">
        <div className="pf-loading">
          <div className="spinner" />
          <p>Loading profile…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="pf-header">
        <h1>👤 My Profile</h1>
        <p>Manage your account information</p>
      </div>

      <div className="pf-layout">
        {/* ——— Profile Card ——— */}
        <div className="pf-card">
          <div className="pf-avatar-section">
            <div className="pf-avatar">{initials}</div>
            <h2>{userProfile?.name || currentUser?.displayName || 'User'}</h2>
            <span className="pf-role-badge">
              {roleIcon} {roleName}
            </span>
            <div className="pf-rating">
              ⭐ {userProfile?.rating || 0} Rating
            </div>
          </div>

          {/* Stats — role-aware labels */}
          <div className="pf-stats">
            <div className="pf-stat">
              <span className="pf-stat-value">
                {userProfile?.totalOrders ?? userProfile?.ordersCount ?? 0}
              </span>
              <span className="pf-stat-label">
                {userProfile?.role === 'buyer' ? 'Orders' : userProfile?.role === 'farmer' ? 'Sales' : 'Trips'}
              </span>
            </div>
            <div className="pf-stat">
              <span className="pf-stat-value">
                ₹{userProfile?.totalRevenue ?? 0}
              </span>
              <span className="pf-stat-label">Revenue</span>
            </div>
            <div className="pf-stat">
              <span className="pf-stat-value">
                {userProfile?.totalListings ?? userProfile?.listingsCount ?? 0}
              </span>
              <span className="pf-stat-label">
                {userProfile?.role === 'transporter' ? 'Deliveries' : 'Listings'}
              </span>
            </div>
          </div>

          <div className="pf-verified">
            <FiShield />
            <span>{userProfile?.verified ? '✅ Verified Account' : 'Verification Pending'}</span>
          </div>
        </div>

        {/* ——— Account Details ——— */}
        <div className="pf-details">
          <div className="pf-details-header">
            <h3>Account Details</h3>
            <div className="pf-header-btns">
              {editing ? (
                <>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={handleSave}
                    id="save-profile-btn"
                    disabled={saving}
                  >
                    {saving ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <><FiSave /> Save</>}
                  </button>
                </>
              ) : (
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setEditing(true)}
                  id="edit-profile-btn"
                >
                  <FiEdit2 /> Edit
                </button>
              )}
            </div>
          </div>

          <div className="pf-fields">
            {/* Full Name */}
            <div className="pf-field">
              <div className="pf-field-icon"><FiUser /></div>
              <div className="pf-field-content">
                <label>Full Name</label>
                {editing ? (
                  <input
                    className="input-field"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                  />
                ) : (
                  <span>{userProfile?.name || currentUser?.displayName || '—'}</span>
                )}
              </div>
            </div>

            {/* Email — always read-only */}
            <div className="pf-field">
              <div className="pf-field-icon"><FiMail /></div>
              <div className="pf-field-content">
                <label>Email</label>
                <span>{userProfile?.email || currentUser?.email || '—'}</span>
              </div>
            </div>

            {/* Phone */}
            <div className="pf-field">
              <div className="pf-field-icon"><FiPhone /></div>
              <div className="pf-field-content">
                <label>Phone</label>
                {editing ? (
                  <input
                    className="input-field"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    type="tel"
                  />
                ) : (
                  <span>{userProfile?.phone || 'Not provided'}</span>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="pf-field">
              <div className="pf-field-icon"><FiMapPin /></div>
              <div className="pf-field-content">
                <label>Location</label>
                {editing ? (
                  <input
                    className="input-field"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="City, State"
                  />
                ) : (
                  <span>{userProfile?.location || 'Not provided'}</span>
                )}
              </div>
            </div>
          </div>

          <div className="pf-joined">
            {joinedDate ? `Joined: ${joinedDate}` : 'Joined: —'}
          </div>
        </div>
      </div>
    </div>
  );
}
