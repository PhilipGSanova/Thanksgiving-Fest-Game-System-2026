import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-state">LOADING...</div>;
  if (!user) return <Navigate to="/signin" replace />;
  return children;
}

export function RequireAdmin({ children }) {
  const { user, loading, hasAdminAccess } = useAuth();
  if (loading) return <div className="loading-state">LOADING...</div>;
  if (!user) return <Navigate to="/signin" replace />;
  if (!hasAdminAccess) return <Navigate to="/home" replace />;
  return children;
}

export function RequireGuest({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-state">LOADING...</div>;
  if (user) return <Navigate to="/home" replace />;
  return children;
}
