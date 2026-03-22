import { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

/* ───── localStorage cache helpers ───── */
const PROFILE_CACHE_KEY = 'fc_user_profile';

function cacheProfile(profile) {
  try {
    if (profile) {
      localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile));
    }
  } catch (_) { /* quota exceeded, ignore */ }
}

function getCachedProfile(uid) {
  try {
    const raw = localStorage.getItem(PROFILE_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Only return if it matches the current user
    return parsed?.uid === uid ? parsed : null;
  } catch (_) {
    return null;
  }
}

function clearCachedProfile() {
  try { localStorage.removeItem(PROFILE_CACHE_KEY); } catch (_) {}
}

/* ───── Fetch Firestore profile with timeout ───── */
async function fetchProfileFromFirestore(uid) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      console.warn('[Auth] Profile fetch timed out after 5s');
      resolve(null);
    }, 5000);

    getDoc(doc(db, 'users', uid))
      .then((snap) => {
        clearTimeout(timer);
        resolve(snap.exists() ? snap.data() : null);
      })
      .catch((err) => {
        clearTimeout(timer);
        console.warn('[Auth] Firestore fetch failed:', err.message);
        resolve(null);
      });
  });
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser]       = useState(null);
  const [userProfile, setUserProfile]       = useState(null);
  const [loading, setLoading]               = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  // Flag: when signup/login sets profile directly, don't let onAuthStateChanged overwrite it
  const profileSetByAction = useRef(false);

  /* ── Safe setter: updates state + localStorage ── */
  function _setProfile(profile) {
    setUserProfile(profile);
    if (profile) cacheProfile(profile);
  }

  /* ── Fetch + set profile (used by onAuthStateChanged) ── */
  async function _backgroundFetchProfile(uid) {
    setProfileLoading(true);

    // 1. Try Firestore first
    const firestoreData = await fetchProfileFromFirestore(uid);

    if (firestoreData) {
      // Got fresh data from Firestore — always use it
      _setProfile(firestoreData);
      setProfileLoading(false);
      return;
    }

    // 2. Firestore failed — fall back to localStorage cache
    const cached = getCachedProfile(uid);
    if (cached) {
      console.log('[Auth] Using cached profile for role:', cached.role);
      setUserProfile(cached); // don't re-cache, it's already there
      setProfileLoading(false);
      return;
    }

    // 3. No Firestore, no cache — leave existing profile if we have one
    // (signup/login already set it directly)
    setProfileLoading(false);
  }

  /* ── Public: refresh profile after edit (Profile page) ── */
  async function fetchUserProfile(uid) {
    setProfileLoading(true);
    const data = await fetchProfileFromFirestore(uid);
    if (data) _setProfile(data);
    setProfileLoading(false);
  }

  /* ══════ SIGNUP ══════ */
  async function signup(email, password, name, role) {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName: name });

    const profile = {
      uid:          result.user.uid,
      name,
      email,
      role,
      phone:        '',
      location:     '',
      avatar:       '',
      rating:       0,
      totalRatings: 0,
      createdAt:    new Date().toISOString(),
      verified:     false,
    };

    // Write to Firestore (don't block on failure)
    setDoc(doc(db, 'users', result.user.uid), profile).catch(err =>
      console.warn('[Auth] Firestore save failed, will retry:', err.message)
    );

    // Set profile IMMEDIATELY — this is the source of truth
    profileSetByAction.current = true;
    _setProfile(profile);

    return result;
  }

  /* ══════ EMAIL LOGIN ══════ */
  async function login(email, password) {
    const result = await signInWithEmailAndPassword(auth, email, password);

    // Eagerly fetch profile so Dashboard gets the right role
    const data = await fetchProfileFromFirestore(result.user.uid);
    if (data) {
      profileSetByAction.current = true;
      _setProfile(data);
    } else {
      // Firestore failed — try localStorage cache
      const cached = getCachedProfile(result.user.uid);
      if (cached) {
        profileSetByAction.current = true;
        setUserProfile(cached);
      }
    }

    return result;
  }

  /* ══════ GOOGLE LOGIN ══════ */
  async function loginWithGoogle(role = 'buyer') {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);

    let snap = null;
    try { snap = await getDoc(doc(db, 'users', result.user.uid)); } catch (_) {}

    if (!snap || !snap.exists()) {
      const profile = {
        uid:          result.user.uid,
        name:         result.user.displayName || 'User',
        email:        result.user.email,
        role,
        phone:        '',
        location:     '',
        avatar:       result.user.photoURL || '',
        rating:       0,
        totalRatings: 0,
        createdAt:    new Date().toISOString(),
        verified:     false,
      };
      setDoc(doc(db, 'users', result.user.uid), profile).catch(() => {});
      profileSetByAction.current = true;
      _setProfile(profile);
    } else {
      profileSetByAction.current = true;
      _setProfile(snap.data());
    }

    return result;
  }

  /* ══════ LOGOUT ══════ */
  function logout() {
    setUserProfile(null);
    clearCachedProfile();
    profileSetByAction.current = false;
    return signOut(auth);
  }

  /* ══════ AUTH STATE OBSERVER ══════
     KEY FIX: if signup/login already set the profile,
     DON'T overwrite it with a potentially failed Firestore fetch */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        if (profileSetByAction.current) {
          // Profile was already set by signup/login — don't overwrite
          profileSetByAction.current = false;
          setLoading(false);
        } else {
          // Page reload / returning user — need to fetch profile
          await _backgroundFetchProfile(user.uid);
          setLoading(false);
        }
      } else {
        setUserProfile(null);
        setProfileLoading(false);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []); // eslint-disable-line

  const value = {
    currentUser,
    userProfile,
    loading,
    profileLoading,
    signup,
    login,
    loginWithGoogle,
    logout,
    fetchUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
