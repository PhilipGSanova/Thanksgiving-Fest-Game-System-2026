import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function LoadingBadge() {
  return (
    <div className="loading-state" aria-live="polite" aria-busy="true">
      <div className="loader-wrapper" aria-hidden="true">
        <div className="loader-circle" />
        <div className="loader-circle" />
        <div className="loader-circle" />
      </div>
      <div className="loader-shadow-group" aria-hidden="true">
        <span className="loader-shadow" />
        <span className="loader-shadow" />
        <span className="loader-shadow" />
      </div>
    </div>
  );
}

export function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingBadge />;
  if (!user) return <Navigate to="/signin" replace />;
  return children;
}

export function RequireAdmin({ children }) {
  const { user, loading, hasAdminAccess } = useAuth();
  if (loading) return <LoadingBadge />;
  if (!user) return <Navigate to="/signin" replace />;
  if (!hasAdminAccess) return <Navigate to="/home" replace />;
  return children;
}

export function RequireGuest({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingBadge />;
  if (user) return <Navigate to="/home" replace />;
  return children;
}
