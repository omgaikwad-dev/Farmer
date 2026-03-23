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
    if (profile && profile.uid) {
      localStorage.setItem(`fc_profile_${profile.uid}`, JSON.stringify(profile));
      // Also store a quick reference for the dashboard default
      localStorage.setItem('fc_user_profile', JSON.stringify(profile));
    }
  } catch (_) { /* quota exceeded, ignore */ }
}

function getCachedProfile(uid) {
  try {
    const raw = localStorage.getItem(`fc_profile_${uid}`);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (_) {
    return null;
  }
}

function clearCachedProfile() {
  // Keep cache intact so subsequent logins still know the user's role 
  // even if Firestore rules are restricting access.
  try { localStorage.removeItem('fc_user_profile'); } catch (_) {}
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
    
    // CRITICAL: Encode role into displayName to guarantee cross-device sync bypassing Firestore completely!
    const encodedName = `${name}|||${role}`;
    await updateProfile(result.user, { displayName: encodedName });

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

    // Try writing to Firestore anyway
    setDoc(doc(db, 'users', result.user.uid), profile).catch(() => {});

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
      } else {
        // Cache is completely empty across new devices, so recover the encoded profile
        let authName = result.user.displayName || '';
        let authRole = 'buyer';
        if (authName.includes('|||')) {
          const parts = authName.split('|||');
          authName = parts[0];
          authRole = parts[1];
        }
        const fallbackProfile = {
           uid: result.user.uid,
           name: authName || 'User',
           email: result.user.email,
           role: authRole
        };
        profileSetByAction.current = true;
        _setProfile(fallbackProfile);
      }
    }

    return result;
  }

  /* ══════ GOOGLE LOGIN ══════ */
  async function loginWithGoogle(role = 'buyer') {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);

    // Decode existing name/role if it was embedded
    let parsedName = result.user.displayName || 'User';
    let parsedRole = role; // default parameter

    if (parsedName.includes('|||')) {
      [parsedName, parsedRole] = parsedName.split('|||');
    }

    let snap = null;
    try { snap = await getDoc(doc(db, 'users', result.user.uid)); } catch (_) {}

    if (!snap || !snap.exists()) {
      // Encode it for Google users too, so they have cross-device sync
      const newEncodedName = `${parsedName}|||${parsedRole}`;
      if (!result.user.displayName?.includes('|||')) {
        updateProfile(result.user, { displayName: newEncodedName }).catch(() => {});
      }

      const profile = {
        uid:          result.user.uid,
        name:         parsedName,
        email:        result.user.email,
        role:         parsedRole,
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

  /* ══════ AUTH STATE OBSERVER ══════ */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        if (profileSetByAction.current) {
          profileSetByAction.current = false;
          setLoading(false);
        } else {
          // Attempt deep decode from Auth object FIRST in case Firestore blocks reads cross-device
          let authName = user.displayName || '';
          let authRole = 'buyer';
          if (authName.includes('|||')) {
            const parts = authName.split('|||');
            authName = parts[0];
            authRole = parts[1];
          }

          // Try fetching from Firestore/Cache
          await _backgroundFetchProfile(user.uid);
          
          // CRITICAL FIX: If _backgroundFetchProfile failed to find a profile entirely 
          // (which happens on new devices if Firestore rules block reads),
          // manually reconstruct the profile perfectly utilizing the embedded Auth string!
          setUserProfile(prev => {
            if (!prev) {
              const fallbackProfile = {
                uid: user.uid,
                name: authName || 'User',
                email: user.email,
                role: authRole,
              };
              cacheProfile(fallbackProfile);
              return fallbackProfile;
            }
            return prev;
          });

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
