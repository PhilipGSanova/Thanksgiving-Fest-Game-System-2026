import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../api/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [stalls, setStalls] = useState([]); // stalls assigned to current user
  const [loading, setLoading] = useState(true);

  const loadMe = useCallback(async () => {
    const token = localStorage.getItem('hfa_token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const data = await api.me();
      setUser(data.user);
      setStalls(data.stalls || []);
    } catch (err) {
      localStorage.removeItem('hfa_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  function applyAuthResult({ token, user: nextUser }) {
    localStorage.setItem('hfa_token', token);
    setUser(nextUser);
  }

  async function signIn(name, password) {
    const data = await api.signIn(name, password);
    applyAuthResult(data);
    await loadMe();
    return data.user;
  }

  async function signUp(payload) {
    const data = await api.signUp(payload);
    applyAuthResult(data);
    await loadMe();
    return data.user;
  }

  async function updateProfile(payload) {
    const data = await api.updateMe(payload);
    applyAuthResult(data);
    return data.user;
  }

  function signOut() {
    localStorage.removeItem('hfa_token');
    setUser(null);
    setStalls([]);
  }

  // Admin access isn't a stored flag anymore — it's derived from whether the
  // user is assigned to the system "Administrator" stall (stallType: 'Admin').
  const hasAdminAccess = stalls.some((s) => s.stallType === 'Admin');

  return (
    <AuthContext.Provider
      value={{
        user,
        stalls,
        loading,
        hasAdminAccess,
        signIn,
        signUp,
        updateProfile,
        signOut,
        refresh: loadMe
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
