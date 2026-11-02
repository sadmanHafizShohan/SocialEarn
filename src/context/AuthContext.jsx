import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth';
import { auth, firebaseConfigured, googleProvider } from '../services/firebase';
import api, { setTokenProvider } from '../services/api';

const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); const [loading, setLoading] = useState(firebaseConfigured);
  const [profile, setProfile] = useState(null);
  useEffect(() => {
    if (!auth) { setLoading(false); return undefined; }
    return onAuthStateChanged(auth, async (next) => {
      setUser(next);
      if (!next) { setProfile(null); setLoading(false); return; }
      setLoading(true);
      setTokenProvider(() => next.getIdToken());
      try {
        const response = await api.get('/auth/me');
        setProfile(response.data?.user ? { ...response.data.user, referral: response.data.referral } : null);
      } catch (error) {
        setProfile(null);
        console.error('Unable to synchronize the authenticated user with the backend.', error);
      } finally {
        setLoading(false);
      }
    });
  }, []);
  useEffect(() => { setTokenProvider(() => user?.getIdToken()); }, [user]);
  async function refreshProfile() {
    const response = await api.get('/auth/me');
    setProfile(response.data?.user ? { ...response.data.user, referral: response.data.referral } : null);
  }
  async function applyReferralCode(referralCode) {
    await api.post('/referral/apply', { referralCode });
    await refreshProfile();
  }
  const value = useMemo(() => ({
    user, profile, loading, configured: firebaseConfigured,
    refreshProfile, applyReferralCode,
    login: (email, password) => signInWithEmailAndPassword(auth, email, password),
    register: (email, password) => createUserWithEmailAndPassword(auth, email, password),
    loginWithGoogle: () => signInWithPopup(auth, googleProvider),
    logout: () => signOut(auth)
  }), [user, loading, profile]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
